import React, { useState } from "react"

export default function ExportReportModal({
  analysisResult,
  onClose
}) {
  const [reportMode, setReportMode] = useState("simplified")
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const docName = analysisResult?.document_name || "Contract_Audit.pdf"
  const reports = analysisResult?.reports || {}
  const activeReport = reports[reportMode] || null

  const handleCopyMarkdown = () => {
    if (activeReport?.markdown) {
      navigator.clipboard.writeText(activeReport.markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadMarkdown = () => {
    if (!activeReport?.markdown) return
    const blob = new Blob([activeReport.markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${docName.replace(/\.[^/.]+$/, "")}_${reportMode}_report.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      window.print()
      return
    }

    const contentHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeReport?.title || "Legal Document Audit Report"}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm 15mm 20mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1a1a1a;
              line-height: 1.6;
              padding: 24px;
              max-width: 850px;
              margin: 0 auto;
            }
            h1 {
              color: #1e293b;
              font-size: 24px;
              border-bottom: 2px solid #334155;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            h2 {
              color: #334155;
              font-size: 18px;
              margin-top: 24px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
            }
            h3 {
              color: #475569;
              font-size: 15px;
              margin-top: 16px;
            }
            p, li {
              font-size: 13px;
              color: #334155;
            }
            blockquote {
              background: #f8fafc;
              border-left: 4px solid #3b82f6;
              margin: 12px 0;
              padding: 10px 16px;
              font-style: italic;
              color: #1e293b;
            }
            .meta-box {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .meta-item {
              margin-bottom: 4px;
            }
            .risk-high { color: #b91c1c; font-weight: bold; }
            .risk-medium { color: #c2410c; font-weight: bold; }
            .risk-low { color: #15803d; font-weight: bold; }
            hr {
              border: 0;
              border-top: 1px solid #e2e8f0;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              font-size: 11px;
              color: #64748b;
              text-align: center;
              border-top: 1px solid #cbd5e1;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="meta-box">
            <div class="meta-item"><strong>Document:</strong> ${docName}</div>
            <div class="meta-item"><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
            <div class="meta-item"><strong>Report Type:</strong> ${reportMode === "simplified" ? "Simplified Commonfolk Guide" : "In-Depth Legal Opinion Dossier"}</div>
            <div class="meta-item"><strong>Model:</strong> Lexis Obsidian Deep Learning (2000-2010 SC Trained)</div>
          </div>
          <div id="report-body">
            ${activeReport?.markdown
              ?.replace(/^# (.*$)/gim, "<h1>$1</h1>")
              ?.replace(/^## (.*$)/gim, "<h2>$1</h2>")
              ?.replace(/^### (.*$)/gim, "<h3>$1</h3>")
              ?.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
              ?.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
              ?.replace(/\*(.*?)\*/gim, "<em>$1</em>")
              ?.replace(/^- (.*$)/gim, "<li>$1</li>")
              ?.replace(/\n/gim, "<br/>") || ""}
          </div>
          <div class="footer">
            CONFIDENTIAL & PRIVILEGED LEGAL REPORT • LEXIS OBSIDIAN LEGAL INTELLIGENCE
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(contentHtml)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-primary">
                Model-Generated Legal Audit Report
              </h3>
              <p className="font-mono text-xs text-on-surface-variant">
                Target: {docName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Option Selector Bar: 2 Clear Generation Options */}
        <div className="px-6 py-3.5 bg-surface-container border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-on-surface-variant uppercase font-semibold">
              Select Audience & Format:
            </span>
            <div className="inline-flex rounded-full bg-surface-container-high p-1 border border-outline-variant/60 font-mono text-xs">
              <button
                onClick={() => setReportMode("simplified")}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  reportMode === "simplified"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>Simplified (Commonfolk / Business)</span>
              </button>

              <button
                onClick={() => setReportMode("in_depth")}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  reportMode === "in_depth"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">gavel</span>
                <span>In-Depth (Lawyers & Counsel)</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copied ? "check" : "content_copy"}
              </span>
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Save .MD</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim transition-all flex items-center gap-1.5 font-bold shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* Report Content Live Preview */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-background text-on-surface">
          {reportMode === "simplified" ? (
            <div className="space-y-6 max-w-3xl mx-auto font-sans">
              {/* Simplified Header Card */}
              <div className="p-5 rounded-2xl bg-secondary-fixed/20 border border-secondary-fixed flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div>
                  <h4 className="font-headline text-lg font-bold text-primary">
                    Simplified Plain-English Risk Guide
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Written in clear everyday language for founders, signers, and non-lawyers.
                  </p>
                </div>
              </div>

              {/* Bottom Line Verdict */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-secondary uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  <span>The Bottom Line Verdict</span>
                </div>
                <p className="font-body text-base font-semibold text-primary leading-relaxed">
                  {activeReport?.summary?.bottom_line || "Review terms thoroughly before signing."}
                </p>
              </div>

              {/* Red Flags to Look Out For */}
              <div className="p-5 rounded-2xl bg-[#FFEBEE]/60 border border-[#FFCDD2] space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#C62828] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>What You Should Look Out For (Red Flags)</span>
                </div>
                <ul className="space-y-2 text-xs font-body text-[#5c1d1d]">
                  {activeReport?.summary?.critical_hazards?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#C62828] font-bold text-sm leading-none">•</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  )) || (
                    <li>No critical high-risk clauses detected. Terms appear reasonable.</li>
                  )}
                </ul>
              </div>

              {/* Key Takeaways & Obligations */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-secondary uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  <span>Your Key Obligations & Commitments</span>
                </div>
                <ul className="space-y-2 text-xs font-body text-on-surface">
                  {activeReport?.summary?.key_obligations?.map((ob, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-secondary font-bold">•</span>
                      <span className="leading-relaxed">{ob}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Steps */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">checklist</span>
                  <span>What You Should Do Next (Recommended Next Steps)</span>
                </div>
                <div className="space-y-2 text-xs font-body text-on-surface">
                  {activeReport?.summary?.action_items?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/30">
                      <span className="w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* In-Depth Legal Mode */
            <div className="space-y-6 max-w-3xl mx-auto font-sans">
              {/* In-Depth Legal Banner */}
              <div className="p-5 rounded-2xl bg-surface-container-high border border-outline-variant flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-secondary uppercase font-bold tracking-wider">
                    Institutional Legal Work Product
                  </span>
                  <h4 className="font-headline text-xl font-bold text-primary mt-1">
                    Formal Legal Opinion & Risk Audit Dossier
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 font-mono">
                    Trained on 2000-2010 Supreme Court of India Jurisprudence • Comprehensive Clause-by-Clause Review
                  </p>
                </div>
                <div className="text-right font-mono text-xs shrink-0">
                  <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold">
                    Risk: {activeReport?.overall_risk || "Medium"} ({activeReport?.risk_score || 50}/100)
                  </span>
                </div>
              </div>

              {/* Metadata Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
                  <span className="text-on-surface-variant block text-[11px]">Primary Parties:</span>
                  <span className="font-semibold text-primary mt-0.5 block truncate">
                    {activeReport?.metadata?.parties?.join(" & ") || "Bilateral Parties"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
                  <span className="text-on-surface-variant block text-[11px]">Governing Law & Forum:</span>
                  <span className="font-semibold text-primary mt-0.5 block truncate">
                    {activeReport?.metadata?.governing_jurisdiction || "Standard"}
                  </span>
                </div>
              </div>

              {/* Executive Legal Abstract */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2 font-body text-xs leading-relaxed">
                <h5 className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                  1. Executive Legal Abstract & Risk Assessment
                </h5>
                <p className="text-on-surface">
                  {activeReport?.verdict}
                </p>
              </div>

              {/* Raw Markdown Render Preview for Counsel */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-outline-variant/60 pb-2">
                  <span className="font-bold text-secondary uppercase">
                    Formal Legal Memorandum (Markdown Format)
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Ready for Print / Archival</span>
                </div>

                <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-on-surface bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/40 overflow-x-auto">
                  {activeReport?.markdown || "Generating formal report..."}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-outline-variant bg-surface-container-low flex justify-between items-center font-mono text-xs">
          <span className="text-on-surface-variant text-[11px]">
            Lexis Obsidian Engine • 2000-2010 SC Trained
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-colors shadow-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
