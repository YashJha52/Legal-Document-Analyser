import React, { useRef, useState } from "react"

export default function DashboardHub({
  onAnalyze,
  isAnalyzing,
  documentsList,
  onNavigateToTab,
  onSelectAndAnalyze,
  onOpenReportModal,
  activeDocumentData
}) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      onAnalyze({ file, documentName: file.name })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      onAnalyze({ file, documentName: file.name })
    }
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  const activeDoc = activeDocumentData || {}
  const summary = activeDoc.summary || {}
  const riskAnalysis = activeDoc.risk_analysis || {}
  const overallRisk = (riskAnalysis.overall_risk || "Medium").toLowerCase()
  const riskScore = riskAnalysis.risk_score !== undefined ? riskAnalysis.risk_score : 65

  return (
    <section className="space-y-6 animate-in fade-in duration-200 font-sans" id="view-dashboard">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
              Legal Document Overview
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Executive Legal Dashboard
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1 max-w-2xl">
            Key points, essential obligations, and major risk indicators for your active contracts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <button
            onClick={onOpenReportModal}
            className="bg-secondary-fixed text-on-secondary-fixed-variant font-label-md px-5 py-2.5 rounded-full hover:bg-secondary-fixed-dim transition-colors flex items-center gap-2 border border-outline-variant/40 font-semibold shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Report</span>
          </button>
          <button
            onClick={triggerUpload}
            className="bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload New Contract</span>
          </button>
        </div>
      </div>

      {/* Main & Major Points & Risks Bento Layout (Decluttered) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
        {/* Top Major Risk & Exposure Banner (Spans 12 cols) */}
        <div className="bento-card md:col-span-12 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-secondary-fixed/50">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">
                Primary Contract Verdict & Exposure
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                  overallRisk === "high"
                    ? "bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]"
                    : overallRisk === "medium"
                    ? "bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]"
                    : "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                Overall Risk: {riskAnalysis.overall_risk || "Medium"}
              </span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-primary">
              {summary.bottom_line || riskAnalysis.verdict || "Standard commercial agreement with baseline liability parameters."}
            </h3>
            <p className="font-mono text-xs text-on-surface-variant">
              Active Instrument: <strong>{activeDoc.document_name || "Contract Document"}</strong> • Governing Jurisdiction: <strong>{activeDoc.entities?.governing_jurisdiction || "Standard"}</strong>
            </p>
          </div>

          <div className="w-full md:w-64 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60 shrink-0 space-y-2">
            <div className="flex justify-between items-center font-mono text-xs font-bold">
              <span className="text-secondary uppercase">Risk Score</span>
              <span className="text-primary text-base">{riskScore}/100</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  riskScore >= 70 ? "bg-[#C62828]" : riskScore >= 40 ? "bg-[#E65100]" : "bg-[#2E7D32]"
                }`}
                style={{ width: `${Math.max(riskScore, 6)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant pt-0.5">
              <span>Safe (0)</span>
              <span>Moderate (50)</span>
              <span>High Risk (100)</span>
            </div>
          </div>
        </div>

        {/* Major Risks & Red Flags (Spans 6 cols) */}
        <div className="bento-card md:col-span-6 p-6 space-y-4 bg-[#FFEBEE]/30 border border-[#FFCDD2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C62828] font-mono text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>Major Risks & Red Flags</span>
            </div>
            <button
              onClick={() => onNavigateToTab("risk")}
              className="text-xs font-mono font-semibold text-[#C62828] hover:underline flex items-center gap-1"
            >
              <span>Full Risk View</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-2.5 font-sans text-xs">
            {riskAnalysis.critical_flags && riskAnalysis.critical_flags.length > 0 ? (
              riskAnalysis.critical_flags.map((flag, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#5c1d1d] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#C62828] text-[18px] shrink-0 mt-0.5">
                    error
                  </span>
                  <span className="leading-relaxed font-medium">{flag}</span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-[#E8F5E9] text-[#2E7D32] font-semibold">
                No high-risk clauses or critical liabilities identified.
              </div>
            )}
          </div>
        </div>

        {/* Main Points & Executive Summary (Spans 6 cols) */}
        <div className="bento-card md:col-span-6 p-6 space-y-4 bg-surface-container-low border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-secondary font-mono text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[20px]">summarize</span>
              <span>Main Takeaways & Obligations</span>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">
              {activeDoc.clauses?.length || 0} Clauses Indexed
            </span>
          </div>

          <p className="font-body text-xs sm:text-sm text-on-surface leading-relaxed">
            {summary.executive_summary || "Automated analysis of contract clauses and operational terms."}
          </p>

          {summary.key_obligations && summary.key_obligations.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-outline-variant/40">
              <span className="font-mono text-[11px] font-bold text-secondary uppercase block">
                Key Obligations:
              </span>
              <ul className="space-y-1.5 text-xs text-on-surface font-body">
                {summary.key_obligations.slice(0, 3).map((ob, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-secondary font-bold">•</span>
                    <span>{ob}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Fast Upload & Switcher Strip (Spans 12 cols) */}
        <div className="bento-card md:col-span-12 p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-container-lowest">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div>
              <h4 className="font-headline text-base font-bold text-primary">
                Switch or Analyze Another Contract
              </h4>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                {documentsList.length} documents ready in local repository • Drag & drop supported
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {documentsList.slice(0, 3).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectAndAnalyze(doc)}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant text-xs font-mono text-primary transition-all truncate max-w-[200px]"
                title={doc.title}
              >
                {doc.title}
              </button>
            ))}
            <button
              onClick={triggerUpload}
              className="px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-mono font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Upload File</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
