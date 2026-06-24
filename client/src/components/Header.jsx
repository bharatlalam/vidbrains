import React from "react";

export default function Header({ onLogoClick, onHistoryClick, onCompareClick, onDashboardClick, onCollectionsClick, onGroupsClick, showHistory, showCompare, showDashboard, showCollections, showGroups, user, onLogout, onSignIn }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 border-b"
      style={{ background: "rgba(13,13,15,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
      <button onClick={onLogoClick} className="flex items-center gap-2 font-black text-lg text-white"
        style={{ letterSpacing: "-0.5px", background: "none", border: "none", cursor: "pointer" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "#e05a2b" }}>🧠</div>
        VidBrain
      </button>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {[
          { label: "📊 Stats", onClick: onDashboardClick, active: showDashboard, color: "#3cb87a" },
          { label: "📚 Collections", onClick: onCollectionsClick, active: showCollections, color: "#9b6dff" },
          { label: "👥 Groups", onClick: onGroupsClick, active: showGroups, color: "#4a9eff" },
          { label: "⚖️ Compare", onClick: onCompareClick, active: showCompare, color: "#4a9eff" },
          { label: "🕐 History", onClick: onHistoryClick, active: showHistory, color: "#e05a2b" },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.onClick}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all"
            style={{
              border: `1px solid ${btn.active ? btn.color + "66" : "rgba(255,255,255,0.07)"}`,
              background: btn.active ? btn.color + "18" : "transparent",
              color: btn.active ? btn.color : "#9b9a96",
              cursor: "pointer",
            }}>
            {btn.label}
          </button>
        ))}

        {user ? (
          <div className="flex items-center gap-2 ml-1 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.2)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: "#e05a2b", color: "white" }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-semibold" style={{ color: "#e05a2b", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </span>
            </div>
            <button onClick={onLogout}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#5a5958", cursor: "pointer" }}>
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={onSignIn}
            className="text-xs font-bold px-3 py-1.5 rounded-lg ml-1 flex-shrink-0"
            style={{ background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}