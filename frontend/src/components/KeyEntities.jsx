import React from "react"

export default function KeyEntities({ entities }) {
  if (!entities) return null

  const partyList = entities.parties && entities.parties.length > 0
    ? entities.parties.join(" & ")
    : "Not explicitly extracted"

  const monetaryText = entities.monetary_caps && entities.monetary_caps.length > 0
    ? entities.monetary_caps.join(", ")
    : "None specified"

  const noticeText = entities.notice_periods && entities.notice_periods.length > 0
    ? entities.notice_periods.join(", ")
    : "30 days (standard)"

  return (
    <div className="bento-card md:col-span-4 flex flex-col justify-between">
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Key Entities
        </h3>

        <div className="space-y-3.5">
          {/* Primary Party */}
          <div className="flex items-center gap-4 py-2 border-b border-outline-variant/40">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-on-surface-variant uppercase">Primary Parties</p>
              <p className="font-body text-sm text-primary font-semibold truncate" title={partyList}>
                {partyList}
              </p>
            </div>
          </div>

          {/* Effective Date */}
          <div className="flex items-center gap-4 py-2 border-b border-outline-variant/40">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <div>
              <p className="font-mono text-xs text-on-surface-variant uppercase">Effective Date</p>
              <p className="font-body text-sm text-primary font-semibold">
                {entities.effective_date || "Not Specified"}
              </p>
            </div>
          </div>

          {/* Jurisdiction */}
          <div className="flex items-center gap-4 py-2 border-b border-outline-variant/40">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <div>
              <p className="font-mono text-xs text-on-surface-variant uppercase">Jurisdiction</p>
              <p className="font-body text-sm text-primary font-semibold">
                {entities.governing_jurisdiction || "Delaware / Standard"}
              </p>
            </div>
          </div>

          {/* Liability Cap */}
          <div className="flex items-center gap-4 py-2 border-b border-outline-variant/40">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <div>
              <p className="font-mono text-xs text-on-surface-variant uppercase">Liability Cap</p>
              <p className="font-mono text-sm text-primary font-semibold">
                {monetaryText}
              </p>
            </div>
          </div>

          {/* Notice Period */}
          <div className="flex items-center gap-4 py-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <div>
              <p className="font-mono text-xs text-on-surface-variant uppercase">Notice Window</p>
              <p className="font-body text-sm text-primary font-semibold">
                {noticeText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
