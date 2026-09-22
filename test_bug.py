import sys
import os
from backend.nlp.chunker import chunk_by_words

text = "This is a simple document."
chunks = chunk_by_words(text, chunk_size=300, chunk_overlap=50)
for i, chunk_dict in enumerate(chunks):
    chunk_text = str(chunk_dict.get("text", ""))
    print(len(chunk_text.strip()))

