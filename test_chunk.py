import sys
import os
from backend.nlp.chunker import chunk_by_words

text = "Hello world. This is a test."
chunks = chunk_by_words(text)
print(chunks)
