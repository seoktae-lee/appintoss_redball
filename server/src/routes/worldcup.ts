import { Router, Request, Response } from "express";
import { TEAMS, GROUPS } from "../data/worldcup2026";
import { fetchMatches } from "../services/football-api";
import { calcAllGroupStandings, getThirdPlaceTable, isTeamQualified } from "../services/standings";
import { calcQualificationProbability } from "../services/probability";
import { calcScenarios } from "../services/scenarios";
import { calcBingo } from "../services/bingo";
import { calcTournamentOdds, getNextMatchScenario } from "../services/tournament";
import { syncBracketFromAPI, applyBracketMatchResult } from "../services/bracketSync";
import { calcKnockoutWatchPoint } from "../services/knockoutScenarios";
import { calcAccuracy, calcLeaderboard } from "../services/leaderboard";
import { loadMatches, saveCachedProbability, loadCachedProbability, loadBracket, saveBracket, loadCachedTournamentOdds, saveCachedTournamentOdds, getUserPrediction, saveUserPrediction } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

function getMatches() {
  return loadMatches();
}

function getTeamGroup(teamCode: string): string {
  for (const [g, codes] of Object.entries(GROUPS)) {
    if (codes.includes(teamCode)) return g;
  }
  return "";
}

// 전체 데이터 한 번에 (프론트엔드용) — ?team=KOR 형태로 응원팀 지정
router.get("/data", async (req, res) => {
  try {
    const teamCode = ((req.query.team as string) || "KOR").toUpperCase();
    if (!TEAMS[teamCode]) {
      res.status(400).json({ error: "존재하지 않는 팀 코드예요." });
      return;
    }

    let matches = await fetchMatches();
    if (!matches || matches.length === 0) {
      matches = getMatches();
    }

    const allStandings = calcAllGroupStandings(matches);
    const thirdPlaceTable = getThirdPlaceTable(allStandings, matches);
    const teamStatus = isTeamQualified(allStandings, thirdPlaceTable, teamCode);

    let cached = loadCachedProbability(teamCode);
    if (!cached || Date.now() - new Date(cached.calculatedAt).getTime() > 5 * 60_000) {
      const prob = calcQualificationProbability(matches, teamCode);
      cached = {
        probability: prob.probability,
        groupPosition: prob.groupPosition,
        thirdPlaceRank: prob.thirdPlaceRank,
        calculatedAt: new Date().toISOString(),
      };
      saveCachedProbability(teamCode, cached);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayMatches = matches.filter(m => m.date.slice(0, 10) === todayStr);

    const scenarios = calcScenarios(matches, teamCode);
    const bingo = calcBingo(matches, teamCode);

    res.json({
      teams: TEAMS,
      groups: GROUPS,
      matches,
      allStandings,
      thirdPlaceTable,
      teamStatus: {
        qualified: teamStatus.qualified,
        position: teamStatus.thirdPlaceRank ?? (teamStatus.groupPosition <= 2 ? 0 : -1),
        groupPosition: teamStatus.groupPosition,
        group: getTeamGroup(teamCode),
        code: teamCode,
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

// 팀 선택용 전체 팀/조 목록
router.get("/teams", (_req, res) => {
  res.json({ teams: TEAMS, groups: GROUPS });
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

// ── 노크아웃 브라켓 ──

// 전체 브라켓 조회 — 32강 이후 결과를 외부 API에서 자동 동기화한 뒤 응답
router.get("/bracket", async (_req: Request, res: Response) => {
  await syncBracketFromAPI();
  const bracket = loadBracket();
  const bracketWithInsight = bracket.map(m => ({
    ...m,
    watchPoint: m.homeTeam && m.awayTeam ? calcKnockoutWatchPoint(m, m.homeTeam, m.awayTeam) : undefined,
  }));
  res.json({ bracket: bracketWithInsight, teams: TEAMS });
});

// 어드민: 브라켓 경기 결과 수동 입력 (API 연동 전이거나 결과 보정용)
router.post("/admin/bracket-match", (req: Request, res: Response): void => {
  const { id, homeTeam, awayTeam, homeScore, awayScore, status } = req.body;
  const bracket = loadBracket();
  const applied = applyBracketMatchResult(bracket, id, { homeTeam, awayTeam, homeScore, awayScore, status });
  if (!applied) { res.status(404).json({ error: "경기를 찾을 수 없음" }); return; }

  saveBracket(bracket);
  if (status === "FINISHED") {
    saveCachedTournamentOdds({ odds: [], calculatedAt: "0" }); // 캐시 무효화
  }
  res.json({ ok: true });
});

// 토너먼트 우승 확률 (5분 캐시)
router.get("/tournament-odds", async (_req: Request, res: Response) => {
  await syncBracketFromAPI();
  const cached = loadCachedTournamentOdds();
  if (cached && cached.calculatedAt !== "0" && Date.now() - new Date(cached.calculatedAt).getTime() < 5 * 60_000) {
    return res.json({ odds: cached.odds, teams: TEAMS, calculatedAt: cached.calculatedAt });
  }
  const bracket = loadBracket();
  const odds = calcTournamentOdds(bracket, 20000);
  const now = new Date().toISOString();
  saveCachedTournamentOdds({ odds, calculatedAt: now });
  res.json({ odds, teams: TEAMS, calculatedAt: now });
});

// "경우의 수" — 내 팀이 다음 라운드에서 만날 수 있는 상대 + 우승까지의 시뮬레이션 경로
router.get("/path", async (req: Request, res: Response): Promise<void> => {
  const teamCode = ((req.query.team as string) || "").toUpperCase();
  if (!TEAMS[teamCode]) { res.status(400).json({ error: "존재하지 않는 팀 코드예요." }); return; }

  await syncBracketFromAPI();
  const bracket = loadBracket();
  const scenario = getNextMatchScenario(bracket, teamCode);
  const odds = calcTournamentOdds(bracket, 20000);
  const myOdds = odds.find(o => o.teamCode === teamCode) || null;

  res.json({ teams: TEAMS, scenario, odds: myOdds, samples: 20000 });
});

// ── 유저 예측 ──

// 내 예측 조회
router.get("/predict", authMiddleware, (req: AuthRequest, res: Response) => {
  const predictions = getUserPrediction(req.userId!);
  const bracket = loadBracket();
  const { correct, total } = calcAccuracy(predictions, bracket);
  res.json({ predictions, correctCount: correct, totalCount: total });
});

// 예측 랭킹 — 정답률 기준 상위 유저 + 내 순위
router.get("/predict/leaderboard", authMiddleware, (req: AuthRequest, res: Response) => {
  const bracket = loadBracket();
  const ranked = calcLeaderboard(bracket);
  const me = ranked.find(e => e.userId === req.userId) || null;
  res.json({ top: ranked.slice(0, 50), me, totalParticipants: ranked.length });
});

// 예측 저장/수정
router.post("/predict", authMiddleware, (req: AuthRequest, res: Response): void => {
  const { matchId, teamCode } = req.body as { matchId: string; teamCode: string };
  if (!matchId || !teamCode) { res.status(400).json({ error: "matchId, teamCode 필요" }); return; }

  const bracket = loadBracket();
  const match = bracket.find(m => m.id === matchId);
  if (!match) { res.status(404).json({ error: "경기를 찾을 수 없음" }); return; }
  if (match.status === "FINISHED") { res.status(400).json({ error: "이미 종료된 경기는 예측할 수 없어요" }); return; }
  if (!TEAMS[teamCode]) { res.status(400).json({ error: "올바른 팀 코드가 아니에요" }); return; }

  const current = getUserPrediction(req.userId!);
  current[matchId] = teamCode;
  saveUserPrediction(req.userId!, current);
  res.json({ ok: true });
});

export default router;
