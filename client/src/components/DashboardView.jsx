import React, { useEffect, useState } from "react";
import { getDashboard } from "../utils/api";

const LANG_NAMES = { en: "English", te: "Telugu", hi: "Hindi", ta: "Tamil", es: "Spanish", fr: "French", ja: "Japanese" };
const LANG_FLAGS = { en: "🇺🇸", te: "🇮🇳", hi: "🇮🇳", ta: "🇮🇳", es: "🇪🇸", fr: "🇫🇷", ja: "🇯🇵" };

export default function DashboardView({ onBack, onReanalyze }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-16">
      <div className="w-8 h-8 rounded-full mx-auto animate-spin mb-4"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
      <p className="text-sm" style={{ color: "#5a5958" }}>Loading your dashboard...</p>
    </div>
  );

  if (!data || data.totalVideos === 0) return (
    <div className="text-center py-16">
      <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
      <h2 className="text-lg font-black mb-2">Performance Dashboard</h2>
      <p className="text-sm" style={{ color: "#5a5958" }}>Analyze some videos and take quizzes to see your stats here!</p>
    </div>
  );

  return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>📊 Performance Dashboard</h2>
          <p className="text-xs" style={{ color: "#9b9a96" }}>Your learning stats and progress</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { value: data.totalVideos, label: "Videos Analyzed", icon: "📹", color: "#e05a2b" },
          { value: data.totalQuizzes, label: "Quizzes Taken", icon: "🧠", color: "#4a9eff" },
          { value: `${data.avgScore}%`, label: "Avg Quiz Score", icon: "⭐", color: "#3cb87a" },
          { value: `${data.streak}d`, label: "Study Streak", icon: "🔥", color: "#f0a030" },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl text-center"
            style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <p className="text-2xl font-black mb-1" style={{ color: stat.color, letterSpacing: "-1px" }}>{stat.value}</p>
            <p className="text-xs" style={{ color: "#5a5958" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quiz performance */}
      {data.quizHistory.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
            Quiz Performance
          </p>
          <div className="p-4 rounded-2xl" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-end gap-2" style={{ height: 80 }}>
              {data.quizHistory.slice(0, 8).reverse().map((q, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full rounded-t-md transition-all"
                    style={{ height: `${q.score}%`, background: q.score >= 80 ? "#3cb87a" : q.score >= 50 ? "#f0a030" : "#e05a2b", minHeight: 4 }} />
                  <p className="text-xs font-mono" style={{ color: "#5a5958", fontSize: 9, fontFamily: "'DM Mono', monospace" }}>
                    {q.score}%
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: "#5a5958" }}>Last {data.quizHistory.length} quizzes</p>
          </div>
        </div>
      )}

      {/* Language breakdown */}
      {Object.keys(data.languageMap).length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
            Languages Used
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.languageMap).map(([lang, count]) => (
              <div key={lang} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span>{LANG_FLAGS[lang] || "🌐"}</span>
                <span className="text-xs font-semibold">{LANG_NAMES[lang] || lang}</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{ background: "#222228", color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent videos */}
      {data.topics.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
            Recently Analyzed
          </p>
          <div className="flex flex-col gap-2">
            {data.topics.map((topic, i) => (
              <div key={i}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
                onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
                onClick={() => onReanalyze && onReanalyze(topic)}>
                <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0 relative"
                  style={{ background: "#1a1a1f" }}>
                  {topic.thumbnail && (
                    <img src={topic.thumbnail} alt="" className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = "none"} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{topic.title}</p>
                  <p className="text-xs" style={{ color: "#9b9a96" }}>{topic.channel}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                  {new Date(topic.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}