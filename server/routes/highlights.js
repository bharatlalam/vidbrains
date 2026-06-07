const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/highlights/expand — expand a highlighted sentence
router.post("/expand", async (req, res) => {
  const { text, videoTitle, context, language = "en" } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const prompt = `You are VidBrain AI. The user highlighted this sentence from a video analysis:

"${text}"

Video: ${videoTitle}
Context: ${context}

Expand this into detailed notes in ${language === "te" ? "Telugu" : language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : language === "es" ? "Spanish" : language === "fr" ? "French" : language === "ja" ? "Japanese" : "English"}.

Return ONLY raw valid JSON, no markdown:
{
  "expandedNote": "Write 4-5 detailed sentences expanding on this highlighted text. Explain it deeply, add examples, context from the video, and why it matters.",
  "keyInsight": "One sentence capturing the core insight of this highlight.",
  "relatedPoints": ["related point 1", "related point 2", "related point 3"]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 800,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content;
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    const data = JSON.parse(clean.slice(start, end + 1));
    res.json({ success: true, data });
  } catch (err) {
    console.error("[highlights] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;