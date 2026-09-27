import React, { useState, useEffect } from "react"
import Header from "./components/Header.jsx"
import Sidebar from "./components/Sidebar.jsx"
import FileUpload from "./components/FileUpload.jsx"
import RiskScorecard from "./components/RiskScorecard.jsx"
import ExecutiveSummary from "./components/ExecutiveSummary.jsx"
import KeyEntities from "./components/KeyEntities.jsx"
import ClauseExplorer from "./components/ClauseExplorer.jsx"
import SplitViewModal from "./components/SplitViewModal.jsx"
import DocumentsView from "./components/DocumentsView.jsx"
import RiskAnalysisView from "./components/RiskAnalysisView.jsx"
import SettingsView from "./components/SettingsView.jsx"
import ExportReportModal from "./components/ExportReportModal.jsx"

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [telemetry, setTelemetry] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [documentsList, setDocumentsList] = useState([])
  const [error, setError] = useState(null)
  const [activeClauseForModal, setActiveClauseForModal] = useState(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [theme, setTheme] = useState("light")

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    document.documentElement.className = nextTheme
  }

  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/v1/health")
      if (res.ok) {
        const data = await res.json()
        setTelemetry(data.telemetry)
      }
    } catch (e) {
      console.warn("Failed to fetch telemetry", e)
    }
  }

  useEffect(() => {
    document.documentElement.className = "light"
    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleAnalyze = async ({ file, text, documentName }) => {
    setIsAnalyzing(true)
    setError(null)
    try {
      const formData = new FormData()
      let docTitle = documentName || "Uploaded_Document"
      if (file) {
        formData.append("file", file)
        docTitle = file.name
      } else if (text) {
        formData.append("raw_text", text)
        formData.append("document_name", docTitle)
      }
      const res = await fetch("/api/v1/analyze", {
        method: "POST",
        body: formData
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Analysis request failed")
      }
      const data = await res.json()
      setAnalysisResult(data)
      setActiveTab("dashboard")

      setDocumentsList((prev) => {
        const exists = prev.some((d) => d.title === docTitle)
        if (exists) return prev
        const newDoc = {
          id: `doc-${Date.now()}`,
          title: docTitle,
          category: data.entities?.document_type === "court_judgment"
            ? "Court Judgment"
            : docTitle.toLowerCase().includes("nda")
            ? "nda"
            : docTitle.toLowerCase().includes("saas")
            ? "saas"
            : "Commercial Contract",
          parties: data.entities?.parties || ["Extracted Parties"],
          jurisdiction: data.entities?.governing_jurisdiction || data.entities?.court_forum || "Standard",
          word_count: data.stats?.word_count || 300,
          token_count: data.stats?.token_count || 380,
          risk_level: data.risk_analysis?.overall_risk || "Medium",
          summary: data.summary?.executive_summary || "Parsed legal document analysis.",
          text: data.raw_text || text || ""
        }
        return [newDoc, ...prev]
      })

      fetchTelemetry()
    } catch (err) {
      setError(err.message || "An unexpected error occurred during document analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSelectAndAnalyzeFromRepo = (doc) => {
    handleAnalyze({ text: doc.text, documentName: doc.title })
    setActiveTab("dashboard")
  }

  const handleUploadNewDocument = (file) => {
    handleAnalyze({ file, documentName: file.name })
    setActiveTab("dashboard")
  }

  const docType = analysisResult?.entities?.document_type || "commercial_contract"
  const isJudgment = docType === "court_judgment"

  return (
    <div className="min-h-screen bg-background text-on-surface flex selection:bg-secondary-fixed selection:text-on-secondary-fixed-variant transition-colors font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        telemetry={telemetry}
      />

      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <Header
          activeTab={activeTab}
          documentName={analysisResult?.document_name || "Workspace"}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="flex-1 px-4 sm:px-8 pt-8 pb-16 max-w-7xl w-full mx-auto space-y-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Top Document Header Bar */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/50 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
                      {analysisResult
                        ? isJudgment
                          ? "Judicial Precedent & Statutory Analysis"
                          : "Contract Intelligence & Risk Audit"
                        : "Legal Document Workspace"}
                    </span>
                    {analysisResult && (
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[11px] font-mono text-primary font-bold border border-outline-variant">
                        {isJudgment ? "Court Judgment" : "Commercial Contract"}
                      </span>
                    )}
                  </div>
                  <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                    {analysisResult?.document_name || "Document Analyzer & Simplifier"}
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant mt-1">
                    {analysisResult
                      ? isJudgment
                        ? "Automated ratio decidendi extraction, precedent evaluation, and judicial orders."
                        : "Automated clause extraction, liability cap auditing, and plain-English simplification."
                      : "Upload or input commercial contracts, court judgments, or legal notices for automated deep analysis."}
                  </p>
                </div>

                {analysisResult && (
                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs flex-wrap">
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="bg-secondary-fixed text-on-secondary-fixed-variant font-mono text-xs px-5 py-2.5 rounded-full hover:bg-secondary-fixed-dim transition-all flex items-center gap-2 shadow-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Export Report
                    </button>
                    <button
                      onClick={() => {
                        const element = document.getElementById("parse-contract-card")
                        element?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="bg-primary text-on-primary font-mono text-xs px-5 py-2.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      Analyze New Document
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Document Switcher Strip - Only rendered when documents exist */}
              {documentsList.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-secondary">folder_open</span>
                    <span className="font-semibold text-primary">Workspace Documents ({documentsList.length}):</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {documentsList.slice(0, 5).map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectAndAnalyzeFromRepo(doc)}
                        className={`px-3 py-1 rounded-xl text-xs font-mono transition-all truncate max-w-[220px] ${
                          doc.title === analysisResult?.document_name
                            ? "bg-primary text-on-primary font-bold shadow-xs"
                            : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/60"
                        }`}
                        title={doc.title}
                      >
                        {doc.title}
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveTab("documents")}
                      className="text-xs font-mono text-secondary hover:text-primary font-bold ml-1"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-2xl p-4 text-xs font-mono text-[#C62828] flex items-center gap-2 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span><strong>Analysis Notice:</strong> {error}</span>
                </div>
              )}

              {/* Main Analysis Bento Layout or Empty State */}
              {analysisResult ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
                  {/* Executive Summary (8 cols) */}
                  <ExecutiveSummary summary={analysisResult.summary} />

                  {/* Case / Contract Key Entities (4 cols) */}
                  <KeyEntities entities={analysisResult.entities} />

                  {/* Clause Explorer & Breakdown (8 cols) */}
                  <ClauseExplorer
                    clauses={analysisResult.clauses}
                    onSelectClauseForSplitView={setActiveClauseForModal}
                  />

                  {/* Upload / Parse Card (4 cols) */}
                  <div id="parse-contract-card" className="md:col-span-4 flex">
                    <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                  </div>

                  {/* Risk Scorecard & Exposure Meter (12 cols) */}
                  <RiskScorecard
                    riskAnalysis={analysisResult.risk_analysis}
                    stats={analysisResult.stats}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
                  <div className="md:col-span-7 flex flex-col justify-between bento-card p-8 bg-surface-container-lowest space-y-6">
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-3xl">account_balance</span>
                      </div>
                      <h3 className="font-headline text-2xl font-bold text-primary">
                        Ready to Analyze Contracts & Legal Precedents
                      </h3>
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                        Input any legal agreement (NDA, MSA, SaaS, Employment) or Indian Court Judgment (Supreme Court, High Court) to automatically extract:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs text-primary">
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-base">gavel</span>
                          <div>
                            <strong>Judicial & Case Entities</strong>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">Parties, Bench, Forum, Disposal Ruling</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-base">security</span>
                          <div>
                            <strong>Operative Legal Clauses</strong>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">Indemnity, Liability, Service Rules, Ratio</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-base">analytics</span>
                          <div>
                            <strong>Dual Audience Risk Audit</strong>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">Simplified user tips & in-depth counsel analysis</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-base">description</span>
                          <div>
                            <strong>Model Dossier Export</strong>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">Direct PDF and structured Markdown export</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant font-mono text-xs text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                      <span>Trained on Supreme Court & Commercial Contract Corpora with 8GB RAM optimization.</span>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex">
                    <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <DocumentsView
              documentsList={documentsList}
              onSelectAndAnalyze={handleSelectAndAnalyzeFromRepo}
              onUploadNewDocument={handleUploadNewDocument}
              isAnalyzing={isAnalyzing}
            />
          )}

          {/* Risk Analysis Tab (Simplified vs. In-Depth) */}
          {activeTab === "risk" && (
            <RiskAnalysisView
              analysisResult={analysisResult}
              onSelectClauseForSplitView={setActiveClauseForModal}
              onNavigateToDocuments={() => setActiveTab("documents")}
              onOpenReportModal={() => setReportModalOpen(true)}
            />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Model-Generated Report Modal */}
      {reportModalOpen && (
        <ExportReportModal
          analysisResult={analysisResult}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {activeClauseForModal && (
        <SplitViewModal
          clause={activeClauseForModal}
          onClose={() => setActiveClauseForModal(null)}
        />
      )}
    </div>
  )
}
