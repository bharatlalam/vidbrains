const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Init notes table
async function initNotesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100),
      share_id VARCHAR(20),
      video_title TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initNotesTable().catch(console.error);

// GET /api/notes/:shareId
router.get("/:shareId", async (req, res) => {
  const { shareId } = req.params;
  const { sessionId } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM notes WHERE share_id = $1 AND session_id = $2 LIMIT 1`,
      [shareId, sessionId]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes — save or update notes
router.post("/", async (req, res) => {
  const { shareId, sessionId, videoTitle, content } = req.body;
  if (!shareId || !sessionId) return res.status(400).json({ error: "shareId and sessionId required" });

  try {
    const existing = await pool.query(
      `SELECT id FROM notes WHERE share_id = $1 AND session_id = $2`,
      [shareId, sessionId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE notes SET content = $1, updated_at = NOW() WHERE share_id = $2 AND session_id = $3`,
        [content, shareId, sessionId]
      );
    } else {
      await pool.query(
        `INSERT INTO notes (session_id, share_id, video_title, content) VALUES ($1, $2, $3, $4)`,
        [sessionId, shareId, videoTitle, content]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:shareId
router.delete("/:shareId", async (req, res) => {
  const { shareId } = req.params;
  const { sessionId } = req.query;
  try {
    await pool.query(`DELETE FROM notes WHERE share_id = $1 AND session_id = $2`, [shareId, sessionId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;