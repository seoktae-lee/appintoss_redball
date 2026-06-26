import { TEAMS, KOREA_CODE, type MatchResult } from "../data/worldcup2026";
import { calcAllGroupStandings, getThirdPlaceTable } from "./standings";
import { getElo, eloToProbs } from "../data/elo-ratings";

export interface Scenario {
  group: string;
  match: { home: string; away: string; date: string; status: string };
  conditions: string[];
  probabilities?: { homeWin: number; draw: number; awayWin: number };
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

    const conditions: string[] = [];

    function describeOutcome(name: string, ranks: number[]): string {
      if (ranks.length === 0) return "";
      const best = Math.min(...ranks);
      const worst = Math.max(...ranks);
      const rankStr = best === worst ? `${best}위` : `${best}~${worst}위`;

      if (worst > 8) {
        if (best > 8) return `❌ ${name} → 한국 ${rankStr} (진출 위험)`;
        return `⚠️ ${name} → 한국 ${rankStr} (결과에 따라 탈락 가능)`;
      }
      if (best < currentRank) return `✅ ${name} → 한국 ${rankStr} (유리)`;
      if (worst > currentRank) return `⚠️ ${name} → 한국 ${rankStr}`;
      return `✅ ${name} → 한국 ${rankStr} 유지`;
    }

    const homeDesc = describeOutcome(`${homeName} 승리`, homeWinRanks);
    const drawDesc = describeOutcome("무승부", drawRanks);
    const awayDesc = describeOutcome(`${awayName} 승리`, awayWinRanks);

    if (homeDesc) conditions.push(homeDesc);
    if (drawDesc) conditions.push(drawDesc);
    if (awayDesc) conditions.push(awayDesc);

    // 가장 유리한 결과 표시
    const allResults = [
      { label: `${homeName} 승리`, best: homeWinRanks.length > 0 ? Math.min(...homeWinRanks) : 99 },
      { label: "무승부", best: drawRanks.length > 0 ? Math.min(...drawRanks) : 99 },
      { label: `${awayName} 승리`, best: awayWinRanks.length > 0 ? Math.min(...awayWinRanks) : 99 },
    ];
    const bestResult = allResults.reduce((a, b) => a.best <= b.best ? a : b);
    const worstResult = allResults.reduce((a, b) => a.best >= b.best ? a : b);
    if (bestResult.best !== worstResult.best) {
      conditions.push(`💡 ${bestResult.label}가 한국에 가장 유리`);
    }

    if (conditions.length === 0) continue;

    const hasDanger = conditions.some(c => c.startsWith("❌") || c.startsWith("⚠️"));
    const hasGood = conditions.some(c => c.startsWith("✅"));
    const impact = hasDanger && hasGood ? "must_watch" as const
      : hasDanger ? "dangerous" as const
      : "helpful" as const;

    const probs = eloToProbs(getElo(match.homeTeam), getElo(match.awayTeam));

    scenarios.push({
      group: match.group,
      match: { home: match.homeTeam, away: match.awayTeam, date: match.date, status: match.status },
      conditions,
      probabilities: {
        homeWin: Math.round(probs.homeWin * 100),
        draw: Math.round(probs.draw * 100),
        awayWin: Math.round(probs.awayWin * 100),
      },
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
