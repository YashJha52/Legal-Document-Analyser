import pytest
from backend.nlp.extractor import (
    extract_entities_regex,
    classify_clause_heuristic,
    extract_clauses_and_entities_heuristic
)

SAMPLE_CONTRACT_TEXT = """
This Non-Disclosure Agreement is entered into on March 15, 2024 by and between Zenith Tech Inc. and Nova Systems LLC.
1. Confidentiality: Both parties shall protect proprietary trade secrets in strict confidence.
2. Indemnification: Customer shall indemnify, defend and hold harmless provider against all claims.
3. Termination: Either party may terminate upon 30 days written notice.
"""

SAMPLE_JUDGMENT_TEXT = """
A.V.G.P. Chettiar & Sons & Ors vs T. Palanisamy Gounder on 8 May, 2002
Author: Ruma Pal
Bench: R.C. Lahoti, Ruma Pal
CASE NO.: Appeal (civil) 6888 of 1999
PETITIONER: A.V.G.P. CHETTIAR & SONS & ORS.
Vs.
RESPONDENT: T. PALANISAMY GOUNDER
DATE OF JUDGMENT: 08/05/2002
JUDGMENT:
This is an appeal filed by tenants against an order passed by the High Court at Madras.
Subject to this observation, we set aside the impugned decision of the High Court and allow the appeal.
"""

def test_extract_entities_regex_contract():
    metadata = extract_entities_regex(SAMPLE_CONTRACT_TEXT)
    assert len(metadata["parties"]) >= 1
    assert metadata["effective_date"] is not None
    assert len(metadata["notice_periods"]) >= 1
    assert metadata["document_type"] == "commercial_contract"

def test_extract_entities_regex_judgment():
    metadata = extract_entities_regex(SAMPLE_JUDGMENT_TEXT)
    assert metadata["document_type"] == "court_judgment"
    assert "A.V.G.P. CHETTIAR & SONS & ORS" in metadata["parties"][0]
    assert "T. PALANISAMY GOUNDER" in metadata["parties"][1]
    assert metadata["effective_date"] == "08/05/2002"
    assert "Supreme Court of India" in metadata["governing_jurisdiction"]
    assert "R.C. Lahoti" in metadata["bench"]
    assert "Appeal (civil) 6888 of 1999" in metadata["case_number"]
    assert "Appeal Allowed" in metadata["disposition"]

def test_classify_clause_heuristic():
    clause_type, risk, rationale, meaning, tip = classify_clause_heuristic("Customer shall indemnify and defend the provider.")
    assert clause_type == "indemnification"
    assert risk in ["High", "Medium"]
    assert tip is not None
    assert "indemnity" in tip.lower()

def test_extract_clauses_and_entities_heuristic():
    result = extract_clauses_and_entities_heuristic(SAMPLE_CONTRACT_TEXT)
    assert "entities" in result
    assert "clauses" in result
    assert "risk_analysis" in result
    assert len(result["clauses"]) >= 2
    assert "risk_score" in result["risk_analysis"]
    assert "verdict" in result["risk_analysis"]
