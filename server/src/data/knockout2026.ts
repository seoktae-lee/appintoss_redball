/**
 * 2026 FIFA World Cup Knockout Stage Bracket — 실제 확정된 32강 대진 (한국시간 기준)
 */

export interface KnockoutMatch {
  id: string;
  round: "R32" | "R16" | "QF" | "SF" | "F";
  slot: number;           // 같은 라운드 내 순번 (1부터 시작)
  bracketSide: "L" | "R"; // 브라켓 좌/우측 (대칭 시각화용)
  homeTeam: string | null;  // 팀 코드 또는 null(TBD)
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "IN_PLAY" | "FINISHED";
  date: string;            // ISO datetime (UTC)
  homeFromMatch: string | null;  // 승자가 올라오는 이전 경기 ID
  awayFromMatch: string | null;
}

export const INITIAL_BRACKET: KnockoutMatch[] = [
  // ── R32 (32강, 16경기) — 좌측 브라켓 ──
  { id: "r32_1",  round: "R32", slot: 1,  bracketSide: "L", homeTeam: "RSA", awayTeam: "CAN", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-06-28T19:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 남아공 vs 캐나다 6/29 4am
  { id: "r32_2",  round: "R32", slot: 2,  bracketSide: "L", homeTeam: "NED", awayTeam: "MAR", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-06-30T01:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 네덜란드 vs 모로코 6/30 10am
  { id: "r32_3",  round: "R32", slot: 3,  bracketSide: "L", homeTeam: "GER", awayTeam: "PAR", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-06-29T20:30:00Z", homeFromMatch: null, awayFromMatch: null }, // 독일 vs 파라과이 6/30 5:30am
  { id: "r32_4",  round: "R32", slot: 4,  bracketSide: "L", homeTeam: "FRA", awayTeam: "SWE", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-06-30T21:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 프랑스 vs 스웨덴 7/1 6am
  { id: "r32_5",  round: "R32", slot: 5,  bracketSide: "L", homeTeam: "ESP", awayTeam: "AUT", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-02T19:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 스페인 vs 오스트리아 7/3 4am
  { id: "r32_6",  round: "R32", slot: 6,  bracketSide: "L", homeTeam: "POR", awayTeam: "CRO", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-02T23:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 포르투갈 vs 크로아티아 7/3 8am
  { id: "r32_7",  round: "R32", slot: 7,  bracketSide: "L", homeTeam: "BEL", awayTeam: "SEN", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-01T20:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 벨기에 vs 세네갈 7/2 5am
  { id: "r32_8",  round: "R32", slot: 8,  bracketSide: "L", homeTeam: "USA", awayTeam: "BIH", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-02T00:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 미국 vs 보스니아 7/2 9am

  // ── R32 — 우측 브라켓 ──
  { id: "r32_9",  round: "R32", slot: 9,  bracketSide: "R", homeTeam: "BRA", awayTeam: "JPN", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-06-29T17:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 브라질 vs 일본 6/30 2am
  { id: "r32_10", round: "R32", slot: 10, bracketSide: "R", homeTeam: "CIV", awayTeam: "NOR", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-06-30T17:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 코트디부아르 vs 노르웨이 7/1 2am
  { id: "r32_11", round: "R32", slot: 11, bracketSide: "R", homeTeam: "MEX", awayTeam: "ECU", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-01T01:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 멕시코 vs 에콰도르 7/1 10am
  { id: "r32_12", round: "R32", slot: 12, bracketSide: "R", homeTeam: "ENG", awayTeam: "COD", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-01T16:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 잉글랜드 vs 콩고민주공화국 7/2 1am
  { id: "r32_13", round: "R32", slot: 13, bracketSide: "R", homeTeam: "AUS", awayTeam: "EGY", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-03T18:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 호주 vs 이집트 7/4 3am
  { id: "r32_14", round: "R32", slot: 14, bracketSide: "R", homeTeam: "ARG", awayTeam: "CPV", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-03T22:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 아르헨티나 vs 카보베르데 7/4 7am
  { id: "r32_15", round: "R32", slot: 15, bracketSide: "R", homeTeam: "SUI", awayTeam: "ALG", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-03T03:00:00Z", homeFromMatch: null, awayFromMatch: null }, // 스위스 vs 알제리 7/3 12pm
  { id: "r32_16", round: "R32", slot: 16, bracketSide: "R", homeTeam: "COL", awayTeam: "GHA", homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-04T01:30:00Z", homeFromMatch: null, awayFromMatch: null }, // 콜롬비아 vs 가나 7/4 10:30am

  // ── R16 (16강, 8경기) ──
  { id: "r16_1", round: "R16", slot: 1, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-04T17:00:00Z", homeFromMatch: "r32_1",  awayFromMatch: "r32_2"  }, // 7/5 2am
  { id: "r16_2", round: "R16", slot: 2, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-04T21:00:00Z", homeFromMatch: "r32_3",  awayFromMatch: "r32_4"  }, // 7/5 6am
  { id: "r16_3", round: "R16", slot: 3, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-06T19:00:00Z", homeFromMatch: "r32_5",  awayFromMatch: "r32_6"  }, // 7/7 4am
  { id: "r16_4", round: "R16", slot: 4, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-07T00:00:00Z", homeFromMatch: "r32_7",  awayFromMatch: "r32_8"  }, // 7/7 9am
  { id: "r16_5", round: "R16", slot: 5, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-05T20:00:00Z", homeFromMatch: "r32_9",  awayFromMatch: "r32_10" }, // 7/6 5am
  { id: "r16_6", round: "R16", slot: 6, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-06T00:00:00Z", homeFromMatch: "r32_11", awayFromMatch: "r32_12" }, // 7/6 9am
  { id: "r16_7", round: "R16", slot: 7, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-07T16:00:00Z", homeFromMatch: "r32_13", awayFromMatch: "r32_14" }, // 7/8 1am
  { id: "r16_8", round: "R16", slot: 8, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-07T20:00:00Z", homeFromMatch: "r32_15", awayFromMatch: "r32_16" }, // 7/8 5am

  // ── QF (8강, 4경기) ──
  { id: "qf_1", round: "QF", slot: 1, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-09T20:00:00Z", homeFromMatch: "r16_1", awayFromMatch: "r16_2" }, // 7/10 5am
  { id: "qf_2", round: "QF", slot: 2, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-10T19:00:00Z", homeFromMatch: "r16_3", awayFromMatch: "r16_4" }, // 7/11 4am
  { id: "qf_3", round: "QF", slot: 3, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-11T21:00:00Z", homeFromMatch: "r16_5", awayFromMatch: "r16_6" }, // 7/12 6am
  { id: "qf_4", round: "QF", slot: 4, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-12T01:00:00Z", homeFromMatch: "r16_7", awayFromMatch: "r16_8" }, // 7/12 10am

  // ── SF (4강, 2경기) ──
  { id: "sf_1", round: "SF", slot: 1, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-14T19:00:00Z", homeFromMatch: "qf_1", awayFromMatch: "qf_2" }, // 7/15 4am
  { id: "sf_2", round: "SF", slot: 2, bracketSide: "R", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-15T19:00:00Z", homeFromMatch: "qf_3", awayFromMatch: "qf_4" }, // 7/16 4am

  // ── F (결승) ──
  { id: "final", round: "F", slot: 1, bracketSide: "L", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "SCHEDULED", date: "2026-07-19T19:00:00Z", homeFromMatch: "sf_1", awayFromMatch: "sf_2" }, // 7/20 4am
];
