import { GROUPS, type MatchResult, type GroupStanding, type ThirdPlaceEntry } from "../data/worldcup2026";

export function calcGroupStandings(matches: MatchResult[], group: string): GroupStanding[] {
  const teamCodes = GROUPS[group];
  if (!teamCodes) return [];

  const map: Record<string, GroupStanding> = {};
  for (const code of teamCodes) {
    map[code] = { team: code, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, position: 0 };
  }

  const groupMatches = matches.filter(m => m.group === group && m.status === "FINISHED");
  for (const m of groupMatches) {
    if (m.homeScore === null || m.awayScore === null) continue;
    const h = map[m.homeTeam];
    const a = map[m.awayTeam];
    if (!h || !a) continue;

    h.played++;
    a.played++;
    h.goalsFor += m.homeScore;
    h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore;
    a.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      h.won++; h.points += 3;
      a.lost++;
    } else if (m.homeScore < m.awayScore) {
      a.won++; a.points += 3;
      h.lost++;
    } else {
      h.draw++; h.points += 1;
      a.draw++; a.points += 1;
    }
  }

  const standings = Object.values(map);
  for (const s of standings) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
  });

  standings.forEach((s, i) => s.position = i + 1);
  return standings;
}

export function calcAllGroupStandings(matches: MatchResult[]): Record<string, GroupStanding[]> {
  const result: Record<string, GroupStanding[]> = {};
  for (const group of Object.keys(GROUPS)) {
    result[group] = calcGroupStandings(matches, group);
  }
  return result;
}

export function getThirdPlaceTable(allStandings: Record<string, GroupStanding[]>, matches: MatchResult[]): ThirdPlaceEntry[] {
  const thirds: ThirdPlaceEntry[] = [];

  for (const [group, standings] of Object.entries(allStandings)) {
    const third = standings.find(s => s.position === 3);
    if (!third) continue;

    const groupMatches = matches.filter(m => m.group === group);
    const totalMatchesInGroup = groupMatches.length;
    const finishedMatches = groupMatches.filter(m => m.status === "FINISHED").length;
    const status = finishedMatches >= totalMatchesInGroup ? "FINISHED" : "IN_PROGRESS";

    thirds.push({
      team: third.team,
      group,
      points: third.points,
      goalDifference: third.goalDifference,
      goalsFor: third.goalsFor,
      status: status as "FINISHED" | "IN_PROGRESS",
    });
  }

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
  });

  return thirds;
}

/**
 * 팀의 32강 진출 여부를 정확하게 판정.
 * 조 1~2위는 무조건 자동 진출, 3위는 전체 3위팀 중 상위 8개만 진출, 4위는 탈락.
 * (3위팀 비교표에 없다는 이유만으로 "탈락"으로 잘못 판정하지 않도록 조 순위를 먼저 확인한다)
 */
export function isTeamQualified(
  allStandings: Record<string, GroupStanding[]>,
  thirdPlaceTable: ThirdPlaceEntry[],
  teamCode: string
): { qualified: boolean; groupPosition: number; thirdPlaceRank: number | null; group: string } {
  let group = "";
  let groupPosition = 0;

  for (const [g, standings] of Object.entries(allStandings)) {
    const entry = standings.find(s => s.team === teamCode);
    if (entry) {
      group = g;
      groupPosition = entry.position;
      break;
    }
  }

  if (groupPosition === 1 || groupPosition === 2) {
    return { qualified: true, groupPosition, thirdPlaceRank: null, group };
  }

  if (groupPosition === 3) {
    const idx = thirdPlaceTable.findIndex(e => e.team === teamCode);
    const thirdPlaceRank = idx === -1 ? null : idx + 1;
    return { qualified: thirdPlaceRank !== null && thirdPlaceRank <= 8, groupPosition, thirdPlaceRank, group };
  }

  // groupPosition === 4 (또는 팀을 찾지 못함)
  return { qualified: false, groupPosition, thirdPlaceRank: null, group };
}
