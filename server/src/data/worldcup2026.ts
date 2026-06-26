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

export const TEAMS: Record<string, Team> = {
  MEX: { code: "MEX", name: "멕시코", flag: "mx" },
  KOR: { code: "KOR", name: "대한민국", flag: "kr" },
  RSA: { code: "RSA", name: "남아공", flag: "za" },
  CZE: { code: "CZE", name: "체코", flag: "cz" },
  CAN: { code: "CAN", name: "캐나다", flag: "ca" },
  SUI: { code: "SUI", name: "스위스", flag: "ch" },
  BIH: { code: "BIH", name: "보스니아", flag: "ba" },
  QAT: { code: "QAT", name: "카타르", flag: "qa" },
  BRA: { code: "BRA", name: "브라질", flag: "br" },
  MAR: { code: "MAR", name: "모로코", flag: "ma" },
  SCO: { code: "SCO", name: "스코틀랜드", flag: "gb-sct" },
  HAI: { code: "HAI", name: "아이티", flag: "ht" },
  USA: { code: "USA", name: "미국", flag: "us" },
  AUS: { code: "AUS", name: "호주", flag: "au" },
  PAR: { code: "PAR", name: "파라과이", flag: "py" },
  TUR: { code: "TUR", name: "튀르키예", flag: "tr" },
  GER: { code: "GER", name: "독일", flag: "de" },
  CIV: { code: "CIV", name: "코트디부아르", flag: "ci" },
  ECU: { code: "ECU", name: "에콰도르", flag: "ec" },
  CUW: { code: "CUW", name: "퀴라소", flag: "cw" },
  NED: { code: "NED", name: "네덜란드", flag: "nl" },
  JPN: { code: "JPN", name: "일본", flag: "jp" },
  SWE: { code: "SWE", name: "스웨덴", flag: "se" },
  TUN: { code: "TUN", name: "튀니지", flag: "tn" },
  EGY: { code: "EGY", name: "이집트", flag: "eg" },
  IRN: { code: "IRN", name: "이란", flag: "ir" },
  BEL: { code: "BEL", name: "벨기에", flag: "be" },
  NZL: { code: "NZL", name: "뉴질랜드", flag: "nz" },
  ESP: { code: "ESP", name: "스페인", flag: "es" },
  URU: { code: "URU", name: "우루과이", flag: "uy" },
  CPV: { code: "CPV", name: "카보베르데", flag: "cv" },
  KSA: { code: "KSA", name: "사우디", flag: "sa" },
  FRA: { code: "FRA", name: "프랑스", flag: "fr" },
  NOR: { code: "NOR", name: "노르웨이", flag: "no" },
  SEN: { code: "SEN", name: "세네갈", flag: "sn" },
  IRQ: { code: "IRQ", name: "이라크", flag: "iq" },
  ARG: { code: "ARG", name: "아르헨티나", flag: "ar" },
  AUT: { code: "AUT", name: "오스트리아", flag: "at" },
  ALG: { code: "ALG", name: "알제리", flag: "dz" },
  JOR: { code: "JOR", name: "요르단", flag: "jo" },
  COL: { code: "COL", name: "콜롬비아", flag: "co" },
  POR: { code: "POR", name: "포르투갈", flag: "pt" },
  COD: { code: "COD", name: "DR콩고", flag: "cd" },
  UZB: { code: "UZB", name: "우즈베키스탄", flag: "uz" },
  ENG: { code: "ENG", name: "잉글랜드", flag: "gb-eng" },
  GHA: { code: "GHA", name: "가나", flag: "gh" },
  CRO: { code: "CRO", name: "크로아티아", flag: "hr" },
  PAN: { code: "PAN", name: "파나마", flag: "pa" },
};

export const GROUPS: Record<string, string[]> = {
  A: ["MEX", "KOR", "RSA", "CZE"],
  B: ["CAN", "SUI", "BIH", "QAT"],
  C: ["BRA", "MAR", "SCO", "HAI"],
  D: ["USA", "AUS", "PAR", "TUR"],
  E: ["GER", "CIV", "ECU", "CUW"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["EGY", "IRN", "BEL", "NZL"],
  H: ["ESP", "URU", "CPV", "KSA"],
  I: ["FRA", "NOR", "SEN", "IRQ"],
  J: ["ARG", "AUT", "ALG", "JOR"],
  K: ["COL", "POR", "COD", "UZB"],
  L: ["ENG", "GHA", "CRO", "PAN"],
};

export const KOREA_CODE = "KOR";
export const KOREA_GROUP = "A";
