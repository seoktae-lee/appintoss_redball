export interface Team {
  code: string;
  name: string;
  flag: string;
}

export interface MatchResult {
  id: string;
  group: string;
  matchday: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "FINISHED" | "IN_PLAY" | "PAUSED" | "SCHEDULED";
  minute?: string;
}

export interface GroupStanding {
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface ThirdPlaceEntry {
  team: string;
  group: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
  status: "FINISHED" | "IN_PROGRESS";
}

export interface Scenario {
  group: string;
  match: { home: string; away: string; date: string; status: string };
  conditions: string[];
  probabilities?: { homeWin: number; draw: number; awayWin: number };
  impact: "must_watch" | "helpful" | "dangerous";
}

export interface WorldCupData {
  teams: Record<string, Team>;
  groups: Record<string, string[]>;
  matches: MatchResult[];
  allStandings: Record<string, GroupStanding[]>;
  thirdPlaceTable: ThirdPlaceEntry[];
  koreaStatus: {
    qualified: boolean;
    position: number;
    group: string;
    code: string;
  };
  probability: number;
  scenarios: Scenario[];
  todayMatches: MatchResult[];
  lastUpdated: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; tossId: string; nickname: string };
}
