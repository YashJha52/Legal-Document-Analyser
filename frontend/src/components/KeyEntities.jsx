import React from "react"

export default function KeyEntities({
  entities,
  className = "",
  onWidthChange,
  currentWidthPercent = 34,
  onResetWidth,
  onDragStart,
  isDragging = false
}) {
  if (!entities) return null

  const docType = entities.document_type
  const isSupremeCourt = docType === "supreme_court_judgment"
  const isJudgment = docType === "court_judgment" || isSupremeCourt ||
    (!docType && (entities.bench || entities.case_number || entities.disposition || (entities.governing_jurisdiction && entities.governing_jurisdiction.includes("Court"))))
  const isFir = docType === "fir"
  const isSummons = docType === "court_summons"
  const isSubpoena = docType === "subpoena"
  const isCaseFile = docType === "case_file"
  const isNotice = docType === "legal_notice"

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
    <div className={`bento-card relative flex flex-col justify-between ${className || "md:col-span-4"}`}>
      {/* Interactive Drag Handle Overlay on Left Border */}
      {onDragStart && (
        <div
          onMouseDown={onDragStart}
          className={`hidden md:block absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 select-none group ${
            isDragging ? "opacity-100" : "opacity-0 hover:opacity-100"
          } transition-opacity`}
          title="Drag to resize this section width"
        >
          <div className="w-1 h-full mx-auto bg-secondary rounded-full shadow-xs" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            {onDragStart && (
              <button
                type="button"
                onMouseDown={onDragStart}
                className="hidden md:inline-flex items-center justify-center cursor-col-resize text-on-surface-variant hover:text-secondary p-0.5 rounded hover:bg-surface-container-high transition-colors"
                title="Drag to resize panel width"
              >
                <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
              </button>
            )}
            <h3 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              {isSupremeCourt
                ? "Supreme Court Precedent Entities"
                : isJudgment
                ? "Court Judgment Entities"
                : isSummons
                ? "Court Summons Notice Entities"
                : isSubpoena
                ? "Subpoena Mandate Entities"
                : isFir
                ? "FIR Registration Particulars"
                : isCaseFile
                ? "Case File & Docket Entities"
                : isNotice
                ? "Legal Notice Entities"
                : "Key Contract Entities"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {onWidthChange && (
              <button
                type="button"
                onClick={() => onWidthChange(currentWidthPercent > 44 ? 34 : 52)}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono border border-outline-variant/80 hover:bg-surface-container-highest text-secondary font-medium transition-all flex items-center gap-1 shadow-2xs"
                title={currentWidthPercent > 44 ? "Reset to standard width (34%)" : "Expand width to 52% to view complete text"}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {currentWidthPercent > 44 ? "close_fullscreen" : "open_in_full"}
                </span>
                <span>{currentWidthPercent > 44 ? "34%" : "Expand"}</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[10px] font-mono text-primary border border-outline-variant font-bold">
              {entities.document_type_label || (
                isSupremeCourt ? "Supreme Court Judgment" :
                isSummons ? "Court Summons" :
                isSubpoena ? "Subpoena" :
                isJudgment ? "Court Judgment" :
                isFir ? "FIR" :
                isCaseFile ? "Case File" :
                isNotice ? "Legal Notice" : "Commercial Contract"
              )}
            </span>
          </div>
        </div>

        {entities.document_type_rationale && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-[11px] font-mono text-secondary flex items-start gap-2 shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">verified</span>
            <span className="leading-snug break-words">{entities.document_type_rationale}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Primary Parties */}
          <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                {isSupremeCourt
                  ? "account_balance"
                  : (isJudgment || isCaseFile)
                  ? "balance"
                  : isSummons
                  ? "assignment_ind"
                  : isSubpoena
                  ? "inventory"
                  : isFir
                  ? "local_police"
                  : isNotice
                  ? "mark_email_read"
                  : "corporate_fare"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                {isSummons
                  ? "Issuing Court / Plaintiff vs Summoned Party"
                  : isSubpoena
                  ? "Issuing Authority / Court vs Subpoenaed Witness"
                  : isFir
                  ? "Complainant / Informant vs Accused"
                  : (isJudgment || isCaseFile || isNotice)
                  ? "Petitioner vs Respondent"
                  : "Primary Contracting Parties"}
              </p>
              <p className="font-body text-xs text-primary font-semibold break-words leading-snug" title={partyList}>
                {partyList}
              </p>
            </div>
          </div>

          {/* Date / Appearance Date */}
          <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                {isSummons
                  ? "Scheduled Hearing / Appearance Date"
                  : isSubpoena
                  ? "Subpoena Compliance / Return Date"
                  : isFir
                  ? "Date of Incident / Report"
                  : isSupremeCourt
                  ? "Date of Apex Pronouncement"
                  : isJudgment
                  ? "Date of Judgment"
                  : isCaseFile
                  ? "Date of Filing"
                  : isNotice
                  ? "Date of Notice"
                  : "Effective Date"}
              </p>
              <p className="font-body text-xs text-primary font-semibold break-words leading-snug">
                {dateText}
              </p>
            </div>
          </div>

          {/* Forum / Jurisdiction */}
          <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                {isFir
                  ? "Police Station & Cognizance Jurisdiction"
                  : isSummons
                  ? "Issuing Court Forum / Bench"
                  : isSubpoena
                  ? "Issuing Judicial Forum / District"
                  : isSupremeCourt
                  ? "Apex Judicial Forum / Bench"
                  : isJudgment
                  ? "Judicial Forum / Court"
                  : isCaseFile
                  ? "Court / Forum"
                  : "Governing Jurisdiction"}
              </p>
              <p className="font-body text-xs text-primary font-semibold break-words leading-snug" title={jurisdictionText}>
                {jurisdictionText}
              </p>
            </div>
          </div>

          {/* Bench & Case Ref or Liability Cap */}
          {(isJudgment || isFir || isCaseFile || isSummons || isSubpoena) ? (
            <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  {isFir ? "badge" : isSummons ? "numbers" : isSubpoena ? "receipt_long" : "person"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {isFir
                    ? "FIR Number & Investigating Authority"
                    : isSummons
                    ? "Court Bench & Suit / Case No."
                    : isSubpoena
                    ? "Issuing Forum & Action Ref"
                    : isSupremeCourt
                    ? "Supreme Court Bench & Petition Ref"
                    : isCaseFile
                    ? "Suit / Docket Number"
                    : "Bench & Case Ref"}
                </p>
                <p className="font-body text-xs text-primary font-semibold break-words leading-snug" title={entities.bench ? `${entities.bench} | ${entities.case_number || ""}` : (entities.case_number || "")}>
                  {entities.bench ? (entities.case_number ? `${entities.bench} (${entities.case_number})` : entities.bench) : (entities.case_number || (isFir ? "FIR Registered" : isSummons ? "Court Summons Ref" : isSubpoena ? "Subpoena Ref" : "Judicial Bench"))}
                </p>
              </div>
            </div>
          ) : (
            monetaryText && (
              <div className="flex items-center gap-3.5 py-2 border-b border-outline-variant/40">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Liability Cap</p>
                  <p className="font-mono text-xs text-primary font-semibold break-words leading-snug">
                    {monetaryText}
                  </p>
                </div>
              </div>
            )
          )}

          {/* Disposition / Legal Directives or Notice Window */}
          {(isJudgment || isCaseFile || isFir || isSummons || isSubpoena) ? (
            <div className="flex items-center gap-3.5 py-2">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {isSummons
                    ? "Attendance Command & Directive"
                    : isSubpoena
                    ? "Production / Appearance Command"
                    : isFir
                    ? "Police Cognizance & Offenses"
                    : "Ruling / Disposition"}
                </p>
                <p className="font-body text-xs text-primary font-semibold break-words leading-snug" title={entities.disposition || "Active Proceedings"}>
                  {entities.disposition || (isSummons ? "Mandatory Appearance Scheduled" : isSubpoena ? "Production Commanded" : isFir ? "Criminal Investigation Active" : "Judicial Decree Pronounced")}
                </p>
              </div>
            </div>
          ) : (
            noticeText && (
              <div className="flex items-center gap-3.5 py-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Notice Window</p>
                  <p className="font-body text-xs text-primary font-semibold break-words leading-snug">
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
