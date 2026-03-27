const express = require("express");
const router = express.Router();
const { getHistory, saveQuizScore, getQuizScores } = require("../services/db");

router.get("/", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.json({ success: true, data: [] });
  const data = await getHistory(sessionId);
  res.json({ success: true, data });
});

router.post("/quiz-score", async (req, res) => {
  const { sessionId, videoTitle, score, total } = req.body;
  if (!sessionId) return res.json({ success: true });
  await saveQuizScore({ sessionId, videoTitle, score, total });
  res.json({ success: true });
});

router.get("/quiz-scores", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.json({ success: true, data: [] });
  const data = await getQuizScores(sessionId);
  res.json({ success: true, data });
});

module.exports = router;