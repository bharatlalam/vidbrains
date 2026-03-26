import React from "react";

export default function ChaptersPanel({ data }) {
  return (
    <div className="flex flex-col gap-2">
      {data.chapters.map((ch, i) => (
        <div key={i} className="flex gap-3 items-start px-4 py-3 rounded-xl"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", cursor: "default" }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
          onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5"
            style={{ background: "#e05a2b", color: "white", fontFamily: "'DM Mono', monospace" }}>
            {ch.timestamp}
          </span>
          <div>
            <p className="text-sm font-semibold mb-0.5">{ch.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#9b9a96" }}>{ch.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}