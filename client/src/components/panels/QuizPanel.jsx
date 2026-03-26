import React, { useState } from "react";
import { generateQuiz } from "../../utils/api";

const TIMER_SECONDS = 15;

export default function QuizPanel({ data, showToast }) {
  const [phase, setPhase] = useState("intro"); // intro | loading | active | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timerRef, setTimerRef] = useState(null);

  async function startQuiz() {
    setPhase("loading");
    try {
      const result = await generateQuiz({
        title: data.title,
        context: data.context,
        keyPoints: data.keyPoints,
      });
      setQuestions(result.questions);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setShowExplanation(false);
      setPhase("active");
      startTimer();
    } catch {
      showToast("Failed to generate quiz. Try again.");
      setPhase("intro");
    }
  }

  function startTimer() {
    setTimer(TIMER_SECONDS);
    const ref = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(ref);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setTimerRef(ref);
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    clearInterval(timerRef);
    setSelected(idx);
    setShowExplanation(true);
    setAnswers((a) => [...a, idx]);
  }

  function next() {
    if (current + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExplanation(false);
      startTimer();
    }
  }

  function restart() {
    setPhase("intro");
    setQuestions([]);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  }

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  // INTRO
  if (phase === "intro") return (
    <div className="text-center py-10">
      <div className="text-6xl mb-4">🧠</div>
      <h2 className="text-xl font-black mb-2" style={{ letterSpacing: "-0.5px" }}>Test Your Knowledge</h2>
      <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "#9b9a96" }}>
        8 questions · {TIMER_SECONDS}s per question · Generated from the video
      </p>
      <button onClick={startQuiz} className="px-8 py-3 rounded-xl text-sm font-bold text-white"
        style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
        Start Quiz →
      </button>
    </div>
  );

  // LOADING
  if (phase === "loading") return (
    <div className="text-center py-10">
      <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
      <p className="text-sm" style={{ color: "#9b9a96" }}>Generating quiz from video...</p>
    </div>
  );

  // RESULT
  if (phase === "result") return (
    <div className="text-center py-8 animate-fade-in">
      <div className="text-5xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
      <h2 className="text-3xl font-black mb-1" style={{ letterSpacing: "-1px", color: pct >= 80 ? "#3cb87a" : pct >= 50 ? "#f0a030" : "#e05a2b" }}>
        {pct}%
      </h2>
      <p className="text-sm mb-1 font-semibold">{score} out of {questions.length} correct</p>
      <p className="text-xs mb-8" style={{ color: "#9b9a96" }}>
        {pct >= 80 ? "Excellent! You really understood this video." : pct >= 50 ? "Good effort! Review the missed questions." : "Keep watching and try again!"}
      </p>

      {/* Score breakdown */}
      <div className="max-w-sm mx-auto mb-8 text-left flex flex-col gap-2">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#131316", border: `1px solid ${answers[i] === q.correct ? "rgba(60,184,122,0.3)" : "rgba(224,90,43,0.3)"}` }}>
            <span style={{ color: answers[i] === q.correct ? "#3cb87a" : "#e05a2b", flexShrink: 0 }}>
              {answers[i] === q.correct ? "✓" : "✗"}
            </span>
            <span style={{ color: "#9b9a96" }}>{q.question}</span>
          </div>
        ))}
      </div>

      <button onClick={restart} className="px-6 py-2.5 rounded-xl text-sm font-bold"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
        Try Again
      </button>
    </div>
  );

  // ACTIVE
  const q = questions[current];
  return (
    <div className="animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
          Question {current + 1} of {questions.length}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${((current) / questions.length) * 100}%`, background: "#e05a2b" }} />
          </div>
          <span className="text-xs font-mono w-6 text-center"
            style={{ color: timer <= 5 ? "#e05a2b" : "#9b9a96", fontFamily: "'DM Mono', monospace" }}>
            {timer}s
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="p-5 rounded-2xl mb-4"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-base font-semibold leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 mb-4">
        {q.options.map((opt, i) => {
          let borderColor = "rgba(255,255,255,0.07)";
          let bg = "#131316";
          let color = "#f0efe8";
          if (selected !== null) {
            if (i === q.correct) { borderColor = "rgba(60,184,122,0.6)"; bg = "rgba(60,184,122,0.08)"; color = "#3cb87a"; }
            else if (i === selected && selected !== q.correct) { borderColor = "rgba(224,90,43,0.6)"; bg = "rgba(224,90,43,0.08)"; color = "#e05a2b"; }
            else { color = "#5a5958"; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
              style={{ background: bg, border: `1px solid ${borderColor}`, color, cursor: selected !== null ? "default" : "pointer", width: "100%" }}
              onMouseOver={(e) => { if (selected === null) e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseOut={(e) => { if (selected === null) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", color: "#9b9a96" }}>
                {["A","B","C","D"][i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="px-4 py-3 rounded-xl mb-4 text-sm animate-fade-in"
          style={{ background: selected === q.correct ? "rgba(60,184,122,0.08)" : "rgba(224,90,43,0.08)", border: `1px solid ${selected === q.correct ? "rgba(60,184,122,0.3)" : "rgba(224,90,43,0.3)"}`, color: "#9b9a96", lineHeight: "1.6" }}>
          <span style={{ color: selected === q.correct ? "#3cb87a" : "#e05a2b", fontWeight: 600 }}>
            {selected === q.correct ? "Correct! " : "Incorrect. "}
          </span>
          {q.explanation}
        </div>
      )}

      {selected !== null && (
        <button onClick={next} className="w-full py-3 rounded-xl text-sm font-bold text-white animate-fade-in"
          style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
          {current + 1 >= questions.length ? "See Results →" : "Next Question →"}
        </button>
      )}
    </div>
  );
}