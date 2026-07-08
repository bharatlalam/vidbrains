import React, { useEffect, useState } from "react";

const FEATURES = [
  { icon: "📋", title: "Smart Summary", desc: "6-8 sentence AI summary covering every concept, example and key idea from the video." },
  { icon: "🕐", title: "Chapter Breakdown", desc: "Auto-generated chapters with precise timestamps and detailed descriptions." },
  { icon: "❓", title: "Deep Q&A", desc: "7 detailed questions with 3-4 sentence answers extracted from the video content." },
  { icon: "🃏", title: "Flashcards", desc: "8 study cards with flip animation, shuffle, and spaced repetition tracking." },
  { icon: "🗺", title: "Mind Map", desc: "Interactive D3.js radial mind map — zoom, pan, download as SVG." },
  { icon: "🕸️", title: "Concept Graph", desc: "Force-directed graph showing how all concepts in the video connect to each other." },
  { icon: "🧠", title: "Quiz Mode", desc: "8 MCQ questions with 15s timer, score tracking, and detailed explanations." },
  { icon: "🧑‍🏫", title: "AI Tutor", desc: "Personal AI teacher breaks the video into 5 interactive lessons and checks your understanding." },
  { icon: "📝", title: "Smart Notes", desc: "Full markdown notes editor with auto-save, toolbar, and word count." },
  { icon: "🌟", title: "Community", desc: "Share key insights from videos, see what others highlighted, upvote the best ones." },
  { icon: "🎙️", title: "Podcast Mode", desc: "Listen to the full analysis read aloud with speed control and voice selector." },
  { icon: "📖", title: "Reading Mode", desc: "Distraction-free fullscreen reading view with adjustable font size." },
  { icon: "💬", title: "AI Chat", desc: "Full conversational AI that remembers context and answers anything about the video." },
  { icon: "⚖️", title: "Video Comparison", desc: "Analyze 2 videos side by side — deep breakdown of differences, similarities, and what each covers." },
  { icon: "🌐", title: "7 Languages", desc: "Full analysis in English, Telugu, Hindi, Tamil, Spanish, French, and Japanese." },
  { icon: "📊", title: "Dashboard", desc: "Track quiz scores, study streaks, videos watched, and language usage over time." },
];

const STATS = [
  { value: "13", label: "AI Features" },
  { value: "7", label: "Languages" },
  { value: "∞", label: "Free Forever" },
  { value: "10s", label: "Analysis Time" },
];

const STEPS = [
  { step: "01", title: "Sign In", desc: "Sign in with your email — get a one-time OTP code. No password needed, works on any device." },
  { step: "02", title: "Paste URL", desc: "Copy any YouTube video link and paste it into VidBrain. Select your output language." },
  { step: "03", title: "Learn Smarter", desc: "Use 13 AI features — summaries, flashcards, quizzes, tutor, notes, community and more." },
];

