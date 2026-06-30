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
  teamStatus: {
    qualified: boolean;
    position: number;
    groupPosition: number;
    group: string;
    code: string;
  };
  probability: number;
  scenarios: Scenario[];
  bingo: {
    cells: Array<{
      group: string;
      team1: string;
      team2: string;
      condition: string;
      status: "fulfilled" | "failed" | "pending";
    }>;
    fulfilledCount: number;
    totalCount: number;
    message: string;
  };
  todayMatches: MatchResult[];
  lastUpdated: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; nickname: string; myTeam: string | null };
}

export interface TeamsResponse {
  teams: Record<string, Team>;
  groups: Record<string, string[]>;
}

export interface KnockoutMatch {
  id: string;
  round: "R32" | "R16" | "QF" | "SF" | "F";
  slot: number;
  bracketSide: "L" | "R";
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "IN_PLAY" | "FINISHED";
  date: string;
  homeFromMatch: string | null;
  awayFromMatch: string | null;
}

export interface BracketResponse {
  bracket: KnockoutMatch[];
  teams: Record<string, Team>;
}

export interface TeamTournamentOdds {
  teamCode: string;
  winPct: number;
  finalPct: number;
  semiFinalPct: number;
  quarterFinalPct: number;
  roundOf16Pct: number;
}

export interface TournamentOddsResponse {
  odds: TeamTournamentOdds[];
  teams: Record<string, Team>;
  calculatedAt: string;
}

export interface PredictResponse {
  predictions: Record<string, string>;
  correctCount: number;
  totalCount: number;
}
