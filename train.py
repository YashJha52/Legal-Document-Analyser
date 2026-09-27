import os
import json
import re
import random
import joblib
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, classification_report, confusion_matrix

RANDOM_SEED = 42
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHECKPOINT_DIR = os.path.join(BASE_DIR, "models", "checkpoints")
REPORT_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

MODEL_SAVE_PATH = os.path.join(CHECKPOINT_DIR, "best_clause_classifier.pt")
VECTORIZER_SAVE_PATH = os.path.join(CHECKPOINT_DIR, "tfidf_vectorizer.joblib")
METRICS_JSON_PATH = os.path.join(REPORT_DIR, "training_metrics.json")

CLAUSE_CLASSES = [
    "Governing Law",
    "Confidentiality",
    "Termination",
    "Limitation of Liability",
    "Indemnification",
    "Intellectual Property",
    "Non-Compete",
    "Warranties",
    "General Legal Context"
]

ALL_KEYWORDS_REGEX = re.compile(
    r"\b(governing law|jurisdiction|applicable law|exclusive jurisdiction|court of competent jurisdiction|civil court|territorial jurisdiction|"
    r"confidential|non-disclosure|secrecy|proprietary information|trade secret|confidentiality|privileged communication|"
    r"terminate|termination|cancellation|revocation|rescission|terminated|discharge of contract|repudiation|"
    r"limitation of liability|liability capped|aggregate liability|consequential damages|liquidated damages|penalty clause|"
    r"indemnify|indemnification|hold harmless|defend and indemnify|indemnity|guarantee|"
    r"intellectual property|copyright|patent|trademark|infringement|passing off|"
    r"non-compete|non-competition|solicit|restrictive covenant|garden leave|restraint of trade|section 27|"
    r"warrant|warranty|warranties|merchantability|fitness for a particular purpose|condition precedent)\b",
    re.IGNORECASE
)

def apply_keyword_dropout(text, drop_prob=0.35):
    if random.random() < drop_prob:
        return ALL_KEYWORDS_REGEX.sub("legal_provision", text)
    return text

class LegalClauseClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_classes):
        super(LegalClauseClassifier, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.40),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.30),
            nn.Linear(hidden_dim // 2, num_classes)
        )

    def forward(self, x):
        if x.dim() == 1:
            x = x.unsqueeze(0)
        return self.network(x)

