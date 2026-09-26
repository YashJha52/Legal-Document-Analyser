import pytest
from backend.nlp.chunker import (
    estimate_token_count,
    split_into_sentences,
    chunk_by_words,
    chunk_by_clauses,
    smart_chunk_legal_document
)

SAMPLE_LEGAL_CONTRACT = """
Section 1. Confidentiality.
Each party agrees to hold all proprietary trade secrets in strict confidence and prevent unauthorized disclosure.

Section 2. Limitation of Liability.
In no event shall either party's aggregate liability under this agreement exceed fifty thousand dollars.

Section 3. Term and Termination.
Either party may terminate this agreement upon thirty days prior written notice to the other party.
"""

def test_estimate_token_count():
    text = "The quick brown fox jumps over the lazy dog."
    count = estimate_token_count(text)
    assert count >= 9
    assert estimate_token_count("") == 0

def test_split_into_sentences():
    sentences = split_into_sentences(SAMPLE_LEGAL_CONTRACT)
    assert len(sentences) >= 3
    assert "Section 1" in sentences[0]

def test_chunk_by_words_single_chunk():
    chunks = chunk_by_words(text=SAMPLE_LEGAL_CONTRACT,chunk_size=500,chunk_overlap=50)
    assert len(chunks) == 1
    assert chunks[0]["chunk_id"] == 0
    assert chunks[0]["word_count"] == len(SAMPLE_LEGAL_CONTRACT.split())

def test_chunk_by_words_sliding_overlap():
    long_text = " ".join([f"LegalWord{i}" for i in range(100)])
    chunks = chunk_by_words(text=long_text,chunk_size=30,chunk_overlap=10)
    assert len(chunks) > 1
    first_chunk_words = chunks[0]["text"].split()
    second_chunk_words = chunks[1]["text"].split()
    assert len(first_chunk_words) == 30
    assert first_chunk_words[-10:] == second_chunk_words[:10]

def test_smart_chunk_under_limit():
    chunks = smart_chunk_legal_document(text=SAMPLE_LEGAL_CONTRACT,max_tokens=8192)
    assert len(chunks) == 1
    assert chunks[0]["is_fallback"] is False
    assert chunks[0]["token_count"] > 0

def test_smart_chunk_fallback_over_limit():
    generated_sections = []
    for i in range(20):
        sec = f"Section {i + 1}. Clause Item.\nParty shall perform duty number {i + 1} with due diligence and care."
        generated_sections.append(sec)
    long_contract = "\n\n".join(generated_sections)
    chunks = smart_chunk_legal_document(text=long_contract,max_tokens=50,overlap_tokens=15)
    assert len(chunks) > 1
    for chunk in chunks:
        assert chunk["is_fallback"] is True
        assert len(chunk["text"]) > 0

def test_chunk_by_clauses():
    chunks = chunk_by_clauses(text=SAMPLE_LEGAL_CONTRACT)
    assert len(chunks) == 3
    assert chunks[0]["chunk_id"] == 0
    assert "Section 1" in chunks[0]["text"]
    assert chunks[0]["token_count"] > 0
    assert chunk_by_clauses(text="") == []