export default function LandingPage({ onGetStarted, onSignIn, user }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouse(e) { setMousePos({ x: e.clientX, y: e.clientY }); }
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div style={{ fontFamily: "Syne, sans-serif", background: "#0d0d0f", color: "#f0efe8", overflowX: "hidden" }}>

      {/* Cursor glow */}
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
        background: "rgba(13,13,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#e05a2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧠</div>
          VidBrain
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#features" style={{ fontSize: 13, color: "#9b9a96", textDecoration: "none" }}>Features</a>
          <a href="#how" style={{ fontSize: 13, color: "#9b9a96", textDecoration: "none" }}>How it works</a>
          <a href="#languages" style={{ fontSize: 13, color: "#9b9a96", textDecoration: "none" }}>Languages</a>
          {user ? (
            <button onClick={onGetStarted}
              style={{ fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
              Go to App →
            </button>
          ) : (
            <>
              <button onClick={onSignIn}
                style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "transparent", color: "#9b9a96", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                Sign In
              </button>
              <button onClick={onGetStarted}
                style={{ fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
                Get Started →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "6rem 1.5rem 4rem", position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }} />
        <div style={{
          position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224,90,43,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: "2px",
            textTransform: "uppercase", color: "#e05a2b",
            marginBottom: 24, padding: "6px 16px", borderRadius: 99,
            border: "1px solid rgba(224,90,43,0.25)", background: "rgba(224,90,43,0.08)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e05a2b", display: "inline-block" }} />
            13 AI Features · 7 Languages · 100% Free
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 24 }}>
            Stop watching.<br />
            Start <span style={{ color: "#e05a2b", textShadow: "0 0 40px rgba(224,90,43,0.35)" }}>understanding.</span>
          </h1>

          <p style={{ fontSize: 18, color: "#9b9a96", maxWidth: 560, margin: "0 auto 20px", lineHeight: 1.7 }}>
            Paste any YouTube URL. Get instant summaries, flashcards, quizzes, mind maps, concept graphs, AI tutor, smart notes and more — in 7 languages.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 36 }}>
            {["Summary", "Chapters", "Q&A", "Flashcards", "Mind Map", "Concept Graph", "Quiz", "AI Tutor", "Notes", "Community", "Podcast", "Read", "Chat"].map((f) => (
              <span key={f} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#131316", border: "1px solid rgba(255,255,255,0.07)", color: "#5a5958" }}>{f}</span>
            ))}
          </div>

          {/* CTA */}
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", items: "center", gap: 10, padding: "12px 20px", borderRadius: 12, background: "rgba(60,184,122,0.1)", border: "1px solid rgba(60,184,122,0.3)" }}>
                <span style={{ color: "#3cb87a", fontSize: 14 }}>✓ Signed in as <strong>{user.name}</strong></span>
              </div>
              <button onClick={onGetStarted}
                style={{ fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 12, background: "#e05a2b", color: "white", border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(224,90,43,0.3)" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                Go to App →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={onGetStarted}
                  style={{ fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 12, background: "#e05a2b", color: "white", border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(224,90,43,0.3)" }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(224,90,43,0.5)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(224,90,43,0.3)"; }}>
                  Sign In to Get Started →
                </button>
                <a href="#features"
                  style={{ fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", color: "#9b9a96", textDecoration: "none", display: "inline-block" }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "#f0efe8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "#9b9a96"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  See all features ↓
                </a>
              </div>
              <p style={{ fontSize: 12, color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                Sign in with email OTP · No password · Works on any device
              </p>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 1.5rem 6rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "rgba(255,255,255,0.04)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "2rem 1rem", textAlign: "center", background: "#0d0d0f", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p style={{ fontSize: 40, fontWeight: 800, color: "#e05a2b", letterSpacing: "-1px", marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e05a2b", marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 60 }}>Three steps to mastery</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {STEPS.map((item, i) => (
              <div key={i} style={{ padding: "2rem", borderRadius: 16, textAlign: "left", background: "#131316", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, fontSize: 80, fontWeight: 800, color: "rgba(224,90,43,0.06)", lineHeight: 1 }}>{item.step}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e05a2b", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Step {item.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.5px" }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#9b9a96", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL FEATURES */}
      <section id="features" style={{ padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e05a2b", marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px" }}>13 ways to learn smarter</h2>
            <p style={{ fontSize: 15, color: "#9b9a96", marginTop: 12 }}>Every feature powered by AI. All free.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i}
                style={{ padding: "1.5rem", borderRadius: 16, background: "#131316", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.2s", cursor: "default" }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "#e05a2b"; e.currentTarget.style.background = "#1a1a1f"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#131316"; }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.3px" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "#9b9a96", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE FEATURE */}
      <section style={{ padding: "2rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ padding: "2.5rem", borderRadius: 24, background: "#131316", border: "1px solid rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4a9eff", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Unique Feature</div>
              <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>⚖️ Video Comparison</h3>
              <p style={{ fontSize: 14, color: "#9b9a96", lineHeight: 1.7, marginBottom: 16 }}>
                Paste 2 YouTube URLs and get a deep side-by-side breakdown — what each video covers, what's unique to each, common topics, teaching style, and who each is best for.
              </p>
              <button onClick={onGetStarted}
                style={{ fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: "#4a9eff", color: "white", border: "none", cursor: "pointer" }}>
                Try Comparison →
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["Topic Focus", "Target Audience", "Content Depth", "Teaching Style", "Practical Tips", "Key Takeaway"].map((aspect, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: 11, color: "#5a5958" }}>{aspect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section id="languages" style={{ padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e05a2b", marginBottom: 12 }}>Multi-language</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>Learn in your language</h2>
          <p style={{ fontSize: 15, color: "#9b9a96", marginBottom: 40, lineHeight: 1.7 }}>
            Get the full analysis — all 13 features — in your native language. Especially built for Indian students.
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
              <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 99, background: "#131316", border: "1px solid rgba(255,255,255,0.07)", fontSize: 14, fontWeight: 600 }}>
                <span>{l.flag}</span><span>{l.lang}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section style={{ padding: "2rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#f0a030", marginBottom: 12 }}>Community</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>🌟 Learn together</h2>
          <p style={{ fontSize: 15, color: "#9b9a96", marginBottom: 40, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 40px" }}>
            Share your key insights from any video, see what others highlighted, and upvote the best learnings.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500, margin: "0 auto" }}>
            {[
              { count: "2.1K", text: "The key to cracking any interview is building real projects, not just studying theory." },
              { count: "1.4K", text: "Start DSA with arrays and strings before moving to trees and graphs." },
              { count: "987", text: "Resume should be 1 page max with quantified achievements in every bullet point." },
            ].map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 18px", borderRadius: 14, background: "#131316", border: "1px solid rgba(255,255,255,0.07)", textAlign: "left" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: i === 0 ? "#e05a2b" : i === 1 ? "#4a9eff" : "#3cb87a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: "#9b9a96", flex: 1, lineHeight: 1.5 }}>"{h.text}"</p>
                <span style={{ fontSize: 11, color: "#f0a030", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>⭐ {h.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "4rem 1.5rem 8rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "4rem 2rem", borderRadius: 24, background: "#131316", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(224,90,43,0.1) 0%, transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>Ready to learn smarter?</h2>
            <p style={{ fontSize: 15, color: "#9b9a96", marginBottom: 16, lineHeight: 1.7 }}>
              Join students using VidBrain to study faster, retain more, and learn in their own language.
            </p>
            <p style={{ fontSize: 13, color: "#5a5958", marginBottom: 32, fontFamily: "'DM Mono', monospace" }}>
              Email OTP login · 13 features · 7 languages · Always free
            </p>
            <button onClick={onGetStarted}
              style={{ fontSize: 15, fontWeight: 700, padding: "14px 40px", borderRadius: 12, background: "#e05a2b", color: "white", border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(224,90,43,0.3)" }}>
              {user ? "Go to App →" : "Sign In & Get Started →"}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, fontWeight: 800, fontSize: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#e05a2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🧠</div>
          VidBrain
        </div>
        <p style={{ fontSize: 12, color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
          Built with React · Node.js · Groq AI · YouTube API · PostgreSQL
        </p>
        <p style={{ fontSize: 11, color: "#3a3a3a", marginTop: 4 }}>
          © 2025 VidBrain · Made with ❤️ for students worldwide
        </p>
      </footer>

    </div>
  );
}