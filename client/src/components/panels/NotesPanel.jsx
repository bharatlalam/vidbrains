import React, { useState, useEffect, useRef } from "react";
import { getNotes, saveNotes, deleteNotes } from "../../utils/api";

const TOOLBAR = [
  { label: "B", action: "bold", style: "font-bold", md: "**", title: "Bold" },
  { label: "I", action: "italic", style: "italic", md: "_", title: "Italic" },
  { label: "H1", action: "h1", md: "# ", title: "Heading 1" },
  { label: "H2", action: "h2", md: "## ", title: "Heading 2" },
  { label: "•", action: "bullet", md: "- ", title: "Bullet point" },
  { label: "1.", action: "number", md: "1. ", title: "Numbered list" },
  { label: "[ ]", action: "todo", md: "- [ ] ", title: "Todo item" },
  { label: "❝", action: "quote", md: "> ", title: "Quote" },
  { label: "—", action: "divider", md: "---\n", title: "Divider" },
];

export default function NotesPanel({ data }) {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef(null);
  const saveTimerRef = useRef(null);

  const shareId = data.shareId || "local";

  useEffect(() => {
    // Load existing notes
    getNotes(shareId)
      .then((note) => {
        if (note?.content) {
          setContent(note.content);
          setWordCount(note.content.split(/\s+/).filter(Boolean).length);
        } else {
          // Pre-fill with video info as starting template
          const template = `# ${data.title}\n\n> ${data.channel} · ${data.duration}\n\n## My Notes\n\n\n\n## Key Takeaways\n${data.keyPoints.map((p) => `- [ ] ${p}`).join("\n")}\n\n## Questions I Have\n\n\n\n## Action Items\n\n`;
          setContent(template);
          setWordCount(template.split(/\s+/).filter(Boolean).length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shareId]);

  function handleChange(e) {
    const val = e.target.value;
    setContent(val);
    setWordCount(val.split(/\s+/).filter(Boolean).length);
    setSaved(false);

    // Auto-save after 2 seconds of no typing
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(val), 2000);
  }

  async function autoSave(val) {
    setSaving(true);
    try {
      await saveNotes({ shareId, videoTitle: data.title, content: val });
      setSaved(true);
    } catch {}
    finally { setSaving(false); }
  }

  async function manualSave() {
    setSaving(true);
    try {
      await saveNotes({ shareId, videoTitle: data.title, content });
      setSaved(true);
    } catch {}
    finally { setSaving(false); }
  }

  function insertAtCursor(insertion) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    let newContent;

    if (["bold", "italic"].includes(insertion.action)) {
      const wrapped = `${insertion.md}${selected || "text"}${insertion.md}`;
      newContent = content.slice(0, start) + wrapped + content.slice(end);
    } else {
      // Line prefix
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      newContent = content.slice(0, lineStart) + insertion.md + content.slice(lineStart);
    }

    setContent(newContent);
    setSaved(false);
    setTimeout(() => el.focus(), 50);
  }

  function copyNotes() {
    navigator.clipboard.writeText(content);
  }

  async function clearNotes() {
    if (!confirm("Clear all notes for this video?")) return;
    await deleteNotes(shareId);
    setContent("");
    setSaved(true);
  }

  if (loading) return (
    <div className="text-center py-10">
      <div className="w-8 h-8 rounded-full mx-auto animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#5a5958" }}>
            📝 Smart Notes
          </p>
          <span className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
            {wordCount} words
          </span>
          <span className="text-xs" style={{ color: saved ? "#3cb87a" : saving ? "#f0a030" : "#9b9a96" }}>
            {saving ? "Saving..." : saved ? "✓ Saved" : "Unsaved"}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={copyNotes}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
            📋 Copy
          </button>
          <button onClick={manualSave}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(224,90,43,0.3)", background: "rgba(224,90,43,0.08)", color: "#e05a2b", cursor: "pointer" }}>
            💾 Save
          </button>
          <button onClick={clearNotes}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#5a5958", cursor: "pointer" }}>
            🗑
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-1 flex-wrap mb-2 p-2 rounded-xl"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        {TOOLBAR.map((tool) => (
          <button key={tool.action} onClick={() => insertAtCursor(tool)}
            title={tool.title}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer", fontWeight: tool.action === "bold" ? 700 : 400, fontStyle: tool.action === "italic" ? "italic" : "normal" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#1a1a1f"; e.currentTarget.style.color = "#f0efe8"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9b9a96"; }}>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Start typing your notes here..."
        className="w-full outline-none resize-none text-sm leading-relaxed"
        style={{
          background: "#131316",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "1.25rem",
          color: "#f0efe8",
          fontFamily: "Syne, sans-serif",
          lineHeight: 1.8,
          minHeight: 400,
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; autoSave(content); }}
      />

      <p className="text-xs mt-2 text-center" style={{ color: "#5a5958" }}>
        Auto-saves as you type · Markdown supported · Saved to your account
      </p>
    </div>
  );
}