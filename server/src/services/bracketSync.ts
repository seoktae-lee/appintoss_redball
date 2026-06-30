import { type KnockoutMatch } from "../data/knockout2026";
import { fetchKnockoutMatches } from "./football-api";
import { loadBracket, saveBracket, saveCachedTournamentOdds } from "../db";

const SYNC_TTL = 60_000; // 1분에 한 번만 외부 API 호출
let lastSyncAt = 0;

const ROUND_ORDER: KnockoutMatch["round"][] = ["R32", "R16", "QF", "SF", "F"];

function propagateWinner(bracket: KnockoutMatch[], finishedId: string) {
  const m = bracket.find(x => x.id === finishedId);
  if (!m || m.status !== "FINISHED" || m.homeScore === null || m.awayScore === null) return;
  const winner = m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam;
  for (const next of bracket) {
    if (next.homeFromMatch === finishedId && !next.homeTeam) next.homeTeam = winner;
    if (next.awayFromMatch === finishedId && !next.awayTeam) next.awayTeam = winner;
  }
}

// 어드민 수동 입력 / 자동 동기화가 공유하는 결과 반영 로직 (다음 라운드 승자 자동 전파 포함)
export function applyBracketMatchResult(
  bracket: KnockoutMatch[],
  matchId: string,
  patch: Partial<Pick<KnockoutMatch, "homeTeam" | "awayTeam" | "homeScore" | "awayScore" | "status">>
): boolean {
  const idx = bracket.findIndex(m => m.id === matchId);
  if (idx === -1) return false;
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) (bracket[idx] as any)[key] = value;
  }
  if (bracket[idx].status === "FINISHED" && bracket[idx].homeScore !== null && bracket[idx].awayScore !== null) {
    propagateWinner(bracket, matchId);
  }
  return true;
}

/**
 * football-data.org에서 32강 이후 경기 결과를 가져와 내부 브라켓에 반영한다.
 * 라운드를 R32 -> F 순서로 처리하므로, 한 라운드가 끝나면 그 결과가 다음 라운드의
 * TBD 슬롯을 채워서(propagateWinner) 같은 호출 안에서 다음 라운드 매칭도 가능해진다.
 */
export async function syncBracketFromAPI(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastSyncAt < SYNC_TTL) return false;
  lastSyncAt = now;

  const apiMatches = await fetchKnockoutMatches();
  if (!apiMatches || apiMatches.length === 0) return false;

  const bracket = loadBracket();
  let changed = false;

  for (const round of ROUND_ORDER) {
    for (const am of apiMatches.filter(m => m.round === round)) {
      const slot = bracket.find(m =>
        m.round === round && m.homeTeam && m.awayTeam && m.status !== "FINISHED" &&
        ((m.homeTeam === am.homeTeam && m.awayTeam === am.awayTeam) ||
         (m.homeTeam === am.awayTeam && m.awayTeam === am.homeTeam))
      );
      if (!slot) continue;

      const reversed = slot.homeTeam === am.awayTeam;
      const homeScore = reversed ? am.awayScore : am.homeScore;
      const awayScore = reversed ? am.homeScore : am.awayScore;

      if (slot.homeScore === homeScore && slot.awayScore === awayScore && slot.status === am.status) continue;

      slot.homeScore = homeScore;
      slot.awayScore = awayScore;
      slot.status = am.status === "IN_PLAY" || am.status === "PAUSED" ? "IN_PLAY" : am.status === "FINISHED" ? "FINISHED" : "SCHEDULED";
      changed = true;

      if (slot.status === "FINISHED" && slot.homeScore !== null && slot.awayScore !== null) {
        propagateWinner(bracket, slot.id);
      }
    }
  }

  if (changed) {
    saveBracket(bracket);
    saveCachedTournamentOdds({ odds: [], calculatedAt: "0" }); // 결과 바뀌었으니 우승확률 캐시 무효화
  }
  return changed;
}
