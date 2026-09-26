import React, { useState } from "react"

export default function SettingsView() {
  const [zeroData, setZeroData] = useState(true)
  const [anomalyDetection, setAnomalyDetection] = useState(true)
  const [exportFormat, setExportFormat] = useState("DOCX with Track Changes")
  const [savedNotice, setSavedNotice] = useState(false)

  const handleSave = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 3000)
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-200" id="view-settings">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-mono">
              Preferences
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Workspace Settings
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-1.5 max-w-2xl">
            Configure security baselines, OCR extractors, and organizational risk tolerance policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-xs font-mono text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-full border border-[#C8E6C9] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Preferences saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="bg-primary-container text-on-primary font-mono text-xs px-6 py-2.5 rounded-full hover:bg-primary transition-all font-semibold shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Settings Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap">
        <div className="bento-card md:col-span-8 space-y-6">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-1">
              Analysis & Privacy Configuration
            </h3>
            <p className="text-xs text-on-surface-variant font-body">
              Manage how legal text and sensitive contract clauses are handled and parsed by the engine.
            </p>
          </div>

          <div className="space-y-4 border-t border-outline-variant/50 pt-4 font-sans text-xs">
            {/* Setting 1: Zero Data Retention */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Zero-Data Retention (GDPR Article 28 Mode)
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Purge ephemeral text segments immediately after clause generation.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={zeroData}
                  onChange={(e) => setZeroData(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Setting 2: Automated Anomaly Detection */}
            <div className="flex items-center justify-between py-2 border-t border-outline-variant/40">
              <div>
                <p className="text-sm font-semibold text-primary">Automated Anomaly Detection</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Flag non-mutual termination, governing law changes, and liability uncaps automatically.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={anomalyDetection}
                  onChange={(e) => setAnomalyDetection(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Setting 3: Export Redline Format */}
            <div className="flex items-center justify-between py-2 border-t border-outline-variant/40">
              <div>
                <p className="text-sm font-semibold text-primary">Export Redline Format</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Default document export standard for revised contract drafts.
                </p>
              </div>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="bg-surface-container-low text-xs border border-outline-variant rounded-xl px-3.5 py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors"
              >
                <option>DOCX with Track Changes</option>
                <option>PDF with Side-by-Side Redline</option>
                <option>Clean JSON Payload</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscription & Team Card (4 cols) */}
        <div className="bento-card md:col-span-4 space-y-4 bg-surface-container-low flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-1">
              Subscription & Team
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Lexis Obsidian Legal Intelligence Enterprise plan. Unlimited batch OCR extraction.
            </p>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/60 mt-4 shadow-xs">
              <p className="text-xs font-semibold text-primary font-mono">Seat Allocation</p>
              <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                8 of 10 Legal Counsel Seats Active
              </p>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full mt-3 overflow-hidden border border-outline-variant/40">
                <div className="bg-primary h-full w-[80%] rounded-full"></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant font-mono pt-3 border-t border-outline-variant/40">
            Contact organization administrator for seat adjustments.
          </p>
        </div>
      </div>
    </section>
  )
}
