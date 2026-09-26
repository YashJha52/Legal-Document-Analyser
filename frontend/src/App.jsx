import React, { useState, useEffect } from "react"
import Header from "./components/Header.jsx"
import Sidebar from "./components/Sidebar.jsx"
import DashboardHub from "./components/DashboardHub.jsx"
import FileUpload from "./components/FileUpload.jsx"
import RiskScorecard from "./components/RiskScorecard.jsx"
import ExecutiveSummary from "./components/ExecutiveSummary.jsx"
import KeyEntities from "./components/KeyEntities.jsx"
import ClauseExplorer from "./components/ClauseExplorer.jsx"
import SplitViewModal from "./components/SplitViewModal.jsx"
import DocumentsView from "./components/DocumentsView.jsx"
import RiskAnalysisView from "./components/RiskAnalysisView.jsx"
import SettingsView from "./components/SettingsView.jsx"

const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Mutual Non-Disclosure Agreement (Apex & BlueSky)",
    category: "nda",
    parties: ["Apex Innovations Inc.", "BlueSky Data Labs LLC"],
    jurisdiction: "California",
    effective_date: "January 15, 2024",
    word_count: 320,
    token_count: 410,
    risk_level: "Low",
    summary: "Standard bilateral non-disclosure agreement protecting technical source code and business plans with 2-year term.",
    text: `MUTUAL NON-DISCLOSURE AGREEMENT
This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2024 ("Effective Date"), by and between Apex Innovations Inc., a Delaware corporation, and BlueSky Data Labs LLC, a California limited liability company.
1. PURPOSE. The Parties wish to explore a potential business relationship concerning AI software development and data infrastructure integration.
2. CONFIDENTIAL INFORMATION. "Confidential Information" means any non-public information disclosed by one Party to the other Party, including source code, customer lists, and algorithms.
3. OBLIGATIONS. The Receiving Party agrees to hold Confidential Information in strict confidence and use not less than reasonable care.
4. TERM AND TERMINATION. This Agreement shall remain in effect for two (2) years from the Effective Date, unless terminated earlier upon thirty (30) days prior written notice.
5. LIMITATION OF LIABILITY. IN NO EVENT SHALL EITHER PARTY'S TOTAL AGGREGATE LIABILITY EXCEED $100,000.
6. INDEMNIFICATION. Each Party agrees to defend, indemnify, and hold harmless the other Party from third-party IP infringement claims.
7. GOVERNING LAW. This Agreement shall be governed by the laws of the State of California.`
  },
  {
    id: "doc-2",
    title: "Master Software as a Service Agreement (CloudScale)",
    category: "saas",
    parties: ["CloudScale Systems Ltd.", "Vertex Enterprise Solutions Inc."],
    jurisdiction: "New York",
    effective_date: "October 1, 2023",
    word_count: 410,
    token_count: 530,
    risk_level: "Medium",
    summary: "Cloud analytics enterprise SaaS agreement with 99.9% uptime SLA, 12-month fees liability cap, and Net 30 payment terms.",
    text: `MASTER SOFTWARE AS A SERVICE (SAAS) AGREEMENT
This Master SaaS Agreement is dated October 1, 2023 by and between CloudScale Systems Ltd. ("Provider") and Vertex Enterprise Solutions Inc. ("Customer").
1. SERVICES AND ACCESS. Provider grants Customer a non-exclusive right to access the enterprise analytics platform.
2. SERVICE LEVEL AGREEMENT (SLA). Provider warrants 99.9% monthly availability. Service credits are Customer's sole remedy for downtime.
3. FEES AND PAYMENT. Customer shall pay invoices within thirty (30) days. Late payments accrue 1.5% monthly interest.
4. INTELLECTUAL PROPERTY. Provider retains all rights to the SaaS platform. Customer retains ownership of all Customer Data.
5. CONFIDENTIALITY. Obligations endure for three (3) years post-termination.
6. LIMITATION OF LIABILITY. AGGREGATE LIABILITY IS CAPPED AT TOTAL FEES PAID IN THE PRECEDING TWELVE (12) MONTHS.
7. TERMINATION. Either Party may terminate for material breach with thirty (30) days cure notice.
8. GOVERNING LAW. Governed by the laws of New York State.`
  },
  {
    id: "doc-3",
    title: "Master Services Agreement (High-Risk AlphaCorp)",
    category: "msa",
    parties: ["AlphaCorp Inc.", "Enterprise Client LLC"],
    jurisdiction: "Delaware",
    effective_date: "October 15, 2024",
    word_count: 245,
    token_count: 312,
    risk_level: "High",
    summary: "Data processing vendor agreement featuring unilateral 15-day termination for convenience and asymmetric indemnification.",
    text: `MASTER SERVICES AGREEMENT
This Master Services Agreement establishes the terms under which AlphaCorp Inc. will provide specialized data processing services to the Client.
1. TERM & TERMINATION. Initial term is 36 months, auto-renewing annually. Provider may terminate this agreement for any reason upon fifteen (15) days prior written notice.
2. FEES. Monthly invoicing with Net 30 payment terms.
3. LIMITATION OF LIABILITY. Liability is strictly capped at preceding 12 months fees without carve-outs for data security breaches.
4. INDEMNIFICATION. Customer shall solely defend, indemnify, and hold harmless Provider from all third-party claims.
5. GOVERNING LAW. This agreement is governed by the State of Delaware.`
  }
]

