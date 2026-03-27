const express = require("express");
const router = express.Router();
const { fetchTranscript } = require("../services/transcript");
const { analyzeVideo } = require("../services/ai");
const { saveAnalysis } = require("../services/db");
const { nanoid } = require("nanoid");

const analyses = new Map();

router.post("/", async (req, res) => {
  const { url, language = "en", sessionId } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  try {
    console.log(`[analyze] ${url} | lang: ${language}`);
    const { videoId, fullText, duration, metadata } = await fetchTranscript(url);
    console.log(`[analyze] transcript: ${fullText ? fullText.length + " chars" : "none"}`);
    const analysis = await analyzeVideo({ videoId, url, fullText, duration, metadata, language });
    console.log(`[analyze] done: "${analysis.title}"`);

    const shareId = nanoid(8);
    analyses.set(shareId, { ...analysis, url, shareId, language, createdAt: new Date().toISOString() });

    // Save to PostgreSQL
    if (sessionId) {
      await saveAnalysis({
        shareId,
        sessionId,
        title: analysis.title,
        channel: analysis.channel,
        url,
        thumbnail: analysis.thumbnail,
        duration: analysis.duration,
        views: analysis.views,
        year: analysis.year,
        language,
      });
    }

    res.json({ success: true, data: { ...analysis, shareId, language } });
  } catch (err) {
    console.error("[analyze] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/share/:id", (req, res) => {
  const data = analyses.get(req.params.id);
  if (!data) return res.status(404).json({ error: "Analysis not found or expired" });
  res.json({ success: true, data });
});

module.exports = { router, analyses };