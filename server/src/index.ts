import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import worldcupRouter from "./routes/worldcup";
import { loadMatches, saveMatches } from "./db";
import ALL_MATCHES from "./data/init-matches";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/worldcup", worldcupRouter);

app.get("/health", (_req, res) => res.json({ status: "ok", app: "redball" }));

// 초기 데이터 로드
const existing = loadMatches();
if (existing.length === 0) {
  saveMatches(ALL_MATCHES);
  console.log(`Initialized ${ALL_MATCHES.length} matches`);
}

app.listen(PORT, () => {
  console.log(`RedBall server running on port ${PORT}`);
});
