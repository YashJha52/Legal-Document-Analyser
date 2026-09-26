import React, { useRef, useState } from "react"

export default function DashboardHub({
  onAnalyze,
  isAnalyzing,
  documentsList,
  onNavigateToTab,
  onSelectAndAnalyze
}) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [complianceModalOpen, setComplianceModalOpen] = useState(false)

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

  return (
    <section className="space-y-8 animate-in fade-in duration-200" id="view-dashboard">
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
              Document Intelligence Hub
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Legal Document Intelligence
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1.5 max-w-2xl">
            Automate legal review, extract structured clauses, and assess risk exposure instantly with audit-grade precision.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <button
            onClick={() => onNavigateToTab("documents")}
            className="bg-secondary-fixed text-on-secondary-fixed-variant font-label-md px-5 py-2.5 rounded-full hover:bg-secondary-fixed-dim transition-colors flex items-center gap-2 border border-outline-variant/40 font-semibold shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Batch</span>
          </button>
          <button
            onClick={triggerUpload}
            className="bg-primary-container text-[#fddbd0] hover:text-white font-label-md px-6 py-2.5 rounded-full hover:bg-primary transition-all flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
        {/* Primary Bento Hero: Prominent Upload Zone (Spans 8 cols) */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={triggerUpload}
          className={`bento-card md:col-span-8 flex flex-col justify-between border-2 border-dashed transition-all p-8 relative overflow-hidden group cursor-pointer ${
            dragOver
              ? "border-primary bg-surface-container scale-[1.005]"
              : "border-[#d3c3be] hover:border-primary-container bg-surface-container-lowest/80"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede9] text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <div>
                <h3 className="font-headline text-[22px] font-bold text-primary">
                  Drop contract or legal brief here
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                  Automated parsing begins upon upload with OCR & semantic clause detection
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-surface-container text-on-surface font-mono text-xs border border-outline-variant/60">
              Encrypted End-to-End
            </span>
          </div>

          <div className="my-8 py-8 flex flex-col items-center justify-center text-center rounded-2xl bg-surface-container-low/70 border border-outline-variant/40 hover:bg-surface-container-low transition-colors">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant mb-3 group-hover:bg-secondary-fixed-dim transition-colors shadow-xs">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <p className="font-headline text-base font-semibold text-primary">
              Drag & drop file here, or click to browse
            </p>
            <p className="font-mono text-xs text-on-surface-variant mt-1.5">
              Supported formats: PDF, DOCX, TXT (up to 50MB per file)
            </p>
            <button
              type="button"
              className="mt-4 bg-primary text-on-primary font-mono text-xs px-5 py-2 rounded-full hover:bg-primary-container transition-colors shadow-sm font-semibold"
            >
              Browse Files
            </button>
          </div>

          {/* Capability chips inside hero */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/40 text-xs text-on-surface-variant font-sans">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                Privileged & Confidential
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">speed</span>
                Real-time Analysis
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">policy</span>
                Multi-jurisdiction rules
              </span>
            </div>
            <span className="text-[11px] font-medium text-secondary font-mono">
              AlphaCorp Enterprise Ready
            </span>
          </div>
        </div>

        {/* Quick Analysis Summary / Active Queue (Spans 4 cols) */}
        <div className="bento-card md:col-span-4 flex flex-col justify-between bg-surface-container-low border border-outline-variant/60">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-[18px] font-semibold text-primary">
                Active Analysis Queue
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbc6ba]"></span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-center py-6 mb-4 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-on-surface-variant mb-2.5">
                <span className="material-symbols-outlined text-xl">
                  {isAnalyzing ? "progress_activity" : "pending_actions"}
                </span>
              </div>
              <p className="font-headline text-sm font-semibold text-primary">
                {isAnalyzing ? "Processing Contract..." : "Awaiting Document Input"}
              </p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">
                {isAnalyzing ? "Deep learning clause extraction active" : "0 active analyses in progress"}
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-container-lowest/60 border border-outline-variant/30">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">folder_open</span>
                  Workspace Documents
                </span>
                <span className="font-semibold text-primary">{documentsList.length} files</span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-container-lowest/60 border border-outline-variant/30">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">query_stats</span>
                  Audited Clauses
                </span>
                <span className="font-semibold text-primary">12 indexed</span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-container-lowest/60 border border-outline-variant/30">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
                  Risk Exceptions
                </span>
                <span className="font-semibold text-primary">2 detected</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/50">
            <button
              onClick={() => onNavigateToTab("documents")}
              className="w-full text-center text-xs font-semibold text-primary hover:text-on-surface-variant transition-colors flex items-center justify-center gap-1 font-mono"
            >
              <span>Open Repository</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Recent Documents Bento Card (Spans 7 cols) */}
        <div className="bento-card md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-[20px] font-semibold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">history</span>
                  Recent Documents
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Your parsed contracts and indexed agreements
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab("documents")}
                className="text-xs font-medium text-secondary hover:text-primary transition-colors font-mono"
              >
                View All
              </button>
            </div>

            {/* Document list or empty state */}
            {documentsList.length > 0 ? (
              <div className="space-y-2.5 my-2">
                {documentsList.slice(0, 3).map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    onClick={() => onSelectAndAnalyze(doc)}
                    className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline text-xs font-bold text-primary truncate">
                          {doc.title}
                        </p>
                        <p className="font-mono text-[11px] text-on-surface-variant truncate">
                          {doc.parties?.join(" & ") || "Bilateral"} • {doc.jurisdiction} Law
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-secondary font-semibold hover:underline flex items-center gap-1">
                      <span>Analyze</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant/70 p-8 text-center bg-surface-container-low/40 my-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-on-surface-variant mb-3">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <h4 className="font-headline text-base font-semibold text-primary">
                  No documents parsed yet
                </h4>
                <p className="text-xs text-on-surface-variant mt-1.5 max-w-md mx-auto leading-relaxed">
                  Upload a document to start automated clause extraction, anomaly detection, and risk scoring.
                </p>
                <button
                  onClick={triggerUpload}
                  className="mt-4 px-4 py-2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim text-xs font-mono font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>Upload First Document</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-outline-variant/40 mt-3 font-mono">
            <span>Automatic sync with legal drive active</span>
            <span className="text-secondary font-medium">Filter by tags in Documents tab</span>
          </div>
        </div>

        {/* Analysis Capabilities / Quick Workflows (Spans 5 cols) */}
        <div className="bento-card md:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-[20px] font-semibold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">auto_awesome</span>
                Analysis Capabilities
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-mono font-medium">
                3 Engines
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Run modular AI audits tailored to contract type and risk threshold.
            </p>

            <div className="space-y-3">
              {/* Workflow Item 1 */}
              <div
                onClick={() => onNavigateToTab("risk")}
                className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface hover:bg-surface-container-high/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">security_update_warning</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-primary group-hover:text-primary-container transition-colors">
                      Risk & Liability Auditing
                    </h4>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1">
                      Uncapped liability, indemnification traps & non-standard terms
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>

              {/* Workflow Item 2 */}
              <div
                onClick={() => onNavigateToTab("documents")}
                className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface hover:bg-surface-container-high/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">segment</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-primary group-hover:text-primary-container transition-colors">
                      Clause Extraction & Benchmarking
                    </h4>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1">
                      Extract IP, termination, payment terms, and compare against standard
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>

              {/* Workflow Item 3 */}
              <div
                onClick={() => setComplianceModalOpen(true)}
                className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface hover:bg-surface-container-high/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-primary group-hover:text-primary-container transition-colors">
                      Regulatory Compliance Check
                    </h4>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1">
                      GDPR, HIPAA, SOC-2, and jurisdictional enforceability review
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/40 mt-3 text-[11px] text-on-surface-variant flex justify-between items-center font-mono">
            <span>Click capability to inspect workflow</span>
            <span className="font-medium text-primary">All automated</span>
          </div>
        </div>
      </div>

      {/* Regulatory Compliance Modal */}
      {complianceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2E7D32]">verified</span>
                <h3 className="font-headline text-lg font-bold text-primary">
                  Regulatory Compliance Auditing
                </h3>
              </div>
              <button
                onClick={() => setComplianceModalOpen(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-[#E8F5E9]/60 border border-[#C8E6C9] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2E7D32] text-2xl">check_circle</span>
                <div>
                  <h4 className="font-bold text-[#1B5E20] text-sm">GDPR Article 28 Compliance</h4>
                  <p className="text-on-surface-variant mt-0.5">
                    Data processing covenants include required sub-processor audit rights and breach notice windows.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
                <div>
                  <h4 className="font-bold text-primary text-sm">SOC-2 Type II Attestation</h4>
                  <p className="text-on-surface-variant mt-0.5">
                    Annual third-party security verification required under standard master services schedule.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF3E0]/70 border border-[#FFE0B2] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E65100] text-2xl">warning</span>
                <div>
                  <h4 className="font-bold text-[#BF360C] text-sm">HIPAA Business Associate Agreement (BAA)</h4>
                  <p className="text-on-surface-variant mt-0.5">
                    BAA execution required prior to processing Protected Health Information (PHI).
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low flex justify-end font-mono text-xs">
              <button
                onClick={() => setComplianceModalOpen(false)}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-colors shadow-sm"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
