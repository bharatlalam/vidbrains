import React, { useState } from "react";

export default function ReadingPanel({ data }) {
  const [fontSize, setFontSize] = useState(16);
  const [fullscreen, setFullscreen] = useState(false);

  const content = (
    <div style={{
      maxWidth: 680, margin: "0 auto",
      fontFamily: "Georgia, serif",
      fontSize: fontSize,
      lineHeight: 1.9,
      color: fullscreen ? "#e8e6df" : "#f0efe8",
    }}>
      {/* Title */}
      <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: fontSize * 1.8, fontWeight: 800, letterSpacing: "-1px", marginBottom: 8, lineHeight: 1.2 }}>
        {data.title}
      </h1>
      <p style={{ fontSize: fontSize * 0.8, color: "#9b9a96", marginBottom: 40, fontFamily: "'DM Mono', monospace" }}>
        {data.channel} · {data.duration} · {data.views}
      </p>

      {/* Summary */}
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: fontSize * 1.1, fontWeight: 700, marginBottom: 16, color: "#e05a2b" }}>Summary</h2>
      <p style={{ marginBottom: 40, color: fullscreen ? "#c8c6bf" : "#9b9a96" }}>{data.summary}</p>

      {/* Key Points */}
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: fontSize * 1.1, fontWeight: 700, marginBottom: 16, color: "#e05a2b" }}>Key Takeaways</h2>
      <ul style={{ paddingLeft: 24, marginBottom: 40 }}>
        {data.keyPoints.map((p, i) => (
          <li key={i} style={{ marginBottom: 12, color: fullscreen ? "#c8c6bf" : "#9b9a96" }}>{p}</li>
        ))}
      </ul>

      {/* Chapters */}
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: fontSize * 1.1, fontWeight: 700, marginBottom: 16, color: "#e05a2b" }}>Chapters</h2>
      <div style={{ marginBottom: 40 }}>
        {data.chapters.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: fontSize * 0.75, background: "#e05a2b", color: "white", padding: "2px 8px", borderRadius: 6, flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>{c.timestamp}</span>
            <div>
              <p style={{ fontWeight: 700, marginBottom: 4, fontFamily: "Syne, sans-serif" }}>{c.title}</p>
              <p style={{ fontSize: fontSize * 0.9, color: fullscreen ? "#c8c6bf" : "#9b9a96" }}>{c.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Q&A */}
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: fontSize * 1.1, fontWeight: 700, marginBottom: 16, color: "#e05a2b" }}>Q&amp;A</h2>
      <div style={{ marginBottom: 40 }}>
        {data.qa.map((q, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Q: {q.question}</p>
            <p style={{ color: fullscreen ? "#c8c6bf" : "#9b9a96", paddingLeft: 16, borderLeft: "2px solid #e05a2b" }}>{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (fullscreen) return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#080808", overflowY: "auto",
      padding: "4rem 2rem",
    }}>
      {/* Controls */}
      <div style={{
        position: "fixed", top: 16, right: 16,
        display: "flex", gap: 8, zIndex: 1000,
      }}>
        <button onClick={() => setFontSize((f) => Math.max(12, f - 2))}
          style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#131316", color: "#9b9a96", cursor: "pointer", fontSize: 16 }}>A-</button>
        <button onClick={() => setFontSize((f) => Math.min(24, f + 2))}
          style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#131316", color: "#9b9a96", cursor: "pointer", fontSize: 16 }}>A+</button>
        <button onClick={() => setFullscreen(false)}
          style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(224,90,43,0.3)", background: "rgba(224,90,43,0.1)", color: "#e05a2b", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      {content}
    </div>
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#5a5958" }}>
          Distraction-free reading mode
        </p>
        <div className="flex gap-2">
          <button onClick={() => setFontSize((f) => Math.max(12, f - 2))}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>A-</button>
          <button onClick={() => setFontSize((f) => Math.min(24, f + 2))}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>A+</button>
          <button onClick={() => setFullscreen(true)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(224,90,43,0.3)", background: "rgba(224,90,43,0.1)", color: "#e05a2b", cursor: "pointer" }}>
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="p-6 rounded-2xl overflow-y-auto"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", maxHeight: 500 }}>
        {content}
      </div>
    </div>
  );
}