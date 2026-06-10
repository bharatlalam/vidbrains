import React, { useState, useEffect } from "react";
import SummaryPanel      from "./panels/SummaryPanel";
import ChaptersPanel     from "./panels/ChaptersPanel";
import QAPanel           from "./panels/QAPanel";
import FlashcardsPanel   from "./panels/FlashcardsPanel";
import MindMapPanel      from "./panels/MindMapPanel";
import QuizPanel         from "./panels/QuizPanel";
import PodcastPanel      from "./panels/PodcastPanel";
import ReadingPanel      from "./panels/ReadingPanel";
import ChatPanel         from "./panels/ChatPanel";
import TutorPanel        from "./panels/TutorPanel";
import ConceptGraphPanel from "./panels/ConceptGraphPanel";
import NotesPanel        from "./panels/NotesPanel";
import CommunityPanel    from "./panels/CommunityPanel";
import { getCollections, createCollection, addToCollection } from "../utils/api";

const TABS = [
  { id: "summary",    label: "Summary",    icon: "📋" },
  { id: "chapters",   label: "Chapters",   icon: "🕐" },
  { id: "qa",         label: "Q&A",        icon: "❓" },
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "mindmap",    label: "Mind Map",   icon: "🗺" },
  { id: "concept",    label: "Concepts",   icon: "🕸️" },
  { id: "quiz",       label: "Quiz",       icon: "🧠" },
  { id: "tutor",      label: "AI Tutor",   icon: "🧑‍🏫" },
  { id: "notes",      label: "Notes",      icon: "📝" },
  { id: "community",  label: "Community",  icon: "🌟" },
  { id: "podcast",    label: "Podcast",    icon: "🎙️" },
  { id: "reading",    label: "Read",       icon: "📖" },
  { id: "chat",       label: "Chat",       icon: "💬" },
];

export default function Results({ videoData, onReset, showToast }) {
  const [active, setActive] = useState("summary");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [creating, setCreating] = useState(false);

  async function openSaveModal() {
    setShowSaveModal(true);
    setLoadingCollections(true);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch {
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  }

  async function saveToCollection(collectionId) {
    try {
      const result = await addToCollection({
        collectionId,
        shareId: videoData.shareId || "no-share-id",
        videoTitle: videoData.title,
        channel: videoData.channel,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
      });
      if (result.alreadyExists) {
        showToast("Already in this collection!");
      } else {
        showToast("Saved to collection ✓");
      }
      setShowSaveModal(false);
    } catch {
      showToast("Failed to save. Try again.");
    }
  }

  async function createAndSave() {
    if (!newColName.trim()) return;
    setCreating(true);
    try {
      const col = await createCollection({ name: newColName.trim(), emoji: "📚" });
      await saveToCollection(col.id);
      setNewColName("");
    } catch {
      showToast("Failed to create collection.");
    } finally {
      setCreating(false);
    }
  }

  function shareAnalysis() {
    if (!videoData.shareId) { showToast("No share link available."); return; }
    const link = `${window.location.origin}/share/${videoData.shareId}`;
    navigator.clipboard.writeText(link).then(() => showToast("Share link copied! ✓"));
  }

  const panels = {
    summary:    <SummaryPanel      data={videoData} showToast={showToast} />,
    chapters:   <ChaptersPanel     data={videoData} />,
    qa:         <QAPanel           data={videoData} />,
    flashcards: <FlashcardsPanel   data={videoData} showToast={showToast} />,
    mindmap:    <MindMapPanel      data={videoData} showToast={showToast} />,
    concept:    <ConceptGraphPanel data={videoData} />,
    quiz:       <QuizPanel         data={videoData} showToast={showToast} />,
    tutor:      <TutorPanel        data={videoData} />,
    notes:      <NotesPanel        data={videoData} />,
    community:  <CommunityPanel    data={videoData} />,
    podcast:    <PodcastPanel      data={videoData} />,
    reading:    <ReadingPanel      data={videoData} />,
    chat:       <ChatPanel         data={videoData} />,
  };

  return (
    <div className="pt-6 animate-fade-in">

      {/* Save to Collection Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSaveModal(false); }}>
          <div className="w-full max-w-sm rounded-2xl p-5 animate-fade-in"
            style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black">📚 Save to Collection</p>
              <button onClick={() => setShowSaveModal(false)}
                style={{ background: "none", border: "none", color: "#5a5958", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>

            {loadingCollections ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 rounded-full mx-auto animate-spin"
                  style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
              </div>
            ) : (
              <>
                {/* Existing collections */}
                {collections.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                    {collections.map((col) => (
                      <button key={col.id} onClick={() => saveToCollection(col.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full"
                        style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", color: "#f0efe8" }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                        <span style={{ fontSize: 20 }}>{col.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{col.name}</p>
                          <p className="text-xs" style={{ color: "#5a5958" }}>{col.item_count} videos</p>
                        </div>
                        <span className="text-xs" style={{ color: "#e05a2b" }}>+ Add</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create new collection */}
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#5a5958" }}>
                  {collections.length === 0 ? "Create your first collection" : "Or create new"}
                </p>
                <div className="flex gap-2">
                  <input
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createAndSave()}
                    placeholder="Collection name..."
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
                    onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
                  <button onClick={createAndSave} disabled={!newColName.trim() || creating}
                    className="px-3 py-2.5 rounded-lg text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "#e05a2b", border: "none", cursor: !newColName.trim() ? "not-allowed" : "pointer", opacity: !newColName.trim() ? 0.5 : 1 }}>
                    {creating ? "..." : "Create & Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video meta */}
      <div className="flex gap-4 items-start p-4 rounded-2xl mb-5"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="relative flex-shrink-0 w-28 h-16 rounded-xl overflow-hidden" style={{ background: "#1a1a1f" }}>
          {videoData.thumbnail && (
            <img src={videoData.thumbnail} alt="" className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = "none"} />
          )}
          <div className="absolute inset-0 flex items-center justify-center text-xl"
            style={{ background: "rgba(0,0,0,0.3)" }}>▶</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-2 truncate">{videoData.title}</p>
          <div className="flex flex-wrap gap-2">
            {[videoData.channel, videoData.duration, videoData.views, videoData.year].filter(Boolean).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: i === 3 ? "rgba(60,184,122,0.1)" : "#222228",
                  border: `1px solid ${i === 3 ? "rgba(60,184,122,0.25)" : "rgba(255,255,255,0.07)"}`,
                  color: i === 3 ? "#3cb87a" : "#9b9a96",
                  fontFamily: "'DM Mono', monospace",
                }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={shareAnalysis}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(224,90,43,0.3)", color: "#e05a2b", background: "transparent", cursor: "pointer" }}>
            🔗 Share
          </button>
          <button onClick={openSaveModal}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(155,109,255,0.3)", color: "#9b6dff", background: "transparent", cursor: "pointer" }}>
            📚 Save
          </button>
          <button onClick={onReset}
            className="text-xs px-3 py-1.5 rounded-lg"
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
            style={{
              background: active === tab.id ? "#222228" : "transparent",
              color: active === tab.id ? "#f0efe8" : "#9b9a96",
              border: "none", cursor: "pointer",
            }}>
            <span style={{ fontSize: 13 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div key={active} className="animate-fade-in">{panels[active]}</div>
    </div>
  );
}