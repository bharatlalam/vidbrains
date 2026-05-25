const express = require("express");
const router = express.Router();
const { fetchTranscript } = require("../services/transcript");
const { analyzeVideo } = require("../services/ai");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function safeParseJSON(raw) {
  let clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  clean = clean.slice(start, end + 1);
  clean = clean
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("[compare] JSON repair attempting...");
    const repair = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0,
      messages: [{ role: "user", content: `Fix this broken JSON. Return ONLY valid JSON, no markdown:\n\n${clean.slice(0, 3000)}` }],
    });
    const fixed = repair.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const fs = fixed.indexOf("{");
    const fe = fixed.lastIndexOf("}");
    if (fs === -1 || fe === -1) throw new Error("Could not repair JSON");
    return JSON.parse(fixed.slice(fs, fe + 1));
  }
}

router.post("/", async (req, res) => {
  const { url1, url2, language = "en" } = req.body;
  if (!url1 || !url2) return res.status(400).json({ error: "Both URLs required" });

  try {
    console.log(`[compare] Analyzing both videos...`);

    const [r1, r2] = await Promise.all([
      fetchTranscript(url1).then(({ videoId, fullText, duration, metadata }) =>
        analyzeVideo({ videoId, url: url1, fullText, duration, metadata, language })
      ),
      fetchTranscript(url2).then(({ videoId, fullText, duration, metadata }) =>
        analyzeVideo({ videoId, url: url2, fullText, duration, metadata, language })
      ),
    ]);

    const prompt = `You are VidBrain AI. Compare these two YouTube videos.

Video 1: "${r1.title}" by ${r1.channel}
Summary 1: ${r1.summary.slice(0, 300)}

Video 2: "${r2.title}" by ${r2.channel}
Summary 2: ${r2.summary.slice(0, 300)}

Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas, no special characters:
{
  "verdict": "One sentence verdict on which video is better and why",
  "winner": 1,
  "comparison": [
    {"aspect": "Content Depth", "video1": "short assessment", "video2": "short assessment", "winner": 1},
    {"aspect": "Beginner Friendly", "video1": "short assessment", "video2": "short assessment", "winner": 2},
    {"aspect": "Practical Tips", "video1": "short assessment", "video2": "short assessment", "winner": 1},
    {"aspect": "Coverage", "video1": "short assessment", "video2": "short assessment", "winner": 2},
    {"aspect": "Best For", "video1": "who should watch", "video2": "who should watch", "winner": 0}
  ],
  "similarities": ["similarity 1", "similarity 2", "similarity 3"],
  "differences": ["difference 1", "difference 2", "difference 3"]
}`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content;
    const comparison = await safeParseJSON(raw);

    res.json({ success: true, data: { video1: r1, video2: r2, comparison } });
  } catch (err) {
    console.error("[compare] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;