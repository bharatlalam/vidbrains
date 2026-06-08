const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initCommunityTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS highlights (
      id SERIAL PRIMARY KEY,
      video_id VARCHAR(20),
      video_title TEXT,
      highlighted_text TEXT,
      count INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS highlight_votes (
      id SERIAL PRIMARY KEY,
      highlight_id INTEGER,
      session_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(highlight_id, session_id)
    );
  `);
}
initCommunityTable().catch(console.error);

// GET /api/community/:videoId — get top highlights for a video
router.get("/:videoId", async (req, res) => {
  const { videoId } = req.params;
  const { sessionId } = req.query;

  try {
    const result = await pool.query(
      `SELECT h.*, 
        CASE WHEN hv.session_id IS NOT NULL THEN true ELSE false END as voted_by_me
       FROM highlights h
       LEFT JOIN highlight_votes hv ON hv.highlight_id = h.id AND hv.session_id = $2
       WHERE h.video_id = $1
       ORDER BY h.count DESC LIMIT 20`,
      [videoId, sessionId || ""]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/highlight — add or upvote a highlight
router.post("/highlight", async (req, res) => {
  const { videoId, videoTitle, text, sessionId } = req.body;
  if (!videoId || !text || !sessionId) return res.status(400).json({ error: "Missing fields" });

  try {
    // Check if same text already highlighted for this video
    const existing = await pool.query(
      `SELECT id FROM highlights WHERE video_id = $1 AND highlighted_text = $2`,
      [videoId, text]
    );

    let highlightId;

    if (existing.rows.length > 0) {
      highlightId = existing.rows[0].id;
      // Try to add vote
      try {
        await pool.query(
          `INSERT INTO highlight_votes (highlight_id, session_id) VALUES ($1, $2)`,
          [highlightId, sessionId]
        );
        // Increment count
        await pool.query(`UPDATE highlights SET count = count + 1 WHERE id = $1`, [highlightId]);
      } catch {
        // Already voted
      }
    } else {
      // New highlight
      const inserted = await pool.query(
        `INSERT INTO highlights (video_id, video_title, highlighted_text, count) VALUES ($1, $2, $3, 1) RETURNING id`,
        [videoId, videoTitle, text]
      );
      highlightId = inserted.rows[0].id;
      await pool.query(
        `INSERT INTO highlight_votes (highlight_id, session_id) VALUES ($1, $2)`,
        [highlightId, sessionId]
      );
    }

    res.json({ success: true, highlightId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;