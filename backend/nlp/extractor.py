import re
import os
import sys

CLAUSE_SCHEMA = {
    "governing_law": "Governing Law & Jurisdiction",
    "confidentiality": "Confidentiality & Privilege",
    "termination": "Termination & Quashing",
    "limitation_of_liability": "Limitation of Liability & Damages",
    "indemnification": "Indemnification & Legal Costs",
    "intellectual_property": "Intellectual Property & Rights",
    "warranties": "Warranties & Statutory Compliance",
    "payment_terms": "Fees, Dues & Compensation",
    "non_compete": "Non-Compete & Restraint of Trade",
    "data_privacy": "Data Protection & Confidential Records",
    "tax_statutory": "Tax Assessment & Fiscal Statute",
    "constitutional_mandate": "Constitutional Equality & Rights (Art. 14/16/32)",
    "service_seniority": "Service Rules & Seniority Principle",
    "court_ruling": "Judicial Order & Ratio Decidendi",
    "jurisdiction_challenge": "Jurisdiction & Forum Authority",
    "evidentiary_holding": "Evidentiary Standard & Burden of Proof",
    "property_tenancy": "Tenancy & Property Rights",
    "statutory_rules": "Statutory Enactment & Delegated Powers"
}

def detect_document_type(text):
    text_sample = text[:3000].lower()
    if any(k in text_sample for k in ["petitioner", "appellant", "respondent", "bench:", "judgment:", "case no.", "appeal (civil)", "indian kanoon", "supreme court", "high court at", "subordinate judge", "writ petition", "special leave petition"]):
        return "court_judgment"
    if any(k in text_sample for k in ["legal notice", "demand notice", "notice under section", "hereby give you notice", "advocate"]):
        return "legal_notice"
    return "commercial_contract"

