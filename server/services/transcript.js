const https = require("https");

function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function fetchTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Invalid YouTube URL");

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    const raw = await httpsGet(apiUrl);
    const data = JSON.parse(raw);

    if (!data.items || data.items.length === 0) {
      console.warn(`No YouTube metadata found for ${videoId}`);
      return { videoId, fullText: null, duration: null, metadata: null };
    }

    const item = data.items[0];
    const snippet = item.snippet;
    const stats = item.statistics;

    const metadata = {
      title: snippet.title,
      channel: snippet.channelTitle,
      description: snippet.description?.slice(0, 2000) || "",
      tags: (snippet.tags || []).slice(0, 20).join(", "),
      publishedAt: snippet.publishedAt?.slice(0, 4),
      viewCount: stats?.viewCount,
      duration: item.contentDetails?.duration,
    };

    const fullText = `Title: ${metadata.title}
Channel: ${metadata.channel}
Published: ${metadata.publishedAt}
Views: ${metadata.viewCount}
Tags: ${metadata.tags}
Description: ${metadata.description}`;

    console.log(`[transcript] Got metadata for: "${metadata.title}"`);
    return { videoId, fullText, duration: metadata.duration, metadata };

  } catch (e) {
    console.warn(`Metadata fetch failed for ${videoId}:`, e.message);
    return { videoId, fullText: null, duration: null, metadata: null };
  }
}

module.exports = { fetchTranscript, extractVideoId };