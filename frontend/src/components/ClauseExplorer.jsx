import React, { useState } from "react"

export default function ClauseExplorer({ clauses, onSelectClauseForSplitView }) {
  const [filter, setFilter] = useState("all")
  const [expandedIds, setExpandedIds] = useState({})

  if (!clauses || clauses.length === 0) {
    return (
      <div className="bento-card md:col-span-8 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-secondary mb-2">segment</span>
        <h4 className="font-headline text-lg font-bold text-primary mb-1">Clause Breakdown</h4>
        <p className="font-mono text-xs">No classified clauses detected yet. Upload or select a contract to analyze.</p>
      </div>
    )
  }

  const filteredClauses = clauses.filter((c) => {
    if (filter === "all") return true
    return c.risk_level?.toLowerCase() === filter.toLowerCase()
  })

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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

  return (
    <div className="bento-card md:col-span-8 flex flex-col justify-between space-y-5">
      <div>
        <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">segment</span>
              Detailed Clause Simplification
            </h3>
            <p className="font-mono text-xs text-on-surface-variant mt-0.5">
              Plain-English interpretations, risk explanations, and negotiation guidance
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {["all", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full capitalize transition-colors ${
                  filter === f
                    ? "bg-primary text-on-primary font-bold shadow-xs"
                    : "bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredClauses.map((clause, idx) => {
            const isExpanded = !!expandedIds[clause.clause_id ?? idx]
            const isHigh = clause.risk_level?.toLowerCase() === "high"

            return (
              <div
                key={clause.clause_id ?? idx}
                className={`bg-surface-container-low rounded-2xl p-5 border transition-all hover:border-primary/40 space-y-3.5 ${
                  isHigh ? "border-[#FFCDD2]" : "border-outline-variant"
                }`}
              >
                {/* Header: Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-body text-base font-bold text-primary">
                      {clause.title || clause.clause_type}
                    </h4>
                    {getRiskBadge(clause.risk_level)}
                  </div>

                  <button
                    onClick={() => onSelectClauseForSplitView(clause)}
                    className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-mono text-xs font-semibold transition-colors border border-outline-variant flex items-center gap-1.5 self-start sm:self-auto"
                    title="Compare Legalese vs Plain English Side-by-Side"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Compare Legalese</span>
                  </button>
                </div>

                {/* 1. Plain English Meaning */}
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-bold block mb-1">
                    Plain-English Translation
                  </span>
                  <p className="font-body text-sm text-on-surface leading-relaxed">
                    {clause.plain_english_meaning || clause.text}
                  </p>
                </div>

                {/* 2. Risk Rationale */}
                {clause.risk_rationale && (
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-risk-medium shrink-0 mt-0.5">
                      shield_alert
                    </span>
                    <div>
                      <strong className="text-on-surface font-semibold">Exposure Analysis: </strong>
                      <span>{clause.risk_rationale}</span>
                    </div>
                  </div>
                )}

                {/* 3. Negotiation Tip / Counter-Proposal */}
                {clause.negotiation_tip && (
                  <div className="bg-secondary-fixed/20 p-3 rounded-xl border border-secondary-fixed/40 text-xs text-on-secondary-fixed-variant flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">
                      lightbulb
                    </span>
                    <div>
                      <strong className="text-primary font-semibold">Negotiation Recommendation: </strong>
                      <span>{clause.negotiation_tip}</span>
                    </div>
                  </div>
                )}

                {/* 4. Collapsible Original Text */}
                <div className="pt-1 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => toggleExpand(clause.clause_id ?? idx)}
                    className="text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <span>{isExpanded ? "Hide Original Contract Text" : "View Original Contract Text"}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      {isExpanded ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                </div>

                {isExpanded && (
                  <pre className="mt-2 p-3 bg-surface-container-lowest rounded-xl text-xs text-on-surface font-mono whitespace-pre-wrap border border-outline-variant/40 leading-relaxed">
                    {clause.text}
                  </pre>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