def extract_entities_regex(text):
    doc_type = detect_document_type(text)
    parties = []
    
    petitioner_match = re.search(r"PETITIONER[\s:\/]+([^\n\r]+)", text, re.IGNORECASE)
    respondent_match = re.search(r"RESPONDENT[\s:\/]+([^\n\r]+)", text, re.IGNORECASE)
    appellant_match = re.search(r"APPELLANT[\s:\/]+([^\n\r]+)", text, re.IGNORECASE)
    
    if petitioner_match and respondent_match:
        p = petitioner_match.group(1).strip().rstrip(".").replace("PETITIONER:", "").strip()
        r = respondent_match.group(1).strip().rstrip(".").replace("RESPONDENT:", "").strip()
        parties = [p[:80], r[:80]]
    elif appellant_match and respondent_match:
        p = appellant_match.group(1).strip().rstrip(".").replace("APPELLANT:", "").strip()
        r = respondent_match.group(1).strip().rstrip(".").replace("RESPONDENT:", "").strip()
        parties = [p[:80], r[:80]]
    else:
        title_vs_match = re.search(r"^\s*([A-Za-z0-9\.\s&,\'\-\_]+?)\s+(?:vs\.?|v\/s|v\.|versus)\s+([A-Za-z0-9\.\s&,\'\-\_]+?)(?:\s+on|\s*\n|\s+dated)", text, re.IGNORECASE | re.MULTILINE)
        if title_vs_match:
            p = title_vs_match.group(1).strip().replace("\n", " ")
            r = title_vs_match.group(2).strip().replace("\n", " ")
            if len(p) < 90 and len(r) < 90:
                parties = [p, r]
        else:
            contract_parties = re.findall(r"(?:between|by and between)\s+([A-Z][A-Za-z0-9\s,\.\(\)\'\-]+?)(?:,|\s+and|\s+\(\"|\s+having|\s+a\s+Delaware|\s+a\s+California)", text[:2500])
            if contract_parties:
                parties = [p.strip().rstrip(",") for p in contract_parties[:2] if len(p.strip()) > 2]
            if not parties:
                org_matches = re.findall(r"([A-Z][A-Za-z0-9\s,\.]+(?:Inc\.|LLC|Corp\.|Ltd\.|Corporation|Company|Pvt\. Ltd\.|Trust|Bank|LLP|Sons|Union of India|State of))", text[:2500])
                if org_matches:
                    parties = list(dict.fromkeys(org_matches))[:2]

    date_val = None
    judgment_date_match = re.search(r"(?:DATE OF JUDGMENT|DECIDED ON|JUDGMENT DATE)[\s:]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4}|[A-Za-z0-9\s,]+)", text[:2000], re.IGNORECASE)
    if judgment_date_match:
        date_val = judgment_date_match.group(1).strip()
    else:
        top_on_date = re.search(r"(?:on|dated)\s+(\d{1,2}(?:st|nd|rd|th)?\s+[A-Z][a-z]+,?\s+\d{4})", text[:1200], re.IGNORECASE)
        if top_on_date:
            date_val = top_on_date.group(1).strip()
        else:
            contract_date = re.search(r"(?:dated|as of|entered into on|Effective Date[\":\s]+)\s*([A-Z][a-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})", text[:2000], re.IGNORECASE)
            if contract_date:
                date_val = contract_date.group(1).strip()

    jurisdiction_val = None
    if "Supreme Court of India" in text or "Supreme Court" in text[:1500]:
        jurisdiction_val = "Supreme Court of India (Appellate / Writ Jurisdiction)"
    elif "High Court" in text[:1500]:
        court_match = re.search(r"(?:High Court (?:at|of)\s+[A-Za-z\s]+)", text[:1500])
        jurisdiction_val = court_match.group(0).strip() if court_match else "High Court Jurisdiction"
    else:
        state_match = re.search(r"(?:laws of the State of|laws of|governed by the State of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", text, re.IGNORECASE)
        if state_match:
            jurisdiction_val = f"State of {state_match.group(1).strip()}"
        elif "Delaware" in text[:2000]:
            jurisdiction_val = "State of Delaware"
        elif "California" in text[:2000]:
            jurisdiction_val = "State of California"
        elif "New York" in text[:2000]:
            jurisdiction_val = "State of New York"
        else:
            jurisdiction_val = "Standard Jurisdiction"

    bench_match = re.search(r"BENCH[\s:]+([^\n\r]+)", text, re.IGNORECASE)
    case_no_match = re.search(r"(?:CASE NO\.|Appeal \(civil\)|Writ Petition \(civil\)|Civil Appeal No\.)[\s:]+([^\n\r]+)", text, re.IGNORECASE)
    bench_val = bench_match.group(1).strip() if bench_match else None
    case_no_val = case_no_match.group(1).strip() if case_no_match else None

    disposition = None
    text_lower = text.lower()
    if any(k in text_lower for k in ["appeal is allowed", "appeal allowed", "we allow the appeal", "impugned order is set aside", "set aside the impugned decision", "writ petition is allowed", "quashed and set aside"]):
        disposition = "Appeal / Petition Allowed — Impugned Order Set Aside"
    elif any(k in text_lower for k in ["appeal is dismissed", "appeal dismissed", "we dismiss the appeal", "writ petition is dismissed", "no merit in the appeal"]):
        disposition = "Appeal Dismissed — Lower Order Upheld"
    elif any(k in text_lower for k in ["remanded back", "remit the matter", "remitted to"]):
        disposition = "Matter Remanded for Fresh Adjudication on Merits"
    elif doc_type == "court_judgment":
        disposition = "Judicial Directives & Declarations Pronounced"

    money_matches = re.findall(r"\$\s*[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|k|thousand))?|Rs\.?\s*[\d,]+|Rupees\s+[\w\s]+", text, re.IGNORECASE)
    notice_matches = re.findall(r"(\d+\s*(?:\([0-9]+\)\s*)?(?:days|months|years)\s*(?:prior\s*)?written\s*notice)", text, re.IGNORECASE)

    return {
        "document_type": doc_type,
        "parties": parties if parties else ["Unspecified Signatories / Litigants"],
        "effective_date": date_val or "Not Dated",
        "governing_jurisdiction": jurisdiction_val,
        "bench": bench_val,
        "case_number": case_no_val,
        "disposition": disposition,
        "monetary_caps": list(dict.fromkeys(money_matches))[:4] if money_matches else [],
        "notice_periods": list(dict.fromkeys(notice_matches))[:3] if notice_matches else []
    }

