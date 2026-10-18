import React, { useState } from "react"

export default function ExecutiveSummary({ summary, caseTopic, docType, className = "" }) {
  const [copied, setCopied] = useState(false)

  if (!summary) return null

  const handleCopy = () => {
    const fullText = [
      summary.bottom_line ? `THE BOTTOM LINE:\n${summary.bottom_line}\n` : "",
      caseTopic?.what_its_about ? `CORE TOPIC:\n${caseTopic.what_its_about}\nWHY THIS OCCURRED:\n${caseTopic.why_it_occurred || ""}\n` : "",
      `EXECUTIVE SUMMARY:\n${summary.executive_summary || ""}\n`,
      summary.key_obligations?.length ? `KEY OBLIGATIONS:\n- ${summary.key_obligations.join("\n- ")}\n` : "",
      summary.critical_hazards?.length ? `CRITICAL HAZARDS:\n- ${summary.critical_hazards.join("\n- ")}\n` : "",
      summary.action_items?.length ? `ACTION ITEMS:\n- ${summary.action_items.join("\n- ")}` : ""
    ].join("\n")

    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentDateText = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={`bento-card flex flex-col justify-between space-y-5 ${className || "md:col-span-8"}`}>
      <div>
        {/* Header with Title and Quick Copy */}
        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">summarize</span>
              Plain-English Analysis
            </h3>
            <p className="font-mono text-xs text-on-surface-variant mt-0.5">
              Automated plain-language breakdown and executive findings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-mono text-xs border border-outline-variant">
              Updated {currentDateText}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant hover:text-primary px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? "check" : "content_copy"}
              </span>
              <span>{copied ? "Copied" : "Copy All"}</span>
            </button>
          </div>
        </div>

        {/* The Bottom Line Callout Box */}
        {summary.bottom_line && (
          <div className="mb-4 p-4 rounded-2xl bg-secondary-fixed/30 border border-secondary-fixed text-on-secondary-fixed-variant">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-secondary mb-1">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              <span>The Bottom Line Verdict</span>
            </div>
            <p className="font-body text-sm font-medium text-primary leading-relaxed">
              {summary.bottom_line}
            </p>
          </div>
        )}

        {/* Core Topic Box */}
        {caseTopic?.what_its_about && (
          <div className="mb-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/70 text-on-surface space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                <span className="material-symbols-outlined text-[18px]">
                  {docType === "fir" ? "local_police" : docType === "subpoena" ? "inventory" : (docType === "supreme_court_judgment" || docType === "court_judgment") ? "balance" : "description"}
                </span>
                <span>{caseTopic.topic_title || "Main Topic of Document"}</span>
              </div>
              {caseTopic.legal_status && (
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[10px] font-mono font-bold text-primary border border-outline-variant">
                  {caseTopic.legal_status}
                </span>
              )}
            </div>
            <p className="font-body text-xs text-primary leading-relaxed">
              <strong>Subject:</strong> {caseTopic.what_they_are_taking || caseTopic.original_case_topic || caseTopic.what_its_about}
            </p>
            {caseTopic.why_it_occurred && (
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                <strong>Why this occurred:</strong> {caseTopic.why_they_are_taking_it || caseTopic.why_it_occurred}
              </p>
            )}
            {(caseTopic.verdict || caseTopic.demanded_items_or_verdict) && (
              <p className="font-body text-xs text-primary font-medium leading-relaxed">
                <strong>{(docType === "supreme_court_judgment" || docType === "court_judgment") ? "Verdict & Decree:" : "Status & Standing:"}</strong> {caseTopic.verdict || caseTopic.demanded_items_or_verdict}
              </p>
            )}
          </div>
        )}

        {/* Executive Summary Narrative */}
        <div className="text-on-surface font-body text-sm leading-relaxed space-y-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60">
          <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold block">
            Executive Summary
          </span>
          <p className="text-on-surface leading-relaxed">
            {summary.executive_summary || "No summary text generated yet. Parse or select a contract above to generate an executive plain-English summary."}
          </p>
        </div>

        {/* 2-Column Section: Obligations & Action Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Key Obligations */}
          {Array.from(new Set(summary.key_obligations || [])).length > 0 && (
            <div className="space-y-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60">
              <h4 className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">task_alt</span>
                Key Obligations
              </h4>
              <ul className="space-y-2">
                {Array.from(new Set(summary.key_obligations || [])).map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-on-surface flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-secondary font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items & Next Steps */}
          {Array.from(new Set(summary.action_items || [])).length > 0 && (
            <div className="space-y-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60">
              <h4 className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-risk-medium">arrow_forward</span>
                Action Items & Redlines
              </h4>
              <ul className="space-y-2">
                {Array.from(new Set(summary.action_items || [])).map((action, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-on-surface flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-risk-medium font-bold">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Critical Hazards / Traps */}
        {Array.from(new Set(summary.critical_hazards || [])).length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FFEBEE]/60 border border-[#FFCDD2] text-xs text-[#5c1d1d] space-y-1.5">
            <span className="font-mono text-xs font-bold text-[#C62828] flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Key Traps & Exposure Points
            </span>
            <ul className="space-y-1 pl-1">
              {Array.from(new Set(summary.critical_hazards || [])).map((hazard, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#C62828] font-bold">•</span>
                  <span>{hazard}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
