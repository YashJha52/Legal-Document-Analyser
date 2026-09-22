import React from "react"

export default function Header({
  documentName,
  telemetry,
  isAnalyzing,
  error,
  theme,
  toggleTheme
}) {
  const ramText = telemetry ? `${telemetry.ram_used_gb} GB / ${telemetry.ram_budget_gb} GB` : "1.6 GB / 8 GB"

  return (
    <>
      {/* Desktop TopAppBar */}
      <header className="bg-background/80 backdrop-blur-md sticky top-0 w-full h-16 z-40 justify-between items-center px-8 border-b border-outline-variant hidden md:flex transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant bg-surface-container-high px-3.5 py-1.5 rounded-full border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" />
            <span className="truncate max-w-xs">{documentName || "No document loaded"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">memory</span>
            <span>RAM: {ramText}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest">
            {isAnalyzing ? (
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Analyzing...
              </span>
            ) : error ? (
              <span className="flex items-center gap-1.5 text-risk-high font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>
                Analysis Error
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-risk-low font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Local Engine Ready
              </span>
            )}
          </div>

          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            className="text-primary hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>

          <button className="text-primary hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          <button className="text-primary hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-1 shadow-sm">
            <img
              alt="User profile photo"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArcgJLz38ygfbZ9FUWZq7xyTf_a4-xbLRFTOwBt-Qj4-k6Mik_GRX8wyYfSsHpQ1OcMeHJS_rTlZBjefMHSpc3HwFWM6d8SWHGoM8gTNrDdmuAdOqTaWxwWY7S9wo5_K9wQJUGfnPfihiywGvoVN2eGsHGnz1BmMonMFSS2ZntijiJsPeJpq3SWF9HNHclVnY9CCgqX9gayZOWlLSdwcRi0jHHOpDToeRndPDacQFRI_NtOtU6WM-D"
            />
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-background border-b border-outline-variant sticky top-0 w-full h-16 z-40 flex justify-between items-center px-4">
        <h1 className="font-headline text-lg text-primary font-bold">Lexis Obsidian</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-primary p-2 rounded-lg hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
        </div>
      </header>
    </>
  )
}
