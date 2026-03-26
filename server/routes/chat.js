const express = require("express");
const router = express.Router();
const { chatWithVideo } = require("../services/ai");

router.post("/", async (req, res) => {
  const { videoTitle, channel, context, history = [], question } = req.body;
  if (!question || !context) return res.status(400).json({ error: "question and context required" });

  try {
    const reply = await chatWithVideo({ videoTitle, channel, context, history, question });
    res.json({ success: true, reply });
  } catch (err) {
    console.error("[chat] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;