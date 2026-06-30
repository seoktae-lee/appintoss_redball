import { TEAMS, GROUPS, type MatchResult } from "../data/worldcup2026";
import { calcAllGroupStandings, getThirdPlaceTable, isTeamQualified } from "./standings";

export interface BingoCell {
  group: string;
  team1: string;
  team2: string;
  condition: string;
  status: "fulfilled" | "failed" | "pending";
}

export interface BingoData {
  cells: BingoCell[];
  fulfilledCount: number;
  totalCount: number;
  message: string;
}

function getTeamRank(matches: MatchResult[], teamCode: string): number {
  const standings = calcAllGroupStandings(matches);
  const third = getThirdPlaceTable(standings, matches);
  const result = isTeamQualified(standings, third, teamCode);
  if (result.groupPosition === 1 || result.groupPosition === 2) return 0;
  if (result.groupPosition === 4) return 99;
  return result.thirdPlaceRank ?? 50;
}

function getGroupThirdRank(matches: MatchResult[], group: string): number {
  const standings = calcAllGroupStandings(matches);
  const third = getThirdPlaceTable(standings, matches);
  const idx = third.findIndex(e => e.group === group);
  return idx === -1 ? 99 : idx + 1;
}

function getTeamGroup(teamCode: string): string {
  for (const [g, codes] of Object.entries(GROUPS)) {
    if (codes.includes(teamCode)) return g;
  }
  return "";
}

