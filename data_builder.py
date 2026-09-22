import os
import glob
import json
import re

BASE_DIR = "/Users/yash/Desktop/Project/NLP_DL/training_files/supreme_court_judgments_txt"
OUT_PATH = "/Users/yash/Desktop/Project/NLP_DL/data/indian_legal_corpus.json"

years = [str(y) for y in range(2015, 2026)]

KEYWORDS = {
    0: ["governing law", "jurisdiction", "applicable law", "laws of india", "exclusive jurisdiction", "court of competent jurisdiction"],
    1: ["confidential", "non-disclosure", "secrecy", "proprietary information", "trade secret", "confidentiality"],
    2: ["terminate", "termination", "cancellation", "revocation", "rescission", "terminated"],
    3: ["limitation of liability", "liability capped", "aggregate liability", "indirect damages", "consequential damages", "liable"],
    4: ["indemnify", "indemnification", "hold harmless", "defend and indemnify", "indemnity"],
    5: ["intellectual property", "copyright", "patent", "trademark", "trade secret", "infringement"],
    6: ["non-compete", "non-competition", "solicit", "restrictive covenant", "garden leave"],
    7: ["warrant", "warranty", "warranties", "merchantability", "fitness for a particular purpose", "breach of warranty"]
}

def extract_corpus():
    files = []
    for y in years:
        path = os.path.join(BASE_DIR, y, "*.txt")
        files.extend(glob.glob(path))
        
    print(f"Processing {len(files)} judgment files...")
    
    data = []
    class_counts = {k: 0 for k in KEYWORDS.keys()}
    
    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
            
            # Simple sentence splitting on punctuation
            sentences = re.split(r'(?<=[.!?])\s+', text)
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence or len(sentence) < 30 or len(sentence) > 1000:
                    continue 
                    
                sentence_lower = sentence.lower()
                
                # Assign to class if keywords match
                for class_id, keywords in KEYWORDS.items():
                    if any(kw in sentence_lower for kw in keywords):
                        # Cap at 1500 samples per class to maintain balance
                        if class_counts[class_id] < 1500:
                            data.append((sentence, class_id))
                            class_counts[class_id] += 1
                        break
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            
    print(f"Extracted {len(data)} training samples.")
    for class_id, count in class_counts.items():
        print(f"Class {class_id}: {count} samples")
        
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Saved to {OUT_PATH}")

if __name__ == "__main__":
    extract_corpus()
