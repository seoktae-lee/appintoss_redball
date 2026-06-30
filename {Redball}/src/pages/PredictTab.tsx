import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { BracketResponse, PredictResponse } from "../api/types";

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

const ROUND_LABEL: Record<string, string> = {
  R32: "32강", R16: "16강", QF: "8강", SF: "4강", F: "결승",
};

export function PredictTab() {
  const [bracket, setBracket] = useState<BracketResponse | null>(null);
  const [predict, setPredict] = useState<PredictResponse | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [b, p] = await Promise.all([
        api.get<BracketResponse>("/api/worldcup/bracket"),
        api.get<PredictResponse>("/api/worldcup/predict"),
      ]);
      setBracket(b);
      setPredict(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePick = async (matchId: string, teamCode: string) => {
    if (saving) return;
    setSaving(matchId);
    try {
      await api.post("/api/worldcup/predict", { matchId, teamCode });
      setPredict(prev => prev ? { ...prev, predictions: { ...prev.predictions, [matchId]: teamCode } } : prev);
    } catch {}
    setSaving(null);
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--w40)" }}>불러오는 중...</div>;
  if (!bracket || !predict) return null;

  // 라운드별 그룹핑
  const ROUND_ORDER = ["R32", "R16", "QF", "SF", "F"] as const;
  const matchesByRound = ROUND_ORDER.reduce((acc, r) => {
    acc[r] = bracket.bracket.filter(m => m.round === r);
    return acc;
  }, {} as Record<string, typeof bracket.bracket>);

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* 정답률 배너 */}
      <div style={{
        margin: "12px 16px 16px", padding: "14px 16px", borderRadius: 14,
        background: "var(--card)", border: "1px solid rgba(255,255,255,.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--w60)", marginBottom: 4 }}>내 예측 정답률</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: predict.totalCount > 0 ? "var(--gold)" : "var(--w40)" }}>
            {predict.totalCount > 0
              ? `${Math.round((predict.correctCount / predict.totalCount) * 100)}%`
              : "—"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--teal)" }}>{predict.correctCount}</div>
          <div style={{ fontSize: 11, color: "var(--w40)" }}>/ {predict.totalCount} 정답</div>
        </div>
      </div>

      {/* 라운드별 예측 */}
      {ROUND_ORDER.map(round => {
        const matches = matchesByRound[round] || [];
        if (matches.length === 0) return null;
        return (
          <div key={round} style={{ padding: "0 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--w40)", letterSpacing: 1, marginBottom: 10 }}>
              {ROUND_LABEL[round]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {matches.map(m => {
                const home = m.homeTeam ? bracket.teams[m.homeTeam] : null;
                const away = m.awayTeam ? bracket.teams[m.awayTeam] : null;
                const myPick = predict.predictions[m.id];
                const isFinished = m.status === "FINISHED";
                const actualWinner = isFinished && m.homeScore !== null && m.awayScore !== null
                  ? (m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam)
                  : null;
                const isCorrect = actualWinner && myPick === actualWinner;
                const isWrong = actualWinner && myPick && myPick !== actualWinner;

                return (
                  <div key={m.id} style={{
                    background: "var(--card2)", borderRadius: 12, padding: "10px 12px",
                    border: isCorrect ? "1px solid var(--teal)" : isWrong ? "1px solid var(--red)" : "1px solid rgba(255,255,255,.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: "var(--w40)" }}>
                        {new Date(m.date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                      </span>
                      {isCorrect && <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700 }}>✓ 정답</span>}
                      {isWrong && <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 700 }}>✗ 오답</span>}
                      {!isFinished && !m.homeTeam && !m.awayTeam && <span style={{ fontSize: 10, color: "var(--w40)" }}>대진 미확정</span>}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {/* 홈팀 버튼 */}
                      <button
                        onClick={() => m.homeTeam && !isFinished && handlePick(m.id, m.homeTeam)}
                        disabled={!m.homeTeam || isFinished || saving === m.id}
                        style={{
                          flex: 1, padding: "8px 6px", borderRadius: 8, border: "none",
                          background: myPick === m.homeTeam
                            ? (isWrong ? "rgba(228,0,43,.2)" : isCorrect ? "rgba(0,133,106,.2)" : "rgba(228,0,43,.2)")
                            : "rgba(255,255,255,.04)",
                          cursor: m.homeTeam && !isFinished ? "pointer" : "default",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          outline: myPick === m.homeTeam ? `1.5px solid ${isWrong ? "var(--red)" : isCorrect ? "var(--teal)" : "var(--red)"}` : "none",
                          fontFamily: "inherit",
                          opacity: isFinished && actualWinner && actualWinner !== m.homeTeam ? 0.45 : 1,
                        }}
                      >
                        {home ? <img src={FLAG_URL(home.flag)} style={{ width: 24, height: 17, borderRadius: 3, objectFit: "cover" }} /> : <div style={{ width: 24, height: 17, background: "var(--w20)", borderRadius: 3 }} />}
                        <span style={{ fontSize: 11, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{home?.name || "TBD"}</span>
                        {isFinished && <span style={{ fontSize: 12, fontWeight: 800, color: actualWinner === m.homeTeam ? "#fff" : "var(--w40)" }}>{m.homeScore}</span>}
                      </button>

                      {/* VS */}
                      <div style={{ display: "flex", alignItems: "center", fontSize: 11, color: "var(--w40)", flexShrink: 0 }}>vs</div>

                      {/* 어웨이팀 버튼 */}
                      <button
                        onClick={() => m.awayTeam && !isFinished && handlePick(m.id, m.awayTeam)}
                        disabled={!m.awayTeam || isFinished || saving === m.id}
                        style={{
                          flex: 1, padding: "8px 6px", borderRadius: 8, border: "none",
                          background: myPick === m.awayTeam
                            ? (isWrong ? "rgba(228,0,43,.2)" : isCorrect ? "rgba(0,133,106,.2)" : "rgba(228,0,43,.2)")
                            : "rgba(255,255,255,.04)",
                          cursor: m.awayTeam && !isFinished ? "pointer" : "default",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          outline: myPick === m.awayTeam ? `1.5px solid ${isWrong ? "var(--red)" : isCorrect ? "var(--teal)" : "var(--red)"}` : "none",
                          fontFamily: "inherit",
                          opacity: isFinished && actualWinner && actualWinner !== m.awayTeam ? 0.45 : 1,
                        }}
                      >
                        {away ? <img src={FLAG_URL(away.flag)} style={{ width: 24, height: 17, borderRadius: 3, objectFit: "cover" }} /> : <div style={{ width: 24, height: 17, background: "var(--w20)", borderRadius: 3 }} />}
                        <span style={{ fontSize: 11, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{away?.name || "TBD"}</span>
                        {isFinished && <span style={{ fontSize: 12, fontWeight: 800, color: actualWinner === m.awayTeam ? "#fff" : "var(--w40)" }}>{m.awayScore}</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
