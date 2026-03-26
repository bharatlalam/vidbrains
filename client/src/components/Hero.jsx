import React, { useState } from "react";

const DEMOS = [
  { label: "Neural networks", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
  { label: "How DNA works",   url: "https://www.youtube.com/watch?v=PaErPyEnDvk" },
  { label: "Startup funding", url: "https://www.youtube.com/watch?v=rHmkSmKIBjI" },
  { label: "World history",   url: "https://www.youtube.com/watch?v=ZzsPDtUSKIs" },
];

const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "te", label: "Telugu",   flag: "🇮🇳" },
  { code: "hi", label: "Hindi",    flag: "🇮🇳" },
  { code: "ta", label: "Tamil",    flag: "🇮🇳" },
  { code: "es", label: "Spanish",  flag: "🇪🇸" },
  { code: "fr", label: "French",   flag: "🇫🇷" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

export default function Hero({ onAnalyze, error }) {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  function submit() {
    if (url.trim()) onAnalyze(url.trim(), language);
  }

  return (
    <section className="text-center pt-16 pb-10 px-4 animate-fade-in">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-px w-6 opacity-50" style={{ background: "#e05a2b" }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#e05a2b" }}>AI Video Intelligence</span>
        <div className="h-px w-6 opacity-50" style={{ background: "#e05a2b" }} />
      </div>

      <h1 className="font-black text-5xl mb-4 leading-tight" style={{ letterSpacing: "-1.5px" }}>
        Turn any YouTube video<br />into <span style={{ color: "#e05a2b" }}>structured knowledge</span>
      </h1>
      <p className="text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ color: "#9b9a96" }}>
        Instant summaries, chapters, Q&A, flashcards, mind maps, and an AI you can chat with.
      </p>

      <div className="max-w-xl mx-auto rounded-2xl p-5" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* URL + Analyze row */}
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded-lg px-4 py-3 text-sm outline-none"
            style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "'DM Mono', monospace" }}
            type="text" placeholder="https://youtube.com/watch?v=..."
            value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            onFocus={(e) => (e.target.style.borderColor = "#e05a2b")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
          />
          <button onClick={submit} className="px-5 py-3 rounded-lg text-sm font-bold text-white"
            style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
            Analyze →
          </button>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 mb-3 relative">
          <span className="text-xs" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>Output language:</span>
          <div className="relative">
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe8", cursor: "pointer" }}>
              <span>{selectedLang.flag}</span>
              <span>{selectedLang.label}</span>
              <span style={{ color: "#5a5958" }}>▾</span>
            </button>

            {showLangMenu && (
              <div className="absolute left-0 top-9 z-50 rounded-xl overflow-hidden"
                style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", minWidth: 160 }}>
                {LANGUAGES.map((lang) => (
                  <button key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left transition-all"
                    style={{
                      background: language === lang.code ? "rgba(224,90,43,0.1)" : "transparent",
                      color: language === lang.code ? "#e05a2b" : "#9b9a96",
                      border: "none", cursor: "pointer",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseOut={(e) => e.currentTarget.style.background = language === lang.code ? "rgba(224,90,43,0.1)" : "transparent"}>
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-3 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.3)", color: "#f07040" }}>
            {error}
          </div>
        )}

        {/* Demo chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>Try:</span>
          {DEMOS.map((d) => (
            <button key={d.label} onClick={() => setUrl(d.url)}
              className="text-xs px-3 py-1 rounded-full"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}
              onMouseOver={(e) => { e.target.style.color = "#e05a2b"; e.target.style.borderColor = "rgba(224,90,43,0.4)"; }}
              onMouseOut={(e) => { e.target.style.color = "#9b9a96"; e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {["Summary","Chapters","Q&A","Flashcards","Mind Map","Quiz","Chat"].map((f) => (
          <span key={f} className="text-xs px-3 py-1 rounded-full"
            style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#5a5958" }}>{f}</span>
        ))}
      </div>
    </section>
  );
}