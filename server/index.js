require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const { initDB } = require("./services/db");

const { router: analyzeRouter } = require("./routes/analyze");
const chatRouter = require("./routes/chat");
const historyRouter = require("./routes/history");
const quizRouter = require("./routes/quiz");
const compareRouter = require("./routes/compare");
const tutorRouter = require("./routes/tutor");
const conceptRouter = require("./routes/concept");
const highlightsRouter = require("./routes/highlights");
const dashboardRouter = require("./routes/dashboard");
const notesRouter = require("./routes/notes");
const communityRouter = require("./routes/community");
const collectionsRouter = require("./routes/collections");
const groupsRouter = require("./routes/groups");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vidbrains.netlify.app",
    "https://vidbrains.vercel.app",
    /\.netlify\.app$/,
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

app.use(express.json());

app.use("/api/analyze", analyzeRouter);
app.use("/api/chat", chatRouter);
app.use("/api/history", historyRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/compare", compareRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api/concept", conceptRouter);
app.use("/api/highlights", highlightsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notes", notesRouter);
app.use("/api/community", communityRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/groups", groupsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🧠 VidBrain server → http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.GROQ_API_KEY ? "✓ loaded" : "✗ MISSING"}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? "✓ connected" : "✗ MISSING"}\n`);
});
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const { initDB } = require("./services/db");

const { router: analyzeRouter } = require("./routes/analyze");
const chatRouter = require("./routes/chat");
const historyRouter = require("./routes/history");
const quizRouter = require("./routes/quiz");
const compareRouter = require("./routes/compare");
const tutorRouter = require("./routes/tutor");
const conceptRouter = require("./routes/concept");
const highlightsRouter = require("./routes/highlights");
const dashboardRouter = require("./routes/dashboard");
const notesRouter = require("./routes/notes");
const communityRouter = require("./routes/community");
const collectionsRouter = require("./routes/collections");
const groupsRouter = require("./routes/groups");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vidbrains.netlify.app",
    "https://vidbrains.vercel.app",
    /\.netlify\.app$/,
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/chat", chatRouter);
app.use("/api/history", historyRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/compare", compareRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api/concept", conceptRouter);
app.use("/api/highlights", highlightsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notes", notesRouter);
app.use("/api/community", communityRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/groups", groupsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🧠 VidBrain server → http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.GROQ_API_KEY ? "✓ loaded" : "✗ MISSING"}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? "✓ connected" : "✗ MISSING"}\n`);
});

initDB().catch((e) => console.error("[db] init error:", e.message));
initDB().catch((e) => console.error("[db] init error:", e.message));