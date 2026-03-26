import React, { useState } from "react";
import SummaryPanel    from "./panels/SummaryPanel";
import ChaptersPanel   from "./panels/ChaptersPanel";
import QAPanel         from "./panels/QAPanel";
import FlashcardsPanel from "./panels/FlashcardsPanel";
import MindMapPanel    from "./panels/MindMapPanel";
import ChatPanel       from "./panels/ChatPanel";
import QuizPanel       from "./panels/QuizPanel";

const TABS = [
  { id: "summary",    label: "Summary",    icon: "📋" },
  { id: "chapters",   label: "Chapters",   icon: "🕐" },
  { id: "qa",         label: "Q&A",        icon: "❓" },
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "mindmap",    label: "Mind Map",   icon: "🗺" },
  { id: "quiz",       label: "Quiz",       icon: "🧠" },
  { id: "chat",       label: "Chat",       icon: "💬" },
];

export default function Results({ videoData, onReset, showToast }) {
  const [active, setActive] = useState("summary");

  function shareAnalysis() {
    if (!videoData.shareId) { showToast("No share link available."); return; }
    const link = `${window.location.origin}/share/${videoData.shareId}`;
    navigator.clipboard.writeText(link).then(() => showToast("Share link copied! ✓"));
  }

  const panels = {
    summary:    <SummaryPanel    data={videoData} showToast={showToast} />,
    chapters:   <ChaptersPanel   data={videoData} />,
    qa:         <QAPanel         data={videoData} />,
    flashcards: <FlashcardsPanel data={videoData} showToast={showToast} />,
    mindmap:    <MindMapPanel    data={videoData} showToast={showToast} />,
    quiz:       <QuizPanel       data={videoData} showToast={showToast} />,
    chat:       <ChatPanel       data={videoData} />,
  };

  return (
    <div className="pt-6 animate-fade-in">
      {/* Video meta */}
      <div className="flex gap-4 items-start p-4 rounded-2xl mb-5"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="relative flex-shrink-0 w-28 h-16 rounded-xl overflow-hidden" style={{ background: "#1a1a1f" }}>
          {videoData.thumbnail && <img src={videoData.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = "none"} />}
          <div className="absolute inset-0 flex items-center justify-center text-xl" style={{ background: "rgba(0,0,0,0.3)" }}>▶</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-2 truncate">{videoData.title}</p>
          <div className="flex flex-wrap gap-2">
            {[videoData.channel, videoData.duration, videoData.views, videoData.year].filter(Boolean).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{ background: i === 3 ? "rgba(60,184,122,0.1)" : "#222228", border: `1px solid ${i === 3 ? "rgba(60,184,122,0.25)" : "rgba(255,255,255,0.07)"}`, color: i === 3 ? "#3cb87a" : "#9b9a96", fontFamily: "'DM Mono', monospace" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={shareAnalysis} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
            style={{ border: "1px solid rgba(224,90,43,0.3)", color: "#e05a2b", background: "transparent", cursor: "pointer" }}>
            🔗 Share
          </button>
          <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
            ← New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 rounded-2xl mb-5 overflow-x-auto"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{ background: active === tab.id ? "#222228" : "transparent", color: active === tab.id ? "#f0efe8" : "#9b9a96", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 14 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div key={active} className="animate-fade-in">{panels[active]}</div>
    </div>
  );
}