import os
import glob

years = [str(y) for y in range(2015, 2026)]
base_dir = "/Users/yash/Desktop/Project/NLP_DL/training_files/supreme_court_judgments_txt"
files = []
for y in years:
    path = os.path.join(base_dir, y, "*.txt")
    files.extend(glob.glob(path))

print(f"Total files from 2015 onwards: {len(files)}")
