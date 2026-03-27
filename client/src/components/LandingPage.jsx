import React, { useEffect, useRef, useState } from "react";

const FEATURES = [
  { icon: "📋", title: "Smart Summary", desc: "4-sentence AI summary that captures the entire video in seconds." },
  { icon: "🕐", title: "Chapter Breakdown", desc: "Auto-generated chapters with precise timestamps and descriptions." },
  { icon: "❓", title: "Q&A Generation", desc: "5 deep questions with detailed answers extracted from the video." },
  { icon: "🃏", title: "Flashcards", desc: "8 study cards with flip animation and spaced repetition tracking." },
  { icon: "🗺", title: "Mind Map", desc: "Interactive D3.js radial mind map — zoom, pan, download as SVG." },
  { icon: "🧠", title: "Quiz Mode", desc: "10 MCQ questions with timer, score, and detailed explanations." },
  { icon: "💬", title: "Chat with Video", desc: "Ask anything about the video — AI answers with full context." },
  { icon: "🌐", title: "7 Languages", desc: "Full analysis in English, Telugu, Hindi, Tamil, Spanish, French, Japanese." },
];

const STATS = [
  { value: "7", label: "Languages" },
  { value: "8", label: "AI Features" },
  { value: "10s", label: "Avg Analysis" },
  { value: "∞", label: "Free Forever" },
];

export default function LandingPage({ onGetStarted }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    function handleMouse(e) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div style={{ fontFamily: "Syne, sans-serif", background: "#0d0d0f", color: "#f0efe8", overflowX: "hidden" }}>

      {/* Cursor glow effect */}
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(224,90,43,0.04), transparent 70%)`,
      }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 58,
        background: "rgba(13,13,15,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#e05a2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧠</div>
          VidBrain
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#features" style={{ fontSize: 13, color: "#9b9a96", textDecoration: "none" }}>Features</a>
          <a href="#how" style={{ fontSize: 13, color: "#9b9a96", textDecoration: "none" }}>How it works</a>
          <button onClick={onGetStarted}
            style={{ fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
            Try Free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "6rem 1.5rem 4rem",
        position: "relative",
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }} />

        {/* Glow orb */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224,90,43,0.15) 0%, transparent 70%)",
          filter: "blur(40px)", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: "2.5px",
            textTransform: "uppercase", color: "#e05a2b",
            marginBottom: 24,
            padding: "6px 16px", borderRadius: 99,
            border: "1px solid rgba(224,90,43,0.25)",
            background: "rgba(224,90,43,0.08)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e05a2b", display: "inline-block" }} />
            AI-Powered Video Intelligence
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05,
            marginBottom: 24, maxWidth: 800, margin: "0 auto 24px",
          }}>
            Stop watching.<br />
            Start <span style={{
              color: "#e05a2b",
              textShadow: "0 0 40px rgba(224,90,43,0.4)",
            }}>understanding.</span>
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 18, color: "#9b9a96", maxWidth: 500,
            margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            Paste any YouTube URL. Get instant summaries, flashcards, quizzes, mind maps and an AI you can chat with — in 7 languages.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onGetStarted}
              style={{
                fontSize: 15, fontWeight: 700, padding: "14px 32px",
                borderRadius: 12, background: "#e05a2b", color: "white",
                border: "none", cursor: "pointer",
                boxShadow: "0 0 30px rgba(224,90,43,0.3)",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(224,90,43,0.5)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(224,90,43,0.3)"; }}>
              Analyze a Video Free →
            </button>
            <a href="#how"
              style={{
                fontSize: 15, fontWeight: 600, padding: "14px 32px",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                color: "#9b9a96", textDecoration: "none",
                transition: "all 0.2s", display: "inline-block",
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = "#f0efe8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseOut={(e) => { e.currentTarget.style.color = "#9b9a96"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <p style={{ fontSize: 12, color: "#5a5958", marginTop: 24, fontFamily: "'DM Mono', monospace" }}>
            Free forever · No signup required · Works on any YouTube video
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 1.5rem 6rem" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          background: "rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: "2rem 1rem", textAlign: "center",
              background: "#0d0d0f",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <p style={{ fontSize: 36, fontWeight: 800, color: "#e05a2b", letterSpacing: "-1px", marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e05a2b", marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 60 }}>
            Three steps to mastery
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { step: "01", title: "Paste URL", desc: "Copy any YouTube video link and paste it into VidBrain. Select your language." },
              { step: "02", title: "AI Analyzes", desc: "Our AI reads the video metadata and generates a complete structured breakdown in seconds." },
              { step: "03", title: "Learn Faster", desc: "Study with summaries, flashcards, quizzes, mind maps and chat with the video." },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "2rem", borderRadius: 16, textAlign: "left",
                background: "#131316", border: "1px solid rgba(255,255,255,0.07)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  fontSize: 80, fontWeight: 800, color: "rgba(224,90,43,0.06)",
                  lineHeight: 1, fontFamily: "Syne, sans-serif",
                }}>
                  {item.step}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#e05a2b",
                  letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12,
                }}>Step {item.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.5px" }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#9b9a96", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e05a2b", marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px" }}>
              Everything you need to learn smarter
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i}
                style={{
                  padding: "1.5rem", borderRadius: 16,
                  background: "#131316", border: "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.2s", cursor: "default",
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "#e05a2b"; e.currentTarget.style.background = "#1a1a1f"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#131316"; }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.3px" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "#9b9a96", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section style={{ padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e05a2b", marginBottom: 12 }}>Multi-language</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
            Learn in your language
          </h2>
          <p style={{ fontSize: 15, color: "#9b9a96", marginBottom: 40, lineHeight: 1.7 }}>
            Get full analysis — summary, Q&A, flashcards, everything — in your native language.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {[
              { flag: "🇺🇸", lang: "English" },
              { flag: "🇮🇳", lang: "Telugu" },
              { flag: "🇮🇳", lang: "Hindi" },
              { flag: "🇮🇳", lang: "Tamil" },
              { flag: "🇪🇸", lang: "Spanish" },
              { flag: "🇫🇷", lang: "French" },
              { flag: "🇯🇵", lang: "Japanese" },
            ].map((l) => (
              <div key={l.lang} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 99,
                background: "#131316", border: "1px solid rgba(255,255,255,0.07)",
                fontSize: 14, fontWeight: 600,
              }}>
                <span>{l.flag}</span>
                <span>{l.lang}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "4rem 1.5rem 8rem" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", textAlign: "center",
          padding: "4rem 2rem", borderRadius: 24,
          background: "#131316", border: "1px solid rgba(255,255,255,0.07)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(224,90,43,0.1) 0%, transparent 70%)",
            filter: "blur(30px)",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              Ready to learn smarter?
            </h2>
            <p style={{ fontSize: 15, color: "#9b9a96", marginBottom: 32, lineHeight: 1.7 }}>
              No signup. No credit card. Just paste a YouTube URL and go.
            </p>
            <button onClick={onGetStarted}
              style={{
                fontSize: 15, fontWeight: 700, padding: "14px 36px",
                borderRadius: 12, background: "#e05a2b", color: "white",
                border: "none", cursor: "pointer",
                boxShadow: "0 0 30px rgba(224,90,43,0.3)",
              }}>
              Start Analyzing Free →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "2rem", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, fontWeight: 800, fontSize: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#e05a2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🧠</div>
          VidBrain
        </div>
        <p style={{ fontSize: 12, color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
          Built with React · Node.js · Groq AI · YouTube API
        </p>
      </footer>

    </div>
  );
}
