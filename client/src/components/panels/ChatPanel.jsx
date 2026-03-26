import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useAnalysis";

export default function ChatPanel({ data }) {
  const { messages, sending, send } = useChat(data);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend() {
    const q = input.trim();
    if (!q || sending) return;
    setInput(""); send(q);
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden"
      style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", height: 520 }}>
      <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#3cb87a", boxShadow: "0 0 0 3px rgba(60,184,122,0.15)" }} />
        <p className="text-sm font-semibold">Chat with the video</p>
        <p className="text-xs ml-auto font-mono truncate" style={{ color: "#5a5958", maxWidth: 180, fontFamily: "'DM Mono', monospace" }}>{data.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className="animate-msg" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div className="text-sm px-4 py-2.5 max-w-xs leading-relaxed"
              style={{ background: msg.role === "user" ? "#e05a2b" : "#1a1a1f", color: msg.role === "user" ? "white" : "#f0efe8", border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.07)" : "none", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", lineHeight: "1.65" }}>
              {msg.text}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: "flex" }}>
            <div className="text-sm px-4 py-2.5 italic animate-msg"
              style={{ background: "#1a1a1f", color: "#5a5958", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px 14px 14px 4px" }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {data.suggestedQuestions && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {data.suggestedQuestions.map((q, i) => (
            <button key={i} onClick={() => setInput(q)} className="text-xs px-3 py-1 rounded-full"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(224,90,43,0.4)"; e.currentTarget.style.color = "#e05a2b"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#9b9a96"; }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 px-4 py-3 items-end" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask anything about the video..."
          className="flex-1 text-sm px-4 py-2.5 rounded-xl resize-none outline-none"
          style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "Syne, sans-serif", maxHeight: 100 }}
          onFocus={(e) => (e.target.style.borderColor = "#e05a2b")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")} />
        <button onClick={handleSend} disabled={sending || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "#e05a2b", border: "none", cursor: "pointer", opacity: sending || !input.trim() ? 0.45 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}