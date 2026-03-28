import { useState, useCallback } from "react";
import { analyzeVideo as apiAnalyze, sendChat as apiChat } from "../utils/api";

const STEPS = [
  "Fetching video metadata...",
  "Processing with AI...",
  "Generating summary...",
  "Building chapters & Q&A...",
  "Creating flashcards & mind map...",
];

export function useAnalysis() {
  const [status, setStatus] = useState("idle");
  const [loadingStep, setLoadingStep] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState("");

  const analyze = useCallback(async (url, language = "en") => {
    setStatus("loading");
    setError("");
    setLoadingProgress(8);
    let si = 0;
    setLoadingStep(STEPS[0]);
    const interval = setInterval(() => {
      if (si < STEPS.length - 1) {
        si++;
        setLoadingStep(STEPS[si]);
        setLoadingProgress(Math.round(((si + 1) / STEPS.length) * 90));
      }
    }, 1200);

    try {
      const data = await apiAnalyze(url, language);
      clearInterval(interval);
      setLoadingProgress(100);
      await new Promise((r) => setTimeout(r, 300));
      setVideoData(data);
      setStatus("done");
    } catch (e) {
      clearInterval(interval);
      setError(e?.response?.data?.error || e.message || "Analysis failed.");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setVideoData(null);
    setError("");
    setLoadingProgress(0);
  }, []);

  return { status, loadingStep, loadingProgress, videoData, error, analyze, reset };
}

export function useChat(videoData) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I've analyzed the video. Ask me anything!" },
  ]);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  const send = useCallback(async (question) => {
    if (!question.trim() || sending || !videoData) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setSending(true);
    try {
      const reply = await apiChat({
        videoTitle: videoData.title,
        channel: videoData.channel,
        context: videoData.context,
        history,
        question,
        language: videoData.language || "en",
      });
      setHistory((h) => [...h, { role: "user", content: question }, { role: "assistant", content: reply }]);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  }, [videoData, history, sending]);

  return { messages, sending, send };
}