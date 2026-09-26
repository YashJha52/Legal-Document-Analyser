import React, { useState } from "react"

export default function RiskAnalysisView({
  analysisResult,
  onSelectClauseForSplitView,
  onNavigateToDocuments
}) {
  const [activeBenchmark, setActiveBenchmark] = useState("standard")
  const [riskFilter, setRiskFilter] = useState("all")

  const riskData = analysisResult?.risk_analysis || {
    overall_risk: "Medium",
    risk_score: 55,
    verdict: "Moderate Legal Exposure: Review unilateral terms before execution.",
    high_risk_count: 1,
    medium_risk_count: 1,
    low_risk_count: 1,
    critical_flags: [
      "Unilateral 15-day termination for convenience favoring counterparty.",
      "12-month liability cap does not explicitly carve out data privacy breaches."
    ]
  }

  const clauses = analysisResult?.clauses || []

  const filteredClauses = clauses.filter((c) => {
    if (riskFilter === "all") return true
    return c.risk_level?.toLowerCase() === riskFilter.toLowerCase()
  })

  const getRiskBadge = (risk) => {
    const r = (risk || "Low").toLowerCase()
    if (r === "high") {
      return (
        <span className="px-3 py-1 rounded-full bg-[#FFEBEE] text-[#C62828] font-mono text-xs font-bold flex items-center gap-1 border border-[#FFCDD2]">
          <span className="material-symbols-outlined text-[14px]">error</span>
          High Risk
        </span>
      )
    }
    if (r === "medium") {
      return (
        <span className="px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E65100] font-mono text-xs font-bold flex items-center gap-1 border border-[#FFE0B2]">
          <span className="material-symbols-outlined text-[14px]">warning</span>
          Medium Risk
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-mono text-xs font-bold flex items-center gap-1 border border-[#C8E6C9]">
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
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
              Risk Assessment Studio
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Risk Analysis & Exposure
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1.5 max-w-2xl">
            Evaluate liability exposure, indemnity carve-outs, and clause deviation against institutional standards.
          </p>
        </div>

        {/* Benchmark Profile pill */}
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full text-xs font-mono text-on-surface border border-outline-variant/60 shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
          <span>Profile:</span>
          <span className="font-bold text-primary">
            {activeBenchmark === "standard"
              ? "Standard Enterprise"
              : activeBenchmark === "aba"
              ? "ABA Tech Standard 2024"
              : "Strict Buyer / Enterprise"}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
        {/* Risk Scorecard Hero */}
        <div className="bento-card md:col-span-8 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/50 pb-4">
            <div>
              <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
                Contract Exposure Posture
              </h3>
              <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                Target: {analysisResult?.document_name || "Active Contract"}
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

        {/* Preset Benchmarks Sidebar */}
        <div className="bento-card md:col-span-4 flex flex-col justify-between bg-surface-container-lowest space-y-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-1">
              Preset Benchmarks
            </h3>
            <p className="text-xs font-mono text-on-surface-variant mb-4">
              Select institutional compliance baseline for automated scoring:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div
                onClick={() => setActiveBenchmark("standard")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeBenchmark === "standard"
                    ? "border-2 border-primary bg-surface-container-low shadow-sm"
                    : "border-outline-variant/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <p className="font-semibold text-primary">Standard Commercial Baseline</p>
                </div>
                <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">
                  Default commercial standard for technology and services contracts.
                </p>
              </div>

              <div
                onClick={() => setActiveBenchmark("aba")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeBenchmark === "aba"
                    ? "border-2 border-primary bg-surface-container-low shadow-sm"
                    : "border-outline-variant/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
                  <p className="font-semibold text-primary">ABA Tech Standard 2024</p>
                </div>
                <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">
                  Enterprise SaaS & Data Services agreements default standard.
                </p>
              </div>

              <div
                onClick={() => setActiveBenchmark("buyer")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeBenchmark === "buyer"
                    ? "border-2 border-primary bg-surface-container-low shadow-sm"
                    : "border-outline-variant/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary text-[18px]">balance</span>
                  <p className="font-semibold text-primary">Strict Buyer / Enterprise</p>
                </div>
                <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">
                  Maximum IP ownership, strict indemnification, and extended cure periods.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/40">
            <button
              onClick={onNavigateToDocuments}
              className="w-full py-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-mono font-semibold hover:bg-secondary-fixed-dim transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
              <span>Switch Contract in Repository</span>
            </button>
          </div>
        </div>

        {/* Full Clause Risk Breakdown Table */}
        <div className="bento-card md:col-span-12 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">segment</span>
              Detailed Clause Risk Matrix ({filteredClauses.length} items)
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
                    <p className="font-body text-xs text-on-surface leading-relaxed">
                      {clause.plain_english_meaning || clause.text}
                    </p>
                    {clause.risk_rationale && (
                      <p className="font-mono text-[11px] text-risk-medium">
                        <strong>Exposure:</strong> {clause.risk_rationale}
                      </p>
                    )}
                    {clause.negotiation_tip && (
                      <p className="font-mono text-[11px] text-primary">
                        <strong>Recommendation:</strong> {clause.negotiation_tip}
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
    </section>
  )
}
