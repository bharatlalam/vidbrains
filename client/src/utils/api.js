import axios from "axios";

const api = axios.create({
  baseURL: "https://vidbrain-server.onrender.com/api",
  timeout: 90000,
});

// Session ID — unique per browser, persists across visits
function getSessionId() {
  let id = localStorage.getItem("vb_session");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("vb_session", id);
  }
  return id;
}

export const sessionId = getSessionId();

export async function analyzeVideo(url, language = "en") {
  const { data } = await api.post("/analyze", { url, language, sessionId: getSessionId() });
  return data.data;
}

export async function sendChat({ videoTitle, channel, context, history, question, language = "en" }) {
  const { data } = await api.post("/chat", { videoTitle, channel, context, history, question, language });
  return data.reply;
}

export async function generateQuiz({ title, context, keyPoints }) {
  const { data } = await api.post("/quiz", { title, context, keyPoints });
  return data.data;
}

export async function getSharedAnalysis(shareId) {
  const { data } = await api.get(`/analyze/share/${shareId}`);
  return data.data;
}

export async function getHistory() {
  const { data } = await api.get(`/history?sessionId=${getSessionId()}`);
  return data.data;
}

export async function saveQuizScore({ videoTitle, score, total }) {
  await api.post("/history/quiz-score", {
    sessionId: getSessionId(),
    videoTitle,
    score,
    total,
  });
}