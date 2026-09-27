import os
import glob
import json
import re

BASE_DIR = "/Users/yash/Desktop/Project/NLP_DL/training_files/supreme_court_judgments_txt"
OUT_PATH = "/Users/yash/Desktop/Project/NLP_DL/data/indian_legal_corpus.json"

YEARS = [str(y) for y in range(2000, 2011)]

KEYWORDS = {
    0: ["governing law", "jurisdiction", "applicable law", "laws of india", "exclusive jurisdiction", "court of competent jurisdiction", "civil court", "territorial jurisdiction", "pecuniary jurisdiction"],
    1: ["confidential", "non-disclosure", "secrecy", "proprietary information", "trade secret", "confidentiality", "privileged communication", "secret trust"],
    2: ["terminate", "termination", "cancellation", "revocation", "rescission", "terminated", "discharge of contract", "repudiation", "rescind"],
    3: ["limitation of liability", "liability capped", "aggregate liability", "indirect damages", "consequential damages", "liable", "measure of damages", "liquidated damages", "penalty clause"],
    4: ["indemnify", "indemnification", "hold harmless", "defend and indemnify", "indemnity", "contract of indemnity", "guarantee"],
    5: ["intellectual property", "copyright", "patent", "trademark", "trade secret", "infringement", "passing off", "proprietary right"],
    6: ["non-compete", "non-competition", "solicit", "restrictive covenant", "garden leave", "restraint of trade", "section 27"],
    7: ["warrant", "warranty", "warranties", "merchantability", "fitness for a particular purpose", "breach of warranty", "representation and warranty", "condition precedent"]
}

def extract_corpus():
    files = []
    for y in YEARS:
        path = os.path.join(BASE_DIR, y, "*.txt")
        files.extend(glob.glob(path))
        
    print(f"Processing {len(files)} judgment files from 2000-2010 Supreme Court archive...")
    
    data = []
    class_counts = {k: 0 for k in range(9)}
    
    all_keywords = [kw for k_list in KEYWORDS.values() for kw in k_list]
    
    for filepath in files:
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            
            sentences = re.split(r"(?<=[.!?])\s+", text)
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence or len(sentence) < 35 or len(sentence) > 800:
                    continue 
                    
                sentence_lower = sentence.lower()
                matched = False
                
                for class_id, keywords in KEYWORDS.items():
                    if any(kw in sentence_lower for kw in keywords):
                        if class_counts[class_id] < 1400:
                            data.append((sentence, class_id))
                            class_counts[class_id] += 1
                        matched = True
                        break
                        
                if not matched and class_counts[8] < 1400:
                    if not any(kw in sentence_lower for kw in all_keywords):
                        if any(w in sentence_lower for w in ["appellant", "respondent", "evidence", "witness", "record", "decree", "trial", "appeal", "high court", "petition"]):
                            data.append((sentence, 8))
                            class_counts[8] += 1
                            
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            
    print(f"Extracted {len(data)} training samples across 2000-2010 with negative background class.")
    for class_id, count in class_counts.items():
        print(f"Class {class_id}: {count} samples")
        
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Saved to {OUT_PATH}")

if __name__ == "__main__":
    extract_corpus()
