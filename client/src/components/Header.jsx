import React from "react";

export default function Header({ onLogoClick, onHistoryClick, onCompareClick, onDashboardClick, showHistory, showCompare, showDashboard }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
      style={{ background: "rgba(13,13,15,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
      <button onClick={onLogoClick} className="flex items-center gap-2 font-black text-lg text-white"
        style={{ letterSpacing: "-0.5px", background: "none", border: "none", cursor: "pointer" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "#e05a2b" }}>🧠</div>
        VidBrain
      </button>

      <div className="flex items-center gap-2">
        <button onClick={onDashboardClick}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            border: `1px solid ${showDashboard ? "rgba(60,184,122,0.4)" : "rgba(255,255,255,0.07)"}`,
            background: showDashboard ? "rgba(60,184,122,0.1)" : "transparent",
            color: showDashboard ? "#3cb87a" : "#9b9a96",
            cursor: "pointer",
          }}>
          📊 Stats
        </button>
        <button onClick={onCompareClick}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            border: `1px solid ${showCompare ? "rgba(74,158,255,0.4)" : "rgba(255,255,255,0.07)"}`,
            background: showCompare ? "rgba(74,158,255,0.1)" : "transparent",
            color: showCompare ? "#4a9eff" : "#9b9a96",
            cursor: "pointer",
          }}>
          ⚖️ Compare
        </button>
        <button onClick={onHistoryClick}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            border: `1px solid ${showHistory ? "rgba(224,90,43,0.4)" : "rgba(255,255,255,0.07)"}`,
            background: showHistory ? "rgba(224,90,43,0.1)" : "transparent",
            color: showHistory ? "#e05a2b" : "#9b9a96",
            cursor: "pointer",
          }}>
          🕐 History
        </button>
        <span className="text-xs font-bold tracking-widest px-2 py-1 rounded-full uppercase hidden sm:block"
          style={{ background: "rgba(224,90,43,0.12)", color: "#f07040", border: "1px solid rgba(224,90,43,0.25)", letterSpacing: "1px" }}>
          Beta
        </span>
      </div>
    </header>
  );
}