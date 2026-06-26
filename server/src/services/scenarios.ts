import { TEAMS, KOREA_CODE, type MatchResult } from "../data/worldcup2026";
import { calcAllGroupStandings, getThirdPlaceTable } from "./standings";

export interface Scenario {
  group: string;
  match: { home: string; away: string; date: string; status: string };
  conditions: string[];
  impact: "must_watch" | "helpful" | "dangerous";
}

const SCORES: [number, number][] = [
  [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [5, 0],
  [0, 0], [1, 1], [2, 2],
  [0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [0, 5],
];

function getKoreaRank(matches: MatchResult[]): number {
  const standings = calcAllGroupStandings(matches);
  const third = getThirdPlaceTable(standings, matches);
  const idx = third.findIndex(e => e.team === KOREA_CODE);
  return idx === -1 ? 99 : idx + 1;
}

export function calcScenarios(matches: MatchResult[]): Scenario[] {
  const remaining = matches.filter(m => m.status !== "FINISHED");
  if (remaining.length === 0) return [];

  const currentRank = getKoreaRank(matches);
  const scenarios: Scenario[] = [];

  for (const match of remaining) {
    const homeName = TEAMS[match.homeTeam]?.name || match.homeTeam;
    const awayName = TEAMS[match.awayTeam]?.name || match.awayTeam;

    type SimResult = { h: number; a: number; rank: number };
    const sims: SimResult[] = [];

    for (const [h, a] of SCORES) {
      const sim = matches.map(m =>
        m.id === match.id ? { ...m, homeScore: h, awayScore: a, status: "FINISHED" as const } : m
      );
      sims.push({ h, a, rank: getKoreaRank(sim) });
    }

    const allSame = sims.every(s => s.rank === sims[0].rank);
    if (allSame) continue;

    const homeWins = sims.filter(s => s.h > s.a);
    const draws = sims.filter(s => s.h === s.a);
    const awayWins = sims.filter(s => s.h < s.a);

    const bestRank = Math.min(...sims.map(s => s.rank));
    const worstRank = Math.max(...sims.map(s => s.rank));

    const conditions: string[] = [];

    const bestHomeRank = homeWins.length > 0 ? Math.min(...homeWins.map(s => s.rank)) : currentRank;
    const worstHomeRank = homeWins.length > 0 ? Math.max(...homeWins.map(s => s.rank)) : currentRank;
    const bestDrawRank = draws.length > 0 ? Math.min(...draws.map(s => s.rank)) : currentRank;
    const worstDrawRank = draws.length > 0 ? Math.max(...draws.map(s => s.rank)) : currentRank;
    const bestAwayRank = awayWins.length > 0 ? Math.min(...awayWins.map(s => s.rank)) : currentRank;
    const worstAwayRank = awayWins.length > 0 ? Math.max(...awayWins.map(s => s.rank)) : currentRank;

    // 홈 승리 분석
    if (homeWins.length > 0) {
      if (worstHomeRank <= 8 && bestHomeRank < currentRank) {
        conditions.push(`✅ ${homeName} 승리 → 한국 ${bestHomeRank}위로 상승`);
      } else if (worstHomeRank <= 8) {
        conditions.push(`✅ ${homeName} 승리 → 한국 진출 유지`);
      } else if (bestHomeRank <= 8) {
        const goodOnes = homeWins.filter(s => s.rank <= 8);
        const badOnes = homeWins.filter(s => s.rank > 8);
        const maxGoodGD = Math.max(...goodOnes.map(s => s.h - s.a));
        const minBadGD = Math.min(...badOnes.map(s => s.h - s.a));
        if (maxGoodGD < minBadGD) {
          conditions.push(`⚠️ ${homeName} ${maxGoodGD}골차 이내 승리만 유리 (${minBadGD}골차 이상 대승 시 불리)`);
        } else {
          conditions.push(`⚠️ ${homeName} 승리 시 스코어에 따라 다름`);
        }
      } else {
        conditions.push(`❌ ${homeName} 승리 시 불리 (한국 ${worstHomeRank}위로 하락)`);
      }
    }

    // 무승부 분석
    if (draws.length > 0) {
      if (worstDrawRank <= 8 && bestDrawRank < currentRank) {
        conditions.push(`✅ 무승부 → 한국 ${bestDrawRank}위로 상승`);
      } else if (worstDrawRank <= 8) {
        conditions.push(`✅ 무승부 → 한국 진출 유지`);
      } else {
        conditions.push(`❌ 무승부 시 불리 (한국 ${worstDrawRank}위로 하락)`);
      }
    }

    // 원정 승리 분석
    if (awayWins.length > 0) {
      if (worstAwayRank <= 8 && bestAwayRank < currentRank) {
        conditions.push(`✅ ${awayName} 승리 → 한국 ${bestAwayRank}위로 상승`);
      } else if (worstAwayRank <= 8) {
        conditions.push(`✅ ${awayName} 승리 → 한국 진출 유지`);
      } else if (bestAwayRank <= 8) {
        const goodOnes = awayWins.filter(s => s.rank <= 8);
        const badOnes = awayWins.filter(s => s.rank > 8);
        const maxGoodGD = Math.max(...goodOnes.map(s => s.a - s.h));
        const minBadGD = Math.min(...badOnes.map(s => s.a - s.h));
        if (maxGoodGD < minBadGD) {
          conditions.push(`⚠️ ${awayName} ${maxGoodGD}골차 이내 승리만 유리 (${minBadGD}골차 이상 대승 시 불리)`);
        } else {
          conditions.push(`⚠️ ${awayName} 승리 시 스코어에 따라 다름`);
        }
      } else {
        conditions.push(`❌ ${awayName} 승리 시 불리 (한국 ${worstAwayRank}위로 하락)`);
      }
    }

    if (conditions.length === 0) continue;

    const hasDanger = conditions.some(c => c.startsWith("❌") || c.startsWith("⚠️"));
    const hasGood = conditions.some(c => c.startsWith("✅"));
    const impact = hasDanger && hasGood ? "must_watch" as const
      : hasDanger ? "dangerous" as const
      : "helpful" as const;

    scenarios.push({
      group: match.group,
      match: { home: match.homeTeam, away: match.awayTeam, date: match.date, status: match.status },
      conditions,
      impact,
    });
  }

  scenarios.sort((a, b) => {
    const order = { must_watch: 0, dangerous: 1, helpful: 2 };
    if (order[a.impact] !== order[b.impact]) return order[a.impact] - order[b.impact];
    return new Date(a.match.date).getTime() - new Date(b.match.date).getTime();
  });

  return scenarios;
}
