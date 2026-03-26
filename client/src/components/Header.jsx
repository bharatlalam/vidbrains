import React from "react";

export default function Header({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
      style={{ background: "rgba(13,13,15,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
      <button onClick={onLogoClick} className="flex items-center gap-2 font-black text-lg text-white"
        style={{ letterSpacing: "-0.5px", background: "none", border: "none", cursor: onLogoClick ? "pointer" : "default" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "#e05a2b" }}>🧠</div>
        VidBrain
      </button>
      <span className="text-xs font-bold tracking-widest px-2 py-1 rounded-full uppercase"
        style={{ background: "rgba(224,90,43,0.12)", color: "#f07040", border: "1px solid rgba(224,90,43,0.25)", letterSpacing: "1px" }}>
        Beta
      </span>
    </header>
  );
}