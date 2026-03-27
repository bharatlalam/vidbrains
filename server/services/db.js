const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      share_id VARCHAR(20) UNIQUE,
      session_id VARCHAR(100),
      title TEXT,
      channel TEXT,
      url TEXT,
      thumbnail TEXT,
      duration TEXT,
      views TEXT,
      year TEXT,
      language VARCHAR(10) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS quiz_scores (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100),
      video_title TEXT,
      score INTEGER,
      total INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("[db] Tables ready ✓");
}

async function saveAnalysis({ shareId, sessionId, title, channel, url, thumbnail, duration, views, year, language }) {
  try {
    await pool.query(
      `INSERT INTO analyses (share_id, session_id, title, channel, url, thumbnail, duration, views, year, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (share_id) DO NOTHING`,
      [shareId, sessionId, title, channel, url, thumbnail, duration, views, year, language]
    );
  } catch (e) {
    console.error("[db] saveAnalysis error:", e.message);
  }
}

async function getHistory(sessionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM analyses WHERE session_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [sessionId]
    );
    return result.rows;
  } catch (e) {
    console.error("[db] getHistory error:", e.message);
    return [];
  }
}

async function saveQuizScore({ sessionId, videoTitle, score, total }) {
  try {
    await pool.query(
      `INSERT INTO quiz_scores (session_id, video_title, score, total) VALUES ($1, $2, $3, $4)`,
      [sessionId, videoTitle, score, total]
    );
  } catch (e) {
    console.error("[db] saveQuizScore error:", e.message);
  }
}

async function getQuizScores(sessionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM quiz_scores WHERE session_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [sessionId]
    );
    return result.rows;
  } catch (e) {
    console.error("[db] getQuizScores error:", e.message);
    return [];
  }
}

module.exports = { initDB, saveAnalysis, getHistory, saveQuizScore, getQuizScores };