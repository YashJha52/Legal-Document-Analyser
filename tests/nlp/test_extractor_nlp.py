import pytest
from backend.nlp.extractor import (
    detect_document_type,
    detect_document_type_with_rationale,
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

SAMPLE_SUPREME_COURT_TEXT = """
SUPREME COURT OF INDIA
CIVIL APPELLATE JURISDICTION
CIVIL APPEAL NO. 4521 OF 2018
Union of India & Ors. ...Appellants
Versus
K.V. Janakiraman ...Respondents
DATE OF JUDGMENT: 27/08/2021
BENCH: Justice D.Y. Chandrachud, Justice M.R. Shah
JUDGMENT:
The fundamental question of law referred to this Constitution Bench concerns the interpretation of service seniority rules.
Having considered the ratio decidendi, the appeal is allowed and the impugned judgment is set aside.
"""

SAMPLE_COURT_JUDGMENT_TEXT = """
High Court of Delhi at New Delhi
Appeal (civil) 6888 of 1999
PETITIONER: A.V.G.P. CHETTIAR & SONS & ORS.
Vs.
RESPONDENT: T. PALANISAMY GOUNDER
DATE OF JUDGMENT: 08/05/2002
BENCH: Justice R.C. Lahoti
JUDGMENT:
This is an appeal filed by tenants against an eviction decree passed by the subordinate judge.
Subject to this observation, we set aside the impugned decision and allow the appeal.
"""

SAMPLE_FIR_TEXT = """
FIRST INFORMATION REPORT
(Under Section 154 Cr.P.C.)
1. District: South Delhi, P.S.: Hauz Khas, Year: 2024, FIR No.: 0184/2024, Date: 12/04/2024
2. Acts & Sections: IPC Sections 420, 406 (Cheating and Criminal Breach of Trust)
3. Complainant / Informant: Rajesh Kumar Sharma
4. Details of known / suspected accused: Vikram Malhotra and Unknown Associates
5. First Information Contents:
The complainant alleged that the accused fraudulently induced investment of Rs. 45,00,000 into a shell entity.
"""

SAMPLE_SUMMONS_TEXT = """
IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION), SAKET COURTS, NEW DELHI
Suit No. 921 of 2024
HDFC Bank Limited ... Plaintiff
Versus
Anand Verma ... Defendant
SUMMONS TO DEFENDANT FOR APPEARANCE
(Order V Rule 1 and 5 of Code of Civil Procedure)
To: Anand Verma, R/o B-42 Greater Kailash, New Delhi
WHEREAS the plaintiff has instituted a suit against you for recovery of dues;
You are hereby summoned to appear before this court on 14th day of November, 2024 at 10:00 AM in person or by pleader.
Take notice that in default of your appearance on the day before mentioned, the suit will be heard and determined ex-parte.
Given under my hand and the seal of the Court, this 10th day of October, 2024.
"""

SAMPLE_SUBPOENA_TEXT = """
UNITED STATES DISTRICT COURT FOR THE SOUTHERN DISTRICT OF NEW YORK
Civil Action No. 23-cv-08492
Apex Global Trading LLC, Plaintiff
v.
Meridian Logistics Inc., Defendant
SUBPOENA TO PRODUCE DOCUMENTS, INFORMATION, OR OBJECTS OR TO PERMIT INSPECTION
To: Records Custodian, JPMorgan Chase Bank N.A.
YOU ARE COMMANDED to produce at the time, date, and place set forth below each of the following documents:
All wire transfer ledgers and account statements concerning Account #84920194 from January 1, 2023 to present.
Date and Time: November 20, 2024 at 5:00 PM.
Place: Law Offices of Sullivan & Cromwell LLP, 125 Broad St, New York, NY.
Failure to obey this subpoena may be deemed a contempt of court under Rule 45.
"""

def test_detect_fir():
    doc_type, rationale = detect_document_type_with_rationale(SAMPLE_FIR_TEXT)
    assert doc_type == "fir"
    assert "First Information Report" in rationale
    entities = extract_entities_regex(SAMPLE_FIR_TEXT)
    assert entities["document_type"] == "fir"
    assert "Rajesh Kumar Sharma" in entities["parties"][0]
    assert "Vikram Malhotra" in entities["parties"][1]
    assert "0184/2024" in entities["case_number"]
    assert "Hauz Khas" in entities["governing_jurisdiction"]

def test_detect_supreme_court_judgment():
    doc_type, rationale = detect_document_type_with_rationale(SAMPLE_SUPREME_COURT_TEXT)
    assert doc_type == "supreme_court_judgment"
    entities = extract_entities_regex(SAMPLE_SUPREME_COURT_TEXT)
    assert entities["document_type"] == "supreme_court_judgment"
    assert "Union of India" in entities["parties"][0]
    assert "Janakiraman" in entities["parties"][1]
    assert "Supreme Court of India" in entities["governing_jurisdiction"]
    assert "Allowed" in entities["disposition"]

def test_detect_court_summons():
    doc_type, rationale = detect_document_type_with_rationale(SAMPLE_SUMMONS_TEXT)
    assert doc_type == "court_summons"
    assert "Court Summons" in rationale
    entities = extract_entities_regex(SAMPLE_SUMMONS_TEXT)
    assert entities["document_type"] == "court_summons"
    assert "Anand Verma" in entities["parties"][1]
    assert "14th day of November, 2024" in entities["effective_date"]
    assert "Suit No. 921 of 2024" in entities["case_number"]
    assert "Mandatory Court Appearance Scheduled" in entities["disposition"]

def test_detect_subpoena():
    doc_type, rationale = detect_document_type_with_rationale(SAMPLE_SUBPOENA_TEXT)
    assert doc_type == "subpoena"
    assert "Subpoena" in rationale
    entities = extract_entities_regex(SAMPLE_SUBPOENA_TEXT)
    assert entities["document_type"] == "subpoena"
    assert "Records Custodian" in entities["parties"][1]
    assert "November 20, 2024" in entities["effective_date"]
    assert "UNITED STATES DISTRICT COURT" in entities["governing_jurisdiction"].upper()
    assert "Mandatory Production" in entities["disposition"]

def test_extract_entities_regex_contract():
    metadata = extract_entities_regex(SAMPLE_CONTRACT_TEXT)
    assert metadata["document_type"] == "commercial_contract"
    assert len(metadata["parties"]) >= 1
    assert metadata["effective_date"] is not None
    assert len(metadata["notice_periods"]) >= 1

def test_extract_entities_regex_judgment():
    metadata = extract_entities_regex(SAMPLE_COURT_JUDGMENT_TEXT)
    assert metadata["document_type"] == "court_judgment"
    assert "A.V.G.P. CHETTIAR & SONS & ORS" in metadata["parties"][0]
    assert "T. PALANISAMY GOUNDER" in metadata["parties"][1]
    assert metadata["effective_date"] == "08/05/2002"
    assert "High Court of Delhi" in metadata["governing_jurisdiction"]
    assert "Appeal (civil) 6888 of 1999" in metadata["case_number"]
    assert "Allowed" in metadata["disposition"]

def test_classify_specialized_clauses():
    summons_type, risk_s, _, _, _ = classify_clause_heuristic("You are hereby summoned to appear before this court on 14th day of November.")
    assert summons_type == "appearance_summons"
    assert risk_s == "High"

    subpoena_type, risk_sub, _, _, _ = classify_clause_heuristic("You are commanded to produce the following documents under Rule 45.")
    assert subpoena_type == "subpoena_production"
    assert risk_sub == "High"

    contempt_type, risk_c, _, _, _ = classify_clause_heuristic("Failure to obey this subpoena may be deemed a contempt of court.")
    assert contempt_type == "penal_consequence"
    assert risk_c == "High"

def test_extract_clauses_and_entities_heuristic():
    result = extract_clauses_and_entities_heuristic(SAMPLE_CONTRACT_TEXT)
    assert "entities" in result
    assert "clauses" in result
    assert "risk_analysis" in result
    assert len(result["clauses"]) >= 2
    assert "risk_score" in result["risk_analysis"]
    assert "verdict" in result["risk_analysis"]
    assert "case_topic" in result["risk_analysis"]

def test_extract_case_topic_and_verdict_all_types():
    from backend.nlp.extractor import extract_case_topic_and_verdict
    
    fir_res = extract_case_topic_and_verdict(SAMPLE_FIR_TEXT, "fir", {"parties": ["Rajesh Kumar Sharma", "Vikram Malhotra"], "governing_jurisdiction": "Hauz Khas Police Station"})
    assert "420" in fir_res["what_its_about"]
    assert "45,00,000" in fir_res["what_its_about"]
    assert "Section 154" in fir_res["why_it_occurred"]

    subpoena_res = extract_case_topic_and_verdict(SAMPLE_SUBPOENA_TEXT, "subpoena", {"parties": ["United States District Court", "Custodian of Records"], "governing_jurisdiction": "SDNY", "effective_date": "14th day of November, 2024"})
    assert subpoena_res["document_type"] == "subpoena"
    assert "wire transfer" in subpoena_res["what_they_are_taking"].lower() or "account statements" in subpoena_res["what_they_are_taking"].lower()
    assert "compulsory process" in subpoena_res["why_they_are_taking_it"].lower()

    sc_res = extract_case_topic_and_verdict(SAMPLE_SUPREME_COURT_TEXT, "supreme_court_judgment", {"parties": ["Union of India", "K.V. Janakiraman"], "governing_jurisdiction": "Supreme Court of India"})
    assert sc_res["document_type"] == "supreme_court_judgment"
    assert "seniority" in sc_res["original_case_topic"].lower()
    assert "allowed" in sc_res["verdict"].lower()

def test_extract_ndps_acquittal_judgment():
    ndps_sample = """IN THE COURT OF ASJ/SPECIAL JUDGE(NDPS) AT NORTH WEST, ROHINI COURTS, DELHI
SC No. 672/2017
STATE Through Police Station Officer Mangol Puri NORTH WEST DELHI
VERSUS
VISHAL S/o Sh. Satish, R/o H-455, Mangolpuri, Delhi
FIR No. : 1161/2017 Police Station : Mangol Puri Under Section : 21(b) NDPS Act
JUDGMENT (Delivered on 07-02-2024)
Thereafter, IO served notice u/s 50 NDPS Act (Ex.Pw10/P-1) upon the accused.
Section 52A of the Act provides for disposal of seized Narcotic Drugs. In Mohan Lal, it was held that drawing of samples at the spot without Magistrate certification does not arise.
In the case in hand neither any public witness has been joined during entire search and seizure procedure.
In light of the abovesaid findings, I am of the considered opinion that the prosecution has failed to prove its case on the touchstone of beyond reasonable doubt against the accused. The accused is accordingly acquitted from the charges levelled against him."""

    res = extract_clauses_and_entities_heuristic(ndps_sample)
    assert res["entities"]["document_type"] == "court_judgment"
    assert "Acquitted" in res["entities"]["disposition"]
    assert res["risk_analysis"]["overall_risk"] == "Low"
    assert res["risk_analysis"]["risk_score"] == 15
    assert res["risk_analysis"]["high_risk_count"] == 0
    assert len(res["risk_analysis"]["critical_flags"]) == 0
    assert "Acquitted" in res["risk_analysis"]["verdict"]
    assert "NDPS" in res["case_topic"]["topic_title"] or "NDPS" in res["case_topic"]["what_its_about"]

def test_fir_risk_invariants():
    res = extract_clauses_and_entities_heuristic(SAMPLE_FIR_TEXT)
    assert res["risk_analysis"]["overall_risk"] == "High"
    assert res["risk_analysis"]["high_risk_count"] >= 1
    assert len(res["risk_analysis"]["critical_flags"]) >= 1

def test_subpoena_risk_invariants():
    res = extract_clauses_and_entities_heuristic(SAMPLE_SUBPOENA_TEXT)
    assert res["risk_analysis"]["overall_risk"] == "High"
    assert res["risk_analysis"]["high_risk_count"] >= 1
    assert len(res["risk_analysis"]["critical_flags"]) >= 1

def test_court_summons_risk_invariants():
    res = extract_clauses_and_entities_heuristic(SAMPLE_SUMMONS_TEXT)
    assert res["risk_analysis"]["overall_risk"] == "High"
    assert res["risk_analysis"]["high_risk_count"] >= 1
    assert len(res["risk_analysis"]["critical_flags"]) >= 1


