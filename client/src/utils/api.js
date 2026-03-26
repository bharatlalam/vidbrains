import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 90000 });

export async function analyzeVideo(url, language = "en") {
  const { data } = await api.post("/analyze", { url, language });
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

export async function saveHistory(entry) {
  const { data } = await api.post("/history", entry);
  return data.data;
}

export async function getHistory() {
  const { data } = await api.get("/history");
  return data.data;
}