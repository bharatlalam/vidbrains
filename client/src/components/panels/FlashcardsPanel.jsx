import React, { useState } from "react";

export default function FlashcardsPanel({ data, showToast }) {
  const [cards, setCards] = useState(data.flashcards || []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(new Set());

  const card = cards[index];

  function goTo(i) { setIndex(i); setFlipped(false); }
  function nav(dir) { goTo((index + dir + cards.length) % cards.length); }

  function shuffle() {
    const s = [...cards];
    for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
    setCards(s); setIndex(0); setFlipped(false); setDone(new Set());
    showToast("Cards shuffled!");
  }

  function markGot() { setDone((d) => new Set([...d, index])); showToast("Marked as learned ✓"); nav(1); }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
          Card {index + 1} of {cards.length} · {done.size} learned
        </p>
        <div className="flex gap-2">
          {[["← Prev", () => nav(-1)], ["⇌ Shuffle", shuffle], ["Next →", () => nav(1)]].map(([label, fn]) => (
            <button key={label} onClick={fn} className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ perspective: "1000px", height: 220, marginBottom: 16 }} onClick={() => setFlipped((f) => !f)}>
        <div style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", position: "relative", cursor: "pointer" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8 text-center"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#e05a2b" }}>Term</p>
            <p className="text-2xl font-black" style={{ letterSpacing: "-0.5px", lineHeight: 1.3 }}>{card?.term}</p>
            <p className="text-xs absolute bottom-4" style={{ color: "#5a5958" }}>click to reveal</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8 text-center"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#1a1a1f", border: "1px solid #e05a2b" }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#3cb87a" }}>Definition</p>
            <p className="text-sm leading-relaxed" style={{ color: "#9b9a96", lineHeight: "1.7" }}>{card?.definition}</p>
            <p className="text-xs absolute bottom-4" style={{ color: "#5a5958" }}>click to flip back</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mb-4">
        {cards.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{ width: 8, height: 8, borderRadius: "50%", background: done.has(i) ? "#3cb87a" : i === index ? "#e05a2b" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", padding: 0, transition: "background 0.2s" }} />
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => nav(1)} className="text-xs font-semibold px-4 py-2 rounded-lg"
          style={{ border: "1px solid rgba(224,90,43,0.3)", background: "transparent", color: "#e05a2b", cursor: "pointer" }}>😅 Hard</button>
        <button onClick={markGot} className="text-xs font-semibold px-4 py-2 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>✓ Got it</button>
      </div>
    </div>
  );
}