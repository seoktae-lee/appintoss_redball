import { type MatchResult } from "../data/worldcup2026";

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_API_KEY || "";
const COMPETITION_ID = process.env.WC_COMPETITION_ID || "2000";

let cachedMatches: MatchResult[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 60_000; // 1 min

async function fetchFromAPI(path: string) {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "X-Auth-Token": API_KEY },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mapStatus(apiStatus: string): MatchResult["status"] {
  switch (apiStatus) {
    case "FINISHED": return "FINISHED";
    case "IN_PLAY": case "LIVE": return "IN_PLAY";
    case "PAUSED": case "HALFTIME": return "PAUSED";
    default: return "SCHEDULED";
  }
}

export async function fetchMatches(): Promise<MatchResult[] | null> {
  const now = Date.now();
  if (cachedMatches && now - lastFetch < CACHE_TTL) return cachedMatches;

  const data = await fetchFromAPI(`/competitions/${COMPETITION_ID}/matches`) as any;
  if (!data?.matches) return cachedMatches;

  const matches: MatchResult[] = (data.matches as any[])
    .filter((m: any) => m.stage === "GROUP_STAGE")
    .map((m: any) => ({
      id: String(m.id),
      group: m.group?.replace("GROUP_", "") || "",
      matchday: m.matchday,
      date: m.utcDate,
      homeTeam: m.homeTeam?.tla || "",
      awayTeam: m.awayTeam?.tla || "",
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      status: mapStatus(m.status),
      minute: m.minute ? String(m.minute) : undefined,
    }));

  cachedMatches = matches;
  lastFetch = now;
  return matches;
}

export function clearCache() {
  cachedMatches = null;
  lastFetch = 0;
}