const INITIAL_DEMO_DATA = {
  document_name: "Master Services Agreement - AlphaCorp Inc.",
  stats: {
    char_count: 1420,
    word_count: 245,
    token_count: 312,
    chunk_count: 1,
    is_chunked: false
  },
  summary: {
    bottom_line:
      "High Risk Detected: The agreement grants the counterparty one-sided 15-day termination for convenience and broad customer-only indemnities. Redlines are strongly recommended before signing.",
    executive_summary:
      "This Master Services Agreement establishes the terms under which AlphaCorp Inc. will provide specialized data processing services to the Client. The agreement highlights a 36-month initial term with auto-renewal, monthly invoicing with Net 30 terms, and significant unilateral exit rights for the service provider.",
    key_obligations: [
      "Maintain 99.9% service level availability for core data processing pipelines.",
      "Submit quarterly security compliance audits and ISO 27001 certifications.",
      "Notify counterparty within 48 hours of any potential data security incidents.",
      "Comply with mutual non-disclosure and strict proprietary trade secret protections."
    ],
    critical_hazards: [
      "Unilateral 15-day termination for convenience favoring AlphaCorp with no penalty.",
      "Asymmetric indemnification requiring Customer to solely defend and hold harmless Provider.",
      "Liability cap excludes data privacy and security breach exclusions."
    ],
    action_items: [
      "Negotiate reciprocal termination for convenience window (change 15 days unilateral to 30 days mutual).",
      "Insert mutual indemnity parity and restrict customer defense obligations to IP infringement.",
      "Carve out data security and confidentiality breaches from the 12-month aggregate liability ceiling."
    ]
  },
  entities: {
    parties: ["AlphaCorp Inc.", "Enterprise Client LLC"],
    effective_date: "October 15, 2024",
    governing_jurisdiction: "State of Delaware",
    monetary_caps: ["12 months preceding fees"],
    notice_periods: ["90 days prior written notice", "15 days for convenience"]
  },
  clauses: [
    {
      clause_id: 0,
      clause_type: "indemnification",
      title: "Indemnification & Defense",
      risk_level: "High",
      risk_rationale: "Customer is forced to solely defend and indemnify Provider from all claims with no reciprocal defense obligations.",
      plain_english_meaning: "You must pay for and manage all lawsuits and legal defense costs filed against the other party, while they have zero duty to protect you.",
      negotiation_tip: "Require mutual indemnity parity and restrict indemnification strictly to direct damages arising from gross negligence or third-party IP infringement.",
      text: "Customer shall solely defend, indemnify, and hold harmless Provider from all third-party claims."
    },
    {
      clause_id: 1,
      clause_type: "limitation_of_liability",
      title: "Limitation of Liability",
      risk_level: "Medium",
      risk_rationale: "Liability is capped at preceding 12 months fees without express carve-outs for data security breaches or confidentiality disclosures.",
      plain_english_meaning: "The maximum amount either party can recover in a lawsuit is restricted to the total fees paid over the previous year.",
      negotiation_tip: "Insist on uncapped liability carve-outs or a super-cap (e.g., 3x annual fees) for data privacy breaches and confidentiality violations.",
      text: "Liability is strictly capped at preceding 12 months fees without carve-outs for data security breaches."
    },
    {
      clause_id: 2,
      clause_type: "termination",
      title: "Termination for Convenience",
      risk_level: "High",
      risk_rationale: "One-sided termination right favoring AlphaCorp with only 15 days notice. Highly non-standard for enterprise engagements.",
      plain_english_meaning: "Provider can exit the contract at any time for any reason with merely 15 days notice, leaving Customer vulnerable.",
      negotiation_tip: "Require a minimum 30-day notice period for termination for convenience and a 30-day cure window for alleged material breaches.",
      text: "Provider may terminate this agreement for any reason upon fifteen (15) days prior written notice."
    }
  ],
  risk_analysis: {
    overall_risk: "High",
    risk_score: 82,
    verdict: "High Legal Exposure (82/100): Critical red flags identified in high-liability clauses. Immediate redlining recommended.",
    high_risk_count: 2,
    medium_risk_count: 1,
    low_risk_count: 0,
    critical_flags: [
      "Unilateral 15-day termination for convenience favoring Provider.",
      "Customer solely required to indemnify Provider without reciprocal protections.",
      "12-month liability cap does not explicitly carve out data privacy breach indemnities."
    ]
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dashboardSubView, setDashboardSubView] = useState("hub")
  const [telemetry, setTelemetry] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(INITIAL_DEMO_DATA)
  const [documentsList, setDocumentsList] = useState(INITIAL_DOCUMENTS)
  const [error, setError] = useState(null)
  const [activeClauseForModal, setActiveClauseForModal] = useState(null)
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
      setDashboardSubView("report")

      setDocumentsList((prev) => {
        const exists = prev.some((d) => d.title === docTitle)
        if (exists) return prev
        const newDoc = {
          id: `doc-${Date.now()}`,
          title: docTitle,
          category: docTitle.toLowerCase().includes("nda")
            ? "nda"
            : docTitle.toLowerCase().includes("saas")
            ? "saas"
            : "uploaded",
          parties: data.entities?.parties || ["Extracted Parties"],
          jurisdiction: data.entities?.governing_jurisdiction || "Standard",
          word_count: data.stats?.word_count || 300,
          token_count: data.stats?.token_count || 380,
          risk_level: data.risk_analysis?.overall_risk || "Medium",
          summary: data.summary?.executive_summary || "Parsed contract analysis.",
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
    setDashboardSubView("report")
  }

  const handleUploadNewDocument = (file) => {
    handleAnalyze({ file, documentName: file.name })
    setActiveTab("dashboard")
    setDashboardSubView("report")
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex selection:bg-secondary-fixed selection:text-on-secondary-fixed-variant transition-colors font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
        }}
        telemetry={telemetry}
      />

      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <Header
          activeTab={activeTab}
          documentName={analysisResult?.document_name}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="flex-1 px-4 sm:px-8 pt-8 pb-16 max-w-7xl w-full mx-auto space-y-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Sub-navigation pill toggle: Hub Overview vs Analysis Report */}
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/50">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    onClick={() => setDashboardSubView("hub")}
                    className={`px-4 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                      dashboardSubView === "hub"
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">hub</span>
                    <span>Document Hub</span>
                  </button>
                  <button
                    onClick={() => setDashboardSubView("report")}
                    className={`px-4 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                      dashboardSubView === "report"
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                    <span>Contract Report</span>
                  </button>
                </div>

                {dashboardSubView === "report" && (
                  <span className="text-xs font-mono text-secondary truncate max-w-xs">
                    Viewing: {analysisResult?.document_name}
                  </span>
                )}
              </div>

              {dashboardSubView === "hub" ? (
                <DashboardHub
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  documentsList={documentsList}
                  onNavigateToTab={setActiveTab}
                  onSelectAndAnalyze={handleSelectAndAnalyzeFromRepo}
                />
              ) : (
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Analysis Report Header Bar */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
                          Document Analysis Report
                        </span>
                      </div>
                      <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                        Contract Overview
                      </h2>
                      <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1.5 font-medium">
                        {analysisResult?.document_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExportPDF}
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
                        Parse New Contract
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-2xl p-4 text-xs font-mono text-[#C62828] flex items-center gap-2 shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span><strong>Analysis Notice:</strong> {error}</span>
                    </div>
                  )}

                  {/* 12-Column Bento Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
                    <ExecutiveSummary summary={analysisResult?.summary} />
                    <KeyEntities entities={analysisResult?.entities} />
                    <ClauseExplorer
                      clauses={analysisResult?.clauses}
                      onSelectClauseForSplitView={setActiveClauseForModal}
                    />
                    <div id="parse-contract-card" className="md:col-span-4 flex">
                      <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                    </div>
                    <RiskScorecard
                      riskAnalysis={analysisResult?.risk_analysis}
                      stats={analysisResult?.stats}
                    />
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

          {/* Risk Analysis Tab */}
          {activeTab === "risk" && (
            <RiskAnalysisView
              analysisResult={analysisResult}
              onSelectClauseForSplitView={setActiveClauseForModal}
              onNavigateToDocuments={() => setActiveTab("documents")}
            />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

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
