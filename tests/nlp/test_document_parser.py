import pytest
from backend.nlp.document_parser import clean_extracted_text, parse_document

def test_clean_extracted_text_removes_hyphenated_linebreaks():
    dirty_text = "This agree-\nment establishes confiden-\ntiality obligations."
    cleaned = clean_extracted_text(dirty_text)
    assert "agreement" in cleaned
    assert "confidentiality" in cleaned
    assert "agree-\nment" not in cleaned

def test_clean_extracted_text_removes_page_numbers():
    dirty_text = "Page 1 of 12\nConfidentiality Agreement\n--- Page 2 ---\nTerms and conditions."
    cleaned = clean_extracted_text(dirty_text)
    assert "Page 1 of 12" not in cleaned
    assert "--- Page 2 ---" not in cleaned
    assert "Confidentiality Agreement" in cleaned

def test_clean_extracted_text_normalizes_whitespace():
    dirty_text = "Clause   1:   Payment    Terms.\n\n\n\nAll fees shall be paid."
    cleaned = clean_extracted_text(dirty_text)
    assert "Clause 1: Payment Terms." in cleaned
    assert "\n\n\n\n" not in cleaned

def test_parse_document_string_and_bytes():
    sample_text = "Independent Contractor Agreement dated January 1, 2024."
    parsed_from_str = parse_document(sample_text)
    assert parsed_from_str == sample_text
    parsed_from_bytes = parse_document(sample_text.encode("utf-8"))
    assert parsed_from_bytes == sample_text

def test_parse_document_empty_input():
    assert parse_document("") == ""
    assert parse_document(None) == ""
