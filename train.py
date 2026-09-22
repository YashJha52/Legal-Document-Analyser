import os
import json
import joblib
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import precision_recall_fscore_support, accuracy_score

RANDOM_SEED = 42
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

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
    "Warranties"
]

def load_comprehensive_legal_corpus():
    governing_law = [
        "This Agreement shall be governed by and construed in accordance with the substantive laws of the State of Delaware.",
        "Any dispute, controversy or claim arising out of this contract shall be submitted to the exclusive jurisdiction of New York courts.",
        "The construction, validity and performance of this Agreement shall be governed by the laws of England and Wales.",
        "All claims arising hereunder shall be resolved in the federal courts located in the Northern District of California.",
        "This contract is governed in all respects by the statutory enactments of the State of Texas without regard to conflict principles.",
        "The parties irrevocably submit to the exclusive jurisdiction of the High Court of Delhi for any contractual litigation.",
        "Governing law shall be the laws of the State of Illinois, with mandatory venue in Cook County judicial circuit.",
        "All legal proceedings regarding the interpretation of this deed shall be instituted before the judicial courts of Singapore.",
        "This Agreement and any dispute arising out of it shall be governed by French civil law, and venue shall lie in Paris.",
        "The validity and interpretation of this franchise deed shall be determined under the laws of the Commonwealth of Massachusetts.",
        "The United Nations Convention on Contracts for the International Sale of Goods does not apply to this transaction.",
        "Any legal controversy concerning the execution of this contract shall be adjudicated under the laws of Ontario, Canada.",
        "Each party waives objection to the laying of venue of any suit in the United States District Court for Southern District of New York.",
        "This Agreement is made under and shall be construed in accordance with the corporate laws of the State of Nevada.",
        "Disputes relating to regulatory compliance shall be determined under the exclusive jurisdiction of Irish administrative courts.",
        "Venue for arbitration or judicial enforcement shall reside exclusively in Zurich, Switzerland under Swiss federal procedure.",
        "This master agreement shall be interpreted in accordance with the commercial code of the Federal Republic of Germany.",
        "All contractual actions shall be brought exclusively in the commercial court of Tokyo, Japan.",
        "The rights of the signatories shall be governed exclusively by the laws of Hong Kong Special Administrative Region.",
        "The parties consent to the personal jurisdiction and venue of the courts in Fulton County, Georgia."
    ]

    confidentiality = [
        "The Recipient shall hold and maintain all Confidential Information in strictest confidence using a reasonable standard of care.",
        "Non-disclosure obligations hereunder shall survive termination or expiration of this Agreement for five consecutive years.",
        "Confidential materials include all technical schematics, software algorithms, customer rosters, pricing models, and trade secrets.",
        "The Receiving Party will not disclose, duplicate, distribute, or reverse engineer any proprietary documents provided by Discloser.",
        "If Recipient is legally compelled by court order to disclose proprietary records, prompt advance written notice must be furnished.",
        "Confidential information does not include information that is publicly known through no wrongful act of the recipient.",
        "Employees and outside contractors accessing secret files must execute non-disclosure agreements with equivalent protective terms.",
        "All tangible media containing confidential information must be promptly returned or destroyed upon written demand.",
        "Unpublished financial projections, executive memoranda, and security audits constitute strictly protected confidential assets.",
        "The obligation of confidentiality shall remain perpetual for any technical asset qualifying as a statutory trade secret.",
        "Recipient agrees to restrict internal dissemination of confidential files strictly to personnel with a bona fide need to know.",
        "Disclosing Party retains all proprietary rights in all confidential data transmitted during business discussions.",
        "Any unauthorized leak or dissemination of secret files shall entitle Discloser to seek emergency preliminary injunctive relief.",
        "The recipient shall not use confidential technical specifications for any commercial purpose other than evaluating this partnership.",
        "Protected information shall be stored on encrypted storage drives with multi-factor authentication access controls.",
        "Confidentiality restrictions continue in full force regardless of whether the proposed commercial transaction is consummated.",
        "All oral disclosures of confidential information must be confirmed in writing within thirty days to receive NDA protection.",
        "The receiving party shall immediately notify the disclosing party upon learning of any suspected security leak or data compromise.",
        "Non-disclosure covenants forbid the disclosure of the existence or terms of this strategic partnership to media outlets.",
        "Third-party audit teams must sign an approved confidentiality joinder before inspecting proprietary accounting records."
    ]

    termination = [
        "Either party may terminate this Agreement immediately upon written notice if the counterparty commits an incurable material breach.",
        "Client reserves the right to terminate this contract for convenience upon delivering thirty calendar days prior written notice.",
        "In the event of voluntary bankruptcy, insolvency, dissolution, or receiver appointment, the non-debtor may terminate forthwith.",
        "Upon termination of this Agreement, all active licenses expire and customer records will be purged within sixty calendar days.",
        "Failure to deliver satisfactory milestones within the cure period gives Buyer the unilateral right to terminate the statement of work.",
        "The Term shall renew automatically for successive one-year cycles unless either party delivers non-renewal notice sixty days prior.",
        "Termination of this Agreement shall not prejudice any accrued monetary debts, claims, or remedies earned prior to cessation.",
        "Vendor may suspend or terminate account access if undisputed monthly invoices remain unpaid forty-five days past due date.",
        "Immediate termination occurs upon any serious violation of export compliance, sanctions regulations, or anti-bribery statutes.",
        "Either party may end this engagement if an unavoidable force majeure condition halts operations for ninety consecutive days.",
        "Upon expiration or termination, Service Provider shall cooperate in facilitating an orderly transition to a replacement vendor.",
        "Client may terminate the agreement without penalty if system uptime falls below ninety-eight percent for three consecutive months.",
        "The right to terminate for cause requires serving written notice specifying the default and allowing thirty days to rectify.",
        "Termination of this consulting engagement may be effected by either party without cause on fourteen days advance warning.",
        "Upon notice of termination, Contractor shall immediately stop work on deliverables and mitigate further project expenditures.",
        "All post-termination transition services requested by Client shall be billed at standard hourly consulting rates.",
        "Failure to maintain statutory operating licenses constitutes automatic grounds for immediate contract cancellation.",
        "If the joint venture incurs continuous operating losses for four consecutive quarters, either shareholder may terminate.",
        "Termination does not relieve Customer from its obligation to pay all accrued fees incurred prior to the effective termination date.",
        "Either party may terminate this data processing addendum if cross-border transfer mechanisms are struck down by court decree."
    ]

    limitation_of_liability = [
        "In no event shall either party's cumulative aggregate liability exceed the total amounts actually paid during the prior 12 months.",
        "Neither party shall be liable for consequential, indirect, incidental, punitive, or special damages, including lost profits.",
        "The limitation of liability clauses set forth herein shall apply regardless of whether an exclusive remedy fails of essential purpose.",
        "Vendor's maximum financial exposure under this engagement is strictly capped at fifty thousand dollars in the aggregate.",
        "The liability caps articulated in this section shall not apply to breaches of confidentiality or gross negligence and willful misconduct.",
        "Under no circumstances will the cloud platform provider be held responsible for loss of data or business interruption losses.",
        "Total cumulative liability for all claims arising out of security incidents shall be capped at two times annual contract value.",
        "Customer agrees that the negotiated pricing reflects this mutual allocation of financial risk and contractual exposure limitation.",
        "Exclusion of indirect damages applies even if the liable party had been informed in advance of the possibility of such loss.",
        "Statutory claims for statutory interest, penalty fines, and remote economic damages are expressly excluded from allowable recovery.",
        "Neither party will be responsible for delay or failure of performance resulting from acts beyond reasonable operational control.",
        "The cumulative cap on damages represents the maximum liability of the developer whether in tort, contract, or strict liability.",
        "No legal action arising out of this contract may be brought by either party more than one year after the cause of action accrued.",
        "The disclaimers and liability limitations in this section form an essential basis of the economic bargain between the parties.",
        "In no event will vendor's liability for third-party hosting outages exceed the service credits outlined in the service level agreement.",
        "Customer's exclusive remedy for system defects is limited to software re-performance or prorated refund of prepaid subscription fees.",
        "The limitations in this Section 8 apply to the maximum extent permitted by applicable commercial legislation.",
        "Each party's aggregate financial liability under this master agreement shall not exceed one hundred thousand British pounds.",
        "Vendor disclaims all liability for consequences resulting from customer's unauthorized modifications to the source code.",
        "Damages recoverable against Supplier for breach of hardware warranty shall not exceed the original invoice purchase price."
    ]

    indemnification = [
        "Supplier agrees to defend, indemnify, and hold harmless Customer and its directors from third-party patent infringement claims.",
        "The Indemnifying Party shall hold the Indemnified Party harmless against settlements, judgments, legal costs, and attorney fees.",
        "Customer shall indemnify and hold harmless Vendor against liabilities arising from unauthorized data processing or unlawful content.",
        "Indemnity obligations are strictly conditioned on prompt written notification of the claim and granting control of the defense.",
        "Each party indemnifies the other from property damage, physical injury, or gross negligence caused by its on-site employees.",
        "Vendor will indemnify buyer against regulatory fines resulting directly from the software's non-compliance with data privacy rules.",
        "The indemnification procedure requires the indemnified party to cooperate fully with defense counsel at indemnifier expense.",
        "No settlement involving an admission of liability or financial penalty may be entered into without the indemnified party's consent.",
        "Contractor indemnifies the university against copyright claims regarding technical materials incorporated into the portal.",
        "Mutual indemnities for mutual breaches of environmental safety regulations shall be apportioned based on comparative fault.",
        "Company shall indemnify and defend Service Provider from claims brought by end-users relating to Company marketing promises.",
        "Indemnitor shall retain competent legal counsel approved by Indemnitee to defend against the contested third-party lawsuit.",
        "The defense and indemnification obligation encompasses reasonable outside legal fees, expert witness charges, and court costs.",
        "Client agrees to defend Vendor against any third-party trade libel or defamation suit arising from content published by Client.",
        "Indemnity protections under this clause extend to parent companies, operating subsidiaries, officers, and legal representatives.",
        "If an intellectual property injunction is issued, Vendor shall procure the right for Customer to continue using the software.",
        "The indemnified party may participate in the defense with its own chosen counsel at its own separate expense.",
        "Supplier's IP indemnity does not cover infringement resulting from combining software with unauthorized third-party hardware.",
        "Indemnity for breach of confidentiality obligations shall be exempted from the general contractual limitation of liability cap.",
        "Buyer shall indemnify Seller against all tax levies, import tariffs, and customs penalties assessed on cross-border shipments."
    ]

    intellectual_property = [
        "All patents, copyrights, moral rights, trade secrets, and registered trademarks in the Deliverables remain the sole property of Company.",
        "Developer hereby irrevocably assigns, transfers, and conveys to Customer all worldwide rights, title, and ownership in custom software.",
        "No implied intellectual property licenses or patent shop rights are granted under this Master Agreement unless expressly set forth.",
        "All improvements, derivative works, inventions, and patentable discoveries conceived during work performance vest exclusively in Employer.",
        "Customer retains sole ownership of all customer data, training datasets, and proprietary models uploaded to the cloud service.",
        "Vendor grants Client a non-exclusive, non-transferable, revocable license to utilize the binary software during the active term.",
        "Pre-existing intellectual property belonging to Contractor prior to the effective date remains the separate property of Contractor.",
        "All work product created by the consultant hereunder shall constitute a work made for hire under the United States Copyright Act.",
        "Neither party will remove, alter, or obscure any proprietary copyright notices or trademark logos affixed to documentation.",
        "Open source software modules incorporated into deliverables are licensed under their respective MIT, Apache, or BSD permissions.",
        "Customer receives a perpetual, irrevocable, royalty-free license to utilize background technology integrated into custom deliverables.",
        "Nothing in this Agreement transfers title or intellectual property rights in the underlying platform engine to the customer.",
        "Contractor agrees to execute all assignment deeds and patent filings required by Company to perfect ownership of inventions.",
        "The company brand name, trade dress, slogans, and corporate symbols remain the exclusive property of the franchisor.",
        "Licensee shall not sub-license, distribute, rent, or lease the licensed software to any unaffiliated third-party entities.",
        "All database schema architectures, user interface workflows, and UX wireframes created during the sprint vest in the client.",
        "The software contains copyrighted source code that is protected under domestic copyright law and international treaties.",
        "Any feedback, suggested enhancements, or technical recommendations submitted by user shall become the intellectual property of vendor.",
        "Contractor warrants that all creative assets delivered to client are original works and do not misappropriate third-party IP.",
        "The grant of license does not convey any right to inspect, decompile, or access human-readable source code repositories."
    ]

    non_compete = [
        "During the employment term and for twelve months thereafter, Employee shall not directly engage with any competing enterprise.",
        "The Consultant covenants not to solicit, recruit, hire, or entice away any senior engineers or key executive officers of the Client.",
        "Restricted territory covers North America and European Union territories where Company actively markets its cloud software.",
        "The non-competition restriction shall apply solely within a radius of thirty miles from any existing physical retail location.",
        "Contractor agrees not to solicit existing clientele or pitch rival services to customer accounts serviced during the prior two years.",
        "If any provision of this restrictive covenant is deemed overly broad by a court, it shall be reformed to the maximum enforceable scope.",
        "Employee acknowledges that the non-competition obligations are reasonable in duration and necessary to safeguard company goodwill.",
        "Non-compete provisions shall not prevent the executive from holding passive investments of less than two percent in public firms.",
        "The period of non-solicitation shall be tolled for any duration during which the former partner was in active breach of this covenant.",
        "Independent contractor will not establish or advise any enterprise engaged in commercial line of business identical to the sponsor.",
        "Executive agrees not to induce any supplier, vendor, or strategic partner to terminate or curtail its business with the firm.",
        "The restriction on competing activities shall apply in any geographic territory where the employer maintained sales offices.",
        "Former employee shall not assist any competitor in preparing competitive bids against the company on public tenders.",
        "During the garden leave period, executive remains bound by strict non-competition and non-disclosure obligations.",
        "The non-compete covenant applies to executive acting as founder, director, employee, agent, investor, or independent advisor.",
        "Covenantor agrees that money damages would be inadequate and covenantee shall be entitled to an injunction restraining competition.",
        "The non-solicitation restriction prohibits targeting any client who was an active customer at any point during the prior 18 months.",
        "Consultant shall not establish a competing agency specializing in the same niche legal vertical within the state of Florida.",
        "Employee acknowledges receiving specialized training and consideration in exchange for executing this non-compete agreement.",
        "The restrictions in this Section 11 shall survive termination of the employment relationship regardless of the reason for separation."
    ]

    warranties = [
        "Vendor warrants that the Software will perform substantially in conformance with published technical documentation for ninety days.",
        "Each party represents and warrants that it possesses full corporate power, authority, and legal capacity to enter into this contract.",
        "Except as expressly specified herein, all cloud services and deliverables are provided on an as-is basis without warranty of any kind.",
        "Contractor warrants that all consulting services will be rendered with reasonable professional skill, care, and industry diligence.",
        "Supplier warrants that products delivered under this purchase order are new, free from defects in materials, and unencumbered by liens.",
        "The express warranties in this section are in lieu of all other warranties, including implied warranties of merchantability and fitness.",
        "Vendor warrants that the system does not contain malicious code, trojan horses, worms, backdoors, or disabling software locks.",
        "Client represents that it has secured all required consents and rights to transfer data to the processor without violating rights.",
        "Manufacturer warrants structural durability of components for twenty-four months following initial delivery inspection.",
        "The limited warranty provided hereunder shall be void if the equipment is subjected to unauthorized repair, misuse, or alteration.",
        "Seller represents and warrants that goods conform to national electrical safety standards and environmental regulations.",
        "Service provider warrants that its data processing infrastructure maintains SOC-2 Type II and ISO-27001 compliance standards.",
        "Customer warrants that its use of the application will not violate applicable export controls or international economic sanctions.",
        "Vendor disclaims any warranty that the operation of the software will be completely uninterrupted or entirely error-free.",
        "Contractor warrants that it has complied with all payroll, tax withholding, and labor standards laws for assigned staff.",
        "The company represents that there is no pending litigation that would materially impair its ability to perform this contract.",
        "Supplier warrants that all raw materials are sustainably sourced in accordance with modern slavery avoidance certifications.",
        "Licensor warrants that it has the unencumbered right to grant the software licenses conveyed under this agreement.",
        "Exclusive remedy for breach of service warranty is re-performance of non-conforming services within fourteen business days.",
        "No oral advice or demonstration provided by sales representatives shall create a binding warranty or expand this commitment."
    ]

    data = []
    for text in governing_law:
        data.append((text, 0))
    for text in confidentiality:
        data.append((text, 1))
    for text in termination:
        data.append((text, 2))
    for text in limitation_of_liability:
        data.append((text, 3))
    for text in indemnification:
        data.append((text, 4))
    for text in intellectual_property:
        data.append((text, 5))
    for text in non_compete:
        data.append((text, 6))
    for text in warranties:
        data.append((text, 7))

    return data

class LegalClauseClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_classes):
        super(LegalClauseClassifier, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.35),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(hidden_dim // 2, num_classes)
        )

    def forward(self, x):
        if x.dim() == 1:
            x = x.unsqueeze(0)
        return self.network(x)

def run_training():
    print("=" * 65)
    print("  Legal Document Classifier - Training & Validation Run  ")
    print("=" * 65)

    corpus_path = "data/indian_legal_corpus.json"
    if os.path.exists(corpus_path):
        import json
        with open(corpus_path, "r", encoding="utf-8") as f:
            corpus = json.load(f)
        print(f"Loaded specialized Indian Law Corpus with {len(corpus)} samples from {corpus_path}")
    else:
        corpus = load_comprehensive_legal_corpus()
        print("Loaded generic comprehensive legal corpus.")
    texts = [item[0] for item in corpus]
    labels = [item[1] for item in corpus]

    train_texts, val_texts, y_train_raw, y_val_raw = train_test_split(
        texts,
        labels,
        test_size=0.25,
        random_state=RANDOM_SEED,
        stratify=labels
    )

    vectorizer = TfidfVectorizer(
        max_features=500,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True
    )

    x_train_vec = vectorizer.fit_transform(train_texts).toarray()
    x_val_vec = vectorizer.transform(val_texts).toarray()

    y_train = np.array(y_train_raw)
    y_val = np.array(y_val_raw)

    train_dataset = TensorDataset(torch.tensor(x_train_vec,dtype=torch.float32), torch.tensor(y_train,dtype=torch.long))
    val_dataset = TensorDataset(torch.tensor(x_val_vec,dtype=torch.float32), torch.tensor(y_val,dtype=torch.long))

    train_loader = DataLoader(train_dataset,batch_size=16,shuffle=True, drop_last=True)
    val_loader = DataLoader(val_dataset,batch_size=16,shuffle=False)

    model = LegalClauseClassifier(input_dim=500,hidden_dim=128,num_classes=len(CLAUSE_CLASSES))
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(),lr=0.003,weight_decay=0.005)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer,T_max=18,eta_min=0.0003)

    epochs = 18
    best_val_acc = 0.0
    history = {
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
    print(f"Epochs: {epochs} | Batch size: 16 | Target Classes: {len(CLAUSE_CLASSES)}\n")
    print(f"{'Epoch':<7} | {'Train Loss':<11} | {'Train Acc':<10} | {'Val Loss':<10} | {'Val Acc':<9} | {'Val F1':<8}")
    print("-" * 65)

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
            preds = torch.argmax(outputs,dim=1)
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
                preds = torch.argmax(outputs,dim=1)
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
            joblib.dump(vectorizer, VECTORIZER_SAVE_PATH)
            torch.save({
                "model_state_dict": model.state_dict(),
                "classes": CLAUSE_CLASSES,
                "val_acc": best_val_acc,
                "input_dim": 500,
                "hidden_dim": 128,
                "num_classes": len(CLAUSE_CLASSES)
            }, MODEL_SAVE_PATH)

        print(f"{epoch:<7} | {epoch_train_loss:<11.4f} | {epoch_train_acc:<10.2%} | {epoch_val_loss:<10.4f} | {epoch_val_acc:<9.2%} | {f1:<8.4f}")

    history["classes"] = CLAUSE_CLASSES
    history["final_val_predictions"] = [int(p) for p in val_preds_list]
    history["final_val_targets"] = [int(t) for t in val_targets_list]

    with open(METRICS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print("-" * 65)
    print(f"Training Complete. Peak Realistic Validation Accuracy: {best_val_acc:.2%}")
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
    input_dim = checkpoint.get("input_dim", 500)
    hidden_dim = checkpoint.get("hidden_dim", 128)
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

