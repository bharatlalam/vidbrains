const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LANGUAGE_NAMES = {
  en: "English", te: "Telugu", hi: "Hindi",
  ta: "Tamil", es: "Spanish", fr: "French", ja: "Japanese",
};

router.post("/expand", async (req, res) => {
  const { text, videoTitle, context, language = "en" } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const langName = LANGUAGE_NAMES[language] || "English";

  const prompt = `You are VidBrain AI. The user highlighted this text from a video analysis. Write ALL output in ${langName}.

Highlighted text: "${text}"
Video: ${videoTitle}
Context: ${context}

Return ONLY raw valid JSON, no markdown:
{
  "expandedNote": "Write 4-5 detailed sentences in ${langName} expanding on this highlighted text with examples and context.",
  "keyInsight": "One sentence in ${langName} capturing the core insight.",
  "relatedPoints": ["related point 1 in ${langName}", "related point 2 in ${langName}", "related point 3 in ${langName}"]
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