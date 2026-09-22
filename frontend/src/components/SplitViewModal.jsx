import React from "react"

export default function SplitViewModal({ clause, onClose }) {
  if (!clause) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary">{clause.title || clause.clause_type}</h3>
            <span className="font-mono text-xs text-on-surface-variant">
              Side-by-Side Legalese vs Plain-English Translation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-secondary uppercase">
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Original Contract Text</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant text-xs font-mono text-on-surface-variant leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                {clause.text}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase">
                <span className="material-symbols-outlined text-[16px] text-secondary">auto_awesome</span>
                <span>Plain-English Meaning</span>
              </div>
              <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/60 text-xs text-on-surface leading-relaxed max-h-[380px] overflow-y-auto space-y-4">
                <p className="font-medium text-sm text-primary leading-normal">
                  {clause.plain_english_meaning}
                </p>

                {clause.risk_rationale && (
                  <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/50 space-y-1">
                    <span className="font-mono text-xs font-bold text-[#C62828] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">shield_alert</span>
                      Risk Posture ({clause.risk_level} Risk):
                    </span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {clause.risk_rationale}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-mono text-xs font-semibold hover:opacity-90 transition-colors shadow-sm"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  )
}
