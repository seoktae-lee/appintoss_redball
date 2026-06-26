import { type MatchResult } from "./worldcup2026";

// A조 (확정 결과)
const GROUP_A: MatchResult[] = [
  { id: "A1", group: "A", matchday: 1, date: "2026-06-12T02:00:00Z", homeTeam: "KOR", awayTeam: "CZE", homeScore: 2, awayScore: 1, status: "FINISHED" },
  { id: "A2", group: "A", matchday: 1, date: "2026-06-12T05:00:00Z", homeTeam: "MEX", awayTeam: "ZAF", homeScore: 2, awayScore: 0, status: "FINISHED" },
  { id: "A3", group: "A", matchday: 2, date: "2026-06-19T01:00:00Z", homeTeam: "MEX", awayTeam: "KOR", homeScore: 1, awayScore: 0, status: "FINISHED" },
  { id: "A4", group: "A", matchday: 2, date: "2026-06-19T04:00:00Z", homeTeam: "CZE", awayTeam: "ZAF", homeScore: 1, awayScore: 1, status: "FINISHED" },
  { id: "A5", group: "A", matchday: 3, date: "2026-06-25T01:00:00Z", homeTeam: "ZAF", awayTeam: "KOR", homeScore: 1, awayScore: 0, status: "FINISHED" },
  { id: "A6", group: "A", matchday: 3, date: "2026-06-25T01:00:00Z", homeTeam: "MEX", awayTeam: "CZE", homeScore: 2, awayScore: 0, status: "FINISHED" },
];

function makeGroupMatches(group: string, teams: string[], results: [number|null,number|null,string][]): MatchResult[] {
  const pairs = [
    [0,1],[2,3],[0,2],[1,3],[0,3],[1,2]
  ];
  return pairs.map((p, i) => ({
    id: `${group}${i+1}`,
    group,
    matchday: Math.floor(i/2) + 1,
    date: `2026-06-${12 + Math.floor(i/2) * 7}T0${i%3}:00:00Z`,
    homeTeam: teams[p[0]],
    awayTeam: teams[p[1]],
    homeScore: results[i][0],
    awayScore: results[i][1],
    status: results[i][2] as MatchResult["status"],
  }));
}

// 나머지 조 (샘플 데이터 - API 연동 시 대체됨)
const ALL_MATCHES: MatchResult[] = [
  ...GROUP_A,
  ...makeGroupMatches("B", ["CAN","SUI","BIH","QAT"], [[0,2,"FINISHED"],[1,0,"FINISHED"],[1,1,"FINISHED"],[0,2,"FINISHED"],[1,2,"FINISHED"],[1,0,"FINISHED"]]),
  ...makeGroupMatches("C", ["BRA","MAR","SCO","HAI"], [[2,0,"FINISHED"],[0,1,"FINISHED"],[3,1,"FINISHED"],[1,2,"FINISHED"],[1,0,"FINISHED"],[0,1,"FINISHED"]]),
  ...makeGroupMatches("D", ["USA","AUS","PAR","TUR"], [[1,1,"FINISHED"],[0,2,"FINISHED"],[1,2,"FINISHED"],[1,0,"FINISHED"],[null,null,"SCHEDULED"],[null,null,"SCHEDULED"]]),
  ...makeGroupMatches("E", ["GER","CIV","ECU","CUW"], [[3,0,"FINISHED"],[1,0,"FINISHED"],[2,1,"FINISHED"],[0,1,"FINISHED"],[4,0,"FINISHED"],[1,0,"FINISHED"]]),
  ...makeGroupMatches("F", ["NED","JPN","SWE","TUN"], [[2,1,"FINISHED"],[1,0,"FINISHED"],[1,2,"FINISHED"],[1,0,"FINISHED"],[2,0,"FINISHED"],[2,1,"FINISHED"]]),
  ...makeGroupMatches("G", ["EGY","IRN","BEL","NZL"], [[0,1,"FINISHED"],[1,2,"FINISHED"],[0,2,"FINISHED"],[2,1,"FINISHED"],[0,3,"FINISHED"],[1,1,"FINISHED"]]),
  ...makeGroupMatches("H", ["ESP","URU","CPV","KSA"], [[2,0,"FINISHED"],[0,1,"FINISHED"],[2,1,"FINISHED"],[1,1,"FINISHED"],[null,null,"SCHEDULED"],[null,null,"SCHEDULED"]]),
  ...makeGroupMatches("I", ["FRA","NOR","SEN","IRQ"], [[1,1,"FINISHED"],[2,0,"FINISHED"],[2,0,"FINISHED"],[1,0,"FINISHED"],[0,1,"FINISHED"],[3,1,"FINISHED"]]),
  ...makeGroupMatches("J", ["ARG","AUT","ALG","JOR"], [[3,0,"FINISHED"],[1,0,"FINISHED"],[2,1,"FINISHED"],[0,1,"FINISHED"],[3,0,"FINISHED"],[2,1,"FINISHED"]]),
  ...makeGroupMatches("K", ["COL","POR","COD","UZB"], [[1,2,"FINISHED"],[0,1,"FINISHED"],[0,1,"FINISHED"],[1,2,"FINISHED"],[1,3,"FINISHED"],[0,1,"FINISHED"]]),
  ...makeGroupMatches("L", ["ENG","GHA","CRO","PAN"], [[2,0,"FINISHED"],[1,1,"FINISHED"],[1,0,"FINISHED"],[1,1,"FINISHED"],[null,null,"SCHEDULED"],[null,null,"SCHEDULED"]]),
];

export default ALL_MATCHES;
