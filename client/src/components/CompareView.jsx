import React, { useState } from "react";
import { compareVideos } from "../utils/api";

const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "te", label: "Telugu",   flag: "🇮🇳" },
  { code: "hi", label: "Hindi",    flag: "🇮🇳" },
  { code: "ta", label: "Tamil",    flag: "🇮🇳" },
  { code: "es", label: "Spanish",  flag: "🇪🇸" },
  { code: "fr", label: "French",   flag: "🇫🇷" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

export default function CompareView({ onBack }) {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleCompare() {
    if (!url1.trim() || !url2.trim()) { setError("Please enter both URLs"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await compareVideos(url1.trim(), url2.trim(), language);
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.error || "Comparison failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>⚖️ Video Comparison</h2>
          <p className="text-xs" style={{ color: "#9b9a96" }}>Deep side-by-side breakdown of 2 videos</p>
        </div>
      </div>

      {/* Input */}
      {!result && (
        <div className="p-5 rounded-2xl mb-5"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex flex-col gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#e05a2b" }}>📹 Video 1</p>
              <input value={url1} onChange={(e) => setUrl1(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "'DM Mono', monospace" }}
                onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#4a9eff" }}>📹 Video 2</p>
              <input value={url2} onChange={(e) => setUrl2(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "'DM Mono', monospace" }}
                onFocus={(e) => e.target.style.borderColor = "#4a9eff"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs" style={{ color: "#5a5958" }}>Language:</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg outline-none"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.3)", color: "#f07040" }}>
              {error}
            </div>
          )}

          <button onClick={handleCompare} disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "#e05a2b", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Analyzing both videos... (~45s)" : "⚖️ Compare Videos →"}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">
          <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
            style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
          <p className="text-sm font-semibold mb-1">Analyzing both videos in depth</p>
          <p className="text-xs" style={{ color: "#9b9a96" }}>Takes about 45 seconds...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="animate-fade-in">

          {/* Video titles side by side */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[result.video1, result.video2].map((v, i) => (
              <div key={i} className="p-4 rounded-xl"
                style={{ background: "#131316", border: `1px solid ${i === 0 ? "rgba(224,90,43,0.3)" : "rgba(74,158,255,0.3)"}` }}>
                <p className="text-xs font-bold mb-2" style={{ color: i === 0 ? "#e05a2b" : "#4a9eff" }}>
                  {i === 0 ? "📹 Video 1" : "📹 Video 2"}
                </p>
                <img src={v.thumbnail} alt="" className="w-full rounded-lg mb-2 object-cover" style={{ height: 80 }}
                  onError={(e) => e.target.style.display = "none"} />
                <p className="text-xs font-semibold mb-1 leading-tight">{v.title}</p>
                <p className="text-xs" style={{ color: "#9b9a96" }}>{v.channel} · {v.duration}</p>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="p-4 rounded-xl mb-5"
            style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#5a5958" }}>Overview</p>
            <p className="text-sm leading-relaxed" style={{ color: "#9b9a96" }}>{result.comparison.overview}</p>
          </div>

          {/* What each covers */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(224,90,43,0.2)" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "#e05a2b" }}>What Video 1 Covers</p>
              <p className="text-xs leading-relaxed" style={{ color: "#9b9a96" }}>{result.comparison.video1Summary}</p>
            </div>
            <div className="p-4 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(74,158,255,0.2)" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "#4a9eff" }}>What Video 2 Covers</p>
              <p className="text-xs leading-relaxed" style={{ color: "#9b9a96" }}>{result.comparison.video2Summary}</p>
            </div>
          </div>

          {/* Aspect table */}
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
            Side by Side Breakdown
          </p>
          <div className="rounded-2xl overflow-hidden mb-5"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid grid-cols-3 text-xs font-bold py-3 px-4"
              style={{ background: "#1a1a1f", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "#5a5958" }}>Aspect</div>
              <div style={{ color: "#e05a2b" }}>📹 Video 1</div>
              <div style={{ color: "#4a9eff" }}>📹 Video 2</div>
            </div>
            {result.comparison.aspects.map((row, i) => (
              <div key={i} className="grid grid-cols-3 py-3 px-4 text-xs gap-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "#131316" : "#0f0f11" }}>
                <div className="font-semibold" style={{ color: "#9b9a96" }}>{row.aspect}</div>
                <div style={{ color: "#f0efe8", lineHeight: 1.5 }}>{row.video1}</div>
                <div style={{ color: "#f0efe8", lineHeight: 1.5 }}>{row.video2}</div>
              </div>
            ))}
          </div>

          {/* Unique to each */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(224,90,43,0.2)" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "#e05a2b" }}>🔵 Only in Video 1</p>
              {result.comparison.uniqueToVideo1.map((s, i) => (
                <p key={i} className="text-xs mb-2" style={{ color: "#9b9a96" }}>• {s}</p>
              ))}
            </div>
            <div className="p-4 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(74,158,255,0.2)" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "#4a9eff" }}>🔵 Only in Video 2</p>
              {result.comparison.uniqueToVideo2.map((s, i) => (
                <p key={i} className="text-xs mb-2" style={{ color: "#9b9a96" }}>• {s}</p>
              ))}
            </div>
          </div>

          {/* Common topics */}
          <div className="p-4 rounded-xl mb-5"
            style={{ background: "#131316", border: "1px solid rgba(60,184,122,0.2)" }}>
            <p className="text-xs font-bold mb-3" style={{ color: "#3cb87a" }}>✓ Topics Both Cover</p>
            <div className="flex flex-wrap gap-2">
              {result.comparison.commonTopics.map((t, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "rgba(60,184,122,0.08)", border: "1px solid rgba(60,184,122,0.2)", color: "#3cb87a" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Watch if */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl"
              style={{ background: "rgba(224,90,43,0.05)", border: "1px solid rgba(224,90,43,0.2)" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "#e05a2b" }}>Watch Video 1 if...</p>
              <p className="text-xs" style={{ color: "#9b9a96" }}>{result.comparison.watchVideo1If}</p>
            </div>
            <div className="p-4 rounded-xl"
              style={{ background: "rgba(74,158,255,0.05)", border: "1px solid rgba(74,158,255,0.2)" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "#4a9eff" }}>Watch Video 2 if...</p>
              <p className="text-xs" style={{ color: "#9b9a96" }}>{result.comparison.watchVideo2If}</p>
            </div>
          </div>

          {/* Compare again */}
          <button onClick={() => { setResult(null); setUrl1(""); setUrl2(""); }}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
            ⚖️ Compare different videos
          </button>
        </div>
      )}
    </div>
  );
}