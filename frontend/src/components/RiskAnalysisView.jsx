import React, { useState } from "react"

export default function RiskAnalysisView({
  analysisResult,
  onSelectClauseForSplitView,
  onNavigateToDocuments,
  onOpenReportModal
}) {
  const [viewMode, setViewMode] = useState("simplified") // "simplified" | "in_depth"
  const [riskFilter, setRiskFilter] = useState("all")

  if (!analysisResult) {
    return (
      <section className="space-y-6 animate-in fade-in duration-200 font-sans">
        <div className="bento-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">shield_lock</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-primary mb-2">
            No Document Loaded for Risk Analysis
          </h3>
          <p className="text-xs font-body text-on-surface-variant max-w-md mb-6 leading-relaxed">
            Upload or paste a commercial agreement or court judgment on the Dashboard to view the simplified user risk checklist and in-depth counsel dissection.
          </p>
          <button
            onClick={onNavigateToDocuments}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-mono text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Go to Documents / Upload</span>
          </button>
        </div>
      </section>
    )
  }

  const riskData = analysisResult.risk_analysis || {
    overall_risk: "Medium",
    risk_score: 50,
    verdict: "Standard legal review required.",
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    critical_flags: []
  }

  const summary = analysisResult.summary || {}
  const clauses = analysisResult.clauses || []
  const entities = analysisResult.entities || {}
  const caseTopic = analysisResult.case_topic || riskData.case_topic || {}
  const docType = entities.document_type || analysisResult.document_type || ""
  const isFir = docType === "fir"
  const isSubpoena = docType === "subpoena"
  const isSupremeCourt = docType === "supreme_court_judgment"
  const isJudgment = docType === "court_judgment" || isSupremeCourt
  const isSummons = docType === "court_summons"

  const filteredClauses = clauses.filter((c) => {
    if (riskFilter === "all") return true
    return c.risk_level?.toLowerCase() === riskFilter.toLowerCase()
  })

  const getRiskBadge = (risk) => {
    const r = (risk || "Low").toLowerCase()
    if (r === "high") {
      return (
        <span className="px-3 py-1 rounded-full bg-[#FFEBEE] text-[#C62828] font-mono text-xs font-bold flex items-center gap-1 border border-[#FFCDD2] shadow-xs">
          <span className="material-symbols-outlined text-[14px]">error</span>
          High Risk
        </span>
      )
    }
    if (r === "medium") {
      return (
        <span className="px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E65100] font-mono text-xs font-bold flex items-center gap-1 border border-[#FFE0B2] shadow-xs">
          <span className="material-symbols-outlined text-[14px]">warning</span>
          Medium Risk
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-mono text-xs font-bold flex items-center gap-1 border border-[#C8E6C9] shadow-xs">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        Low Risk
      </span>
    )
  }

  const score = riskData.risk_score !== undefined
    ? riskData.risk_score
    : riskData.overall_risk?.toLowerCase() === "high"
    ? 85
    : riskData.overall_risk?.toLowerCase() === "medium"
    ? 55
    : 20

  return (
    <section className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
              Risk Assessment Studio
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Risk Analysis & Legal Evaluation
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1.5 max-w-2xl">
            Choose between a simplified summary for everyday users or in-depth statutory analysis for legal professionals.
          </p>
        </div>

        {/* 2 Clear Options Toggle: Simplified vs In-Depth */}
        <div className="flex items-center gap-2 bg-surface-container-high p-1.5 rounded-full border border-outline-variant/60 font-mono text-xs shadow-xs">
          <button
            onClick={() => setViewMode("simplified")}
            className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
              viewMode === "simplified"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Simplified (Basic Users)</span>
          </button>

          <button
            onClick={() => setViewMode("in_depth")}
            className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
              viewMode === "in_depth"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>In-Depth (Lawyers & Counsel)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Simplified View for Everyday Users / Commonfolk */}
      {viewMode === "simplified" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Main Risk Highlight Card */}
          <div className="bento-card p-6 space-y-4 border-2 border-secondary-fixed/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                  Everyday Summary & Risk Checklist
                </span>
                <h3 className="font-headline text-2xl font-bold text-primary mt-1">
                  What is the Bottom Line?
                </h3>
                <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                  Document: {analysisResult?.document_name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-xs text-on-surface-variant block">Risk Level</span>
                  <span className="text-lg font-bold text-primary">{score} / 100</span>
                </div>
                {getRiskBadge(riskData.overall_risk)}
              </div>
            </div>

            {/* Plain-English Verdict */}
            <div className="p-4 rounded-2xl bg-secondary-fixed/20 border border-secondary-fixed text-primary font-body text-sm leading-relaxed">
              <p className="font-bold text-base mb-1">
                {summary.bottom_line || riskData.verdict}
              </p>
              <p className="text-on-surface text-xs leading-relaxed mt-1">
                {summary.executive_summary || "This document specifies rights, obligations, and rules agreed upon between the parties."}
              </p>
            </div>

            {/* Exposure progress meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-semibold">
                <span className="text-secondary">Overall Contract Safety:</span>
                <span className="text-primary">
                  {score >= 70 ? "High Exposure — Pay Attention" : score >= 40 ? "Moderate Exposure — Standard" : "Low Exposure — Relatively Safe"}
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score >= 70 ? "bg-[#C62828]" : score >= 40 ? "bg-[#E65100]" : "bg-[#2E7D32]"
                  }`}
                  style={{ width: `${Math.max(score, 6)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main Topic & Origin of Dispute / Proceedings Card */}
          <div className="bento-card p-6 space-y-4 border-2 border-primary/20 bg-surface-container-lowest shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/50 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-2xl">
                    {isFir ? "local_police" : isSubpoena ? "inventory" : isSupremeCourt ? "account_balance" : isJudgment ? "balance" : isSummons ? "assignment_ind" : "description"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs uppercase tracking-wider font-bold text-secondary">
                      Core Case Topic & Context
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[10px] font-mono text-primary font-bold border border-outline-variant">
                      {isFir ? "FIR Particulars" : isSubpoena ? "Subpoena Mandate" : isSupremeCourt ? "Supreme Court Precedent" : isJudgment ? "Court Judgment" : isSummons ? "Court Summons" : "Contract Scope"}
                    </span>
                  </div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-primary mt-0.5">
                    {caseTopic.topic_title || (isFir ? "What This FIR is About" : isSubpoena ? "What & Why They Are Taking" : isJudgment ? "Original Case Topic & Verdict" : "Main Topic of Document")}
                  </h3>
                </div>
              </div>

              {caseTopic.legal_status && (
                <span className="px-3.5 py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs font-mono font-semibold border border-secondary-fixed self-start sm:self-auto">
                  {caseTopic.legal_status}
                </span>
              )}
            </div>

            {/* 3-Section Grid: What It's About, Why It Occurred, Demanded Action / Verdict */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Tile 1: What It's About / What They Are Taking */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-primary font-mono text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {isSubpoena ? "inventory_2" : isFir ? "emergency" : "help_center"}
                    </span>
                    <span>
                      {isSubpoena
                        ? "1. What They Are Taking"
                        : isFir
                        ? "1. What This FIR is About"
                        : isJudgment
                        ? "1. Original Case Topic"
                        : isSummons
                        ? "1. What the Suit is About"
                        : "1. Core Subject Matter"}
                    </span>
                  </div>
                  <p className="font-body text-xs text-on-surface leading-relaxed">
                    {isSubpoena
                      ? (caseTopic.what_they_are_taking || caseTopic.what_its_about)
                      : isJudgment
                      ? (caseTopic.original_case_topic || caseTopic.what_its_about)
                      : (caseTopic.what_its_about || "Core factual allegations and operative provisions stipulated in the text.")}
                  </p>
                </div>
              </div>

              {/* Tile 2: Why It Occurred / Why They Are Taking It */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-primary font-mono text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {isSubpoena ? "psychology_alt" : "history_edu"}
                    </span>
                    <span>
                      {isSubpoena
                        ? "2. Why They Are Taking It"
                        : isFir
                        ? "2. Why This FIR Occurred"
                        : isJudgment
                        ? "2. Why Case Occurred (Dispute)"
                        : isSummons
                        ? "2. Why Summons Occurred"
                        : "2. Operational Purpose"}
                    </span>
                  </div>
                  <p className="font-body text-xs text-on-surface leading-relaxed">
                    {isSubpoena
                      ? (caseTopic.why_they_are_taking_it || caseTopic.why_it_occurred)
                      : (caseTopic.why_it_occurred || "Dispute or commercial negotiations requiring formal legal instrument.")}
                  </p>
                </div>
              </div>

              {/* Tile 3: Final Verdict / Production Directive / Legal Orders */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-primary font-mono text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {isJudgment ? "gavel" : "verified"}
                    </span>
                    <span>
                      {isJudgment
                        ? "3. Final Supreme Court Verdict"
                        : isSubpoena
                        ? "3. Compliance Deadline & Orders"
                        : isFir
                        ? "3. Police Investigation Status"
                        : isSummons
                        ? "3. Court Date & Ex-Parte Warning"
                        : "3. Legal Standing"}
                    </span>
                  </div>
                  <p className="font-body text-xs text-on-surface leading-relaxed font-medium">
                    {isJudgment
                      ? (caseTopic.verdict || caseTopic.demanded_items_or_verdict)
                      : (caseTopic.demanded_items_or_verdict || "Governing rules and binding obligations in force.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Section: What to Look Out For vs Key Points of the Case */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-bento-gap">
            {/* Column 1: What Should You Look Out For? */}
            <div className={`bento-card p-6 space-y-4 ${
              riskData.overall_risk?.toLowerCase() === "low"
                ? "bg-[#E8F5E9]/40 border border-[#C8E6C9]"
                : "bg-[#FFEBEE]/30 border border-[#FFCDD2]"
            }`}>
              <div className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider ${
                riskData.overall_risk?.toLowerCase() === "low" ? "text-[#2E7D32]" : "text-[#C62828]"
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {riskData.overall_risk?.toLowerCase() === "low" ? "check_circle" : "warning"}
                </span>
                <span>
                  {riskData.overall_risk?.toLowerCase() === "low"
                    ? "Risk Exposure Status: Low Risk (Safe / Discharged)"
                    : "What Should You Look Out For? (Traps & Red Flags)"}
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                {Array.from(new Set(riskData.critical_flags || [])).length > 0 ? (
                  Array.from(new Set(riskData.critical_flags || [])).slice(0, 4).map((flag, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#5c1d1d] flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#C62828] text-[18px] shrink-0 mt-0.5">
                        report
                      </span>
                      <p className="leading-relaxed font-medium">{flag}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#1B5E20] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2E7D32] text-[18px]">verified</span>
                    <span className="font-semibold">
                      {riskData.overall_risk?.toLowerCase() === "low"
                        ? "No high-risk liabilities detected. Proceedings disposed or terms balanced."
                        : "No critical red flags detected."}
                    </span>
                  </div>
                )}

                {Array.from(new Set(summary.critical_hazards || [])).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#FFCDD2]">
                    <span className="font-mono text-[11px] font-bold text-[#C62828] uppercase block">
                      Specific Key Hazards to Check:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#5c1d1d]">
                      {Array.from(new Set(summary.critical_hazards || [])).map((haz, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#C62828] font-bold">•</span>
                          <span>{haz}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Key Points & Obligations */}
            <div className="bento-card p-6 space-y-4 bg-surface-container-low border border-outline-variant/60">
              <div className="flex items-center gap-2 text-secondary font-mono text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Key Points & What You Must Do</span>
              </div>

              <div className="space-y-3 font-sans text-xs text-on-surface">
                {Array.from(new Set(summary.key_obligations || [])).length > 0 ? (
                  Array.from(new Set(summary.key_obligations || [])).map((ob, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                        task_alt
                      </span>
                      <p className="leading-relaxed">{ob}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant">No special obligations identified.</p>
                )}

                {Array.from(new Set(summary.action_items || [])).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                    <span className="font-mono text-[11px] font-bold text-primary uppercase block">
                      Recommended Steps Before Signing:
                    </span>
                    <ul className="space-y-1.5 text-xs text-on-surface">
                      {Array.from(new Set(summary.action_items || [])).map((act, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-primary font-bold">→</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simplified Clause Cards Grid */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">format_list_bulleted</span>
              Everyday Clause Explanations ({clauses.length} items)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clauses.map((clause, idx) => (
                <div
                  key={clause.clause_id ?? idx}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-headline font-bold text-sm text-primary">
                        {clause.title || clause.clause_type}
                      </h4>
                      {getRiskBadge(clause.risk_level)}
                    </div>
                    <p className="font-body text-xs text-on-surface leading-relaxed">
                      {clause.plain_english_meaning || clause.text}
                    </p>
                  </div>

                  {clause.negotiation_tip && (
                    <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[11px] font-mono text-primary flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[14px] shrink-0 mt-0.5">
                        lightbulb
                      </span>
                      <span><strong>Tip:</strong> {clause.negotiation_tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: In-Depth Analysis for Lawyers & Legal Professionals */}
      {viewMode === "in_depth" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
            {/* Contract Exposure Posture & KPIs (12 cols) */}
            <div className="bento-card md:col-span-12 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/50 pb-4">
                <div>
                  <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
                    Institutional Exposure & Statutory Dissection
                  </h3>
                  <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                    Target: {analysisResult?.document_name || "Active Contract"} • Corpus Benchmark: 2000-2010 SC Precedents
                  </p>
                </div>
                <div>{getRiskBadge(riskData.overall_risk)}</div>
              </div>

              {/* Exposure Meter */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60 space-y-2">
                <div className="flex justify-between items-center font-mono text-xs font-bold">
                  <span className="text-secondary uppercase">Risk Exposure Index</span>
                  <span className="text-primary text-sm">{score} / 100</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 70 ? "bg-[#C62828]" : score >= 40 ? "bg-[#E65100]" : "bg-[#2E7D32]"
                    }`}
                    style={{ width: `${Math.max(score, 6)}%` }}
                  />
                </div>
              </div>

              {/* Metric KPI Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60">
                  <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Total Tokens</span>
                  <p className="font-mono text-2xl font-bold text-primary mt-1">{analysisResult?.stats?.token_count || 312}</p>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-4 border border-[#FFCDD2]/60">
                  <span className="font-mono text-xs text-[#C62828] uppercase tracking-wider font-semibold">High Risks</span>
                  <p className="font-mono text-2xl font-bold text-[#C62828] mt-1">{riskData.high_risk_count || 0}</p>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-4 border border-[#FFE0B2]/60">
                  <span className="font-mono text-xs text-[#E65100] uppercase tracking-wider font-semibold">Medium Risks</span>
                  <p className="font-mono text-2xl font-bold text-[#E65100] mt-1">{riskData.medium_risk_count || 0}</p>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-4 border border-[#C8E6C9]/60">
                  <span className="font-mono text-xs text-[#2E7D32] uppercase tracking-wider font-semibold">Low Risks</span>
                  <p className="font-mono text-2xl font-bold text-[#2E7D32] mt-1">{riskData.low_risk_count || 0}</p>
                </div>
              </div>

              {/* Critical Risk Flags */}
              {riskData.critical_flags && riskData.critical_flags.length > 0 && (
                <div className="bg-[#FFEBEE]/60 border border-[#FFCDD2] rounded-2xl p-4 space-y-2.5">
                  <span className="font-mono text-xs font-bold text-[#C62828] flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    Critical Risk Flags & Anomalies Detected
                  </span>
                  <ul className="space-y-2 text-xs text-[#5c1d1d] font-body">
                    {riskData.critical_flags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[#C62828] font-bold text-sm leading-none">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Filters */}
              <div className="border-t border-outline-variant/40 pt-4">
                <label className="block text-xs font-semibold text-primary font-mono uppercase tracking-wider mb-2.5">
                  Filter Clause Exposure
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <button
                    onClick={() => setRiskFilter(riskFilter === "high" ? "all" : "high")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      riskFilter === "high"
                        ? "border-error ring-2 ring-error/30 bg-[#fff8f7]"
                        : "border-error-container bg-[#fff8f7]/70 hover:bg-[#fff8f7]"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-error shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-error">High Risk</p>
                      <p className="text-[10px] text-on-surface-variant">Unilateral / Capped $0</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setRiskFilter(riskFilter === "medium" ? "all" : "medium")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      riskFilter === "medium"
                        ? "border-[#f57c00] ring-2 ring-[#f57c00]/30 bg-[#fffcf5]"
                        : "border-[#ffe0b2] bg-[#fffcf5]/70 hover:bg-[#fffcf5]"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#f57c00] shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-[#b26a00]">Medium Risk</p>
                      <p className="text-[10px] text-on-surface-variant">Notice &lt; 30d / IP grant</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setRiskFilter(riskFilter === "low" ? "all" : "low")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      riskFilter === "low"
                        ? "border-[#2e7d32] ring-2 ring-[#2e7d32]/30 bg-[#f9fdf9]"
                        : "border-[#c8e6c9] bg-[#f9fdf9]/70 hover:bg-[#f9fdf9]"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#2e7d32] shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-[#2e7d32]">Low Risk</p>
                      <p className="text-[10px] text-on-surface-variant">Standard mutual terms</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Clause Matrix for Lawyers (12 cols) */}
            <div className="bento-card md:col-span-12 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2 border-b border-outline-variant/50 pb-3">
                <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-2xl">segment</span>
                  Clause-by-Clause Dissection & Legal Counsel Annotations ({filteredClauses.length} items)
                </h3>
                {riskFilter !== "all" && (
                  <button
                    onClick={() => setRiskFilter("all")}
                    className="font-mono text-xs text-secondary hover:text-primary underline"
                  >
                    Clear filter (showing {riskFilter} risk only)
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredClauses.length > 0 ? (
                  filteredClauses.map((clause, idx) => (
                    <div
                      key={clause.clause_id ?? idx}
                      className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-primary/40"
                    >
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-body text-base font-bold text-primary">
                            {clause.title || clause.clause_type}
                          </h4>
                          {getRiskBadge(clause.risk_level)}
                        </div>

                        {/* Raw excerpt block */}
                        <blockquote className="font-mono text-[11px] text-on-surface bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 italic">
                          "{clause.text}"
                        </blockquote>

                        <p className="font-body text-xs text-on-surface leading-relaxed">
                          <strong>Operational Scope:</strong> {clause.plain_english_meaning || clause.text}
                        </p>

                        {clause.risk_rationale && (
                          <p className="font-mono text-[11px] text-risk-medium">
                            <strong>Legal Exposure Rationale:</strong> {clause.risk_rationale}
                          </p>
                        )}

                        {clause.negotiation_tip && (
                          <p className="font-mono text-[11px] text-primary">
                            <strong>Strategic Redline / Negotiation Direction:</strong> {clause.negotiation_tip}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
                        <button
                          onClick={() => onSelectClauseForSplitView(clause)}
                          className="px-4 py-2 rounded-full bg-primary text-on-primary font-mono text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Compare Legalese</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-on-surface-variant font-mono text-xs">
                    No clauses matched the selected risk filter ({riskFilter}).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
