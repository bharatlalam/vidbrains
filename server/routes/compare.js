const express = require("express");
const router = express.Router();
const { fetchTranscript } = require("../services/transcript");
const { analyzeVideo } = require("../services/ai");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const prompt = `You are VidBrain AI. Compare these two YouTube videos and generate a detailed comparison.

Video 1: "${r1.title}" by ${r1.channel}
Summary 1: ${r1.summary}
Key Points 1: ${r1.keyPoints.join(", ")}

Video 2: "${r2.title}" by ${r2.channel}
Summary 2: ${r2.summary}
Key Points 2: ${r2.keyPoints.join(", ")}

Return ONLY raw JSON, no markdown, no backticks:
{
  "verdict": "One sentence verdict on which video is better and why",
  "winner": 1,
  "comparison": [
    {"aspect": "Content Depth", "video1": "assessment", "video2": "assessment", "winner": 1},
    {"aspect": "Beginner Friendly", "video1": "assessment", "video2": "assessment", "winner": 2},
    {"aspect": "Practical Tips", "video1": "assessment", "video2": "assessment", "winner": 1},
    {"aspect": "Coverage", "video1": "assessment", "video2": "assessment", "winner": 2},
    {"aspect": "Best For", "video1": "who should watch", "video2": "who should watch", "winner": 0}
  ],
  "similarities": ["similarity 1", "similarity 2", "similarity 3"],
  "differences": ["difference 1", "difference 2", "difference 3"]
}`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content;
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    const comparison = JSON.parse(clean.slice(start, end + 1));

    res.json({ success: true, data: { video1: r1, video2: r2, comparison } });
  } catch (err) {
    console.error("[compare] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;