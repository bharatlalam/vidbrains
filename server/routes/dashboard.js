const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// GET /api/dashboard — get full performance data for session
router.get("/", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.json({ success: true, data: getEmptyDashboard() });

  try {
    // Get analyses history
    const analysesResult = await pool.query(
      `SELECT * FROM analyses WHERE session_id = $1 ORDER BY created_at DESC`,
      [sessionId]
    );

    // Get quiz scores
    const scoresResult = await pool.query(
      `SELECT * FROM quiz_scores WHERE session_id = $1 ORDER BY created_at DESC`,
      [sessionId]
    );

    const analyses = analysesResult.rows;
    const scores = scoresResult.rows;

    // Calculate stats
    const totalVideos = analyses.length;
    const totalQuizzes = scores.length;
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + (b.score / b.total) * 100, 0) / scores.length)
      : 0;

    // Study streak
    const streak = calculateStreak(analyses);

    // Topics from video titles
    const topics = analyses.slice(0, 10).map((a) => ({
      title: a.title,
      channel: a.channel,
      thumbnail: a.thumbnail,
      language: a.language,
      date: a.created_at,
    }));

    // Quiz performance over time
    const quizHistory = scores.slice(0, 10).map((s) => ({
      title: s.video_title,
      score: Math.round((s.score / s.total) * 100),
      date: s.created_at,
    }));

    // Language breakdown
    const languageMap = {};
    analyses.forEach((a) => {
      const lang = a.language || "en";
      languageMap[lang] = (languageMap[lang] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalVideos,
        totalQuizzes,
        avgScore,
        streak,
        topics,
        quizHistory,
        languageMap,
      },
    });
  } catch (err) {
    console.error("[dashboard] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

function calculateStreak(analyses) {
  if (!analyses.length) return 0;
  const dates = [...new Set(analyses.map((a) => new Date(a.created_at).toDateString()))];
  let streak = 1;
  const today = new Date().toDateString();
  if (dates[0] !== today) return 0;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function getEmptyDashboard() {
  return { totalVideos: 0, totalQuizzes: 0, avgScore: 0, streak: 0, topics: [], quizHistory: [], languageMap: {} };
}

module.exports = router;