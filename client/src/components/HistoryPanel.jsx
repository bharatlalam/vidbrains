import React, { useEffect, useState } from "react";
import { getHistory } from "../utils/api";

export default function HistoryPanel({ onSelect }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-10">
      <div className="w-8 h-8 rounded-full mx-auto animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
    </div>
  );

  if (!history.length) return (
    <div className="text-center py-10">
      <p style={{ color: "#5a5958", fontSize: 14 }}>No history yet. Analyze a video first!</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#5a5958" }}>
        Recently analyzed
      </p>
      {history.map((item) => (
        <div key={item.id}
          className="flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
          onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
          onClick={() => onSelect(item.url, item.language)}>
          <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1f" }}>
            {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{item.title}</p>
            <p className="text-xs" style={{ color: "#9b9a96" }}>{item.channel} · {item.duration}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
            style={{ background: "#222228", color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}