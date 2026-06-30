import { type KnockoutMatch } from "../data/knockout2026";
import { getAllPredictions, findUserById } from "../db";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  correctCount: number;
  totalCount: number;
  accuracy: number; // 0~100
}

export function calcAccuracy(predictions: Record<string, string>, bracket: KnockoutMatch[]): { correct: number; total: number } {
  let correct = 0;
  let total = 0;
  for (const m of bracket) {
    if (m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null) {
      const winner = m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam;
      if (predictions[m.id]) {
        total++;
        if (predictions[m.id] === winner) correct++;
      }
    }
  }
  return { correct, total };
}

// 최소 1경기 이상 예측 + 결과가 나온 유저만 랭킹에 노출. 정답률 -> 정답 개수 순으로 정렬.
export function calcLeaderboard(bracket: KnockoutMatch[]): LeaderboardEntry[] {
  const entries: Omit<LeaderboardEntry, "rank">[] = [];

  for (const p of getAllPredictions()) {
    const { correct, total } = calcAccuracy(p.predictions, bracket);
    if (total === 0) continue;
    const user = findUserById(p.userId);
    entries.push({
      userId: p.userId,
      nickname: user?.nickname || "익명의 축구팬",
      correctCount: correct,
      totalCount: total,
      accuracy: Math.round((correct / total) * 100),
    });
  }

  entries.sort((a, b) => b.accuracy - a.accuracy || b.correctCount - a.correctCount);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}
