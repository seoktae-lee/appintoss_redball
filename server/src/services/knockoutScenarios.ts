import { type KnockoutMatch } from "../data/knockout2026";
import { TEAMS } from "../data/worldcup2026";
import { getElo, eloToProbs } from "../data/elo-ratings";

// 한글 받침 유무에 따라 이/가, 은/는 등의 조사를 고른다
function josa(word: string, withFinal: string, withoutFinal: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return withoutFinal;
  return (last - 0xac00) % 28 === 0 ? withoutFinal : withFinal;
}

const ROUND_STAKE: Record<KnockoutMatch["round"], string> = {
  R32: "이 경기 승자는 16강에 진출해요",
  R16: "8강 진출이 걸린 한 판이에요",
  QF: "4강 진출이 걸린 경기예요",
  SF: "결승 진출을 가르는 경기예요",
  F: "우승팀을 가리는 결승전이에요",
};

export interface KnockoutWatchPoint {
  probabilities: { homeWin: number; draw: number; awayWin: number };
  elo: { home: number; away: number };
  headline: string;
  points: string[];
}

export function calcKnockoutWatchPoint(match: KnockoutMatch, homeCode: string, awayCode: string): KnockoutWatchPoint {
  const homeElo = getElo(homeCode);
  const awayElo = getElo(awayCode);
  const homeName = TEAMS[homeCode]?.name || homeCode;
  const awayName = TEAMS[awayCode]?.name || awayCode;

  const probs = eloToProbs(homeElo, awayElo);
  // 토너먼트는 무승부가 없으므로(연장/승부차기) 무승부 확률을 절반씩 양 팀에 합산
  const homeWin = Math.round((probs.homeWin + probs.draw * 0.5) * 100);
  const awayWin = 100 - homeWin;

  const favorite = homeWin >= awayWin ? homeName : awayName;
  const underdog = homeWin >= awayWin ? awayName : homeName;
  const favoriteWin = Math.max(homeWin, awayWin);

  const points: string[] = [];
  let headline: string;

  if (favoriteWin < 58) {
    headline = "박빙의 매치업, 결과를 예측하기 어려워요";
    points.push(`✅ ${homeName} ${homeWin}% vs ${awayName} ${awayWin}% — 누가 이겨도 이상하지 않아요`);
  } else if (favoriteWin < 72) {
    headline = `${favorite}${josa(favorite, "이", "가")} 살짝 우세하지만 안심할 수 없어요`;
    points.push(`✅ ${favorite} 승리 확률 ${favoriteWin}% — ${underdog}의 이변 가능성도 충분해요`);
  } else {
    headline = `${favorite}의 무난한 승리가 예상돼요`;
    points.push(`⚠️ ${favorite} 승리 확률 ${favoriteWin}% — 전력 차이가 뚜렷한 경기예요`);
  }

  const eloDiff = Math.abs(homeElo - awayElo);
  if (eloDiff >= 150) {
    points.push(`💡 ELO 레이팅 격차 ${eloDiff}점 — ${underdog}${josa(underdog, "이", "가")} 이기면 이번 대회 최대 이변 중 하나예요`);
  }

  points.push(`● ${ROUND_STAKE[match.round]}`);

  return {
    probabilities: { homeWin, draw: 0, awayWin },
    elo: { home: homeElo, away: awayElo },
    headline,
    points,
  };
}
