import React, { useState, useRef } from "react"

const SAMPLE_CONTRACTS = {
  nda: {
    title: "Mutual_NDA_Standard.txt",
    text: `MUTUAL NON-DISCLOSURE AGREEMENT
This Mutual Non-Disclosure Agreement ("Agreement") is made and entered into as of January 15, 2024, by and between Apex Systems Inc., a Delaware corporation, and Horizon Cloud LLC, a California limited liability company.
1. Confidential Information. Each party agrees to protect proprietary information with the same standard of care as its own confidential materials, and not less than reasonable care.
2. Governing Law. This Agreement shall be construed and governed in accordance with the laws of the State of Delaware, without regard to conflicts of law principles.
3. Term and Termination. This Agreement shall remain in effect for three (3) years from the Effective Date. Either party may terminate this Agreement upon thirty (30) days prior written notice.
4. Limitation of Liability. In no event shall either party's aggregate liability under this Agreement exceed $100,000.`
  },
  msa_high_risk: {
    title: "MSA_Enterprise_HighRisk.txt",
    text: `MASTER SERVICES AGREEMENT
This Agreement is entered into on March 1, 2024 by and between Global Enterprise Corp and Vendor Services Ltd.
1. Indemnification. Customer shall solely defend, indemnify, and hold harmless Provider from any and all third-party claims, liabilities, losses, damages, and expenses without limitation.
2. Limitation of Liability. In no event shall Provider's total aggregate liability exceed $0, and Provider disclaims all consequential, indirect, or punitive damages.
3. Termination. Provider may immediately terminate this agreement without cause and without prior written notice to Customer.
4. Payment Terms. All fees are net 15 days upon receipt of invoice, subject to a 5% monthly late interest rate.
5. Governing Law. This agreement is governed by the laws of New York.`
  }
}

export default function FileUpload({ onAnalyze, isAnalyzing }) {
  const [mode, setMode] = useState("file")
  const [selectedFile, setSelectedFile] = useState(null)
  const [pastedText, setPastedText] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleLoadSample = (sampleKey) => {
    const sample = SAMPLE_CONTRACTS[sampleKey]
    if (sample) {
      setMode("text")
      setPastedText(sample.text)
    }
  }

  const handleSubmit = () => {
    if (mode === "file" && selectedFile) {
      onAnalyze({ file: selectedFile, documentName: selectedFile.name })
    } else if (mode === "text" && pastedText.trim()) {
      onAnalyze({ text: pastedText, documentName: "Legal_Contract_Input.txt" })
    }
  }

  return (
    <div className="bento-card md:col-span-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            Parse Contract
          </h3>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
              onClick={() => setMode("file")}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                mode === "file"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-primary"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                mode === "text"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-primary"
              }`}
            >
              Paste
            </button>
          </div>
        </div>

        {mode === "file" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-surface-container-high scale-[1.01]"
                : "border-outline-variant bg-surface-container-low hover:bg-surface-container"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-secondary-fixed mb-3 flex items-center justify-center text-on-secondary-fixed-variant group-hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <h4 className="font-body text-base text-primary font-semibold mb-1">
              {selectedFile ? selectedFile.name : "Parse New Contract"}
            </h4>
            <p className="font-mono text-xs text-on-surface-variant mb-4">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                : "Drag & drop PDF or TXT documents here"}
            </p>
            <button
              type="button"
              className="bg-surface-container-high text-on-surface font-mono text-xs px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-container-highest transition-colors shadow-sm"
            >
              {selectedFile ? "Change File" : "Browse Files"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste contract clauses or full legal agreement text..."
              rows={7}
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl p-3.5 text-xs text-on-surface font-mono focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Load Sample Contracts */}
        <div className="mt-4 pt-3 border-t border-outline-variant/40 space-y-2">
          <p className="font-mono text-[11px] text-on-surface-variant uppercase">Quick Samples:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleLoadSample("nda")}
              className="flex-1 py-1.5 px-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant font-mono text-[11px] text-on-surface text-center transition-colors"
            >
              Standard NDA
            </button>
            <button
              onClick={() => handleLoadSample("msa_high_risk")}
              className="flex-1 py-1.5 px-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-[#FFCDD2] font-mono text-[11px] text-[#C62828] text-center transition-colors font-semibold"
            >
              High-Risk MSA
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isAnalyzing || (mode === "file" && !selectedFile) || (mode === "text" && !pastedText.trim())}
        className="w-full mt-4 bg-primary text-on-primary font-medium text-sm py-3 px-6 rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm font-semibold"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isAnalyzing ? "progress_activity" : "auto_awesome"}
        </span>
        <span>{isAnalyzing ? "Processing..." : "Analyze Contract"}</span>
      </button>
    </div>
  )
}
