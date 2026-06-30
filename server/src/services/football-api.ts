import { type MatchResult } from "../data/worldcup2026";
import { type KnockoutMatch } from "../data/knockout2026";

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_API_KEY || "";
const COMPETITION_ID = process.env.WC_COMPETITION_ID || "2000";

// 32강부터는 API의 stage 값이 시점/버전에 따라 다를 수 있어 후보를 넓게 잡는다.
// 실제 키 연결 후 매칭이 안 되는 stage가 보이면 여기에 추가하면 된다.
const STAGE_TO_ROUND: Record<string, KnockoutMatch["round"]> = {
  LAST_32: "R32", ROUND_OF_32: "R32",
  LAST_16: "R16", ROUND_OF_16: "R16",
  QUARTER_FINALS: "QF", QUARTERFINALS: "QF",
  SEMI_FINALS: "SF", SEMIFINALS: "SF",
  FINAL: "F",
};

export interface APIKnockoutMatch {
  apiId: string;
  round: KnockoutMatch["round"];
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchResult["status"];
  minute?: string;
}

let cachedRaw: any[] | null = null;
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

async function fetchAllRaw(): Promise<any[] | null> {
  const now = Date.now();
  if (cachedRaw && now - lastFetch < CACHE_TTL) return cachedRaw;

  const data = await fetchFromAPI(`/competitions/${COMPETITION_ID}/matches`) as any;
  if (!data?.matches) return cachedRaw;

  cachedRaw = data.matches as any[];
  lastFetch = now;
  return cachedRaw;
}

export async function fetchMatches(): Promise<MatchResult[] | null> {
  const raw = await fetchAllRaw();
  if (!raw) return null;

  return raw
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
}

// 32강 이후 경기 — round를 알 수 없는 stage는 건너뛴다 (알 수 없는 stage는 콘솔에 1회성 경고).
const warnedStages = new Set<string>();

export async function fetchKnockoutMatches(): Promise<APIKnockoutMatch[] | null> {
  const raw = await fetchAllRaw();
  if (!raw) return null;

  const result: APIKnockoutMatch[] = [];
  for (const m of raw) {
    if (m.stage === "GROUP_STAGE") continue;
    const round = STAGE_TO_ROUND[m.stage];
    if (!round) {
      if (!warnedStages.has(m.stage)) {
        warnedStages.add(m.stage);
        console.warn(`[football-api] 매핑되지 않은 stage: ${m.stage} — STAGE_TO_ROUND에 추가 필요`);
      }
      continue;
    }
    if (!m.homeTeam?.tla || !m.awayTeam?.tla) continue; // 아직 대진 미확정
    result.push({
      apiId: String(m.id),
      round,
      date: m.utcDate,
      homeTeam: m.homeTeam.tla,
      awayTeam: m.awayTeam.tla,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      status: mapStatus(m.status),
      minute: m.minute ? String(m.minute) : undefined,
    });
  }
  return result;
}

export function clearCache() {
  cachedRaw = null;
  lastFetch = 0;
}
