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
      max_tokens: 3000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Fix this broken JSON. Return ONLY the valid JSON object, nothing else, no markdown:\n\n${clean}`,
        },
      ],
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
    ? fullText
    : `No metadata available. Infer topic from URL: ${url}`;

  const prompt = `You are VidBrain AI. Analyze this YouTube video.

${videoContext}

OUTPUT LANGUAGE: ${langName}
Write ALL text fields in ${langName}. Keep JSON structure valid — no special characters that break JSON, no unescaped quotes inside strings.

Return ONLY a raw valid JSON object. No markdown. No backticks. No explanation. No trailing commas.

{
  "title": "video title in ${langName}",
  "channel": "channel name",
  "duration": "mm:ss",
  "views": "14K views",
  "year": "2024",
  "thumbnail": "https://img.youtube.com/vi/${videoId}/mqdefault.jpg",
  "summary": "Four sentences about this video in ${langName}.",
  "keyPoints": ["point 1 in ${langName}", "point 2", "point 3", "point 4", "point 5"],
  "chapters": [
    {"timestamp": "0:00", "title": "chapter in ${langName}", "description": "description"},
    {"timestamp": "3:00", "title": "chapter", "description": "description"},
    {"timestamp": "7:00", "title": "chapter", "description": "description"},
    {"timestamp": "12:00", "title": "chapter", "description": "description"},
    {"timestamp": "17:00", "title": "chapter", "description": "description"}
  ],
  "qa": [
    {"question": "question in ${langName}?", "answer": "answer in ${langName}."},
    {"question": "question?", "answer": "answer."},
    {"question": "question?", "answer": "answer."},
    {"question": "question?", "answer": "answer."},
    {"question": "question?", "answer": "answer."}
  ],
  "flashcards": [
    {"term": "term in ${langName}", "definition": "definition."},
    {"term": "term", "definition": "definition."},
    {"term": "term", "definition": "definition."},
    {"term": "term", "definition": "definition."},
    {"term": "term", "definition": "definition."},
    {"term": "term", "definition": "definition."},
    {"term": "term", "definition": "definition."},
    {"term": "term", "definition": "definition."}
  ],
  "mindmap": {
    "center": "topic in ${langName}",
    "branches": [
      {"label": "branch 1", "children": ["sub1", "sub2", "sub3"]},
      {"label": "branch 2", "children": ["sub1", "sub2", "sub3"]},
      {"label": "branch 3", "children": ["sub1", "sub2"]},
      {"label": "branch 4", "children": ["sub1", "sub2", "sub3"]},
      {"label": "branch 5", "children": ["sub1", "sub2"]}
    ]
  },
  "suggestedQuestions": ["question 1 in ${langName}?", "question 2?", "question 3?"],
  "context": "Detailed paragraph in ${langName} about the video."
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 3000,
    temperature: 0.3,
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
      content: `You are VidBrain, expert assistant for the YouTube video "${videoTitle}" by ${channel}. Context: ${context}. Answer ALL questions in ${langName} only. Be specific and concise.`,
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