def run_training():
    print("=" * 65)
    print("  Legal Document Classifier - Realistic Training Run (2000-2010)  ")
    print("=" * 65)

    corpus_path = "data/indian_legal_corpus.json"
    if not os.path.exists(corpus_path):
        raise FileNotFoundError(f"Corpus not found at {corpus_path}. Run data_builder.py first.")
    
    with open(corpus_path, "r", encoding="utf-8") as f:
        corpus = json.load(f)
    print(f"Loaded Indian Law Corpus (2000-2010) with {len(corpus)} samples across 9 classes.")

    texts = [item[0] for item in corpus]
    labels = [item[1] for item in corpus]

    train_texts_raw, val_texts, y_train_raw, y_val_raw = train_test_split(
        texts,
        labels,
        test_size=0.20,
        random_state=RANDOM_SEED,
        stratify=labels
    )

    train_texts = [apply_keyword_dropout(t, drop_prob=0.40) for t in train_texts_raw]

    vectorizer = TfidfVectorizer(
        max_features=1200,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True
    )

    x_train_vec = vectorizer.fit_transform(train_texts).toarray()
    x_val_vec = vectorizer.transform(val_texts).toarray()

    y_train = np.array(y_train_raw)
    y_val = np.array(y_val_raw)

    train_dataset = TensorDataset(torch.tensor(x_train_vec, dtype=torch.float32), torch.tensor(y_train, dtype=torch.long))
    val_dataset = TensorDataset(torch.tensor(x_val_vec, dtype=torch.float32), torch.tensor(y_val, dtype=torch.long))

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, drop_last=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

    model = LegalClauseClassifier(input_dim=1200, hidden_dim=256, num_classes=len(CLAUSE_CLASSES))
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=0.003, weight_decay=0.008)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=16, eta_min=0.0002)

    epochs = 16
    best_val_acc = 0.0
    history = {
        "dataset_name": "Supreme Court of India Judgments (2000-2010)",
        "training_years": "2000-2010",
        "total_samples": len(corpus),
        "train_samples": len(train_texts),
        "val_samples": len(val_texts),
        "evaluation_protocol": "Realistic Benchmark with Keyword Dropout Regularization & Negative Background Class",
        "epoch": [],
        "train_loss": [],
        "val_loss": [],
        "train_acc": [],
        "val_acc": [],
        "val_precision": [],
        "val_recall": [],
        "val_f1": []
    }

    print(f"Training samples: {len(train_texts)} | Validation samples: {len(val_texts)}")
    print(f"Epochs: {epochs} | Batch size: 32 | Target Classes: {len(CLAUSE_CLASSES)}\n")
    print(f"{'Epoch':<7} | {'Train Loss':<11} | {'Train Acc':<10} | {'Val Loss':<10} | {'Val Acc':<9} | {'Val F1':<8}")
    print("-" * 65)

    best_val_preds = []
    best_val_targets = []

    for epoch in range(1, epochs + 1):
        model.train()
        train_loss_sum = 0.0
        train_correct = 0
        train_total = 0

        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()

            train_loss_sum += loss.item() * batch_x.size(0)
            preds = torch.argmax(outputs, dim=1)
            train_correct += (preds == batch_y).sum().item()
            train_total += batch_y.size(0)

        scheduler.step()

        epoch_train_loss = train_loss_sum / train_total
        epoch_train_acc = train_correct / train_total

        model.eval()
        val_loss_sum = 0.0
        val_preds_list = []
        val_targets_list = []

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)
                val_loss_sum += loss.item() * batch_x.size(0)
                preds = torch.argmax(outputs, dim=1)
                val_preds_list.extend(preds.cpu().numpy())
                val_targets_list.extend(batch_y.cpu().numpy())

        epoch_val_loss = val_loss_sum / len(val_dataset)
        epoch_val_acc = accuracy_score(val_targets_list, val_preds_list)
        precision, recall, f1, _ = precision_recall_fscore_support(
            val_targets_list,
            val_preds_list,
            average="weighted",
            zero_division=0
        )

        history["epoch"].append(epoch)
        history["train_loss"].append(round(epoch_train_loss, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))
        history["val_precision"].append(round(float(precision), 4))
        history["val_recall"].append(round(float(recall), 4))
        history["val_f1"].append(round(float(f1), 4))

        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            best_val_preds = list(val_preds_list)
            best_val_targets = list(val_targets_list)
            joblib.dump(vectorizer, VECTORIZER_SAVE_PATH)
            torch.save({
                "model_state_dict": model.state_dict(),
                "classes": CLAUSE_CLASSES,
                "val_acc": best_val_acc,
                "input_dim": 1200,
                "hidden_dim": 256,
                "num_classes": len(CLAUSE_CLASSES)
            }, MODEL_SAVE_PATH)

        print(f"{epoch:<7} | {epoch_train_loss:<11.4f} | {epoch_train_acc:<10.2%} | {epoch_val_loss:<10.4f} | {epoch_val_acc:<9.2%} | {f1:<8.4f}")

    history["classes"] = CLAUSE_CLASSES
    history["final_val_predictions"] = [int(p) for p in best_val_preds]
    history["final_val_targets"] = [int(t) for t in best_val_targets]

    cm = confusion_matrix(best_val_targets, best_val_preds)
    history["confusion_matrix"] = cm.tolist()

    report_dict = classification_report(
        best_val_targets,
        best_val_preds,
        target_names=CLAUSE_CLASSES,
        output_dict=True,
        zero_division=0
    )
    history["classification_report"] = report_dict

    with open(METRICS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print("-" * 65)
    print(f"Realistic Training Complete. Peak Validation Accuracy: {best_val_acc:.2%}")
    print(f"Final Validation Accuracy: {history['val_acc'][-1]:.2%}")
    print(f"Final Validation F1-Score: {history['val_f1'][-1]:.4f}")
    print(f"Model Checkpoint saved to: {MODEL_SAVE_PATH}")
    print(f"Vectorizer saved to: {VECTORIZER_SAVE_PATH}")
    print(f"Metrics Record saved to: {METRICS_JSON_PATH}")

def load_trained_model(model_path=MODEL_SAVE_PATH, vectorizer_path=VECTORIZER_SAVE_PATH):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model checkpoint not found at {model_path}")
    vectorizer = None
    if os.path.exists(vectorizer_path):
        vectorizer = joblib.load(vectorizer_path)
    checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    classes = checkpoint.get("classes", CLAUSE_CLASSES)
    if vectorizer is None and "vectorizer" in checkpoint:
        vectorizer = checkpoint["vectorizer"]
    input_dim = checkpoint.get("input_dim", 1200)
    hidden_dim = checkpoint.get("hidden_dim", 256)
    num_classes = checkpoint.get("num_classes", len(classes))
    model = LegalClauseClassifier(input_dim=input_dim, hidden_dim=hidden_dim, num_classes=num_classes)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    return model, vectorizer, classes

def predict_clause(text, model=None, vectorizer=None):
    if model is None or vectorizer is None:
        loaded_model, loaded_vectorizer, classes = load_trained_model()
        model = model or loaded_model
        vectorizer = vectorizer or loaded_vectorizer
    else:
        classes = CLAUSE_CLASSES
    vec = vectorizer.transform([text]).toarray()
    tensor_input = torch.tensor(vec, dtype=torch.float32)
    model.eval()
    with torch.no_grad():
        logits = model(tensor_input)
        probs = torch.softmax(logits, dim=1).squeeze(0)
        pred_idx = torch.argmax(probs).item()
        confidence = probs[pred_idx].item()
    return {
        "clause_type": classes[pred_idx],
        "confidence": round(confidence, 4),
        "class_id": pred_idx
    }

if __name__ == "__main__":
    run_training()
