const express = require("express");
const router = express.Router();

let analyses = [];

router.get("/", (req, res) => {
  res.json({ success: true, data: analyses.slice(-20).reverse() });
});

router.post("/", (req, res) => {
  const { title, url, thumbnail, channel, duration } = req.body;
  const entry = { id: Date.now().toString(), title, url, thumbnail, channel, duration, savedAt: new Date().toISOString() };
  analyses.push(entry);
  if (analyses.length > 100) analyses = analyses.slice(-100);
  res.json({ success: true, data: entry });
});

router.delete("/:id", (req, res) => {
  analyses = analyses.filter((a) => a.id !== req.params.id);
  res.json({ success: true });
});

module.exports = router;