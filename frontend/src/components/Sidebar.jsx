import React from "react"

export default function Sidebar({ activeTab, setActiveTab, telemetry }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "parser", label: "Documents", icon: "description" },
    { id: "risk", label: "Risk Analysis", icon: "gavel" },
    { id: "settings", label: "Telemetry & Settings", icon: "settings" }
  ]

  return (
    <nav className="bg-surface border-r border-outline-variant h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col py-6 z-50 transition-colors">
      <div className="px-6 mb-8">
        <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">Lexis Obsidian</h1>
        <p className="font-mono text-xs text-on-surface-variant mt-1 tracking-wider uppercase">Legal Intelligence</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm text-left ${
                    isActive
                      ? "bg-gradient-to-r from-secondary-fixed to-surface-container-high text-on-secondary-fixed-variant rounded-xl rounded-l-none border-l-4 border-primary ml-0 mr-4 scale-[1.02] shadow-sm font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-primary hover:translate-x-1 rounded-xl mx-4 w-[calc(100%-2rem)]"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="px-4 mt-auto">
        <div className="bg-surface-container rounded-2xl p-3.5 border border-outline-variant space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <span className="material-symbols-outlined text-sm text-primary">memory</span>
            <span>8GB Workstation Budget</span>
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant space-y-1.5">
            <div className="flex justify-between">
              <span>RAM Used:</span>
              <span className="text-primary font-bold">{telemetry ? `${telemetry.ram_used_gb} GB` : "1.6 GB"}</span>
            </div>
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-on-surface font-medium">Qwen2.5-1.5B</span>
            </div>
            <div className="flex justify-between">
              <span>Quant:</span>
              <span className="text-on-surface font-medium">Q4_K_M GGUF</span>
            </div>
            <div className="flex justify-between">
              <span>Context:</span>
              <span className="text-on-surface font-medium">8,192 tokens</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