def clean_paragraph_noise(p):
    lines = [line.strip() for line in p.split("\n") if line.strip()]
    cleaned = []
    for l in lines:
        if any(l.startswith(prefix) for prefix in ["PETITIONER:", "RESPONDENT:", "DATE OF JUDGMENT", "BENCH:", "ACT:", "HEADNOTE:", "Equivalent citations:", "Indian Kanoon", "JUDGMENT:"]):
            continue
        if re.match(r"^(?:AIR\s+\d+|SCR\s+\(\d+\)|\(\d+\)\s*SCC|\d+\s*JT)\b", l):
            continue
        cleaned.append(l)
    return " ".join(cleaned)

def classify_clause_heuristic(para):
    text_lower = para.lower()
    
    # Taxation & Commercial Taxes
    if any(k in text_lower for k in ["commercial tax", "sales tax", "assessment year", "turnover", "excise", "customs duty", "taxable turnover", "rebate", "exemption notification", "revenue authority"]):
        risk = "Medium"
        rationale = "Fiscal liability assessment and statutory tax exemptions under state revenue enactments."
        meaning = "Deals with tax rates, deductions, and exemptions for commercial transactions."
        tip = "Ensure tax returns, exemption certificates, and assessment notices strictly comply with state tax statutes."
        return "tax_statutory", risk, rationale, meaning, tip

    # Service Law & Seniority
    if any(k in text_lower for k in ["seniority", "cadre", "roster", "regularisation", "officiating", "quota-rota", "direct recruit", "promotee", "service rules", "recruitment rules", "article 309", "article 311"]):
        risk = "High" if ("quashed" in text_lower or "arbitrary" in text_lower or "violation" in text_lower) else "Medium"
        rationale = "Statutory recruitment and seniority determination governing public employment placement."
        meaning = "Defines seniority ranking, promotion eligibility, and quota-rota rules between direct recruits and promotees."
        tip = "Ensure seniority rosters strictly adhere to statutory recruitment rules without executive arbitrariness."
        return "service_seniority", risk, rationale, meaning, tip

    # Constitutional Mandate
    if any(k in text_lower for k in ["article 14", "article 16", "article 32", "article 226", "fundamental right", "arbitrary", "discrimination", "manifest arbitrariness"]):
        risk = "High"
        rationale = "Constitutional standard of equality and protection against administrative arbitrariness."
        meaning = "Governmental and statutory rules must not unfairly discriminate or act arbitrarily against citizens."
        tip = "Ensure statutory rules and administrative procedures satisfy the Article 14 reasonableness test."
        return "constitutional_mandate", risk, rationale, meaning, tip

    # Court Ruling & Holding
    if any(k in text_lower for k in ["held that", "we hold", "direction is issued", "impugned order", "judgment of the high court", "writ petition is", "appeal is allowed", "appeal is dismissed", "ordered accordingly"]):
        risk = "Medium" if "dismissed" in text_lower else "Low"
        rationale = "Binding judicial holding and ratio decidendi establishing legal precedent."
        meaning = "The authoritative decision and enforceable directions pronounced by the court."
        tip = "Verify procedural timelines for implementing judicial orders or filing appellate review."
        return "court_ruling", risk, rationale, meaning, tip

    # Jurisdiction
    if any(k in text_lower for k in ["jurisdiction", "rent controller", "civil court", "tribunal had no jurisdiction", "ouster of jurisdiction", "coram non judice"]):
        risk = "High" if ("without jurisdiction" in text_lower or "lacks jurisdiction" in text_lower) else "Medium"
        rationale = "Judicial authority and statutory competence of the forum to try the substantive matter."
        meaning = "Establishes whether the tribunal or court has lawful power to hear and decide the dispute."
        tip = "Verify forum jurisdiction prior to initiation to prevent decrees from being void ab initio."
        return "jurisdiction_challenge", risk, rationale, meaning, tip

    # Tenancy & Rent Disputes
    if any(k in text_lower for k in ["tenant", "landlord", "eviction", "bona fide dispute", "rent control", "lease deed", "mesne profits"]):
        risk = "Medium"
        rationale = "Statutory tenancy protections and landlord-tenant rights under rent control legislation."
        meaning = "Governs possession, ground for eviction, and statutory exemptions for public or charitable trusts."
        tip = "Ensure genuine questions of title are adjudicated before a competent civil court."
        return "property_tenancy", risk, rationale, meaning, tip

    # Evidentiary Holding
    if any(k in text_lower for k in ["burden of proof", "standard of proof", "admissibility of evidence", "witness", "testimony", "prima facie"]):
        risk = "Medium"
        rationale = "Evidentiary standard required to substantiate legal claims or rebut statutory presumptions."
        meaning = "Outlines which party bears the legal obligation to prove facts before the court."
        tip = "Ensure original documentary records and witness statements are properly tendered."
        return "evidentiary_holding", risk, rationale, meaning, tip

    # Indemnification
    if any(k in text_lower for k in ["indemnif", "hold harmless", "defend and hold"]):
        is_high = "solely" in text_lower or ("customer shall indemnify" in text_lower and "provider shall" not in text_lower) or "unlimited" in text_lower
        risk = "High" if is_high else "Medium"
        rationale = "Unilateral defense and indemnity obligation transferring litigation risks without reciprocity." if is_high else "Standard mutual indemnity for third-party claims."
        meaning = "You are legally required to cover lawsuits and damages incurred by the counterparty."
        tip = "Insist on mutual indemnity parity and restrict coverage to direct IP infringement or gross negligence."
        return "indemnification", risk, rationale, meaning, tip

    # Limitation of Liability
    if any(k in text_lower for k in ["limitation of liability", "indirect damages", "consequential damages", "aggregate liability", "liquidated damages"]):
        is_high = "unlimited" in text_lower or "$0" in text_lower or "no liability" in text_lower
        risk = "High" if is_high else "Medium"
        rationale = "Uncapped liability or one-sided liability cap leaving you financially exposed." if is_high else "Standard financial cap on aggregate contractual damages."
        meaning = "Sets a maximum financial ceiling on what can be recovered in a breach or dispute."
        tip = "Cap liability at 12 months fees, with mutual carve-outs for data security and confidentiality breaches."
        return "limitation_of_liability", risk, rationale, meaning, tip

    # Termination
    if any(k in text_lower for k in ["terminate", "termination", "cure period", "material breach", "convenience", "cancellation"]):
        is_high = ("immediate" in text_lower and "without notice" in text_lower) or ("convenience" in text_lower and "15 days" in text_lower)
        risk = "High" if is_high else ("Medium" if "convenience" in text_lower else "Low")
        rationale = "Short-notice or unilateral termination for convenience right." if is_high else "Standard duration, renewal, and material breach notice provisions."
        meaning = "Defines how and when either party can exit the agreement."
        tip = "Require a minimum 30-day notice for convenience and a 30-day cure period for alleged breaches."
        return "termination", risk, rationale, meaning, tip

    # Confidentiality
    if any(k in text_lower for k in ["confidential", "proprietary", "trade secret", "non-disclosure", "privilege"]):
        is_med = "indefinitely" in text_lower or "in perpetuity" in text_lower
        risk = "Medium" if is_med else "Low"
        rationale = "Perpetual confidentiality obligation without standard expiration." if is_med else "Standard confidentiality protections for proprietary information."
        meaning = "Restricts disclosure of sensitive technical code, trade secrets, and business data."
        tip = "Include standard carve-outs and limit term to 2-3 years post-termination."
        return "confidentiality", risk, rationale, meaning, tip

    # Intellectual Property
    if any(k in text_lower for k in ["intellectual property", "work made for hire", "license grant", "assigns", "copyright", "patent"]):
        is_high = "irrevocable" in text_lower and "all rights" in text_lower
        risk = "High" if is_high else "Medium"
        rationale = "Broad assignment of intellectual property rights or irrevocable transfers." if is_high else "Standard IP ownership retention and license boundaries."
        meaning = "Specifies who owns software, code, designs, and data created or shared under the agreement."
        tip = "Ensure you retain 100% ownership of pre-existing IP and customer data."
        return "intellectual_property", risk, rationale, meaning, tip

    # Non-Compete
    if any(k in text_lower for k in ["non-compete", "non-solicit", "restrictive covenant", "shall not engage", "restraint of trade"]):
        risk = "High"
        rationale = "Restrictive covenant curbing future commercial activities or employee recruitment."
        meaning = "Restricts your ability to operate in competing markets or hire counterparty staff."
        tip = "Strike non-competes or restrict duration to 6 months within narrow geography."
        return "non_compete", risk, rationale, meaning, tip

    # Warranties
    if any(k in text_lower for k in ["warranty", "warranties", "disclaim", "as is", "merchantability"]):
        is_med = "as is" in text_lower or "disclaims all warranties" in text_lower
        risk = "Medium" if is_med else "Low"
        rationale = "Broad disclaimer of express and implied performance warranties ('AS-IS')." if is_med else "Standard performance and non-infringement warranties."
        meaning = "Outlines service guarantees or disclaims all quality and fitness commitments."
        tip = "Insist on 99.9% uptime and standard performance conformity warranties."
        return "warranties", risk, rationale, meaning, tip

    # Governing Law
    if any(k in text_lower for k in ["governing law", "venue", "arbitration", "exclusive jurisdiction"]):
        return "governing_law", "Low", "Specifies applicable governing court jurisdiction and dispute forum.", "Dictates which legal jurisdiction governs dispute resolution.", "Ensure chosen venue is commercially accessible and balanced."

    return None, None, None, None, None

