const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initCollectionsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100),
      name VARCHAR(100),
      emoji VARCHAR(10) DEFAULT '📚',
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      id SERIAL PRIMARY KEY,
      collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
      share_id VARCHAR(20),
      video_title TEXT,
      channel TEXT,
      thumbnail TEXT,
      duration TEXT,
      added_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initCollectionsTable().catch(console.error);

// GET /api/collections — get all collections for session
router.get("/", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.json({ success: true, data: [] });
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(ci.id) as item_count 
       FROM collections c
       LEFT JOIN collection_items ci ON ci.collection_id = c.id
       WHERE c.session_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [sessionId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections — create collection
router.post("/", async (req, res) => {
  const { sessionId, name, emoji, description } = req.body;
  if (!sessionId || !name) return res.status(400).json({ error: "sessionId and name required" });
  try {
    const result = await pool.query(
      `INSERT INTO collections (session_id, name, emoji, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [sessionId, name, emoji || "📚", description || ""]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id
router.delete("/:id", async (req, res) => {
  const { sessionId } = req.query;
  try {
    await pool.query(`DELETE FROM collections WHERE id = $1 AND session_id = $2`, [req.params.id, sessionId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:id/items
router.get("/:id/items", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM collection_items WHERE collection_id = $1 ORDER BY added_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections/:id/items — add video to collection
router.post("/:id/items", async (req, res) => {
  const { shareId, videoTitle, channel, thumbnail, duration } = req.body;
  try {
    const existing = await pool.query(
      `SELECT id FROM collection_items WHERE collection_id = $1 AND share_id = $2`,
      [req.params.id, shareId]
    );
    if (existing.rows.length > 0) return res.json({ success: true, alreadyExists: true });

    const result = await pool.query(
      `INSERT INTO collection_items (collection_id, share_id, video_title, channel, thumbnail, duration)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.id, shareId, videoTitle, channel, thumbnail, duration]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id/items/:itemId
router.delete("/:id/items/:itemId", async (req, res) => {
  try {
    await pool.query(`DELETE FROM collection_items WHERE id = $1 AND collection_id = $2`, [req.params.itemId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;