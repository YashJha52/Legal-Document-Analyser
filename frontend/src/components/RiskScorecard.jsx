import React from "react"

export default function RiskScorecard({ riskAnalysis, stats }) {
  if (!riskAnalysis) return null

  const overall = (riskAnalysis.overall_risk || "Low").toLowerCase()

  const getOverallBadge = () => {
    if (overall === "high") {
      return (
        <span className="px-4 py-1.5 rounded-full bg-[#FFEBEE] text-[#C62828] font-mono text-xs font-bold flex items-center gap-2 border border-[#FFCDD2] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#C62828] animate-pulse" />
          Overall Risk: High
        </span>
      )
    }
    if (overall === "medium") {
      return (
        <span className="px-4 py-1.5 rounded-full bg-[#FFF3E0] text-[#E65100] font-mono text-xs font-bold flex items-center gap-2 border border-[#FFE0B2] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#E65100]" />
          Overall Risk: Medium
        </span>
      )
    }
    return (
      <span className="px-4 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-mono text-xs font-bold flex items-center gap-2 border border-[#C8E6C9] shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
        Overall Risk: Low
      </span>
    )
  }

  return (
    <div className="bento-card md:col-span-12 space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/50 pb-4">
        <div>
          <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
            Legal Risk Scorecard
          </h3>
          <p className="font-mono text-xs text-on-surface-variant mt-0.5">
            Automated liability, indemnification & contract exposure analysis
          </p>
        </div>
        <div>{getOverallBadge()}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60">
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Estimated Tokens</span>
          <p className="font-mono text-2xl font-bold text-primary mt-1">{stats?.token_count || 0}</p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 border border-[#FFCDD2]/60">
          <span className="font-mono text-xs text-[#C62828] uppercase tracking-wider font-semibold">High Risks</span>
          <p className="font-mono text-2xl font-bold text-[#C62828] mt-1">{riskAnalysis.high_risk_count || 0}</p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 border border-[#FFE0B2]/60">
          <span className="font-mono text-xs text-[#E65100] uppercase tracking-wider font-semibold">Medium Risks</span>
          <p className="font-mono text-2xl font-bold text-[#E65100] mt-1">{riskAnalysis.medium_risk_count || 0}</p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 border border-[#C8E6C9]/60">
          <span className="font-mono text-xs text-[#2E7D32] uppercase tracking-wider font-semibold">Low Risks</span>
          <p className="font-mono text-2xl font-bold text-[#2E7D32] mt-1">{riskAnalysis.low_risk_count || 0}</p>
        </div>
      </div>

      {riskAnalysis.critical_flags && riskAnalysis.critical_flags.length > 0 && (
        <div className="bg-[#FFEBEE]/60 border border-[#FFCDD2] rounded-2xl p-4 space-y-2">
          <span className="font-mono text-xs font-bold text-[#C62828] flex items-center gap-1.5 uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Critical Risk Flags Detected
          </span>
          <ul className="space-y-1.5 text-xs text-[#5c1d1d] font-body">
            {riskAnalysis.critical_flags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#C62828] font-bold">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
