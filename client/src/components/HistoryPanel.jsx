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
    <div className="text-center py-16">
      <div className="w-8 h-8 rounded-full mx-auto animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
      <p className="text-sm mt-4" style={{ color: "#5a5958" }}>Loading history...</p>
    </div>
  );

  if (!history.length) return (
    <div className="text-center py-16">
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <p className="text-base font-semibold mb-2">No history yet</p>
      <p className="text-sm" style={{ color: "#5a5958" }}>Analyze a video and it will appear here!</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#5a5958" }}>
          Recently analyzed — {history.length} videos
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {history.map((item) => (
          <div key={item.id}
            className="flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all"
            style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
            onClick={() => onSelect(item.url, item.language)}>

            {/* Thumbnail */}
            <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 relative"
              style={{ background: "#1a1a1f" }}>
              {item.thumbnail && (
                <img src={item.thumbnail} alt="" className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = "none"} />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-sm"
                style={{ background: "rgba(0,0,0,0.3)" }}>▶</div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate mb-1">{item.title}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs" style={{ color: "#9b9a96" }}>{item.channel}</span>
                {item.duration && (
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "#222228", color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                    {item.duration}
                  </span>
                )}
                {item.language && item.language !== "en" && (
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(224,90,43,0.1)", color: "#e05a2b" }}>
                    {item.language.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Date + re-analyze */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: "#222228", color: "#9b9a96" }}>
                Re-analyze →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}