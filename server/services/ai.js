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

  const videoDuration = metadata?.duration || null;

  const prompt = `You are VidBrain AI. Analyze this YouTube video carefully and generate a rich, detailed, comprehensive analysis.

VIDEO METADATA:
${videoContext}
${videoDuration ? `Real video duration from YouTube API: ${videoDuration}` : ""}

OUTPUT LANGUAGE: ${langName}
Write ALL text fields in ${langName}. Keep JSON structure valid — no special characters that break JSON, no unescaped quotes inside strings.

IMPORTANT RULES:
- Summary must be 6-8 detailed sentences covering the ENTIRE video — main topic, all key concepts, specific examples, who it is for, and what viewer will learn
- Key points must be 7 detailed insights each with a full explanation not just a title
- Q&A must have 7 questions with 3-4 sentence detailed answers each including examples
- Chapters must have realistic timestamps based on actual video duration — NEVER use "not available"
- Flashcards must have 8 specific terms with detailed definitions from the video
- Everything must be specific to THIS video not generic

Return ONLY a raw valid JSON object. No markdown. No backticks. No explanation. No trailing commas.

{
  "title": "exact video title from metadata in ${langName}",
  "channel": "exact channel name from metadata",
  "duration": "exact duration in mm:ss format",
  "views": "exact view count formatted like 14K views",
  "year": "exact year published",
  "thumbnail": "https://img.youtube.com/vi/${videoId}/mqdefault.jpg",
  "summary": "Write a comprehensive 6-8 sentence paragraph covering the entire video. Include main topic, all key concepts discussed, specific examples or tips mentioned, who this video is for, and what the viewer will learn. Be very detailed and specific in ${langName}.",
  "keyPoints": [
    "Detailed insight 1 with full explanation of the concept in ${langName}",
    "Detailed insight 2 with full explanation",
    "Detailed insight 3 with full explanation",
    "Detailed insight 4 with full explanation",
    "Detailed insight 5 with full explanation",
    "Detailed insight 6 with full explanation",
    "Detailed insight 7 with full explanation"
  ],
  "chapters": [
    {"timestamp": "0:00", "title": "specific chapter title in ${langName}", "description": "detailed description of what happens in this section"},
    {"timestamp": "calculated based on duration", "title": "specific chapter title", "description": "detailed description"},
    {"timestamp": "calculated based on duration", "title": "specific chapter title", "description": "detailed description"},
    {"timestamp": "calculated based on duration", "title": "specific chapter title", "description": "detailed description"},
    {"timestamp": "calculated based on duration", "title": "specific chapter title", "description": "detailed description"}
  ],
  "qa": [
    {"question": "specific detailed question about this video in ${langName}?", "answer": "Write a detailed 3-4 sentence answer that fully explains the concept with examples from the video in ${langName}."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."},
    {"question": "specific question?", "answer": "detailed 3-4 sentence answer with examples."}
  ],
  "flashcards": [
    {"term": "specific term from video in ${langName}", "definition": "detailed precise definition with context from the video."},
    {"term": "specific term", "definition": "detailed definition."},
    {"term": "specific term", "definition": "detailed definition."},
    {"term": "specific term", "definition": "detailed definition."},
    {"term": "specific term", "definition": "detailed definition."},
    {"term": "specific term", "definition": "detailed definition."},
    {"term": "specific term", "definition": "detailed definition."},
    {"term": "specific term", "definition": "detailed definition."}
  ],
  "mindmap": {
    "center": "core topic of video in ${langName}",
    "branches": [
      {"label": "specific branch 1 in ${langName}", "children": ["specific sub1", "specific sub2", "specific sub3"]},
      {"label": "specific branch 2", "children": ["specific sub1", "specific sub2", "specific sub3"]},
      {"label": "specific branch 3", "children": ["specific sub1", "specific sub2"]},
      {"label": "specific branch 4", "children": ["specific sub1", "specific sub2", "specific sub3"]},
      {"label": "specific branch 5", "children": ["specific sub1", "specific sub2"]}
    ]
  },
  "suggestedQuestions": [
    "specific question about this video in ${langName}?",
    "specific question?",
    "specific question?"
  ],
  "context": "Write a very detailed 4-5 sentence paragraph in ${langName} summarizing the full video content accurately including all main points discussed."
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
      content: `You are VidBrain, expert assistant for the YouTube video "${videoTitle}" by ${channel}. Context: ${context}. Answer ALL questions in ${langName} only. Give detailed, comprehensive answers with examples. Be specific and thorough.`,
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