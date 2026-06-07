const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/concept — generate concept graph
router.post("/", async (req, res) => {
  const { title, summary, keyPoints, context } = req.body;
  if (!context) return res.status(400).json({ error: "context is required" });

  const prompt = `You are VidBrain AI. Generate a concept graph for this YouTube video showing how all concepts connect.

Video: ${title}
Context: ${context}
Key Points: ${keyPoints?.join(", ")}

Create a concept graph with a central concept and related nodes. Each node has connections to other nodes showing relationships.

Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas:
{
  "centralConcept": {
    "id": "root",
    "label": "main topic of video (3 words max)",
    "description": "one sentence about this concept",
    "color": "#e05a2b"
  },
  "nodes": [
    {
      "id": "n1",
      "label": "concept name (2-3 words)",
      "description": "one sentence explaining this concept from the video",
      "category": "core",
      "color": "#4a9eff"
    },
    {
      "id": "n2",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "core",
      "color": "#4a9eff"
    },
    {
      "id": "n3",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "supporting",
      "color": "#3cb87a"
    },
    {
      "id": "n4",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "supporting",
      "color": "#3cb87a"
    },
    {
      "id": "n5",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "supporting",
      "color": "#9b6dff"
    },
    {
      "id": "n6",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "example",
      "color": "#9b6dff"
    },
    {
      "id": "n7",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "example",
      "color": "#f0a030"
    },
    {
      "id": "n8",
      "label": "concept name",
      "description": "one sentence explanation",
      "category": "example",
      "color": "#f0a030"
    }
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