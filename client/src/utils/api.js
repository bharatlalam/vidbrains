import axios from "axios";

const api = axios.create({
  baseURL: "https://vidbrain-server.onrender.com/api",
  timeout: 120000,
});

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

export async function compareVideos(url1, url2, language = "en") {
  const { data } = await api.post("/compare", { url1, url2, language });
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

export async function generateLesson({ title, summary, keyPoints, context, language }) {
  const { data } = await api.post("/tutor/lesson", { title, summary, keyPoints, context, language });
  return data.data;
}

export async function evaluateAnswer({ question, correctAnswer, studentAnswer, concept, language }) {
  const { data } = await api.post("/tutor/evaluate", { question, correctAnswer, studentAnswer, concept, language });
  return data.data;
}

export async function generateConceptGraph({ title, summary, keyPoints, context, language = "en" }) {
  const { data } = await api.post("/concept", { title, summary, keyPoints, context, language });
  return data.data;
}

export async function expandHighlight({ text, videoTitle, context, language }) {
  const { data } = await api.post("/highlights/expand", { text, videoTitle, context, language });
  return data.data;
}

export async function getDashboard() {
  const { data } = await api.get(`/dashboard?sessionId=${getSessionId()}`);
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
  await api.post("/history/quiz-score", { sessionId: getSessionId(), videoTitle, score, total });
}

export async function getNotes(shareId) {
  const { data } = await api.get(`/notes/${shareId}?sessionId=${getSessionId()}`);
  return data.data;
}

export async function saveNotes({ shareId, videoTitle, content }) {
  await api.post("/notes", { shareId, sessionId: getSessionId(), videoTitle, content });
}

export async function deleteNotes(shareId) {
  await api.delete(`/notes/${shareId}?sessionId=${getSessionId()}`);
}

export async function getCommunityHighlights(videoId) {
  const { data } = await api.get(`/community/${videoId}?sessionId=${getSessionId()}`);
  return data.data;
}

export async function addCommunityHighlight({ videoId, videoTitle, text }) {
  const { data } = await api.post("/community/highlight", { videoId, videoTitle, text, sessionId: getSessionId() });
  return data;
}

// Collections
export async function getCollections() {
  const { data } = await api.get(`/collections?sessionId=${getSessionId()}`);
  return data.data;
}

export async function createCollection({ name, emoji, description }) {
  const { data } = await api.post("/collections", { sessionId: getSessionId(), name, emoji, description });
  return data.data;
}

export async function deleteCollection(id) {
  await api.delete(`/collections/${id}?sessionId=${getSessionId()}`);
}

export async function getCollectionItems(id) {
  const { data } = await api.get(`/collections/${id}/items`);
  return data.data;
}

export async function addToCollection({ collectionId, shareId, videoTitle, channel, thumbnail, duration }) {
  const { data } = await api.post(`/collections/${collectionId}/items`, { shareId, videoTitle, channel, thumbnail, duration });
  return data;
}

export async function removeFromCollection(collectionId, itemId) {
  await api.delete(`/collections/${collectionId}/items/${itemId}`);
}

// Study Groups
export async function createGroup({ name, emoji, nickname }) {
  const { data } = await api.post("/groups", { sessionId: getSessionId(), name, emoji, nickname });
  return data.data;
}

export async function joinGroup({ code, nickname }) {
  const { data } = await api.post("/groups/join", { sessionId: getSessionId(), code, nickname });
  return data.data;
}

export async function getMyGroups() {
  const { data } = await api.get(`/groups/my?sessionId=${getSessionId()}`);
  return data.data;
}

export async function getGroupDetails(id) {
  const { data } = await api.get(`/groups/${id}`);
  return data.data;
}

export async function addVideoToGroup({ groupId, shareId, videoTitle, channel, thumbnail }) {
  await api.post(`/groups/${groupId}/videos`, { shareId, videoTitle, channel, thumbnail, sessionId: getSessionId() });
}

export async function sendGroupMessage({ groupId, message }) {
  await api.post(`/groups/${groupId}/messages`, { sessionId: getSessionId(), message });
}

export async function getGroupMessages({ groupId, after }) {
  const { data } = await api.get(`/groups/${groupId}/messages${after ? `?after=${after}` : ""}`);
  return data.data;
}

export async function saveGroupQuizScore({ groupId, videoTitle, score, total }) {
  await api.post(`/groups/${groupId}/quiz-score`, { sessionId: getSessionId(), videoTitle, score, total });
}