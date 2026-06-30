import { type KnockoutMatch } from "../data/knockout2026";
import { getElo, eloToProbs } from "../data/elo-ratings";

/**
 * 두 팀 간 ELO 기반 토너먼트 승자 결정 (연장/승부차기 있으므로 무승부 없음)
 * 무승부 확률은 홈/원정 각 팀에 절반씩 추가
 */
function winProbInKnockout(teamA: string, teamB: string): number {
  const probs = eloToProbs(getElo(teamA), getElo(teamB));
  return probs.homeWin + probs.draw * 0.5; // 무승부 시 50% 확률로 각 팀
}

/**
 * 현재 브라켓 상태에서 match ID → 승자 팀 코드 매핑을 생성
 */
function buildWinnerMap(bracket: KnockoutMatch[]): Map<string, string | null> {
  const map = new Map<string, string | null>();
  for (const m of bracket) {
    if (m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null) {
      const winner = m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam;
      map.set(m.id, winner);
    } else {
      map.set(m.id, null);
    }
  }
  return map;
}

/**
 * 남은 토너먼트를 N회 몬테카를로 시뮬레이션
 * 각 팀의 우승 / 결승 / 4강 / 8강 진출 확률 반환
 */
export interface TeamTournamentOdds {
  teamCode: string;
  winPct: number;
  finalPct: number;
  semiFinalPct: number;
  quarterFinalPct: number;
  roundOf16Pct: number;
}

export function calcTournamentOdds(bracket: KnockoutMatch[], samples = 20000): TeamTournamentOdds[] {
  const counts: Record<string, { win: number; final: number; sf: number; qf: number; r16: number }> = {};

  const initCount = (code: string) => {
    if (!counts[code]) counts[code] = { win: 0, final: 0, sf: 0, qf: 0, r16: 0 };
  };

  // 브라켓에 등록된 팀 전부 초기화
  for (const m of bracket) {
    if (m.homeTeam) initCount(m.homeTeam);
    if (m.awayTeam) initCount(m.awayTeam);
  }

  for (let i = 0; i < samples; i++) {
    // 브라켓 복사 (시뮬레이션용)
    const sim = bracket.map(m => ({ ...m }));
    const winnerMap = buildWinnerMap(sim);

    // 라운드 순서대로 처리
    const ROUND_ORDER: KnockoutMatch["round"][] = ["R32", "R16", "QF", "SF", "F"];
    const ROUND_STAT: Record<string, keyof (typeof counts)[string]> = {
      R32: "r16", R16: "r16", QF: "qf", SF: "sf", F: "final"
    };

    for (const round of ROUND_ORDER) {
      const roundMatches = sim.filter(m => m.round === round);

      for (const m of roundMatches) {
        // 팀 결정 (이전 경기 승자 or 이미 배정된 팀)
        const home = m.homeTeam ?? (m.homeFromMatch ? winnerMap.get(m.homeFromMatch) ?? null : null);
        const away = m.awayTeam ?? (m.awayFromMatch ? winnerMap.get(m.awayFromMatch) ?? null : null);

        if (!home || !away) continue;

        if (m.status !== "FINISHED") {
          // 시뮬레이션: ELO 기반 승자 결정
          const homeWinP = winProbInKnockout(home, away);
          const winner = Math.random() < homeWinP ? home : away;
          winnerMap.set(m.id, winner);

          // 통계 기록
          initCount(home); initCount(away);
          const stat = ROUND_STAT[round];
          if (stat) {
            counts[home][stat]++;
            counts[away][stat]++;
          }
          if (round === "F") {
            counts[winner].win++;
          }
        } else {
          // 이미 확정된 결과
          const winner = winnerMap.get(m.id);
          if (!winner) continue;
          const loser = winner === home ? away : home;
          initCount(home); initCount(away);
          const stat = ROUND_STAT[round];
          if (stat) {
            counts[home][stat]++;
            counts[away][stat]++;
          }
          if (round === "F") {
            counts[winner].win++;
          }
        }
      }
    }
  }

  // 결과 정리
  const result: TeamTournamentOdds[] = [];
  for (const [teamCode, c] of Object.entries(counts)) {
    result.push({
      teamCode,
      winPct: Math.round((c.win / samples) * 100 * 10) / 10,
      finalPct: Math.round((c.final / samples) * 100 * 10) / 10,
      semiFinalPct: Math.round((c.sf / samples) * 100 * 10) / 10,
      quarterFinalPct: Math.round((c.qf / samples) * 100 * 10) / 10,
      roundOf16Pct: Math.round((c.r16 / samples) * 100 * 10) / 10,
    });
  }

  return result.sort((a, b) => b.winPct - a.winPct);
}

/**
 * 특정 팀의 다음 경기 + 이후 예상 경로 반환
 */
export function getTeamPath(bracket: KnockoutMatch[], teamCode: string): KnockoutMatch[] {
  const path: KnockoutMatch[] = [];
  const winnerMap = buildWinnerMap(bracket);

  for (const m of bracket) {
    const home = m.homeTeam ?? (m.homeFromMatch ? winnerMap.get(m.homeFromMatch) ?? null : null);
    const away = m.awayTeam ?? (m.awayFromMatch ? winnerMap.get(m.awayFromMatch) ?? null : null);
    if (home === teamCode || away === teamCode) {
      path.push(m);
    }
  }
  return path;
}
