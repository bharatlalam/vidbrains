const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LANGUAGE_NAMES = {
  en: "English", te: "Telugu", hi: "Hindi",
  ta: "Tamil", es: "Spanish", fr: "French", ja: "Japanese",
};

router.post("/", async (req, res) => {
  const { title, summary, keyPoints, context, language = "en" } = req.body;
  if (!context) return res.status(400).json({ error: "context is required" });

  const langName = LANGUAGE_NAMES[language] || "English";

  const prompt = `You are VidBrain AI. Generate a concept graph for this YouTube video. Write ALL labels and descriptions in ${langName}.

Video: ${title}
Context: ${context}
Key Points: ${keyPoints?.join(", ")}

Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas:
{
  "centralConcept": {
    "id": "root",
    "label": "main topic in ${langName} (3 words max)",
    "description": "one sentence in ${langName}",
    "color": "#e05a2b"
  },
  "nodes": [
    {"id": "n1", "label": "concept in ${langName} (2-3 words)", "description": "one sentence in ${langName}", "category": "core", "color": "#4a9eff"},
    {"id": "n2", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "core", "color": "#4a9eff"},
    {"id": "n3", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "supporting", "color": "#3cb87a"},
    {"id": "n4", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "supporting", "color": "#3cb87a"},
    {"id": "n5", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "supporting", "color": "#9b6dff"},
    {"id": "n6", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "example", "color": "#9b6dff"},
    {"id": "n7", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "example", "color": "#f0a030"},
    {"id": "n8", "label": "concept in ${langName}", "description": "one sentence in ${langName}", "category": "example", "color": "#f0a030"}
  ],
  "edges": [
    {"from": "root", "to": "n1", "label": "includes"},
    {"from": "root", "to": "n2", "label": "requires"},
    {"from": "root", "to": "n3", "label": "involves"},
    {"from": "n1", "to": "n4", "label": "leads to"},
    {"from": "n1", "to": "n5", "label": "uses"},
    {"from": "n2", "to": "n6", "label": "example"},
    {"from": "n3", "to": "n7", "label": "example"},
    {"from": "n2", "to": "n8", "label": "relates to"}
  ]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
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
    console.error("[concept] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;