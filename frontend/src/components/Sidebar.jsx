import React from "react"

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "documents", label: "Documents", icon: "description" },
    { id: "risk", label: "Risk Analysis", icon: "gavel" },
    { id: "settings", label: "Settings", icon: "settings" }
  ]

  return (
    <nav className="bg-surface border-r border-outline-variant h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col py-6 z-50 transition-colors">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-container text-surface flex items-center justify-center font-serif text-lg font-bold shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-primary-fixed">balance</span>
        </div>
        <div>
          <h1 className="font-headline text-[20px] leading-tight font-bold text-primary">Lexis Obsidian</h1>
          <p className="font-mono text-xs text-on-surface-variant">Legal Intelligence</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5" id="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium text-sm transition-all text-left ${
                    isActive
                      ? "bg-gradient-to-r from-secondary-fixed to-surface-container-high text-on-secondary-fixed-variant rounded-xl rounded-l-none border-l-4 border-primary ml-0 mr-4 scale-[1.02] shadow-xs font-semibold"
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

      {/* Bottom Workspace Status */}
      <div className="px-6 pt-4 border-t border-outline-variant/60">
        <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/50">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5 font-mono">
            <span className="font-semibold text-primary">Engine Status</span>
            <span className="inline-flex items-center gap-1.5 text-[#2E7D32] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse"></span>
              Ready
            </span>
          </div>
          <p className="text-[11px] font-mono text-on-surface-variant leading-relaxed">
            Model: Obsidian-Legal v4.2<br />
            Zero data retention active
          </p>
        </div>
      </div>
    </nav>
  )
}
