import { KOREA_CODE, type MatchResult } from "../data/worldcup2026";
import { calcAllGroupStandings, getThirdPlaceTable, isKoreaQualified } from "./standings";

const REALISTIC_SCORES: [number, number, number][] = [
  // [homeScore, awayScore, weight(확률가중치)]
  [1, 0, 18], [2, 0, 8], [2, 1, 12], [3, 0, 3], [3, 1, 5], [3, 2, 3], [4, 0, 1], [4, 1, 1],
  [0, 0, 12], [1, 1, 15], [2, 2, 5], [3, 3, 1],
  [0, 1, 18], [0, 2, 8], [1, 2, 12], [0, 3, 3], [1, 3, 5], [2, 3, 3], [0, 4, 1], [1, 4, 1],
];

const TOTAL_WEIGHT = REALISTIC_SCORES.reduce((s, r) => s + r[2], 0);

function pickWeightedScore(): [number, number] {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const [h, a, w] of REALISTIC_SCORES) {
    r -= w;
    if (r <= 0) return [h, a];
  }
  return [1, 0];
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
      const [h, a] = pickWeightedScore();
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
