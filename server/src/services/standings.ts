import { GROUPS, TEAMS, KOREA_CODE, type MatchResult, type GroupStanding, type ThirdPlaceEntry } from "../data/worldcup2026";

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

export function isKoreaQualified(thirdPlaceTable: ThirdPlaceEntry[]): { qualified: boolean; position: number } {
  const koreaIdx = thirdPlaceTable.findIndex(e => e.team === KOREA_CODE);
  if (koreaIdx === -1) return { qualified: false, position: -1 };
  return { qualified: koreaIdx < 8, position: koreaIdx + 1 };
}
