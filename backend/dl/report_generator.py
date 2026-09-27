import os
import json
from datetime import datetime
from backend.nlp.extractor import CLAUSE_SCHEMA

def generate_report(analysis_data, mode="simplified"):
    doc_name = analysis_data.get("document_name", "Legal_Document.pdf")
    entities = analysis_data.get("entities", {})
    clauses = analysis_data.get("clauses", [])
    risk_analysis = analysis_data.get("risk_analysis", {})
    summary = analysis_data.get("summary", {})
    stats = analysis_data.get("stats", {})
    
    parties = entities.get("parties", ["Unspecified Parties"])
    parties_str = " & ".join(parties) if isinstance(parties, list) else str(parties)
    jurisdiction = entities.get("governing_jurisdiction", "Not specified / Standard")
    effective_date = entities.get("effective_date", datetime.now().strftime("%B %d, %Y"))
    overall_risk = risk_analysis.get("overall_risk", "Medium")
    risk_score = risk_analysis.get("risk_score", 50)
    verdict = risk_analysis.get("verdict", "Review terms before execution.")
    critical_flags = risk_analysis.get("critical_flags", [])
    
    if mode == "simplified":
        return generate_simplified_report(
            doc_name=doc_name,
            parties_str=parties_str,
            jurisdiction=jurisdiction,
            effective_date=effective_date,
            overall_risk=overall_risk,
            risk_score=risk_score,
            verdict=verdict,
            critical_flags=critical_flags,
            summary=summary,
            clauses=clauses,
            stats=stats
        )
    else:
        return generate_in_depth_report(
            doc_name=doc_name,
            entities=entities,
            parties_str=parties_str,
            jurisdiction=jurisdiction,
            effective_date=effective_date,
            overall_risk=overall_risk,
            risk_score=risk_score,
            verdict=verdict,
            critical_flags=critical_flags,
            summary=summary,
            clauses=clauses,
            stats=stats
        )

def generate_simplified_report(doc_name, parties_str, jurisdiction, effective_date, overall_risk, risk_score, verdict, critical_flags, summary, clauses, stats):
    high_risks = [c for c in clauses if c.get("risk_level") == "High"]
    med_risks = [c for c in clauses if c.get("risk_level") == "Medium"]
    low_risks = [c for c in clauses if c.get("risk_level") == "Low"]
    
    bottom_line = summary.get("bottom_line", verdict)
    exec_summary = summary.get("executive_summary", "A legal agreement between the parties establishing operational terms and conditions.")
    obligations = summary.get("key_obligations", [
        "Comply with basic payment and deliverable schedules.",
        "Maintain confidentiality over proprietary business information.",
        "Provide required notice before termination."
    ])
    action_items = summary.get("action_items", [
        "Carefully check contract duration and cancellation rules before signing.",
        "Ensure payment terms and deliverables are realistic.",
        "Verify liability caps protect you from unexpected claims."
    ])
    
    markdown_lines = []
    markdown_lines.append(f"# 📋 SIMPLIFIED CONTRACT SUMMARY & RISK GUIDE")
    markdown_lines.append(f"**Document Name:** {doc_name}  ")
    markdown_lines.append(f"**Parties Involved:** {parties_str}  ")
    markdown_lines.append(f"**Date:** {effective_date}  ")
    markdown_lines.append(f"**Governing Jurisdiction:** {jurisdiction}  ")
    markdown_lines.append(f"**Risk Exposure Score:** {risk_score}/100 ({overall_risk} Risk)  ")
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    markdown_lines.append("## ⚡ The Bottom Line (Quick Takeaway)")
    markdown_lines.append(f"> **{bottom_line}**")
    markdown_lines.append("")
    markdown_lines.append("## 📖 What is this document about in Plain English?")
    markdown_lines.append(exec_summary)
    markdown_lines.append("")
    markdown_lines.append("## ⚠️ What should you LOOK OUT FOR? (Red Flags & Hazards)")
    if critical_flags:
        for flag in critical_flags:
            markdown_lines.append(f"- 🔴 **Warning:** {flag}")
    else:
        markdown_lines.append("- 🟢 No critical one-sided clauses found. Terms appear balanced.")
    
    if high_risks or med_risks:
        markdown_lines.append("")
        markdown_lines.append("### Key Clauses with Potential Risks:")
        for c in high_risks + med_risks:
            title = c.get("title", c.get("clause_type", "Clause"))
            meaning = c.get("plain_english_meaning", c.get("text", ""))
            tip = c.get("negotiation_tip", "")
            risk_badge = "🔴 High Risk" if c.get("risk_level") == "High" else "🟠 Medium Risk"
            markdown_lines.append(f"- **{title}** ({risk_badge}): {meaning}")
            if tip:
                markdown_lines.append(f"  - *Advice:* {tip}")
    
    markdown_lines.append("")
    markdown_lines.append("## ✅ What are your Main Obligations?")
    for ob in obligations:
        markdown_lines.append(f"- ✔️ {ob}")
        
    markdown_lines.append("")
    markdown_lines.append("## 💡 What should you do next? (Action Steps)")
    for act in action_items:
        markdown_lines.append(f"1. {act}")
        
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("*Generated by Lexis Obsidian Legal Intelligence Engine. Intended for fast comprehension and risk awareness.*")

    return {
        "mode": "simplified",
        "title": f"Simplified Risk Guide - {doc_name}",
        "markdown": "\n".join(markdown_lines),
        "document_name": doc_name,
        "overall_risk": overall_risk,
        "risk_score": risk_score,
        "summary": {
            "bottom_line": bottom_line,
            "executive_summary": exec_summary,
            "critical_hazards": critical_flags,
            "key_obligations": obligations,
            "action_items": action_items
        },
        "key_clauses": [
            {
                "title": c.get("title", c.get("clause_type")),
                "risk_level": c.get("risk_level"),
                "plain_meaning": c.get("plain_english_meaning", c.get("text")),
                "advice": c.get("negotiation_tip", "")
            }
            for c in clauses
        ]
    }

