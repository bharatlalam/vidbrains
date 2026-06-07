const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/tutor/lesson — generate lesson plan from video
router.post("/lesson", async (req, res) => {
  const { title, summary, keyPoints, context, language = "en" } = req.body;
  if (!context) return res.status(400).json({ error: "context is required" });

  const prompt = `You are VidBrain AI Tutor. Create an interactive lesson plan for this YouTube video.

Video: ${title}
Context: ${context}
Key Points: ${keyPoints?.join(", ")}

Generate a step-by-step interactive lesson with 5 stages. Each stage teaches one concept, then asks the student a question to check understanding.

Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas:
{
  "lessonTitle": "lesson title",
  "totalStages": 5,
  "stages": [
    {
      "id": 1,
      "concept": "concept name",
      "teaching": "Explain this concept in 3-4 sentences as if you are a teacher talking to a student. Be clear, engaging and use simple language.",
      "example": "Give a real world example or analogy to make this concept easy to understand.",
      "question": "Ask the student a specific question to check if they understood this concept.",
      "correctAnswer": "The correct answer to the question above.",
      "hint": "A helpful hint if the student is stuck."
    },
    {
      "id": 2,
      "concept": "concept name",
      "teaching": "teaching content",
      "example": "example",
      "question": "question for student",
      "correctAnswer": "correct answer",
      "hint": "hint"
    },
    {
      "id": 3,
      "concept": "concept name",
      "teaching": "teaching content",
      "example": "example",
      "question": "question for student",
      "correctAnswer": "correct answer",
      "hint": "hint"
    },
    {
      "id": 4,
      "concept": "concept name",
      "teaching": "teaching content",
      "example": "example",
      "question": "question for student",
      "correctAnswer": "correct answer",
      "hint": "hint"
    },
    {
      "id": 5,
      "concept": "concept name",
      "teaching": "teaching content",
      "example": "example",
      "question": "question for student",
      "correctAnswer": "correct answer",
      "hint": "hint"
    }
  ]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2500,
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
    console.error("[tutor] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tutor/evaluate — evaluate student answer
router.post("/evaluate", async (req, res) => {
  const { question, correctAnswer, studentAnswer, concept, language = "en" } = req.body;

  const prompt = `You are a helpful AI tutor evaluating a student's answer.

Concept being taught: ${concept}
Question asked: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${studentAnswer}

Evaluate the student's answer. Be encouraging and constructive. 

Return ONLY raw valid JSON:
{
  "isCorrect": true or false,
  "score": a number from 0 to 100,
  "feedback": "2-3 sentences of encouraging feedback explaining if they got it right or wrong and why",
  "encouragement": "one short encouraging sentence to motivate the student"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
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
    console.error("[tutor/evaluate] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;