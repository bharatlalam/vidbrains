const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const resend = new Resend(process.env.RESEND_API_KEY);
const otpStore = new Map();

async function initUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(200) UNIQUE,
      name VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW(),
      last_login TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("[db] Users table ready ✓");
}
initUsersTable().catch(console.error);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  try {
    const result = await resend.emails.send({
      from: "VidBrain <onboarding@resend.dev>",
      to: [email],
      subject: "Your VidBrain OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d0d0f;color:#f0efe8;border-radius:16px;">
          <div style="margin-bottom:24px;">
            <span style="font-size:20px;font-weight:800;color:#f0efe8;">🧠 VidBrain</span>
          </div>
          <h2 style="font-size:24px;margin-bottom:8px;color:#f0efe8;">Your login code</h2>
          <p style="color:#9b9a96;margin-bottom:24px;">Enter this code to sign in to VidBrain</p>
          <div style="background:#1a1a1f;border:2px solid #e05a2b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="font-size:48px;font-weight:800;letter-spacing:16px;color:#e05a2b;margin:0;">${otp}</p>
          </div>
          <p style="color:#5a5958;font-size:13px;">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    console.log(`[auth] OTP for ${email} is: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("[auth] resend error:", err.message, JSON.stringify(err));
    res.status(500).json({ error: "Failed to send email. Try again." });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

  const stored = otpStore.get(email.toLowerCase());
  if (!stored) return res.status(400).json({ error: "No OTP found. Please request a new one." });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }
  if (stored.otp !== otp.trim()) {
    return res.status(400).json({ error: "Incorrect OTP. Please try again." });
  }

  otpStore.delete(email.toLowerCase());

  const existing = await pool.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
  const isNewUser = existing.rows.length === 0;

  if (!isNewUser) {
    const user = existing.rows[0];
    await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "vidbrain_secret",
      { expiresIn: "30d" }
    );
    return res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name }, isNewUser: false });
  }

  res.json({ success: true, isNewUser: true, email: email.toLowerCase() });
});

router.post("/complete-signup", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: "Email and name required" });

  try {
    const result = await pool.query(
      `INSERT INTO users (email, name) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET name = $2, last_login = NOW()
       RETURNING *`,
      [email.toLowerCase(), name.trim()]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "vidbrain_secret",
      { expiresIn: "30d" }
    );
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("[auth] signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vidbrain_secret");
    res.json({ success: true, user: decoded });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;