def generate_in_depth_report(doc_name, entities, parties_str, jurisdiction, effective_date, overall_risk, risk_score, verdict, critical_flags, summary, clauses, stats):
    high_risks = [c for c in clauses if c.get("risk_level") == "High"]
    med_risks = [c for c in clauses if c.get("risk_level") == "Medium"]
    low_risks = [c for c in clauses if c.get("risk_level") == "Low"]
    
    parties = entities.get("parties", ["Unspecified Parties"])
    monetary_caps = entities.get("monetary_caps", [])
    notice_periods = entities.get("notice_periods", [])
    bench = entities.get("bench")
    case_no = entities.get("case_number")
    disposition = entities.get("disposition")
    
    caps_str = ", ".join(monetary_caps) if monetary_caps else "None explicitly stipulated"
    notice_str = ", ".join(notice_periods) if notice_periods else "Standard / Unspecified"
    
    markdown_lines = []
    markdown_lines.append(f"# ⚖️ FORMAL LEGAL MEMORANDUM & IN-DEPTH RISK AUDIT")
    markdown_lines.append(f"**TO:** Senior Legal Counsel & Managing Partners  ")
    markdown_lines.append(f"**FROM:** Lexis Obsidian Deep Learning Legal Auditor (Trained on 2000-2010 Supreme Court Corpus)  ")
    markdown_lines.append(f"**DATE OF AUDIT:** {datetime.now().strftime('%B %d, %Y')}  ")
    markdown_lines.append(f"**TARGET INSTRUMENT:** `{doc_name}`  ")
    markdown_lines.append(f"**PRIMARY PARTIES:** {parties_str}  ")
    markdown_lines.append(f"**GOVERNING JURISDICTION & VENUE:** {jurisdiction}  ")
    markdown_lines.append(f"**COMPLIANCE POSTURE:** {overall_risk.upper()} EXPOSURE ({risk_score}/100)  ")
    if bench:
        markdown_lines.append(f"**BENCH / CORAM:** {bench}  ")
    if case_no:
        markdown_lines.append(f"**CASE CITATION / DOCKET NO:** {case_no}  ")
    if disposition:
        markdown_lines.append(f"**JUDICIAL DISPOSITION:** {disposition}  ")
        
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    markdown_lines.append("## 1. EXECUTIVE LEGAL SUMMARY & AUDIT ABSTRACT")
    markdown_lines.append(f"**Overall Legal Verdict:** {verdict}")
    markdown_lines.append("")
    markdown_lines.append(summary.get("executive_summary", "Detailed legal examination indicates multi-faceted contractual commitments and liabilities."))
    markdown_lines.append("")
    markdown_lines.append(f"- **Total Clauses Indexed:** {len(clauses)}")
    markdown_lines.append(f"- **High-Risk Exposure Provisions:** {len(high_risks)}")
    markdown_lines.append(f"- **Moderate-Risk Provisions:** {len(med_risks)}")
    markdown_lines.append(f"- **Standard / Balanced Provisions:** {len(low_risks)}")
    markdown_lines.append(f"- **Identified Monetary Caps:** {caps_str}")
    markdown_lines.append(f"- **Statutory & Notice Windows:** {notice_str}")
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    markdown_lines.append("## 2. CRITICAL LEGAL ANOMALIES & EXPOSURE VULNERABILITIES")
    if critical_flags:
        for idx, flag in enumerate(critical_flags, 1):
            markdown_lines.append(f"### {idx}. Risk Item: {flag}")
            markdown_lines.append(f"- **Legal Implication:** Creates asymmetry of liability and prospective exposure to injunctive relief or uncapped consequential damages.")
            markdown_lines.append(f"- **Litigation Exposure Rating:** Severe / Actionable")
            markdown_lines.append("")
    else:
        markdown_lines.append("No critical statutory anomalies or unilateral indemnity burdens detected in baseline screening.")
        markdown_lines.append("")

    markdown_lines.append("---")
    markdown_lines.append("")
    markdown_lines.append("## 3. CLAUSE-BY-CLAUSE IN-DEPTH STATUTORY & CONTRACTUAL DISSECTION")
    
    for idx, c in enumerate(clauses, 1):
        title = c.get("title", c.get("clause_type", f"Clause {idx}"))
        risk = c.get("risk_level", "Low")
        raw_text = c.get("text", "")
        rationale = c.get("risk_rationale", "Standard commercial clause drafting.")
        meaning = c.get("plain_english_meaning", "")
        tip = c.get("negotiation_tip", "Standard commercial verification recommended.")
        
        risk_emoji = "🔴 [HIGH RISK]" if risk == "High" else "🟠 [MEDIUM RISK]" if risk == "Medium" else "🟢 [LOW RISK]"
        
        markdown_lines.append(f"### 3.{idx} {title} — {risk_emoji}")
        markdown_lines.append(f"**Verbatim Contractual Excerpt:**")
        markdown_lines.append(f"> *\"{raw_text}\"*")
        markdown_lines.append("")
        markdown_lines.append(f"- **Legal Risk Rationale:** {rationale}")
        markdown_lines.append(f"- **Operational & Legal Interpretation:** {meaning}")
        markdown_lines.append(f"- **Recommended Redline / Counsel Strategy:** {tip}")
        markdown_lines.append("")

    markdown_lines.append("---")
    markdown_lines.append("")
    markdown_lines.append("## 4. STATUTORY CITATIONS, JURISPRUDENCE & ENFORCEABILITY")
    markdown_lines.append("Based on historical precedents and comparative Indian / Common Law doctrines (2000-2010 Supreme Court jurisprudence):")
    markdown_lines.append("1. **Section 27, Indian Contract Act, 1872 (Restraint of Trade):** Restrictive covenants operating post-termination (non-compete clauses) are prima facie void unless strictly falling within statutory goodwill exceptions.")
    markdown_lines.append("2. **Section 73 & 74, Indian Contract Act (Liquidated Damages vs Penalty):** Liability caps and liquidated damages must represent genuine pre-estimates of loss; penal stipulations are unenforceable.")
    markdown_lines.append("3. **Exclusive Jurisdiction & Forum Selection:** Forum selection clauses require clear intentionality and mutuality. Ouster of civil court jurisdiction must be express and constitutionally compliant.")
    markdown_lines.append("4. **Indemnity Parity:** Unilateral indemnification without corresponding counterparty obligations imposes unmitigated third-party defense liabilities.")
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    markdown_lines.append("## 5. STRATEGIC COUNSEL CHECKLIST & REDLINE DIRECTIVES")
    for act in summary.get("action_items", []):
        markdown_lines.append(f"- [ ] **Action:** {act}")
    markdown_lines.append("- [ ] **Verification:** Ensure corporate signatory resolutions and power of attorney are attached as Schedule A.")
    markdown_lines.append("- [ ] **Notice Protocol:** Ensure notice addresses specify registered email and courier tracking requirements.")
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("*CONFIDENTIAL & PRIVILEGED LEGAL WORK PRODUCT. Prepared for institutional and legal professional analysis.*")

    return {
        "mode": "in_depth",
        "title": f"In-Depth Legal Opinion & Audit Dossier - {doc_name}",
        "markdown": "\n".join(markdown_lines),
        "document_name": doc_name,
        "overall_risk": overall_risk,
        "risk_score": risk_score,
        "metadata": {
            "parties": parties,
            "governing_jurisdiction": jurisdiction,
            "effective_date": effective_date,
            "monetary_caps": monetary_caps,
            "notice_periods": notice_periods,
            "bench": bench,
            "case_number": case_no,
            "disposition": disposition,
            "word_count": stats.get("word_count", 0),
            "token_count": stats.get("token_count", 0)
        },
        "verdict": verdict,
        "critical_flags": critical_flags,
        "clauses_analyzed": len(clauses),
        "high_risk_clauses": len(high_risks),
        "medium_risk_clauses": len(med_risks),
        "low_risk_clauses": len(low_risks)
    }
