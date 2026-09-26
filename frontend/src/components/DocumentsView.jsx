import React, { useState } from "react"

export default function DocumentsView({
  documentsList,
  onSelectAndAnalyze,
  onUploadNewDocument,
  isAnalyzing
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [inspectDoc, setInspectDoc] = useState(null)

  const categories = [
    { id: "all", label: "All Documents" },
    { id: "nda", label: "NDAs" },
    { id: "msa", label: "Agreements (MSA)" },
    { id: "saas", label: "SaaS Contracts" },
    { id: "uploaded", label: "User Uploaded" }
  ]

  const filteredDocs = documentsList.filter((doc) => {
    const matchesCategory =
      categoryFilter === "all" || doc.category?.toLowerCase() === categoryFilter.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.parties?.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.jurisdiction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
              Central Repository
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Documents Repository
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1.5 max-w-2xl">
            Store, categorize, and inspect contract archives with instant semantic search and automated AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="bg-primary text-on-primary font-mono text-xs px-6 py-2.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Contract</span>
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadNewDocument(e.target.files[0])
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bento-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, party, jurisdiction, or clause..."
            className="w-full bg-surface-container-low pl-10 pr-4 py-2 rounded-full text-xs text-primary font-mono border border-outline-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc, idx) => {
            const riskColor =
              doc.risk_level?.toLowerCase() === "high"
                ? "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]"
                : doc.risk_level?.toLowerCase() === "medium"
                ? "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]"
                : "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]"

            return (
              <div
                key={doc.id || idx}
                className="bento-card flex flex-col justify-between hover:border-primary/40 transition-all p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/60">
                      {doc.category || "Legal Contract"}
                    </span>
                    <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${riskColor}`}>
                      {doc.risk_level || "Low"} Risk
                    </span>
                  </div>

                  <h3 className="font-headline text-base font-bold text-primary mb-1 line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {doc.summary || doc.description || doc.text?.substring(0, 140) + "..."}
                  </p>

                  <div className="space-y-1.5 font-mono text-[11px] text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 mb-4">
                    <div className="flex justify-between">
                      <span className="text-secondary">Parties:</span>
                      <span className="text-primary font-medium truncate max-w-[160px]">
                        {doc.parties?.join(" & ") || "Bilateral"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Jurisdiction:</span>
                      <span className="text-primary font-medium">{doc.jurisdiction || "Delaware"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Length:</span>
                      <span className="text-primary font-medium">
                        {doc.word_count || doc.text?.split(" ").length || 250} words (
                        {doc.token_count || 320} tokens)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/40 font-mono text-xs">
                  <button
                    onClick={() => onSelectAndAnalyze(doc)}
                    disabled={isAnalyzing}
                    className="flex-1 py-2 px-3 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                    <span>Analyze in Dashboard</span>
                  </button>
                  <button
                    onClick={() => setInspectDoc(doc)}
                    className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition-colors"
                    title="Inspect Full Text"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bento-card p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">folder_zip</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-primary mb-1">
            No Contracts Matched Filter
          </h3>
          <p className="text-xs font-body text-on-surface-variant max-w-md mb-6 leading-relaxed">
            No contracts in repository matching "{searchQuery}". Upload a contract or clear the search filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("")
              setCategoryFilter("all")
            }}
            className="px-5 py-2 rounded-full bg-surface-container text-on-surface font-mono text-xs border border-outline-variant hover:bg-surface-container-high transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Upload Strip */}
      <div className="bento-card p-6 border-2 border-dashed border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-low transition-colors text-center">
        <label className="cursor-pointer block">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed mx-auto mb-2 flex items-center justify-center text-on-secondary-fixed-variant shadow-xs">
            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
          </div>
          <p className="font-headline text-sm font-semibold text-primary">
            Drag & drop legal files here to add directly to repository
          </p>
          <span className="font-mono text-[11px] text-on-surface-variant mt-1 inline-block">
            Supports PDF, DOCX, TXT with automated boundary-preserving chunking
          </span>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadNewDocument(e.target.files[0])
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      {/* Contract Full Text Inspection Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-headline text-lg font-bold text-primary">{inspectDoc.title}</h3>
                <span className="font-mono text-xs text-on-surface-variant">
                  {inspectDoc.category?.toUpperCase()} • {inspectDoc.jurisdiction} Law
                </span>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-mono bg-surface-container-high px-4 py-2 rounded-xl border border-outline-variant/60">
                <span>Characters: {inspectDoc.text?.length || 0}</span>
                <span>Words: {inspectDoc.text?.split(" ").length || 0}</span>
                <span>Estimated Tokens: {Math.round((inspectDoc.text?.split(" ").length || 0) * 1.3)}</span>
              </div>
              <pre className="p-4 bg-surface-container-low rounded-2xl text-xs font-mono text-on-surface whitespace-pre-wrap leading-relaxed border border-outline-variant/40 max-h-[420px] overflow-y-auto">
                {inspectDoc.text}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low flex justify-between items-center font-mono text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inspectDoc.text || "")
                }}
                className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Full Text
              </button>
              <button
                onClick={() => {
                  onSelectAndAnalyze(inspectDoc)
                  setInspectDoc(null)
                }}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                Analyze in Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
