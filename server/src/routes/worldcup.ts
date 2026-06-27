import { Router } from "express";
import { TEAMS, GROUPS, KOREA_CODE, KOREA_GROUP } from "../data/worldcup2026";
import { fetchMatches } from "../services/football-api";
import { calcAllGroupStandings, getThirdPlaceTable, isKoreaQualified } from "../services/standings";
import { calcQualificationProbability } from "../services/probability";
import { calcScenarios } from "../services/scenarios";
import { calcBingo } from "../services/bingo";
import { loadMatches, saveCachedProbability, loadCachedProbability } from "../db";

const router = Router();

function getMatches() {
  return loadMatches();
}

// 전체 데이터 한 번에 (프론트엔드용)
router.get("/data", async (_req, res) => {
  try {
    let matches = await fetchMatches();
    if (!matches || matches.length === 0) {
      matches = getMatches();
    }

    const allStandings = calcAllGroupStandings(matches);
    const thirdPlaceTable = getThirdPlaceTable(allStandings, matches);
    const koreaStatus = isKoreaQualified(thirdPlaceTable);

    let cached = loadCachedProbability();
    if (!cached || Date.now() - new Date(cached.calculatedAt).getTime() > 5 * 60_000) {
      const prob = calcQualificationProbability(matches);
      cached = {
        probability: prob.probability,
        koreaPosition: prob.koreaPosition,
        calculatedAt: new Date().toISOString(),
      };
      saveCachedProbability(cached);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayMatches = matches.filter(m => m.date.slice(0, 10) === todayStr);

    const scenarios = calcScenarios(matches);
    const bingo = calcBingo(matches);

    res.json({
      teams: TEAMS,
      groups: GROUPS,
      matches,
      allStandings,
      thirdPlaceTable,
      koreaStatus: {
        ...koreaStatus,
        group: KOREA_GROUP,
        code: KOREA_CODE,
      },
      probability: cached.probability,
      scenarios,
      bingo,
      todayMatches,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("worldcup data error:", err);
    res.status(500).json({ error: "데이터 로드 실패" });
  }
});

// 날짜별 경기
router.get("/matches", async (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  let matches = await fetchMatches();
  if (!matches || matches.length === 0) matches = getMatches();

  const filtered = matches.filter(m => m.date.slice(0, 10) === date);
  res.json({ date, matches: filtered });
});

// 어드민: 경기 결과 수동 입력/수정
router.post("/admin/match", (req, res) => {
  const { id, homeScore, awayScore, status } = req.body;
  const matches = getMatches();
  const idx = matches.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "경기를 찾을 수 없음" });

  if (homeScore !== undefined) matches[idx].homeScore = homeScore;
  if (awayScore !== undefined) matches[idx].awayScore = awayScore;
  if (status) matches[idx].status = status;

  const { saveMatches } = require("../db");
  saveMatches(matches);
  res.json({ ok: true, match: matches[idx] });
});

// 어드민: 전체 경기 데이터 초기화
router.post("/admin/init-matches", (req, res) => {
  const { matches } = req.body;
  if (!Array.isArray(matches)) return res.status(400).json({ error: "matches 배열 필수" });
  const { saveMatches } = require("../db");
  saveMatches(matches);
  res.json({ ok: true, count: matches.length });
});

export default router;
