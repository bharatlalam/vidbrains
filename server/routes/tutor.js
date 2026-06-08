const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LANGUAGE_NAMES = {
  en: "English", te: "Telugu", hi: "Hindi",
  ta: "Tamil", es: "Spanish", fr: "French", ja: "Japanese",
};

router.post("/lesson", async (req, res) => {
  const { title, summary, keyPoints, context, language = "en" } = req.body;
  if (!context) return res.status(400).json({ error: "context is required" });

  const langName = LANGUAGE_NAMES[language] || "English";

  const prompt = `You are VidBrain AI Tutor. Create an interactive lesson plan for this YouTube video. Write EVERYTHING in ${langName} language.

Video: ${title}
Context: ${context}
Key Points: ${keyPoints?.join(", ")}

Generate a step-by-step interactive lesson with 5 stages in ${langName}. Each stage teaches one concept then asks a question.

Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas:
{
  "lessonTitle": "lesson title in ${langName}",
  "totalStages": 5,
  "stages": [
    {
      "id": 1,
      "concept": "concept name in ${langName}",
      "teaching": "Explain this concept in 3-4 sentences in ${langName} as a teacher talking to a student.",
      "example": "Give a real world example in ${langName}.",
      "question": "Ask a question in ${langName} to check understanding.",
      "correctAnswer": "correct answer in ${langName}",
      "hint": "helpful hint in ${langName}"
    },
    {"id": 2, "concept": "concept in ${langName}", "teaching": "teaching in ${langName}", "example": "example in ${langName}", "question": "question in ${langName}", "correctAnswer": "answer in ${langName}", "hint": "hint in ${langName}"},
    {"id": 3, "concept": "concept in ${langName}", "teaching": "teaching in ${langName}", "example": "example in ${langName}", "question": "question in ${langName}", "correctAnswer": "answer in ${langName}", "hint": "hint in ${langName}"},
    {"id": 4, "concept": "concept in ${langName}", "teaching": "teaching in ${langName}", "example": "example in ${langName}", "question": "question in ${langName}", "correctAnswer": "answer in ${langName}", "hint": "hint in ${langName}"},
    {"id": 5, "concept": "concept in ${langName}", "teaching": "teaching in ${langName}", "example": "example in ${langName}", "question": "question in ${langName}", "correctAnswer": "answer in ${langName}", "hint": "hint in ${langName}"}
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

router.post("/evaluate", async (req, res) => {
  const { question, correctAnswer, studentAnswer, concept, language = "en" } = req.body;
  const langName = LANGUAGE_NAMES[language] || "English";

  const prompt = `You are a helpful AI tutor. Evaluate this student's answer. Write feedback in ${langName}.

Concept: ${concept}
Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${studentAnswer}

Return ONLY raw valid JSON:
{
  "isCorrect": true or false,
  "score": number from 0 to 100,
  "feedback": "2-3 sentences of feedback in ${langName}",
  "encouragement": "one encouraging sentence in ${langName}"
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