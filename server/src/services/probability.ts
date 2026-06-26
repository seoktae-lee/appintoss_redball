import { KOREA_CODE, type MatchResult } from "../data/worldcup2026";
import { getElo, eloToProbs } from "../data/elo-ratings";
import { calcAllGroupStandings, getThirdPlaceTable, isKoreaQualified } from "./standings";

// 현실적 스코어 분포 (가중치)
const HOME_WIN_SCORES: [number, number, number][] = [
  [1, 0, 30], [2, 0, 14], [2, 1, 20], [3, 0, 5], [3, 1, 8], [3, 2, 4], [4, 0, 2], [4, 1, 2],
];
const DRAW_SCORES: [number, number, number][] = [
  [0, 0, 35], [1, 1, 40], [2, 2, 15], [3, 3, 3],
];
const AWAY_WIN_SCORES: [number, number, number][] = [
  [0, 1, 30], [0, 2, 14], [1, 2, 20], [0, 3, 5], [1, 3, 8], [2, 3, 4], [0, 4, 2], [1, 4, 2],
];

function normalizeWeights(scores: [number, number, number][]): [number, number, number][] {
  const total = scores.reduce((s, r) => s + r[2], 0);
  return scores.map(([h, a, w]) => [h, a, w / total]);
}

const HW = normalizeWeights(HOME_WIN_SCORES);
const DW = normalizeWeights(DRAW_SCORES);
const AW = normalizeWeights(AWAY_WIN_SCORES);

function pickScore(match: MatchResult): [number, number] {
  const probs = eloToProbs(getElo(match.homeTeam), getElo(match.awayTeam));

  const r = Math.random();
  let pool: [number, number, number][];
  if (r < probs.homeWin) pool = HW;
  else if (r < probs.homeWin + probs.draw) pool = DW;
  else pool = AW;

  const r2 = Math.random();
  let cumulative = 0;
  for (const [h, a, w] of pool) {
    cumulative += w;
    if (r2 <= cumulative) return [h, a];
  }
  return [pool[0][0], pool[0][1]];
}

export function calcQualificationProbability(matches: MatchResult[]): {
  probability: number;
  totalCombinations: number;
  qualifyCombinations: number;
  koreaPosition: number;
} {
  const remaining = matches.filter(m => m.status !== "FINISHED");

  if (remaining.length === 0) {
    const allStandings = calcAllGroupStandings(matches);
    const thirdTable = getThirdPlaceTable(allStandings, matches);
    const result = isKoreaQualified(thirdTable);
    return {
      probability: result.qualified ? 100 : 0,
      totalCombinations: 1,
      qualifyCombinations: result.qualified ? 1 : 0,
      koreaPosition: result.position,
    };
  }

  const SAMPLE_SIZE = remaining.length <= 6 ? 50000 : 20000;

  let qualify = 0;
  let positionSum = 0;

  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const simMatches = matches.map(m => {
      if (m.status === "FINISHED") return m;
      const [h, a] = pickScore(m);
      return { ...m, homeScore: h, awayScore: a, status: "FINISHED" as const };
    });

    const allStandings = calcAllGroupStandings(simMatches);
    const thirdTable = getThirdPlaceTable(allStandings, simMatches);
    const result = isKoreaQualified(thirdTable);

    if (result.qualified) qualify++;
    positionSum += result.position;
  }

  const avgPosition = Math.round(positionSum / SAMPLE_SIZE);

  return {
    probability: Math.round((qualify / SAMPLE_SIZE) * 100),
    totalCombinations: SAMPLE_SIZE,
    qualifyCombinations: qualify,
    koreaPosition: avgPosition,
  };
}
