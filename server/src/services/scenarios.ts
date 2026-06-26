import { TEAMS, KOREA_CODE, type MatchResult } from "../data/worldcup2026";
import { calcAllGroupStandings, getThirdPlaceTable } from "./standings";

export interface Scenario {
  group: string;
  match: { home: string; away: string; date: string; status: string };
  conditions: string[];
  impact: "must_watch" | "helpful" | "dangerous";
}

const SCORES: [number, number][] = [
  [1, 0], [2, 0], [2, 1], [3, 0],
  [0, 0], [1, 1],
  [0, 1], [0, 2], [1, 2], [0, 3],
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

  // 같은 조 경기를 그룹핑
  const groupedRemaining: Record<string, MatchResult[]> = {};
  for (const m of remaining) {
    if (!groupedRemaining[m.group]) groupedRemaining[m.group] = [];
    groupedRemaining[m.group].push(m);
  }

  const currentRank = getKoreaRank(matches);
  const scenarios: Scenario[] = [];

  for (const match of remaining) {
    const homeName = TEAMS[match.homeTeam]?.name || match.homeTeam;
    const awayName = TEAMS[match.awayTeam]?.name || match.awayTeam;

    // 같은 조 다른 경기도 함께 시뮬레이션
    const sameGroupMatches = (groupedRemaining[match.group] || []).filter(m => m.id !== match.id);

    const allRanks: number[] = [];
    const homeWinRanks: number[] = [];
    const drawRanks: number[] = [];
    const awayWinRanks: number[] = [];

    const pairScores = sameGroupMatches.length > 0 ? SCORES : [[null, null] as [null, null]];

    for (const [h, a] of SCORES) {
      for (const [ph, pa] of pairScores) {
        const sim = matches.map(m => {
          if (m.id === match.id) return { ...m, homeScore: h, awayScore: a, status: "FINISHED" as const };
          if (ph !== null && sameGroupMatches.some(sm => sm.id === m.id)) {
            return { ...m, homeScore: ph, awayScore: pa, status: "FINISHED" as const };
          }
          return m;
        });
        const rank = getKoreaRank(sim);
        allRanks.push(rank);
        if (h > a) homeWinRanks.push(rank);
        else if (h === a) drawRanks.push(rank);
        else awayWinRanks.push(rank);
      }
    }

    const uniqueRanks = [...new Set(allRanks)];
    if (uniqueRanks.length === 1 && uniqueRanks[0] === currentRank) {
      scenarios.push({
        group: match.group,
        match: { home: match.homeTeam, away: match.awayTeam, date: match.date, status: match.status },
        conditions: [`어떤 결과든 한국 순위 변동 없음 (${currentRank}위 유지)`],
        impact: "helpful",
      });
      continue;
    }

    const bestRank = Math.min(...allRanks);
    const worstRank = Math.max(...allRanks);
    const conditions: string[] = [];

    // 홈 승리
    if (homeWinRanks.length > 0) {
      const best = Math.min(...homeWinRanks);
      const worst = Math.max(...homeWinRanks);
      if (worst <= 8 && best < currentRank) {
        conditions.push(`✅ ${homeName} 승리 → 한국 ${best}위로 상승`);
      } else if (worst <= 8) {
        conditions.push(`✅ ${homeName} 승리 → 한국 진출 유지`);
      } else if (best <= 8) {
        conditions.push(`⚠️ ${homeName} 승리 시 다른 경기 결과에 따라 다름`);
      } else {
        conditions.push(`❌ ${homeName} 승리 시 불리 (한국 최대 ${worst}위)`);
      }
    }

    // 무승부
    if (drawRanks.length > 0) {
      const best = Math.min(...drawRanks);
      const worst = Math.max(...drawRanks);
      if (worst <= 8 && best < currentRank) {
        conditions.push(`✅ 무승부 → 한국 ${best}위로 상승`);
      } else if (worst <= 8) {
        conditions.push(`✅ 무승부 → 한국 진출 유지`);
      } else if (best <= 8) {
        conditions.push(`⚠️ 무승부 시 다른 경기 결과에 따라 다름`);
      } else {
        conditions.push(`❌ 무승부 시 불리 (한국 최대 ${worst}위)`);
      }
    }

    // 원정 승리
    if (awayWinRanks.length > 0) {
      const best = Math.min(...awayWinRanks);
      const worst = Math.max(...awayWinRanks);
      if (worst <= 8 && best < currentRank) {
        conditions.push(`✅ ${awayName} 승리 → 한국 ${best}위로 상승`);
      } else if (worst <= 8) {
        conditions.push(`✅ ${awayName} 승리 → 한국 진출 유지`);
      } else if (best <= 8) {
        conditions.push(`⚠️ ${awayName} 승리 시 다른 경기 결과에 따라 다름`);
      } else {
        conditions.push(`❌ ${awayName} 승리 시 불리 (한국 최대 ${worst}위)`);
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
