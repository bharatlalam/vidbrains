const express = require("express");
const router = express.Router();
const { fetchTranscript } = require("../services/transcript");
const { analyzeVideo } = require("../services/ai");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function safeParseJSON(raw) {
  let clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  clean = clean.slice(start, end + 1);
  clean = clean
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("[compare] JSON repair attempting...");
    const repair = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0,
      messages: [{ role: "user", content: `Fix this broken JSON. Return ONLY valid JSON, no markdown:\n\n${clean.slice(0, 3000)}` }],
    });
    const fixed = repair.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const fs = fixed.indexOf("{");
    const fe = fixed.lastIndexOf("}");
    if (fs === -1 || fe === -1) throw new Error("Could not repair JSON");
    return JSON.parse(fixed.slice(fs, fe + 1));
  }
}

router.post("/", async (req, res) => {
  const { url1, url2, language = "en" } = req.body;
  if (!url1 || !url2) return res.status(400).json({ error: "Both URLs required" });

  try {
    console.log(`[compare] Analyzing both videos...`);

    const t1 = await fetchTranscript(url1);
    const r1 = await analyzeVideo({ videoId: t1.videoId, url: url1, fullText: t1.fullText, duration: t1.duration, metadata: t1.metadata, language });

    console.log("[compare] Waiting 15s to avoid rate limit...");
    await new Promise((r) => setTimeout(r, 15000));

    const t2 = await fetchTranscript(url2);
    const r2 = await analyzeVideo({ videoId: t2.videoId, url: url2, fullText: t2.fullText, duration: t2.duration, metadata: t2.metadata, language });

    const prompt = `You are VidBrain AI. Do a deep detailed comparison of these two YouTube videos. Do NOT say which is better or pick a winner. Just compare them in depth so the user understands what each video covers and how they differ.

Video 1: "${r1.title}" by ${r1.channel}
Summary: ${r1.summary}
Key Points: ${r1.keyPoints.join(". ")}

Video 2: "${r2.title}" by ${r2.channel}
Summary: ${r2.summary}
Key Points: ${r2.keyPoints.join(". ")}

Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas, keep strings under 25 words:
{
  "overview": "2 sentences describing what both videos are about and how they relate to each other",
  "video1Summary": "3 sentences explaining what Video 1 specifically covers and what you will learn from it",
  "video2Summary": "3 sentences explaining what Video 2 specifically covers and what you will learn from it",
  "aspects": [
    {
      "aspect": "Topic Focus",
      "video1": "what video 1 focuses on for this aspect",
      "video2": "what video 2 focuses on for this aspect"
    },
    {
      "aspect": "Target Audience",
      "video1": "who video 1 is best for",
      "video2": "who video 2 is best for"
    },
    {
      "aspect": "Depth of Coverage",
      "video1": "how deep video 1 goes",
      "video2": "how deep video 2 goes"
    },
    {
      "aspect": "Teaching Style",
      "video1": "how video 1 teaches",
      "video2": "how video 2 teaches"
    },
    {
      "aspect": "Practical Content",
      "video1": "practical elements in video 1",
      "video2": "practical elements in video 2"
    },
    {
      "aspect": "Key Takeaway",
      "video1": "main thing you learn from video 1",
      "video2": "main thing you learn from video 2"
    }
  ],
  "uniqueToVideo1": ["something only in video 1", "another unique point", "another unique point"],
  "uniqueToVideo2": ["something only in video 2", "another unique point", "another unique point"],
  "commonTopics": ["topic both cover", "topic both cover", "topic both cover"],
  "watchVideo1If": "one sentence — watch video 1 if you want this specific thing",
  "watchVideo2If": "one sentence — watch video 2 if you want this specific thing"
}`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content;
    const comparison = await safeParseJSON(raw);

    res.json({ success: true, data: { video1: r1, video2: r2, comparison } });
  } catch (err) {
    console.error("[compare] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;