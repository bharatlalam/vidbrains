import React, { useState } from "react";
import { generateLesson, evaluateAnswer } from "../../utils/api";

export default function TutorPanel({ data }) {
  const [phase, setPhase] = useState("intro");
  const [lesson, setLesson] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const language = data.language || "en";

  async function startLesson() {
    setPhase("loading");
    try {
      const result = await generateLesson({
        title: data.title,
        summary: data.summary,
        keyPoints: data.keyPoints,
        context: data.context,
        language,
      });
      setLesson(result);
      setStageIndex(0);
      setPhase("lesson");
    } catch {
      setPhase("intro");
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setEvaluating(true);
    const stage = lesson.stages[stageIndex];
    try {
      const result = await evaluateAnswer({
        question: stage.question,
        correctAnswer: stage.correctAnswer,
        studentAnswer: answer,
        concept: stage.concept,
        language,
      });
      setEvaluation(result);
      setScores((s) => [...s, result.score]);
    } catch {
      setEvaluation({ isCorrect: false, feedback: "Could not evaluate. Try again.", encouragement: "Keep going!" });
    } finally {
      setEvaluating(false);
    }
  }

  function nextStage() {
    if (stageIndex + 1 >= lesson.stages.length) {
      setPhase("complete");
    } else {
      setStageIndex((i) => i + 1);
      setAnswer("");
      setEvaluation(null);
      setShowHint(false);
      setShowAnswer(false);
    }
  }

  function restart() {
    setPhase("intro");
    setLesson(null);
    setStageIndex(0);
    setAnswer("");
    setEvaluation(null);
    setScores([]);
  }

  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  if (phase === "intro") return (
    <div className="text-center py-10">
      <div style={{ fontSize: 56, marginBottom: 12 }}>🧑‍🏫</div>
      <h2 className="text-xl font-black mb-2" style={{ letterSpacing: "-0.5px" }}>AI Tutor Mode</h2>
      <p className="text-sm mb-2 max-w-sm mx-auto leading-relaxed" style={{ color: "#9b9a96" }}>
        Your personal AI teacher will break this video into lessons, teach you each concept step by step, and check your understanding.
      </p>
      {language !== "en" && (
        <p className="text-xs mb-4 px-3 py-1.5 rounded-full inline-block"
          style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.25)", color: "#e05a2b" }}>
          🌐 Lesson will be in {language.toUpperCase()}
        </p>
      )}
      <p className="text-xs mb-8 font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
        5 lessons · interactive questions · instant feedback
      </p>
      <button onClick={startLesson}
        className="px-8 py-3 rounded-xl text-sm font-bold text-white"
        style={{ background: "#e05a2b", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(224,90,43,0.3)" }}>
        Start Learning →
      </button>
    </div>
  );

  if (phase === "loading") return (
    <div className="text-center py-10">
      <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
      <p className="text-sm font-semibold mb-1">Preparing your lesson...</p>
      <p className="text-xs" style={{ color: "#9b9a96" }}>AI tutor is studying the video</p>
    </div>
  );

  if (phase === "complete") return (
    <div className="text-center py-8 animate-fade-in">
      <div style={{ fontSize: 56, marginBottom: 12 }}>{avgScore >= 80 ? "🏆" : avgScore >= 50 ? "👍" : "📚"}</div>
      <h2 className="text-2xl font-black mb-2" style={{ letterSpacing: "-0.5px", color: avgScore >= 80 ? "#3cb87a" : "#e05a2b" }}>
        Lesson Complete!
      </h2>
      <p className="text-sm mb-1" style={{ color: "#9b9a96" }}>Average score: <strong style={{ color: "#f0efe8" }}>{avgScore}%</strong></p>
      <p className="text-xs mb-8" style={{ color: "#5a5958" }}>
        {avgScore >= 80 ? "Excellent! You mastered this video." : avgScore >= 50 ? "Good job! Review the concepts again." : "Keep practicing!"}
      </p>
      <div className="max-w-sm mx-auto mb-6 flex flex-col gap-2">
        {lesson.stages.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2 rounded-xl text-sm"
            style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ color: "#9b9a96" }}>{s.concept}</span>
            <span style={{ color: scores[i] >= 70 ? "#3cb87a" : "#e05a2b", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
              {scores[i] ?? 0}%
            </span>
          </div>
        ))}
      </div>
      <button onClick={restart}
        className="px-6 py-2.5 rounded-xl text-sm font-bold"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
        Restart Lesson
      </button>
    </div>
  );

  const stage = lesson?.stages[stageIndex];
  if (!stage) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
          Lesson {stageIndex + 1} of {lesson.stages.length}
        </p>
        <div className="flex gap-1">
          {lesson.stages.map((_, i) => (
            <div key={i} style={{ width: 24, height: 4, borderRadius: 99, background: i < stageIndex ? "#3cb87a" : i === stageIndex ? "#e05a2b" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
        style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.25)" }}>
        <span style={{ fontSize: 12 }}>📖</span>
        <span className="text-xs font-bold" style={{ color: "#e05a2b" }}>{stage.concept}</span>
      </div>

      <div className="p-5 rounded-2xl mb-3"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>🧑‍🏫 Your Tutor Says</p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#f0efe8", lineHeight: 1.8 }}>{stage.teaching}</p>
        <div className="px-4 py-3 rounded-xl" style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#9b6dff" }}>💡 Example</p>
          <p className="text-xs leading-relaxed" style={{ color: "#9b9a96" }}>{stage.example}</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl mb-3"
        style={{ background: "#131316", border: `1px solid ${evaluation ? (evaluation.isCorrect ? "rgba(60,184,122,0.4)" : "rgba(224,90,43,0.4)") : "rgba(255,255,255,0.07)"}` }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>❓ Check Your Understanding</p>
        <p className="text-sm font-semibold mb-4" style={{ lineHeight: 1.6 }}>{stage.question}</p>

        {!evaluation ? (
          <>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-3"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "Syne, sans-serif" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            <div className="flex gap-2">
              <button onClick={submitAnswer} disabled={evaluating || !answer.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#e05a2b", border: "none", cursor: evaluating || !answer.trim() ? "not-allowed" : "pointer", opacity: evaluating || !answer.trim() ? 0.5 : 1 }}>
                {evaluating ? "Evaluating..." : "Submit Answer →"}
              </button>
              <button onClick={() => setShowHint((v) => !v)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
                💡 Hint
              </button>
            </div>
            {showHint && (
              <div className="mt-3 px-4 py-3 rounded-xl animate-fade-in"
                style={{ background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.2)" }}>
                <p className="text-xs" style={{ color: "#9b6dff" }}>💡 {stage.hint}</p>
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in">
            <div className="px-4 py-3 rounded-xl mb-3"
              style={{ background: evaluation.isCorrect ? "rgba(60,184,122,0.08)" : "rgba(224,90,43,0.08)", border: `1px solid ${evaluation.isCorrect ? "rgba(60,184,122,0.3)" : "rgba(224,90,43,0.3)"}` }}>
              <p className="text-sm font-bold mb-1" style={{ color: evaluation.isCorrect ? "#3cb87a" : "#e05a2b" }}>
                {evaluation.isCorrect ? "✓ Correct!" : "✗ Not quite"}
              </p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "#9b9a96" }}>{evaluation.feedback}</p>
              <p className="text-xs" style={{ color: "#5a5958", fontStyle: "italic" }}>{evaluation.encouragement}</p>
            </div>
            {!evaluation.isCorrect && (
              <button onClick={() => setShowAnswer((v) => !v)}
                className="text-xs px-3 py-1.5 rounded-lg mb-3"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
                {showAnswer ? "Hide answer" : "Show correct answer"}
              </button>
            )}
            {showAnswer && (
              <div className="px-4 py-3 rounded-xl mb-3 animate-fade-in"
                style={{ background: "rgba(60,184,122,0.05)", border: "1px solid rgba(60,184,122,0.2)" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#3cb87a" }}>Correct Answer</p>
                <p className="text-xs" style={{ color: "#9b9a96" }}>{stage.correctAnswer}</p>
              </div>
            )}
            <button onClick={nextStage}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
              {stageIndex + 1 >= lesson.stages.length ? "Complete Lesson →" : "Next Concept →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}