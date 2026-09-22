import React, { useState } from "react"

export default function ExecutiveSummary({ summary }) {
  const [copied, setCopied] = useState(false)

  if (!summary) return null

  const handleCopy = () => {
    if (summary.executive_summary) {
      navigator.clipboard.writeText(summary.executive_summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentDateText = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="bento-card md:col-span-8 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-5 flex-wrap gap-2">
          <h3 className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">summarize</span>
            Executive Summary
          </h3>
          <div className="flex items-center gap-2">
            <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-mono text-xs border border-outline-variant">
              Generated Today, {currentDateText}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant hover:text-primary px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? "check" : "content_copy"}
              </span>
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="text-on-surface-variant font-body text-base leading-relaxed space-y-3">
          <p className="text-on-surface">
            {summary.executive_summary || "No summary text generated yet. Parse or select a contract above to generate an executive plain-English summary."}
          </p>
        </div>

        {summary.key_obligations && summary.key_obligations.length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">task_alt</span>
              Key Contractual Obligations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {summary.key_obligations.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/50 text-xs text-on-surface flex items-start gap-2"
                >
                  <span className="text-secondary font-bold text-sm leading-none">•</span>
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.action_items && summary.action_items.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-risk-medium">arrow_forward</span>
              Action Items & Recommendations
            </h4>
            <div className="space-y-2">
              {summary.action_items.map((action, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/40 text-xs text-on-surface flex items-start gap-2"
                >
                  <span className="text-risk-medium font-bold">→</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thematic Image Element from Stitch design */}
      <div className="mt-6 rounded-2xl overflow-hidden h-28 w-full relative shadow-inner">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCImvS2DsLgGboxeKd1NdLl6wRferZinlR3Op3Tj3-Okup8Nszchkx_Pw1h_lPvmolrbesFay5hHOGUDE9nZGby5dcPa68DWMfPoDGWR9IA4QgQmn7jHXH_ZwB1oh-433c24RbxUpXa7TgKFBf6NM2CJAIBup7ZDIozPzgOHbq02qglCfVA_cFbcXaIYYgLekqgpqs-tuVMEArq0F_I8-ql2nzk-CA45D_dlqOckDc0VeNf1iD-BcACXD8PVJ4NBv8kmg')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      </div>
    </div>
  )
}
