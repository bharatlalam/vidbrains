const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initGroupsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS study_groups (
      id SERIAL PRIMARY KEY,
      code VARCHAR(8) UNIQUE,
      name VARCHAR(100),
      emoji VARCHAR(10) DEFAULT '👥',
      created_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
      session_id VARCHAR(100),
      nickname VARCHAR(50),
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(group_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS group_videos (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
      share_id VARCHAR(20),
      video_title TEXT,
      channel TEXT,
      thumbnail TEXT,
      added_by VARCHAR(50),
      added_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS group_messages (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
      session_id VARCHAR(100),
      nickname VARCHAR(50),
      message TEXT,
      sent_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS group_quiz_scores (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
      session_id VARCHAR(100),
      nickname VARCHAR(50),
      video_title TEXT,
      score INTEGER,
      total INTEGER,
      played_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initGroupsTable().catch(console.error);

// POST /api/groups — create group
router.post("/", async (req, res) => {
  const { sessionId, name, emoji, nickname } = req.body;
  if (!sessionId || !name || !nickname) return res.status(400).json({ error: "sessionId, name and nickname required" });
  try {
    const code = nanoid(6).toUpperCase();
    const group = await pool.query(
      `INSERT INTO study_groups (code, name, emoji, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
      [code, name, emoji || "👥", sessionId]
    );
    await pool.query(
      `INSERT INTO group_members (group_id, session_id, nickname) VALUES ($1, $2, $3)`,
      [group.rows[0].id, sessionId, nickname]
    );
    res.json({ success: true, data: group.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups/join — join by code
router.post("/join", async (req, res) => {
  const { sessionId, code, nickname } = req.body;
  if (!sessionId || !code || !nickname) return res.status(400).json({ error: "sessionId, code and nickname required" });
  try {
    const group = await pool.query(`SELECT * FROM study_groups WHERE code = $1`, [code.toUpperCase()]);
    if (!group.rows.length) return res.status(404).json({ error: "Group not found. Check the code." });

    try {
      await pool.query(
        `INSERT INTO group_members (group_id, session_id, nickname) VALUES ($1, $2, $3)`,
        [group.rows[0].id, sessionId, nickname]
      );
    } catch { /* already member */ }

    res.json({ success: true, data: group.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/groups/my — get my groups
router.get("/my", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.json({ success: true, data: [] });
  try {
    const result = await pool.query(
      `SELECT sg.*, gm.nickname,
        (SELECT COUNT(*) FROM group_members WHERE group_id = sg.id) as member_count,
        (SELECT COUNT(*) FROM group_videos WHERE group_id = sg.id) as video_count
       FROM study_groups sg
       JOIN group_members gm ON gm.group_id = sg.id AND gm.session_id = $1
       ORDER BY sg.created_at DESC`,
      [sessionId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/groups/:id — get group details
router.get("/:id", async (req, res) => {
  try {
    const group = await pool.query(`SELECT * FROM study_groups WHERE id = $1`, [req.params.id]);
    const members = await pool.query(`SELECT * FROM group_members WHERE group_id = $1 ORDER BY joined_at`, [req.params.id]);
    const videos = await pool.query(`SELECT * FROM group_videos WHERE group_id = $1 ORDER BY added_at DESC`, [req.params.id]);
    const messages = await pool.query(`SELECT * FROM group_messages WHERE group_id = $1 ORDER BY sent_at DESC LIMIT 50`, [req.params.id]);
    const scores = await pool.query(
      `SELECT nickname, SUM(score) as total_score, COUNT(*) as quizzes_taken
       FROM group_quiz_scores WHERE group_id = $1
       GROUP BY nickname ORDER BY total_score DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        group: group.rows[0],
        members: members.rows,
        videos: videos.rows,
        messages: messages.rows.reverse(),
        leaderboard: scores.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups/:id/videos — add video to group
router.post("/:id/videos", async (req, res) => {
  const { shareId, videoTitle, channel, thumbnail, sessionId } = req.body;
  try {
    const member = await pool.query(`SELECT nickname FROM group_members WHERE group_id = $1 AND session_id = $2`, [req.params.id, sessionId]);
    if (!member.rows.length) return res.status(403).json({ error: "Not a member" });

    await pool.query(
      `INSERT INTO group_videos (group_id, share_id, video_title, channel, thumbnail, added_by) VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, shareId, videoTitle, channel, thumbnail, member.rows[0].nickname]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups/:id/messages — send message
router.post("/:id/messages", async (req, res) => {
  const { sessionId, message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message required" });
  try {
    const member = await pool.query(`SELECT nickname FROM group_members WHERE group_id = $1 AND session_id = $2`, [req.params.id, sessionId]);
    if (!member.rows.length) return res.status(403).json({ error: "Not a member" });

    await pool.query(
      `INSERT INTO group_messages (group_id, session_id, nickname, message) VALUES ($1, $2, $3, $4)`,
      [req.params.id, sessionId, member.rows[0].nickname, message.trim()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/groups/:id/messages — get new messages (polling)
router.get("/:id/messages", async (req, res) => {
  const { after } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM group_messages WHERE group_id = $1 ${after ? "AND id > $2" : ""} ORDER BY sent_at ASC LIMIT 50`,
      after ? [req.params.id, after] : [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups/:id/quiz-score — save quiz score for group
router.post("/:id/quiz-score", async (req, res) => {
  const { sessionId, videoTitle, score, total } = req.body;
  try {
    const member = await pool.query(`SELECT nickname FROM group_members WHERE group_id = $1 AND session_id = $2`, [req.params.id, sessionId]);
    if (!member.rows.length) return res.status(403).json({ error: "Not a member" });

    await pool.query(
      `INSERT INTO group_quiz_scores (group_id, session_id, nickname, video_title, score, total) VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, sessionId, member.rows[0].nickname, videoTitle, score, total]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;