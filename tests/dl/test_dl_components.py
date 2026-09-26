import pytest
from backend.dl.extractor import extract_clauses_and_entities_llm
from backend.dl.summarizer import (
    generate_plain_english_summary,
    fallback_plain_english_summary
)
from backend.dl.rag_indexer import retrieve_context

SAMPLE_LEGAL_TEXT = """
This Service Level Agreement is between Apex Cloud Inc. and Summit Retail LLC dated June 1, 2024.
1. Limitation of Liability: In no event shall total damages exceed $10,000.
2. Confidentiality: Trade secrets and source code remain strictly confidential.
3. Termination: Either party may terminate immediately without notice upon breach.
"""

def test_fallback_plain_english_summary():
    summary = fallback_plain_english_summary(SAMPLE_LEGAL_TEXT)
    assert "executive_summary" in summary
    assert "key_obligations" in summary
    assert "action_items" in summary
    assert len(summary["key_obligations"]) > 0

def test_generate_plain_english_summary():
    summary = generate_plain_english_summary(SAMPLE_LEGAL_TEXT,max_tokens=2000)
    assert "executive_summary" in summary
    assert "key_obligations" in summary
    assert "action_items" in summary

def test_extract_clauses_and_entities_llm():
    res = extract_clauses_and_entities_llm(SAMPLE_LEGAL_TEXT)
    assert "entities" in res
    assert "clauses" in res
    assert "risk_analysis" in res

def test_retrieve_context_empty_or_nonexistent():
    ctx = retrieve_context("arbitration agreement",n_results=1)
    assert isinstance(ctx, str)
