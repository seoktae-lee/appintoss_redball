import { useState } from "react";
import type { WorldCupData } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";

interface Props { data: WorldCupData }

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

export function QualifyTab({ data }: Props) {
  const { probability, koreaStatus, thirdPlaceTable, teams } = data;
  const [showThirdTable, setShowThirdTable] = useState(false);

  const statusLabel = koreaStatus.qualified
    ? probability === 100 ? "32강 진출 확정" : "진출권 안에 있음"
    : "진출 위험";
  const statusColor = koreaStatus.qualified ? "var(--gold)" : "var(--red)";

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* 확률 배너 */}
      <div style={{
        margin: "12px 16px 16px", padding: 20, borderRadius: 20,
        background: "linear-gradient(135deg, #1a1a2e 0%, #2a1a1e 100%)",
        border: "1px solid rgba(228,0,43,.2)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(228,0,43,.08)" }} />
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>대한민국 32강 진출 확률</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#E4002B", lineHeight: 1 }}>
          {probability}<span style={{ fontSize: 26, color: "rgba(255,255,255,.5)" }}>%</span>
        </div>
        <div style={{
          display: "inline-flex", padding: "5px 12px", borderRadius: 6,
          fontSize: 13, fontWeight: 700, marginTop: 10, marginBottom: 12,
          background: koreaStatus.qualified ? "rgba(212,175,55,.15)" : "rgba(228,0,43,.15)",
          color: statusColor,
        }}>{statusLabel}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>
          A조 3위 · 상위 8개 3위 팀 진출 시 32강
        </div>
        <div style={{
          display: "flex", gap: 16, marginTop: 14, paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,.15)",
        }}>
          {[
            { val: "3", label: "승점" },
            { val: "-1", label: "골득실" },
            { val: "2", label: "득점" },
            { val: "1승 2패", label: "전적" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3위 비교표 (토글) */}
      <div style={{ padding: "0 16px" }}>
        <button
          onClick={() => setShowThirdTable(!showThirdTable)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", background: "var(--card)", borderRadius: 14, border: "none",
            cursor: "pointer", marginBottom: 10, fontFamily: "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>3위 팀 비교표</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>상위 8팀 진출</span>
          </div>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)", transition: "transform .2s", transform: showThirdTable ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
        </button>
        {showThirdTable && <div style={{ background: "var(--card)", borderRadius: 16, padding: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "var(--w40)", fontSize: 10 }}>
                <th style={{ padding: "6px 4px", textAlign: "left", width: 20 }}>#</th>
                <th style={{ padding: "6px 4px", textAlign: "left" }}>팀 (조)</th>
                <th style={{ padding: "6px 4px", textAlign: "center" }}>승점</th>
                <th style={{ padding: "6px 4px", textAlign: "center" }}>득실</th>
                <th style={{ padding: "6px 4px", textAlign: "center" }}>득점</th>
                <th style={{ padding: "6px 4px", textAlign: "center" }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {thirdPlaceTable.map((entry, idx) => {
                const team = teams[entry.team];
                const isKorea = entry.team === "KOR";
                const isInCutline = idx < 8;
                const isCutlineBorder = idx === 7;
                const opacity = idx >= 8 ? 0.5 : 1;

                return (
                  <tr key={entry.team} style={{
                    opacity,
                    background: isKorea ? "var(--red-bg)" : "transparent",
                    borderBottom: isCutlineBorder ? "2px solid var(--red)" : "1px solid rgba(255,255,255,.05)",
                  }}>
                    <td style={{ padding: "8px 4px" }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", display: "inline-flex",
                        alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                        background: isInCutline ? (isCutlineBorder ? "var(--red-bg)" : "var(--teal-bg)") : "transparent",
                        color: isInCutline ? (isCutlineBorder ? "var(--red)" : "var(--teal)") : "var(--w40)",
                      }}>{idx + 1}</span>
                    </td>
                    <td style={{ padding: "8px 4px", color: isKorea ? "var(--red)" : "var(--w80)", fontWeight: isKorea ? 700 : 400 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <img src={FLAG_URL(team?.flag || "")} style={{ width: 18, height: 13, borderRadius: 2, objectFit: "cover" }} />
                        {team?.name || entry.team} ({entry.group})
                      </span>
                    </td>
                    <td style={{ padding: "8px 4px", textAlign: "center", fontWeight: 700, color: isKorea ? "var(--red)" : "var(--w80)" }}>{entry.points}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: isKorea ? "var(--red)" : "var(--w80)" }}>{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: isKorea ? "var(--red)" : "var(--w80)" }}>{entry.goalsFor}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", fontSize: 10, color: isKorea ? "var(--gold)" : entry.status === "FINISHED" ? "var(--teal)" : "var(--gold)" }}>
                      {isKorea ? "대기 중" : entry.status === "FINISHED" ? "확정" : "진행 중"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 한국 상태 요약 */}
          <div style={{
            marginTop: 10, padding: "8px 10px", background: "var(--red-bg)",
            borderRadius: 8, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 18 }}>🇰🇷</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>
                현재 {koreaStatus.position}위 — {koreaStatus.qualified ? "32강 진출권 안에 있음" : "진출권 밖"}
              </div>
              <div style={{ fontSize: 11, color: "var(--w60)" }}>
                8위까지 진출 · 남은 경기 결과에 따라 변동
              </div>
            </div>
          </div>
        </div>}
      </div>

      {/* 관전 포인트 */}
      {data.scenarios && data.scenarios.length > 0 && (
        <div style={{ padding: "0 16px", marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.4)", letterSpacing: 1, marginBottom: 10 }}>
            관전 포인트
          </div>
          <div style={{ padding: "12px 14px", background: "var(--card)", borderRadius: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              남은 경기 중 한국 진출에 영향을 주는 경기
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
              아래 조건이 충족되면 한국 32강 진출에 유리해요
            </div>
          </div>
          {data.scenarios.map((sc, idx) => {
            const homeTeam = teams[sc.match.home];
            const awayTeam = teams[sc.match.away];
            const matchTime = new Date(sc.match.date).toLocaleString("ko-KR", {
              month: "numeric", day: "numeric", weekday: "short",
              hour: "2-digit", minute: "2-digit", hour12: false,
            });
            return (
              <div key={idx} style={{
                background: "var(--card2)", borderRadius: 14, padding: 14, marginBottom: 10,
                borderLeft: `3px solid ${sc.impact === "must_watch" ? "var(--gold)" : sc.impact === "dangerous" ? "var(--red)" : "var(--teal)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)",
                  }}>{sc.group}조</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{matchTime}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <img src={`https://flagcdn.com/w40/${homeTeam?.flag || ""}.png`} style={{ width: 20, height: 14, borderRadius: 2 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{homeTeam?.name || sc.match.home}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>vs</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <img src={`https://flagcdn.com/w40/${awayTeam?.flag || ""}.png`} style={{ width: 20, height: 14, borderRadius: 2 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{awayTeam?.name || sc.match.away}</span>
                  </div>
                </div>
                {sc.conditions.map((cond, ci) => (
                  <div key={ci} style={{
                    display: "flex", alignItems: "flex-start", gap: 6, marginTop: 4,
                  }}>
                    {(() => {
                      const isGood = cond.startsWith("✅");
                      const isBad = cond.startsWith("❌");
                      const color = isGood ? "#00856A" : isBad ? "#E4002B" : "#D4AF37";
                      const bg = isGood ? "rgba(0,133,106,.15)" : isBad ? "rgba(228,0,43,.15)" : "rgba(212,175,55,.15)";
                      const icon = isGood ? "▲" : isBad ? "▼" : "●";
                      const text = cond.replace(/^[✅❌⚠️]\s*/, "");
                      return (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ width: 20, height: 20, borderRadius: 6, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>{text}</span>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* 광고 배너 */}
      <div style={{ marginTop: 20 }}>
        <BannerAd adGroupId={AD_IDS.BANNER_TAB1} />
      </div>
    </div>
  );
}