def split_paragraphs_and_clauses(text):
    raw_paras = [p.strip() for p in re.split(r"\n\s*\n|\r\n\s*\r\n", text) if p.strip()]
    items = []
    for p in raw_paras:
        clean_p = clean_paragraph_noise(p)
        if len(clean_p.split()) < 4:
            continue
        sub_items = re.split(r"\n(?=\s*(?:\d+\.|\([a-z0-9]+\)|Section|Article|ORDER|HELD:)\s+)", clean_p)
        for s in sub_items:
            s_clean = s.strip()
            if len(s_clean.split()) >= 4:
                items.append(s_clean)
    if not items:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        for i in range(0, len(sentences), 3):
            chunk = " ".join(sentences[i:i+3]).strip()
            chunk_clean = clean_paragraph_noise(chunk)
            if len(chunk_clean.split()) >= 6:
                items.append(chunk_clean)
    return items if items else [text.strip()]

def extract_clauses_and_entities_heuristic(text):
    paragraphs = split_paragraphs_and_clauses(text)
    clauses = []
    clause_id = 0
    seen_types = {}
    
    for para in paragraphs:
        if len(para.strip()) < 25:
            continue
        c_type, risk, rationale, meaning, tip = classify_clause_heuristic(para)
        if c_type:
            # Allow at most 2 clauses of the same type to prevent repetitive blocks
            count = seen_types.get(c_type, 0)
            if count >= 2:
                continue
            seen_types[c_type] = count + 1
            
            title = CLAUSE_SCHEMA.get(c_type, c_type.replace("_", " ").title())
            if count > 0:
                title = f"{title} (Section {count + 1})"
                
            clauses.append({
                "clause_id": clause_id,
                "clause_type": c_type,
                "title": title,
                "text": para,
                "risk_level": risk,
                "risk_rationale": rationale,
                "plain_english_meaning": meaning,
                "negotiation_tip": tip
            })
            clause_id += 1

    # Fallback to ensure clauses NEVER return 0 if text exists
    if not clauses and paragraphs:
        for idx, para in enumerate(paragraphs[:5]):
            if len(para.split()) >= 5:
                title = f"Operative Legal Section {idx + 1}"
                clauses.append({
                    "clause_id": idx,
                    "clause_type": "statutory_rules",
                    "title": title,
                    "text": para,
                    "risk_level": "Medium" if idx == 0 else "Low",
                    "risk_rationale": "Legal provision governing operative party commitments or procedural standards.",
                    "plain_english_meaning": para[:200] + ("..." if len(para) > 200 else ""),
                    "negotiation_tip": "Review against applicable statutory regulations and party covenants."
                })
            
    entities = extract_entities_regex(text)
    doc_type = entities.get("document_type", "commercial_contract")
    
    high_count = sum(1 for c in clauses if c["risk_level"] == "High")
    med_count = sum(1 for c in clauses if c["risk_level"] == "Medium")
    low_count = sum(1 for c in clauses if c["risk_level"] == "Low")
    
    if doc_type == "court_judgment":
        disp = entities.get("disposition") or ""
        if "Allowed" in disp:
            overall = "Low"
            risk_score = 25
            verdict = "Judicial Finding: Appeal / Petition Allowed. Lower order set aside with directives."
        elif "Dismissed" in disp:
            overall = "Medium"
            risk_score = 55
            verdict = "Judicial Finding: Appeal Dismissed. Lower judicial order upheld."
        elif high_count > 0:
            overall = "High"
            risk_score = 72
            verdict = "Judicial Finding: High Exposure. Impugned statutory rule or administrative order quashed for arbitrariness."
        else:
            overall = "Medium"
            risk_score = 48
            verdict = "Judicial Finding: Substantive judicial directives pronounced on statutory compliance."
    else:
        if high_count >= 1:
            overall = "High"
            risk_score = min(75 + (high_count * 5), 90)
            verdict = f"High Legal Exposure ({risk_score}/100): Critical red flags identified in high-liability clauses. Immediate redlining recommended."
        elif med_count >= 1:
            overall = "Medium"
            risk_score = min(45 + (med_count * 5), 65)
            verdict = f"Moderate Legal Exposure ({risk_score}/100): Standard commercial terms with notable asymmetry in termination or liability caps."
        else:
            overall = "Low"
            risk_score = 20
            verdict = f"Low Legal Exposure ({risk_score}/100): Balanced commercial terms aligned with industry standards."

    # Deduplicate critical flags
    flag_candidates = [c["title"] + ": " + c["risk_rationale"] for c in clauses if c["risk_level"] == "High"]
    if not flag_candidates and med_count > 0:
        flag_candidates = [c["title"] + ": " + c["risk_rationale"] for c in clauses if c["risk_level"] == "Medium"]
    
    critical_flags = list(dict.fromkeys(flag_candidates))[:4]

    return {
        "entities": entities,
        "clauses": clauses,
        "risk_analysis": {
            "overall_risk": overall,
            "risk_score": risk_score,
            "verdict": verdict,
            "high_risk_count": high_count,
            "medium_risk_count": med_count,
            "low_risk_count": low_count,
            "critical_flags": critical_flags
        }
    }
