const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/quiz
router.post("/", async (req, res) => {
  const { title, context, keyPoints } = req.body;
  if (!context) return res.status(400).json({ error: "context is required" });

  const prompt = `You are VidBrain Quiz Generator. Generate a quiz for this YouTube video.

Video: ${title}
Context: ${context}
Key Points: ${keyPoints?.join(", ")}

Generate exactly 8 multiple choice questions. Each must have 4 options and one correct answer.

Reply with ONLY raw JSON, no markdown, no backticks:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Rules:
- correct is the index (0,1,2,3) of the correct option
- Questions must be specific to the video content
- Make options realistic and tricky
- Keep questions clear and concise`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content;
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const data = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[quiz] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;