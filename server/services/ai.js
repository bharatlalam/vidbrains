require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LANGUAGE_NAMES = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  es: "Spanish",
  fr: "French",
  ja: "Japanese",
};

async function safeParseJSON(raw, client) {
  let clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in response");
  clean = clean.slice(start, end + 1);
  clean = clean
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("[ai] JSON parse failed, attempting repair...");
    const repair = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2500,
      temperature: 0,
      messages: [{
        role: "user",
        content: `Fix this broken JSON. Return ONLY the valid JSON object, nothing else, no markdown:\n\n${clean.slice(0, 3000)}`,
      }],
    });
    const fixed = repair.choices[0].message.content
      .replace(/```json/g, "").replace(/```/g, "").trim();
    const fs = fixed.indexOf("{");
    const fe = fixed.lastIndexOf("}");
    if (fs === -1 || fe === -1) throw new Error("Could not repair JSON");
    return JSON.parse(fixed.slice(fs, fe + 1));
  }
}

async function analyzeVideo({ videoId, url, fullText, duration, metadata, language = "en" }) {
  const langName = LANGUAGE_NAMES[language] || "English";
  const videoContext = fullText
    ? fullText.slice(0, 1500)
    : `Infer topic from URL: ${url}`;

  const videoDuration = metadata?.duration || null;

  const prompt = `You are VidBrain AI. Analyze this YouTube video.

VIDEO INFO:
${videoContext}
${videoDuration ? `Duration: ${videoDuration}` : ""}

OUTPUT LANGUAGE: ${langName}

CRITICAL RULES:
- Return ONLY raw valid JSON. No markdown. No backticks. No trailing commas.
- Keep ALL string values SHORT — max 15 words per string value.
- No newlines inside strings. No special punctuation that breaks JSON.
- For non-English languages like Telugu, Hindi, Tamil: use simple short words only. Avoid long complex sentences in JSON strings as they break parsing.
- Mindmap children and branch labels must be 1-3 words only.
- Flashcard terms must be 1-4 words. Definitions max 10 words.

{
  "title": "video title in ${langName}",
  "channel": "channel name",
  "duration": "mm:ss",
  "views": "14K views",
  "year": "2024",
  "thumbnail": "https://img.youtube.com/vi/${videoId}/mqdefault.jpg",
  "summary": "3-4 sentences about this video in ${langName}.",
  "keyPoints": [
    "key point 1 in ${langName}",
    "key point 2",
    "key point 3",
    "key point 4",
    "key point 5"
  ],
  "chapters": [
    {"timestamp": "0:00", "title": "chapter title in ${langName}", "description": "short description"},
    {"timestamp": "3:00", "title": "chapter title", "description": "short description"},
    {"timestamp": "7:00", "title": "chapter title", "description": "short description"},
    {"timestamp": "12:00", "title": "chapter title", "description": "short description"},
    {"timestamp": "17:00", "title": "chapter title", "description": "short description"}
  ],
  "qa": [
    {"question": "question in ${langName}?", "answer": "2 sentence answer."},
    {"question": "question?", "answer": "2 sentence answer."},
    {"question": "question?", "answer": "2 sentence answer."},
    {"question": "question?", "answer": "2 sentence answer."},
    {"question": "question?", "answer": "2 sentence answer."}
  ],
  "flashcards": [
    {"term": "short term", "definition": "short definition max 10 words."},
    {"term": "short term", "definition": "short definition."},
    {"term": "short term", "definition": "short definition."},
    {"term": "short term", "definition": "short definition."},
    {"term": "short term", "definition": "short definition."},
    {"term": "short term", "definition": "short definition."},
    {"term": "short term", "definition": "short definition."},
    {"term": "short term", "definition": "short definition."}
  ],
  "mindmap": {
    "center": "2-3 word topic",
    "branches": [
      {"label": "2-3 words", "children": ["1-2 words", "1-2 words", "1-2 words"]},
      {"label": "2-3 words", "children": ["1-2 words", "1-2 words", "1-2 words"]},
      {"label": "2-3 words", "children": ["1-2 words", "1-2 words"]},
      {"label": "2-3 words", "children": ["1-2 words", "1-2 words", "1-2 words"]},
      {"label": "2-3 words", "children": ["1-2 words", "1-2 words"]}
    ]
  },
  "suggestedQuestions": ["question 1?", "question 2?", "question 3?"],
  "context": "2-3 sentences summarizing the video."
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2500,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0].message.content;
  console.log(`[ai] raw response length: ${raw.length}`);
  return await safeParseJSON(raw, client);
}

async function chatWithVideo({ videoTitle, channel, context, history, question, language = "en" }) {
  const langName = LANGUAGE_NAMES[language] || "English";

  const messages = [
    {
      role: "system",
      content: `You are VidBrain, expert assistant for "${videoTitle}" by ${channel}. Context: ${context}. Answer in ${langName}. Be specific and concise.`,
    },
    ...history,
    { role: "user", content: question },
  ];

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages,
  });

  return response.choices[0].message.content;
}

module.exports = { analyzeVideo, chatWithVideo };