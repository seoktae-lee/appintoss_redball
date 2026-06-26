// 2026 FIFA World Cup ELO Ratings (June 2026 기준, eloratings.net 참고)
export const ELO_RATINGS: Record<string, number> = {
  ARG: 2060, FRA: 2040, ESP: 2030, ENG: 2010, BRA: 2000,
  POR: 1990, NED: 1970, BEL: 1960, GER: 1950, COL: 1930,
  URU: 1910, CRO: 1900, MAR: 1880, JPN: 1870, USA: 1860,
  SUI: 1850, MEX: 1840, SEN: 1830, TUR: 1820, IRN: 1810,
  AUT: 1800, AUS: 1790, KOR: 1780, ECU: 1770, EGY: 1760,
  SWE: 1750, NOR: 1740, ALG: 1730, CIV: 1720, TUN: 1710,
  CAN: 1700, PAR: 1690, SCO: 1680, GHA: 1670, RSA: 1660,
  CZE: 1650, NZL: 1640, IRQ: 1620, PAN: 1610, BIH: 1600,
  QAT: 1580, UZB: 1570, JOR: 1560, KSA: 1550, CPV: 1520,
  HAI: 1500, COD: 1490, CUW: 1450,
};

const DEFAULT_ELO = 1600;

export function getElo(teamCode: string): number {
  return ELO_RATINGS[teamCode] || DEFAULT_ELO;
}

// ELO 차이 → 승/무/패 확률 변환
export function eloToProbs(homeElo: number, awayElo: number): { homeWin: number; draw: number; awayWin: number } {
  const HOME_ADVANTAGE = 50;
  const diff = homeElo + HOME_ADVANTAGE - awayElo;

  const homeExpected = 1 / (1 + Math.pow(10, -diff / 400));
  const awayExpected = 1 - homeExpected;

  // 무승부 확률 추정 (축구 평균 약 25%, 실력차 클수록 낮아짐)
  const drawBase = 0.26 - Math.abs(diff) * 0.0003;
  const drawProb = Math.max(0.08, Math.min(0.32, drawBase));

  const remaining = 1 - drawProb;
  const homeWin = remaining * homeExpected;
  const awayWin = remaining * awayExpected;

  return { homeWin, draw: drawProb, awayWin };
}
