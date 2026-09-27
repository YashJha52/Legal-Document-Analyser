import React, { useState, useRef } from "react"

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

  const handleSubmit = () => {
    if (mode === "file" && selectedFile) {
      onAnalyze({ file: selectedFile, documentName: selectedFile.name })
    } else if (mode === "text" && pastedText.trim()) {
      onAnalyze({ text: pastedText, documentName: "Input_Document.txt" })
    }
  }

  return (
    <div className="bento-card w-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            Input Legal Document
          </h3>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
              onClick={() => setMode("file")}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === "file"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-primary"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === "text"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-primary"
              }`}
            >
              Paste Text
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
            <div className="w-14 h-14 rounded-full bg-secondary-fixed mb-3 flex items-center justify-center text-on-secondary-fixed-variant group-hover:scale-110 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <h4 className="font-body text-base text-primary font-semibold mb-1">
              {selectedFile ? selectedFile.name : "Upload Document"}
            </h4>
            <p className="font-mono text-xs text-on-surface-variant mb-4">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                : "Drag & drop PDF, TXT, or DOCX files here"}
            </p>
            <button
              type="button"
              className="bg-surface-container-high text-on-surface font-mono text-xs px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-container-highest transition-colors shadow-xs"
            >
              {selectedFile ? "Change File" : "Browse Files"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste contract clauses, court judgment, or legal notice text here..."
              rows={8}
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl p-3.5 text-xs text-on-surface font-mono focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isAnalyzing || (mode === "file" && !selectedFile) || (mode === "text" && !pastedText.trim())}
        className="w-full mt-4 bg-primary text-on-primary font-medium text-sm py-3 px-6 rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm font-semibold"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isAnalyzing ? "progress_activity" : "auto_awesome"}
        </span>
        <span>{isAnalyzing ? "Analyzing Document..." : "Analyze Document"}</span>
      </button>
    </div>
  )
}
