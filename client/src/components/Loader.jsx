import React from "react";

export default function Loader({ step, progress }) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-24 pb-16 animate-fade-in">
      <div className="w-12 h-12 rounded-full mb-6 animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
      <p className="text-base font-semibold mb-2">Analyzing your video</p>
      <p className="text-sm mb-6" style={{ color: "#e05a2b", fontFamily: "'DM Mono', monospace" }}>{step}</p>
      <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: "#e05a2b" }} />
      </div>
    </div>
  );
}