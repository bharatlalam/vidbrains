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

  const prompt = `You are VidBrain AI. Analyze this YouTube video and generate a detailed analysis.

VIDEO INFO:
${videoContext}
${videoDuration ? `Duration: ${videoDuration}` : ""}

OUTPUT LANGUAGE: ${langName}
CRITICAL RULES:
- Return ONLY raw valid JSON. No markdown. No backticks. No trailing commas.
- For summary and keyPoints and qa answers — write detailed long content
- For ALL OTHER fields like titles, chapter titles, descriptions, flashcard terms, mindmap labels — keep them SHORT under 15 words
- No newlines inside any string value
- Use only straight double quotes

{
  "title": "exact video title",
  "channel": "channel name",
  "duration": "mm:ss",
  "views": "14K views",
  "year": "2024",
  "thumbnail": "https://img.youtube.com/vi/${videoId}/mqdefault.jpg",
  "summary": "Write a very detailed and comprehensive paragraph of 6-8 sentences in ${langName}. Cover the main topic thoroughly, explain all key concepts discussed, mention specific examples or tips given in the video, describe who this video is for, and explain exactly what the viewer will learn. Make this the most informative part of the entire analysis.",
  "keyPoints": [
    "Detailed insight with full explanation of this concept from the video in ${langName}",
    "Detailed insight with full explanation in ${langName}",
    "Detailed insight with full explanation in ${langName}",
    "Detailed insight with full explanation in ${langName}",
    "Detailed insight with full explanation in ${langName}",
    "Detailed insight with full explanation in ${langName}",
    "Detailed insight with full explanation in ${langName}"
  ],
  "chapters": [
    {"timestamp": "0:00", "title": "short chapter title", "description": "short description"},
    {"timestamp": "3:00", "title": "short chapter title", "description": "short description"},
    {"timestamp": "7:00", "title": "short chapter title", "description": "short description"},
    {"timestamp": "12:00", "title": "short chapter title", "description": "short description"},
    {"timestamp": "17:00", "title": "short chapter title", "description": "short description"}
  ],
  "qa": [
    {"question": "specific question about this video?", "answer": "Write a detailed 3-4 sentence answer with examples from the video in ${langName}."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."}
  ],
  "flashcards": [
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."},
    {"term": "short term", "definition": "clear definition under 20 words."}
  ],
  "mindmap": {
    "center": "core topic",
    "branches": [
      {"label": "branch 1", "children": ["sub1", "sub2", "sub3"]},
      {"label": "branch 2", "children": ["sub1", "sub2", "sub3"]},
      {"label": "branch 3", "children": ["sub1", "sub2"]},
      {"label": "branch 4", "children": ["sub1", "sub2", "sub3"]},
      {"label": "branch 5", "children": ["sub1", "sub2"]}
    ]
  },
  "suggestedQuestions": ["question 1?", "question 2?", "question 3?"],
  "context": "3-4 sentences summarizing the full video content accurately in ${langName}."
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 3500,
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
      content: `You are VidBrain, expert assistant for "${videoTitle}" by ${channel}. Context: ${context}. Answer in ${langName}. Be detailed and specific.`,
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