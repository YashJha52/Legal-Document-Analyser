import sys
import os
from backend.nlp.chunker import chunk_by_words

TRAINING_FILES_DIR = os.path.join("/Users/yash/Desktop/Project/NLP_DL", "training_files", "supreme_court_judgments_txt")
years = [str(y) for y in range(2015, 2026)]

for year in years:
    year_dir = os.path.join(TRAINING_FILES_DIR, year)
    if not os.path.isdir(year_dir):
        continue
    files = os.listdir(year_dir)
    for filename in files[:20]:
        if not filename.endswith(".txt"):
            continue
        filepath = os.path.join(year_dir, filename)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        chunks = chunk_by_words(text, chunk_size=300, chunk_overlap=50)
        for i, chunk_dict in enumerate(chunks):
            chunk_text = chunk_dict["text"]
            if not isinstance(chunk_text, str):
                print(f"File: {filepath}")
                print(f"Type is {type(chunk_text)}, value is {chunk_text}")
                sys.exit(1)
print("All clear!")
