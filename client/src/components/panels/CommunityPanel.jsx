import React, { useState, useEffect } from "react";
import { getCommunityHighlights, addCommunityHighlight } from "../../utils/api";

export default function CommunityPanel({ data }) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myHighlight, setMyHighlight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Extract video ID from thumbnail URL
  const videoId = data.thumbnail?.match(/vi\/([^/]+)\//)?.[1] || "unknown";

  useEffect(() => {
    getCommunityHighlights(videoId)
      .then(setHighlights)
      .catch(() => setHighlights([]))
      .finally(() => setLoading(false));
  }, [videoId]);

  async function submitHighlight() {
    if (!myHighlight.trim() || myHighlight.trim().length < 10) return;
    setSubmitting(true);
    try {
      await addCommunityHighlight({
        videoId,
        videoTitle: data.title,
        text: myHighlight.trim(),
      });
      setSubmitted(true);
      setMyHighlight("");
      // Refresh highlights
      const updated = await getCommunityHighlights(videoId);
      setHighlights(updated);
    } catch {}
    finally { setSubmitting(false); }
  }

  async function upvote(highlight) {
    if (highlight.voted_by_me) return;
    try {
      await addCommunityHighlight({
        videoId,
        videoTitle: data.title,
        text: highlight.highlighted_text,
      });
      const updated = await getCommunityHighlights(videoId);
      setHighlights(updated);
    } catch {}
  }

  return (
    <div>
      {/* Header */}
      <div className="p-4 rounded-2xl mb-5"
        style={{ background: "rgba(224,90,43,0.06)", border: "1px solid rgba(224,90,43,0.15)" }}>
        <p className="text-sm font-bold mb-1">🌟 Community Highlights</p>
        <p className="text-xs" style={{ color: "#9b9a96" }}>
          See what other learners highlighted from this video. Add your own insight and upvote the best ones.
        </p>
      </div>

      {/* Add highlight */}
      <div className="mb-5">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#5a5958" }}>
          Share your key insight
        </p>
        <textarea
          value={myHighlight}
          onChange={(e) => setMyHighlight(e.target.value)}
          placeholder="What's the most important thing you learned from this video?"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-2"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "Syne, sans-serif" }}
          onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#5a5958" }}>{myHighlight.length} chars</span>
          <button onClick={submitHighlight} disabled={submitting || myHighlight.trim().length < 10}
            className="text-xs font-bold px-4 py-2 rounded-lg"
            style={{ background: "#e05a2b", color: "white", border: "none", cursor: submitting || myHighlight.trim().length < 10 ? "not-allowed" : "pointer", opacity: submitting || myHighlight.trim().length < 10 ? 0.5 : 1 }}>
            {submitting ? "Sharing..." : "🌟 Share Insight"}
          </button>
        </div>
        {submitted && (
          <p className="text-xs mt-2" style={{ color: "#3cb87a" }}>✓ Insight shared with the community!</p>
        )}
      </div>

      {/* Community highlights list */}
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
        Top highlights from all learners
      </p>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 rounded-full mx-auto animate-spin"
            style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
        </div>
      ) : highlights.length === 0 ? (
        <div className="text-center py-8"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🌟</p>
          <p className="text-sm font-semibold mb-1">Be the first!</p>
          <p className="text-xs" style={{ color: "#5a5958" }}>No highlights yet. Share your insight above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {highlights.map((h, i) => (
            <div key={h.id}
              className="p-4 rounded-xl transition-all"
              style={{ background: "#131316", border: `1px solid ${i === 0 ? "rgba(224,90,43,0.3)" : "rgba(255,255,255,0.07)"}` }}>
              <div className="flex gap-3 items-start">
                {/* Rank */}
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ background: i === 0 ? "#e05a2b" : i === 1 ? "#4a9eff" : i === 2 ? "#3cb87a" : "#222228", color: "white" }}>
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "#f0efe8", lineHeight: 1.6 }}>
                    "{h.highlighted_text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => upvote(h)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all"
                      style={{
                        border: `1px solid ${h.voted_by_me ? "rgba(224,90,43,0.4)" : "rgba(255,255,255,0.07)"}`,
                        background: h.voted_by_me ? "rgba(224,90,43,0.1)" : "transparent",
                        color: h.voted_by_me ? "#e05a2b" : "#9b9a96",
                        cursor: h.voted_by_me ? "default" : "pointer",
                      }}>
                      <span>⭐</span>
                      <span>{h.count} {h.count === 1 ? "person" : "people"} highlighted this</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}