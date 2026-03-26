require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");

const { router: analyzeRouter } = require("./routes/analyze");
const chatRouter = require("./routes/chat");
const historyRouter = require("./routes/history");
const quizRouter = require("./routes/quiz");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/analyze", analyzeRouter);
app.use("/api/chat", chatRouter);
app.use("/api/history", historyRouter);
app.use("/api/quiz", quizRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🧠 VidBrain server → http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.GROQ_API_KEY ? "✓ loaded" : "✗ MISSING"}\n`);
});