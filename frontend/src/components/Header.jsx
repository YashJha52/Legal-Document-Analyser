import React from "react"

export default function Header({
  activeTab,
  documentName,
  theme,
  toggleTheme
}) {
  const breadcrumbLabels = {
    dashboard: "Document & Contract Intelligence",
    documents: "Contract & Case Repository",
    risk: "Risk Assessment Studio",
    settings: "Workspace Settings"
  }

  return (
    <>
      <header className="bg-background/90 backdrop-blur-md sticky top-0 w-full h-16 z-40 flex justify-between items-center px-8 border-b border-outline-variant transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-md bg-surface-container font-medium text-secondary font-mono">
            Lexis Workspace
          </span>
          <span className="text-outline-variant font-mono">/</span>
          <span className="text-xs font-semibold text-primary font-mono" id="breadcrumb-current">
            {breadcrumbLabels[activeTab] || "Overview"}
          </span>
          {documentName && (
            <>
              <span className="text-outline-variant font-mono">/</span>
              <span className="text-xs font-mono text-on-surface-variant truncate max-w-sm bg-surface-container-high px-2.5 py-0.5 rounded-full border border-outline-variant/60">
                {documentName}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-[11px] font-mono text-secondary border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Legal NLP Engine Active</span>
          </div>

          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            className="text-primary hover:text-secondary p-2 rounded-full hover:bg-surface-container-high border border-outline-variant transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
        </div>
      </header>

      <header className="md:hidden bg-background border-b border-outline-variant sticky top-0 w-full h-16 z-40 flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-primary-fixed">balance</span>
          </div>
          <h1 className="font-headline text-base text-primary font-bold">Lexis Obsidian</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-primary p-2 rounded-lg hover:bg-surface-container-high border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
        </div>
      </header>
    </>
  )
}
