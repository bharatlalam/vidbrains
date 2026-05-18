import React, { useState, useEffect, useRef } from "react";

const VOICES_LANG_MAP = {
  en: "en",
  te: "te",
  hi: "hi",
  ta: "ta",
  es: "es",
  fr: "fr",
  ja: "ja",
};

export default function PodcastPanel({ data }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);

  const sections = [
    { label: "📋 Summary", text: data.summary },
    { label: "💡 Key Points", text: data.keyPoints.join(". ") },
    { label: "❓ Q&A", text: data.qa.map((q) => `Question: ${q.question}. Answer: ${q.answer}`).join(". ") },
  ];

  useEffect(() => {
    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length) setSelectedVoice(v[0]);
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { stop(); };
  }, []);

  function speak(text) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.rate = speed;
    utter.pitch = pitch;
    utter.onend = () => {
      clearInterval(intervalRef.current);
      setPlaying(false);
      setPaused(false);
      setProgress(100);
    };
    utter.onstart = () => {
      setProgress(0);
      let p = 0;
      intervalRef.current = setInterval(() => {
        p += 1;
        if (p >= 100) clearInterval(intervalRef.current);
        setProgress(p);
      }, (text.length * 60) / speed);
    };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
    setPaused(false);
  }

  function stop() {
    window.speechSynthesis.cancel();
    clearInterval(intervalRef.current);
    setPlaying(false);
    setPaused(false);
    setProgress(0);
  }

  function togglePause() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function playSection(i) {
    setCurrentSection(i);
    speak(sections[i].text);
  }

  function playAll() {
    const fullText = `Title: ${data.title}. ${sections.map((s) => s.text).join(". ")}`;
    setCurrentSection(-1);
    speak(fullText);
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎙️</div>
        <h2 className="text-lg font-black mb-1" style={{ letterSpacing: "-0.5px" }}>Podcast Mode</h2>
        <p className="text-xs" style={{ color: "#9b9a96" }}>Listen to the full analysis read aloud</p>
      </div>

      {/* Now playing */}
      <div className="p-5 rounded-2xl mb-4 text-center"
        style={{ background: "#131316", border: `1px solid ${playing ? "#e05a2b" : "rgba(255,255,255,0.07)"}` }}>
        <p className="text-xs font-mono mb-2" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
          {playing ? (paused ? "⏸ PAUSED" : "▶ NOW PLAYING") : "⏹ STOPPED"}
        </p>
        <p className="text-sm font-semibold mb-4" style={{ color: playing ? "#f0efe8" : "#5a5958" }}>
          {currentSection === -1 ? "Full Analysis" : currentSection >= 0 ? sections[currentSection]?.label : "Select a section"}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "#e05a2b" }} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={stop} disabled={!playing}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: playing ? "#9b9a96" : "#5a5958", cursor: playing ? "pointer" : "not-allowed" }}>
            ⏹
          </button>
          <button onClick={playing ? togglePause : playAll}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all"
            style={{ background: "#e05a2b", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(224,90,43,0.3)" }}>
            {playing && !paused ? "⏸" : "▶"}
          </button>
          <button onClick={() => { if (currentSection < sections.length - 1) playSection(currentSection + 1); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
            ⏭
          </button>
        </div>
      </div>

      {/* Sections */}
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>Sections</p>
      <div className="flex flex-col gap-2 mb-5">
        {sections.map((s, i) => (
          <button key={i} onClick={() => playSection(i)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              background: currentSection === i && playing ? "rgba(224,90,43,0.08)" : "#131316",
              border: `1px solid ${currentSection === i && playing ? "#e05a2b" : "rgba(255,255,255,0.07)"}`,
              color: "#f0efe8", cursor: "pointer", width: "100%",
            }}>
            <span style={{ fontSize: 18 }}>{currentSection === i && playing && !paused ? "🔊" : "▶"}</span>
            <span className="text-sm font-semibold">{s.label}</span>
            <span className="ml-auto text-xs" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
              ~{Math.ceil(s.text.split(" ").length / (speed * 150))} min
            </span>
          </button>
        ))}
      </div>

      {/* Settings */}
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>Settings</p>
      <div className="p-4 rounded-xl flex flex-col gap-4"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Speed */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold">Speed</span>
            <span className="text-xs font-mono" style={{ color: "#e05a2b", fontFamily: "'DM Mono', monospace" }}>{speed}x</span>
          </div>
          <input type="range" min="0.5" max="2" step="0.25" value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#e05a2b" }} />
          <div className="flex justify-between text-xs" style={{ color: "#5a5958" }}>
            <span>0.5x</span><span>1x</span><span>2x</span>
          </div>
        </div>

        {/* Voice */}
        {voices.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2">Voice</p>
            <select
              value={selectedVoice?.name || ""}
              onChange={(e) => setSelectedVoice(voices.find((v) => v.name === e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}