import re

CLAUSE_SCHEMA = {
    "governing_law": "Governing Law & Jurisdiction",
    "confidentiality": "Confidentiality & Non-Disclosure",
    "termination": "Term & Termination",
    "limitation_of_liability": "Limitation of Liability",
    "indemnification": "Indemnification & Defense",
    "intellectual_property": "Intellectual Property & Ownership",
    "warranties": "Warranties & Disclaimers",
    "payment_terms": "Fees & Payment Terms"
}

def extract_entities_regex(text):
    parties_match = re.findall(r"(?:between|by and between)\s+([A-Z][A-Za-z0-9\s,\.]+(?:Inc\.|LLC|Corp\.|Ltd\.|Corporation|Company))", text)
    date_match = re.search(r"(?:dated|as of|entered into on|Effective Date[\":\s]+)\s*([A-Z][a-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})", text, re.IGNORECASE)
    jurisdiction_match = re.search(r"(?:laws of the State of|laws of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", text)
    money_matches = re.findall(r"\$\s*[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|k|thousand))?", text, re.IGNORECASE)
    notice_matches = re.findall(r"(\d+\s*(?:\([0-9]+\)\s*)?(?:days|months|years)\s*(?:prior\s*)?written\s*notice)", text, re.IGNORECASE)
    metadata = {
        "parties": [p.strip().rstrip(",") for p in parties_match[:2]] if parties_match else [],
        "effective_date": date_match.group(1) if date_match else None,
        "governing_jurisdiction": jurisdiction_match.group(1) if jurisdiction_match else None,
        "monetary_caps": list(dict.fromkeys(money_matches)) if money_matches else [],
        "notice_periods": list(dict.fromkeys(notice_matches)) if notice_matches else []
    }
    return metadata

def classify_clause_heuristic(para):
    text_lower = para.lower()
    if any(k in text_lower for k in ["indemnif", "hold harmless", "defend and hold"]):
        risk = "High" if "solely" in text_lower or ("customer shall indemnify" in text_lower and "provider shall" not in text_lower) else "Medium"
        return "indemnification", risk, "Broad indemnity requirement detected. Review scope of third-party indemnification.", "Requires one party to compensate or defend the other against legal claims."
    if any(k in text_lower for k in ["limitation of liability", "indirect damages", "consequential damages", "aggregate liability"]):
        risk = "High" if "unlimited" in text_lower or "$0" in text_lower else "Medium"
        return "limitation_of_liability", risk, "Liability cap specified. Ensure mutual parity and carve-outs for confidentiality breaches.", "Restricts the total financial payout either party can claim if a dispute arises."
    if any(k in text_lower for k in ["terminate", "termination", "cure period", "material breach"]):
        risk = "High" if "immediate" in text_lower and "without notice" in text_lower else "Low"
        return "termination", risk, "Specifies exit terms and notice windows.", "Defines how and when either party can end this agreement."
    if any(k in text_lower for k in ["confidential", "proprietary", "trade secret", "non-disclosure"]):
        risk = "Medium" if "indefinitely" in text_lower or "in perpetuity" in text_lower else "Low"
        return "confidentiality", risk, "Standard non-disclosure restrictions on sensitive information.", "Protects business secrets and private information from being shared."
    if any(k in text_lower for k in ["governing law", "jurisdiction", "venue", "laws of"]):
        return "governing_law", "Low", "Specifies applicable regional court jurisdiction.", "Dictates which state's or country's laws govern this contract."
    if any(k in text_lower for k in ["intellectual property", "ownership", "work made for hire", "license grant"]):
        return "intellectual_property", "Medium", "Outlines assignment of created works, patents, and copyright.", "Specifies who owns the creations, code, or materials produced under this agreement."
    if any(k in text_lower for k in ["payment", "invoice", "fees", "net 30", "net 60"]):
        return "payment_terms", "Low", "Standard fee structure and billing cycles.", "Explains when payments must be made and acceptable invoicing timelines."
    return None, None, None, None

def split_paragraphs_and_clauses(text):
    raw_paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    items = []
    for p in raw_paras:
        sub_items = re.split(r"\n(?=\s*(?:\d+\.|\([a-z0-9]+\)|Section|Article)\s+)", p)
        for s in sub_items:
            s_clean = s.strip()
            if len(s_clean.split()) >= 4:
                items.append(s_clean)
    return items if items else [text.strip()]

def extract_clauses_and_entities_heuristic(text):
    paragraphs = split_paragraphs_and_clauses(text)
    clauses = []
    clause_id = 0
    for para in paragraphs:
        c_type, risk, rationale, meaning = classify_clause_heuristic(para)
        if c_type:
            clauses.append({
                "clause_id": clause_id,
                "clause_type": c_type,
                "title": CLAUSE_SCHEMA.get(c_type, c_type.replace("_", " ").title()),
                "text": para,
                "risk_level": risk,
                "risk_rationale": rationale,
                "plain_english_meaning": meaning
            })
            clause_id += 1
    entities = extract_entities_regex(text)
    high_count = sum(1 for c in clauses if c["risk_level"] == "High")
    med_count = sum(1 for c in clauses if c["risk_level"] == "Medium")
    low_count = sum(1 for c in clauses if c["risk_level"] == "Low")
    overall = "High" if high_count >= 1 else ("Medium" if med_count >= 2 else "Low")
    flags = [c["title"] + ": " + c["risk_rationale"] for c in clauses if c["risk_level"] == "High"]
    return {
        "entities": entities,
        "clauses": clauses,
        "risk_analysis": {
            "overall_risk": overall,
            "high_risk_count": high_count,
            "medium_risk_count": med_count,
            "low_risk_count": low_count,
            "critical_flags": flags
        }
    }
