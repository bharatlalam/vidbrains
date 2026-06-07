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
      max_tokens: 4096,
      temperature: 0,
      messages: [{
        role: "user",
        content: `Fix this broken JSON. Return ONLY the valid JSON object, nothing else, no markdown:\n\n${clean.slice(0, 4000)}`,
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
  const videoContext = fullText || `Infer topic from URL: ${url}`;
  const videoDuration = metadata?.duration || null;

  const prompt = `You are VidBrain AI. Analyze this YouTube video carefully and generate a rich detailed analysis.

VIDEO METADATA:
${videoContext}
${videoDuration ? `Real video duration: ${videoDuration}` : ""}

OUTPUT LANGUAGE: ${langName}
Write ALL text fields in ${langName}.

IMPORTANT RULES:
- Summary MUST be 6-8 detailed sentences — this is the most important field
- Key points MUST have 7 items each with a full detailed explanation
- Q&A MUST have 7 questions each with 3-4 sentence detailed answers
- Keep JSON valid — no unescaped quotes, no newlines inside strings, no trailing commas
- Chapters must have real timestamps based on video duration — never use "not available"

Return ONLY raw valid JSON, no markdown, no backticks:

{
  "title": "exact video title in ${langName}",
  "channel": "exact channel name",
  "duration": "exact duration mm:ss",
  "views": "view count like 14K views",
  "year": "year published",
  "thumbnail": "https://img.youtube.com/vi/${videoId}/mqdefault.jpg",
  "summary": "Write a very comprehensive 6-8 sentence paragraph in ${langName} covering: the main topic of the video, all key concepts discussed, specific examples and tips mentioned, who this video is best for, what the viewer will learn, and why this video is valuable. Be very detailed and specific — this is the most important field.",
  "keyPoints": [
    "Detailed insight 1 with full explanation in ${langName}",
    "Detailed insight 2 with full explanation",
    "Detailed insight 3 with full explanation",
    "Detailed insight 4 with full explanation",
    "Detailed insight 5 with full explanation",
    "Detailed insight 6 with full explanation",
    "Detailed insight 7 with full explanation"
  ],
  "chapters": [
    {"timestamp": "0:00", "title": "chapter title", "description": "what this section covers"},
    {"timestamp": "3:00", "title": "chapter title", "description": "what this section covers"},
    {"timestamp": "7:00", "title": "chapter title", "description": "what this section covers"},
    {"timestamp": "12:00", "title": "chapter title", "description": "what this section covers"},
    {"timestamp": "17:00", "title": "chapter title", "description": "what this section covers"}
  ],
  "qa": [
    {"question": "specific question about this video in ${langName}?", "answer": "Write a detailed 3-4 sentence answer with specific examples from the video in ${langName}."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."}
  ],
  "flashcards": [
    {"term": "Key Term 1", "definition": "clear precise definition from video."},
    {"term": "Key Term 2", "definition": "clear precise definition."},
    {"term": "Key Term 3", "definition": "clear precise definition."},
    {"term": "Key Term 4", "definition": "clear precise definition."},
    {"term": "Key Term 5", "definition": "clear precise definition."},
    {"term": "Key Term 6", "definition": "clear precise definition."},
    {"term": "Key Term 7", "definition": "clear precise definition."},
    {"term": "Key Term 8", "definition": "clear precise definition."}
  ],
  "mindmap": {
    "center": "core topic",
    "branches": [
      {"label": "Branch 1", "children": ["sub1", "sub2", "sub3"]},
      {"label": "Branch 2", "children": ["sub1", "sub2", "sub3"]},
      {"label": "Branch 3", "children": ["sub1", "sub2"]},
      {"label": "Branch 4", "children": ["sub1", "sub2", "sub3"]},
      {"label": "Branch 5", "children": ["sub1", "sub2"]}
    ]
  },
  "suggestedQuestions": ["specific question 1?", "specific question 2?", "specific question 3?"],
  "context": "Detailed 3-4 sentence paragraph summarizing the full video content accurately in ${langName}."
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
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
      content: `You are VidBrain, expert assistant for the YouTube video "${videoTitle}" by ${channel}. Context: ${context}. Answer ALL questions in ${langName} only. Give detailed comprehensive answers with examples. Be specific and thorough.`,
    },
    ...history,
    { role: "user", content: question },
  ];

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2048,
    messages,
  });

  return response.choices[0].message.content;
}

module.exports = { analyzeVideo, chatWithVideo };