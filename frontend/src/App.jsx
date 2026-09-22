import React, { useState, useEffect } from "react"
import Header from "./components/Header.jsx"
import Sidebar from "./components/Sidebar.jsx"
import FileUpload from "./components/FileUpload.jsx"
import RiskScorecard from "./components/RiskScorecard.jsx"
import ExecutiveSummary from "./components/ExecutiveSummary.jsx"
import KeyEntities from "./components/KeyEntities.jsx"
import ClauseExplorer from "./components/ClauseExplorer.jsx"
import SplitViewModal from "./components/SplitViewModal.jsx"

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
    executive_summary:
      "This Master Services Agreement establishes the terms under which AlphaCorp Inc. will provide specialized data processing services to the Client. The agreement highlights a standard 36-month initial term, auto-renewing annually unless terminated with 90 days prior written notice. Key financial obligations stipulate monthly invoicing with Net 30 payment terms.",
    key_obligations: [
      "Maintain 99.9% service level availability for core data processing pipelines.",
      "Submit quarterly security compliance audits and ISO 27001 certifications.",
      "Notify counterparty within 48 hours of any potential data security incidents.",
      "Comply with mutual non-disclosure and strict proprietary trade secret protections."
    ],
    action_items: [
      "Verify signatory designations and corporate entity state registrations.",
      "Negotiate reciprocal termination for convenience window (currently 15 days unilateral).",
      "Consult counsel to adjust liability exclusions to include confidentiality breaches."
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
      title: "Indemnification",
      risk_level: "Low",
      risk_rationale: "Standard mutual indemnification covering third-party IP infringement claims. No unusual carve-outs noted.",
      plain_english_meaning: "Both parties agree to defend and compensate each other if a third party sues over intellectual property claims.",
      text: "Each party ('Indemnifying Party') shall defend, indemnify, and hold harmless the other party from and against any third-party claims arising out of infringement of valid patent, copyright, or trademark rights."
    },
    {
      clause_id: 1,
      clause_type: "limitation_of_liability",
      title: "Limitation of Liability",
      risk_level: "Medium",
      risk_rationale: "Liability capped at preceding 12 months fees. Excludes gross negligence and willful misconduct.",
      plain_english_meaning: "The maximum amount either party can recover in a lawsuit is restricted to the total fees paid over the previous year.",
      text: "In no event shall either party's aggregate liability under this agreement exceed the total fees paid or payable by Customer in the twelve (12) months preceding the claim."
    },
    {
      clause_id: 2,
      clause_type: "termination",
      title: "Termination for Convenience",
      risk_level: "High",
      risk_rationale: "One-sided termination right favoring AlphaCorp with only 15 days notice. Highly non-standard for enterprise engagements.",
      plain_english_meaning: "Provider can exit the contract at any time for any reason with merely 15 days notice, leaving Customer vulnerable.",
      text: "Provider may terminate this agreement for any reason or no reason upon fifteen (15) days prior written notice to Customer without penalty."
    }
  ],
  risk_analysis: {
    overall_risk: "Medium",
    high_risk_count: 1,
    medium_risk_count: 1,
    low_risk_count: 1,
    critical_flags: [
      "Unilateral 15-day termination for convenience favoring Provider.",
      "12-month liability cap does not explicitly carve out data privacy breach indemnities."
    ]
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [telemetry, setTelemetry] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(INITIAL_DEMO_DATA)
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
      if (file) {
        formData.append("file", file)
      } else if (text) {
        formData.append("raw_text", text)
        formData.append("document_name", documentName || "Pasted_Contract.txt")
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
      fetchTelemetry()
    } catch (err) {
      setError(err.message || "An unexpected error occurred during document analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex selection:bg-secondary-fixed selection:text-on-secondary-fixed-variant transition-colors">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        telemetry={telemetry}
      />

      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <Header
          documentName={analysisResult?.document_name}
          telemetry={telemetry}
          isAnalyzing={isAnalyzing}
          error={error}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="flex-1 px-4 sm:px-8 pt-8 pb-16 max-w-7xl w-full mx-auto space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                Contract Overview
              </h2>
              <p className="font-body text-base text-on-surface-variant mt-1.5 font-medium">
                {analysisResult?.document_name || "Select or parse a legal document to begin"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="bg-secondary-fixed text-on-secondary-fixed-variant font-mono text-xs px-5 py-2.5 rounded-full hover:bg-secondary-fixed-dim transition-all flex items-center gap-2 shadow-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("parse-contract-card")
                  element?.scrollIntoView({ behavior: "smooth" })
                }}
                className="bg-primary text-on-primary font-mono text-xs px-5 py-2.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Parse New Contract
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-2xl p-4 text-xs font-mono text-[#C62828] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span><strong>Analysis Notice:</strong> {error}</span>
            </div>
          )}

          {/* 12-Column Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
            {/* Row 1: Executive Summary (8 cols) & Key Entities (4 cols) */}
            <ExecutiveSummary summary={analysisResult?.summary} />
            <KeyEntities entities={analysisResult?.entities} />

            {/* Row 2: Clause Breakdown (8 cols) & Parse Contract (4 cols) */}
            <ClauseExplorer
              clauses={analysisResult?.clauses}
              onSelectClauseForSplitView={setActiveClauseForModal}
            />
            <div id="parse-contract-card" className="md:col-span-4 flex">
              <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            </div>

            {/* Row 3: Risk Scorecard & System Telemetry (12 cols) */}
            <RiskScorecard
              riskAnalysis={analysisResult?.risk_analysis}
              stats={analysisResult?.stats}
            />
          </div>
        </main>
      </div>

      {activeClauseForModal && (
        <SplitViewModal
          clause={activeClauseForModal}
          onClose={() => setActiveClauseForModal(null)}
        />
      )}
    </div>
  )
}
