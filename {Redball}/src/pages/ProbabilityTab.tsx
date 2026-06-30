import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { TournamentOddsResponse } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";
import trophy from "../assets/trophy.png";

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

export function ProbabilityTab({ myTeam }: { myTeam?: string }) {
  const [data, setData] = useState<TournamentOddsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TournamentOddsResponse>("/api/worldcup/tournament-odds")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--w40)" }}>확률 계산 중...</div>;
  if (!data || data.odds.length === 0) return <div style={{ padding: 20, textAlign: "center", color: "var(--w40)" }}>32강 대진이 확정되면 계산할게요</div>;

  const top3 = data.odds.slice(0, 3);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Top 3 포디움 */}
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ fontSize: 13, color: "var(--w40)", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span>우승 확률 (ELO 기반 시뮬레이션)</span>
          <span style={{ fontSize: 11 }}>
            {data.calculatedAt !== "0" ? `업데이트: ${new Date(data.calculatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "flex-end", marginBottom: 16 }}>
          {[top3[1], top3[0], top3[2]].map((item, displayIdx) => {
            if (!item) return null;
            const rankIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
            const rank = rankIdx + 1;
            const heights = [100, 130, 80];
            const podiumH = heights[displayIdx];
            const team = data.teams[item.teamCode];
            const isMe = item.teamCode === myTeam;
            const medalColor = rank === 1 ? "#D4AF37" : rank === 2 ? "#C0C0C0" : "#CD7F32";

            return (
              <div key={item.teamCode} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <img src={FLAG_URL(team?.flag || "")} style={{ width: 36, height: 26, borderRadius: 4, objectFit: "cover", marginBottom: 6, border: isMe ? "2px solid var(--red)" : "none" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: isMe ? "var(--red)" : "#fff", marginBottom: 2 }}>{team?.name || item.teamCode}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: medalColor, marginBottom: 8 }}>{item.winPct}%</div>
                <div style={{
                  width: "100%", height: podiumH, background: "var(--card2)",
                  borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                  justifyContent: "center", border: `1px solid ${medalColor}33`,
                }}>
                  {rank === 1 ? (
                    <img src={trophy} style={{ width: 44, height: 44, objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 900, color: medalColor }}>
                      {rank === 2 ? "🥈" : "🥉"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 전체 리스트 */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "var(--card)", borderRadius: 16, overflow: "hidden" }}>
          {/* 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 52px 48px 48px 48px", gap: 4, padding: "10px 12px 8px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize: 10, color: "var(--w40)" }}>#</span>
            <span style={{ fontSize: 10, color: "var(--w40)" }}>팀</span>
            <span style={{ fontSize: 10, color: "var(--gold)", textAlign: "center" }}>우승</span>
            <span style={{ fontSize: 10, color: "var(--w40)", textAlign: "center" }}>결승</span>
            <span style={{ fontSize: 10, color: "var(--w40)", textAlign: "center" }}>4강</span>
            <span style={{ fontSize: 10, color: "var(--w40)", textAlign: "center" }}>8강</span>
          </div>
          {data.odds.map((item, idx) => {
            const team = data.teams[item.teamCode];
            const isMe = item.teamCode === myTeam;
            return (
              <div key={item.teamCode} style={{
                display: "grid", gridTemplateColumns: "32px 1fr 52px 48px 48px 48px", gap: 4,
                padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,.04)",
                background: isMe ? "var(--red-bg)" : "transparent",
              }}>
                <span style={{ fontSize: 12, color: "var(--w40)", fontWeight: 700 }}>{idx + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <img src={FLAG_URL(team?.flag || "")} style={{ width: 18, height: 13, borderRadius: 2, objectFit: "cover" }} />
                  <span style={{ fontSize: 13, color: isMe ? "var(--red)" : "var(--w80)", fontWeight: isMe ? 700 : 400 }}>{team?.name || item.teamCode}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.winPct > 10 ? "var(--gold)" : "var(--w80)", textAlign: "center" }}>{item.winPct}%</span>
                <span style={{ fontSize: 12, color: "var(--w60)", textAlign: "center" }}>{item.finalPct}%</span>
                <span style={{ fontSize: 12, color: "var(--w60)", textAlign: "center" }}>{item.semiFinalPct}%</span>
                <span style={{ fontSize: 12, color: "var(--w60)", textAlign: "center" }}>{item.quarterFinalPct}%</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "var(--w40)", textAlign: "center", marginTop: 8, lineHeight: 1.6 }}>
          ELO 레이팅 기반 몬테카를로 시뮬레이션<br/>실제 결과와 다를 수 있어요
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <BannerAd adGroupId={AD_IDS.BANNER_TAB2} />
      </div>
    </div>
  );
}
