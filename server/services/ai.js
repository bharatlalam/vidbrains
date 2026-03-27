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

  // Parse real duration from metadata if available
  const videoDuration = metadata?.duration || null;

  const prompt = `You are VidBrain AI. Analyze this YouTube video carefully and generate a precise, detailed analysis.

VIDEO METADATA:
${videoContext}
${videoDuration ? `Real video duration from YouTube API: ${videoDuration}` : ""}

OUTPUT LANGUAGE: ${langName}
Write ALL text fields in ${langName}. Keep JSON structure valid — no special characters that break JSON, no unescaped quotes inside strings.

IMPORTANT RULES FOR CHAPTERS:
- You MUST generate realistic timestamps based on the actual video duration
- If the video is 20 minutes long, spread chapters across 0:00 to 20:00
- If the video is 10 minutes long, spread chapters across 0:00 to 10:00
- NEVER use "not available" for timestamps — always use mm:ss format like "0:00", "4:30", "9:15"
- Calculate timestamps by dividing the video duration into 5 equal parts
- First chapter is always "0:00"
- Make chapter titles and descriptions specific to the actual video content

Return ONLY a raw valid JSON object. No markdown. No backticks. No explanation. No trailing commas.

{
  "title": "exact video title from metadata in ${langName}",
  "channel": "exact channel name from metadata",
  "duration": "exact duration in mm:ss format from metadata",
  "views": "exact view count from metadata formatted like 14K views",
  "year": "exact year from metadata",
  "thumbnail": "https://img.youtube.com/vi/${videoId}/mqdefault.jpg",
  "summary": "Four detailed and specific sentences about what this video actually covers in ${langName}.",
  "keyPoints": [
    "specific insight 1 about this video in ${langName}",
    "specific insight 2",
    "specific insight 3",
    "specific insight 4",
    "specific insight 5"
  ],
  "chapters": [
    {"timestamp": "0:00", "title": "specific chapter title in ${langName}", "description": "specific description of what happens at this timestamp"},
    {"timestamp": "calculate based on duration", "title": "specific chapter title", "description": "specific description"},
    {"timestamp": "calculate based on duration", "title": "specific chapter title", "description": "specific description"},
    {"timestamp": "calculate based on duration", "title": "specific chapter title", "description": "specific description"},
    {"timestamp": "calculate based on duration", "title": "specific chapter title", "description": "specific description"}
  ],
  "qa": [
    {"question": "specific question about this video in ${langName}?", "answer": "specific detailed answer in ${langName}."},
    {"question": "specific question?", "answer": "specific answer."},
    {"question": "specific question?", "answer": "specific answer."},
    {"question": "specific question?", "answer": "specific answer."},
    {"question": "specific question?", "answer": "specific answer."}
  ],
  "flashcards": [
    {"term": "specific term from video in ${langName}", "definition": "precise definition in ${langName}."},
    {"term": "specific term", "definition": "precise definition."},
    {"term": "specific term", "definition": "precise definition."},
    {"term": "specific term", "definition": "precise definition."},
    {"term": "specific term", "definition": "precise definition."},
    {"term": "specific term", "definition": "precise definition."},
    {"term": "specific term", "definition": "precise definition."},
    {"term": "specific term", "definition": "precise definition."}
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
  "context": "Detailed paragraph in ${langName} summarizing the full video content accurately."
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