export function calcBingo(matches: MatchResult[], teamCode: string): BingoData {
  const teamName = TEAMS[teamCode]?.name || teamCode;
  const myGroup = getTeamGroup(teamCode);

  // 내 조를 제외한 나머지 그룹 중 9개로 3x3 빙고판 구성
  const BINGO_GROUPS = Object.keys(GROUPS).filter(g => g !== myGroup).slice(0, 9);
  const cells: BingoCell[] = [];
  const teamRank = getTeamRank(matches, teamCode);

  // 이미 조 1~2위로 자동 진출했거나 4위로 확정 탈락한 경우 빙고는 의미 없음
  const allStandings = calcAllGroupStandings(matches);
  const thirdTable = getThirdPlaceTable(allStandings, matches);
  const status = isTeamQualified(allStandings, thirdTable, teamCode);
  const myGroupMatches = matches.filter(m => m.group === myGroup);
  const myGroupFinished = myGroupMatches.length > 0 && myGroupMatches.every(m => m.status === "FINISHED");

  if (myGroupFinished && (status.groupPosition === 1 || status.groupPosition === 2)) {
    return { cells: [], fulfilledCount: 0, totalCount: 0, message: `${teamName} 조 ${status.groupPosition}위로 32강 자동 진출 확정!` };
  }
  if (myGroupFinished && status.groupPosition === 4) {
    return { cells: [], fulfilledCount: 0, totalCount: 0, message: `${teamName} 조 4위로 탈락이 확정됐어요.` };
  }

  for (const group of BINGO_GROUPS) {
    const groupMatches = matches.filter(m => m.group === group);
    const remaining = groupMatches.filter(m => m.status !== "FINISHED");
    const standings = calcAllGroupStandings(matches);
    const thirdTeam = standings[group]?.[2];

    if (!thirdTeam) continue;

    const thirdName = TEAMS[thirdTeam.team]?.name || thirdTeam.team;
    // 3위 팀 참여 경기 중 마지막(또는 남은) 경기
    const thirdMatches = groupMatches.filter(m => m.homeTeam === thirdTeam.team || m.awayTeam === thirdTeam.team);
    const remainingThird = thirdMatches.filter(m => m.status !== "FINISHED");
    const keyMatch = remainingThird.length > 0 ? remainingThird[0] : thirdMatches[thirdMatches.length - 1];

    if (!keyMatch) continue;

    const homeName = TEAMS[keyMatch.homeTeam]?.name || keyMatch.homeTeam;
    const awayName = TEAMS[keyMatch.awayTeam]?.name || keyMatch.awayTeam;

    if (remaining.length === 0) {
      // 종료된 조: 결과 판단
      const groupThirdRank = getGroupThirdRank(matches, group);
      const isFavorable = groupThirdRank > teamRank;

      cells.push({
        group,
        team1: keyMatch.homeTeam,
        team2: keyMatch.awayTeam,
        condition: isFavorable
          ? `${thirdName} 승점${thirdTeam.points} (${teamName} 아래)`
          : `${thirdName} 승점${thirdTeam.points} (${teamName} 위)`,
        status: isFavorable ? "fulfilled" : "failed",
      });
    } else {
      // 남은 경기: 구체적 조건 계산
      const SCORES: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
        [0, 0], [1, 1], [2, 2],
        [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [5, 0],
      ];

      const goodScores: { h: number; a: number }[] = [];
      const badScores: { h: number; a: number }[] = [];

      for (const [h, a] of SCORES) {
        const sim = matches.map(m =>
          m.id === keyMatch.id ? { ...m, homeScore: h, awayScore: a, status: "FINISHED" as const } : m
        );
        const simGroupThirdRank = getGroupThirdRank(sim, group);
        const simTeamRank = getTeamRank(sim, teamCode);

        if (simGroupThirdRank > simTeamRank) {
          goodScores.push({ h, a });
        } else {
          badScores.push({ h, a });
        }
      }

      // 조건 자연어 생성
      const homeWinGood = goodScores.filter(s => s.h > s.a);
      const drawGood = goodScores.filter(s => s.h === s.a);
      const awayWinGood = goodScores.filter(s => s.h < s.a);
      const homeWinBad = badScores.filter(s => s.h > s.a);
      const drawBad = badScores.filter(s => s.h === s.a);
      const awayWinBad = badScores.filter(s => s.h < s.a);

      const parts: string[] = [];

      // 홈 승리 분석
      if (homeWinGood.length > 0 && homeWinBad.length === 0) {
        parts.push(`${homeName} 승리`);
      } else if (homeWinGood.length > 0) {
        const maxGD = Math.max(...homeWinGood.map(s => s.h - s.a));
        parts.push(`${homeName} ${maxGD}골차 이내 승리`);
      }

      // 무승부
      if (drawGood.length > 0 && drawBad.length === 0) {
        parts.push("무승부");
      }

      // 어웨이 승리 분석
      if (awayWinGood.length > 0 && awayWinBad.length === 0) {
        parts.push(`${awayName} 승리`);
      } else if (awayWinGood.length > 0) {
        const maxGD = Math.max(...awayWinGood.map(s => s.a - s.h));
        parts.push(`${awayName} ${maxGD}골차 이내 승리`);
      }

      // 안되는 결과 표시
      const noParts: string[] = [];
      if (homeWinGood.length === 0 && homeWinBad.length > 0) noParts.push(`${homeName} 승리`);
      if (drawGood.length === 0 && drawBad.length > 0) noParts.push("무승부");
      if (awayWinGood.length === 0 && awayWinBad.length > 0) noParts.push(`${awayName} 승리`);

      let condition = parts.join(" 또는 ");
      if (noParts.length > 0 && noParts.length <= 2 && condition) {
        condition += ` (${noParts.join(", ")} 안됨)`;
      }
      if (!condition) condition = `${homeName} vs ${awayName}`;

      cells.push({
        group,
        team1: keyMatch.homeTeam,
        team2: keyMatch.awayTeam,
        condition,
        status: "pending",
      });
    }
  }

  const fulfilledCount = cells.filter(c => c.status === "fulfilled").length;
  const pendingCount = cells.filter(c => c.status === "pending").length;
  const needed = Math.max(0, 3 - fulfilledCount);

  let message: string;
  if (pendingCount === 0) {
    message = fulfilledCount >= 3 ? `조건 충족! ${teamName} 32강 진출!` : "아쉽지만 조건 미달...";
  } else if (needed === 0) {
    message = `이미 ${fulfilledCount}개 달성! 32강 유력!`;
  } else {
    message = `남은 ${pendingCount}경기 중 ${needed}개만 더!`;
  }

  return { cells, fulfilledCount, totalCount: cells.length, message };
}
