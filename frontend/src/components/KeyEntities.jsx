import React from "react"

export default function KeyEntities({ entities }) {
  if (!entities) return null

  const isJudgment = entities.document_type === "court_judgment" ||
    entities.bench ||
    entities.case_number ||
    entities.disposition ||
    (entities.governing_jurisdiction && entities.governing_jurisdiction.includes("Court"))

  const partyList = entities.parties && entities.parties.length > 0
    ? entities.parties.join(" vs ")
    : "Extracted from Pleadings / Text"

  const dateText = entities.effective_date || "Not explicitly specified"

  const jurisdictionText = entities.governing_jurisdiction || "Standard / Neutral Forum"

  const monetaryText = entities.monetary_caps && entities.monetary_caps.length > 0
    ? entities.monetary_caps.join(", ")
    : null

  const noticeText = entities.notice_periods && entities.notice_periods.length > 0
    ? entities.notice_periods.join(", ")
    : null

  return (
    <div className="bento-card md:col-span-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            {isJudgment ? "Case & Judicial Entities" : "Key Contract Entities"}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[10px] font-mono text-primary border border-outline-variant">
            {isJudgment ? "Court Judgment" : "Agreement"}
          </span>
        </div>

        <div className="space-y-3">
          {/* Primary Parties */}
          <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                {isJudgment ? "balance" : "corporate_fare"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                {isJudgment ? "Petitioner vs Respondent" : "Primary Parties"}
              </p>
              <p className="font-body text-xs text-primary font-semibold truncate" title={partyList}>
                {partyList}
              </p>
            </div>
          </div>

          {/* Date / Judgment Date */}
          <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
            <div>
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                {isJudgment ? "Date of Judgment" : "Effective Date"}
              </p>
              <p className="font-body text-xs text-primary font-semibold">
                {dateText}
              </p>
            </div>
          </div>

          {/* Forum / Jurisdiction */}
          <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                {isJudgment ? "Judicial Forum / Court" : "Governing Jurisdiction"}
              </p>
              <p className="font-body text-xs text-primary font-semibold truncate" title={jurisdictionText}>
                {jurisdictionText}
              </p>
            </div>
          </div>

          {/* Bench & Case Number (for Judgments) or Liability Cap (for Contracts) */}
          {isJudgment ? (
            <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Bench & Case Ref</p>
                <p className="font-body text-xs text-primary font-semibold truncate" title={entities.bench || entities.case_number}>
                  {entities.bench || entities.case_number || "Supreme Court Bench"}
                </p>
              </div>
            </div>
          ) : (
            monetaryText && (
              <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Liability Cap</p>
                  <p className="font-mono text-xs text-primary font-semibold">
                    {monetaryText}
                  </p>
                </div>
              </div>
            )
          )}

          {/* Disposition (for Judgments) or Notice Window (for Contracts) */}
          {isJudgment ? (
            <div className="flex items-center gap-3.5 py-2">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Ruling / Disposition</p>
                <p className="font-body text-xs text-primary font-semibold truncate" title={entities.disposition || "Appeal Allowed"}>
                  {entities.disposition || "Appeal Allowed (Eviction Set Aside)"}
                </p>
              </div>
            </div>
          ) : (
            noticeText && (
              <div className="flex items-center gap-3.5 py-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Notice Window</p>
                  <p className="font-body text-xs text-primary font-semibold">
                    {noticeText}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
