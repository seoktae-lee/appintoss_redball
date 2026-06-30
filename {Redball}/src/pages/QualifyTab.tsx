import { useState } from "react";
import type { WorldCupData } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";

interface Props { data: WorldCupData }

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

export function QualifyTab({ data }: Props) {
  const { probability, teamStatus, thirdPlaceTable, teams } = data;
  const myTeam = teams[teamStatus.code];
  const myTeamName = myTeam?.name || teamStatus.code;
  const myStanding = data.allStandings[teamStatus.group]?.find(s => s.team === teamStatus.code);

  const [showThirdTable, setShowThirdTable] = useState(false);
  const [showBingo, setShowBingo] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);

  const statusLabel = teamStatus.qualified
    ? probability === 100 ? "32강 진출 확정" : teamStatus.groupPosition <= 2 ? "조 상위권 (자동 진출권)" : "진출권 안에 있음"
    : "진출 위험";
  const statusColor = teamStatus.qualified ? "var(--gold)" : "var(--red)";

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* 확률 배너 */}
      <div style={{
        margin: "12px 16px 16px", padding: 20, borderRadius: 20,
        background: "linear-gradient(135deg, #1a1a2e 0%, #2a1a1e 100%)",
        border: "1px solid rgba(228,0,43,.2)", position: "relative", overflow: "hidden",
      }}>
        {/* 깃발 워터마크 */}
        {myTeam && (
          <img src={FLAG_URL(myTeam.flag)} style={{
            position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)",
            width: 90, height: 64, objectFit: "cover", borderRadius: 6, opacity: 0.12,
          }} />
        )}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>{myTeamName} 32강 진출 확률</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#E4002B", lineHeight: 1 }}>
          {probability}<span style={{ fontSize: 26, color: "rgba(255,255,255,.5)" }}>%</span>
        </div>
        <div style={{
          display: "inline-flex", padding: "5px 12px", borderRadius: 6,
          fontSize: 13, fontWeight: 700, marginTop: 10, marginBottom: 12,
          background: teamStatus.qualified ? "rgba(212,175,55,.15)" : "rgba(228,0,43,.15)",
          color: statusColor,
        }}>{statusLabel}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>
          {teamStatus.group}조 {teamStatus.groupPosition > 0 ? `${teamStatus.groupPosition}위` : ""} · 조 1~2위 자동 진출, 상위 8개 3위 팀 진출
        </div>
        {myStanding && (
          <div style={{
            display: "flex", gap: 16, marginTop: 14, paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,.15)",
          }}>
            {[
              { val: String(myStanding.points), label: "승점" },
              { val: myStanding.goalDifference > 0 ? `+${myStanding.goalDifference}` : String(myStanding.goalDifference), label: "골득실" },
              { val: String(myStanding.goalsFor), label: "득점" },
              { val: `${myStanding.won}승 ${myStanding.draw}무 ${myStanding.lost}패`, label: "전적" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3x3 빙고판 (토글) */}
      {data.bingo && data.bingo.cells.length > 0 && (
        <div style={{ padding: "0 16px", marginBottom: 16 }}>
          <button
            onClick={() => setShowBingo(!showBingo)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", background: "var(--card)", borderRadius: 14, border: "none",
              cursor: "pointer", marginBottom: showBingo ? 10 : 0, fontFamily: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>32강 빙고판</span>
              <div style={{ display: "flex", gap: 3 }}>
                {data.bingo.cells.map((c, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: 3, fontSize: 8, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: c.status === "fulfilled" ? "var(--teal)" : c.status === "failed" ? "var(--red)" : "rgba(255,255,255,.15)",
                    color: "#fff",
                  }}>{c.status === "fulfilled" ? "O" : c.status === "failed" ? "X" : ""}</div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{data.bingo.fulfilledCount}/3</span>
            </div>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)", transition: "transform .2s", transform: showBingo ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </button>
          {showBingo && <div style={{
            background: "var(--card)", borderRadius: 20, padding: "16px 12px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,.08)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: "var(--gold)" }}>
                9가지 중 <span style={{ fontWeight: 800, fontSize: 15, color: "var(--red)" }}>3개</span>만 맞으면 {myTeamName} 32강 진출!
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {data.bingo.cells.map((cell, idx) => {
                const t1 = teams[cell.team1];
                const t2 = teams[cell.team2];
                const isFulfilled = cell.status === "fulfilled";
                const isFailed = cell.status === "failed";

                const borderColor = isFulfilled ? "var(--teal)" : isFailed ? "var(--red)" : "rgba(255,255,255,.1)";
                const bgColor = isFulfilled ? "rgba(0,133,106,.08)" : isFailed ? "rgba(228,0,43,.06)" : "var(--card2)";

                return (
                  <div key={idx} style={{
                    background: bgColor, borderRadius: 12, padding: "10px 6px",
                    border: `1.5px solid ${borderColor}`, textAlign: "center",
                    position: "relative",
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: isFulfilled ? "var(--teal)" : isFailed ? "var(--red)" : "rgba(255,255,255,.5)",
                      marginBottom: 6, padding: "1px 6px", background: "rgba(255,255,255,.08)",
                      borderRadius: 4, display: "inline-block",
                    }}>{cell.group}조</div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
                      <img src={FLAG_URL(t1?.flag || "")} style={{ width: 24, height: 16, borderRadius: 2 }} />
                      <img src={FLAG_URL(t2?.flag || "")} style={{ width: 24, height: 16, borderRadius: 2 }} />
                    </div>

                    <p style={{
                      fontSize: 10, color: "rgba(255,255,255,.75)", lineHeight: 1.4,
                      wordBreak: "keep-all", minHeight: 28,
                    }}>
                      {cell.condition}
                    </p>

                    {(isFulfilled || isFailed) && (
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: 12,
                        background: isFulfilled ? "rgba(0,133,106,.15)" : "rgba(228,0,43,.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{
                          fontSize: 28, fontWeight: 800,
                          color: isFulfilled ? "var(--teal)" : "var(--red)",
                          opacity: 0.6,
                        }}>{isFulfilled ? "✓" : "✕"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: 12, padding: "10px 12px", borderRadius: 10,
              background: data.bingo.fulfilledCount >= 3 ? "rgba(0,133,106,.12)" : "rgba(212,175,55,.1)",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: 13, fontWeight: 700,
                color: data.bingo.fulfilledCount >= 3 ? "var(--teal)" : "var(--gold)",
              }}>{data.bingo.message}</p>
            </div>
          </div>}
        </div>
      )}

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
                const isMyTeam = entry.team === teamStatus.code;
                const isInCutline = idx < 8;
                const isCutlineBorder = idx === 7;
                const opacity = idx >= 8 ? 0.5 : 1;

                return (
                  <tr key={entry.team} style={{
                    opacity,
                    background: isMyTeam ? "var(--red-bg)" : "transparent",
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
                    <td style={{ padding: "8px 4px", color: isMyTeam ? "var(--red)" : "var(--w80)", fontWeight: isMyTeam ? 700 : 400 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <img src={FLAG_URL(team?.flag || "")} style={{ width: 18, height: 13, borderRadius: 2, objectFit: "cover" }} />
                        {team?.name || entry.team} ({entry.group})
                      </span>
                    </td>
                    <td style={{ padding: "8px 4px", textAlign: "center", fontWeight: 700, color: isMyTeam ? "var(--red)" : "var(--w80)" }}>{entry.points}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: isMyTeam ? "var(--red)" : "var(--w80)" }}>{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: isMyTeam ? "var(--red)" : "var(--w80)" }}>{entry.goalsFor}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", fontSize: 10, color: isMyTeam ? "var(--gold)" : entry.status === "FINISHED" ? "var(--teal)" : "var(--gold)" }}>
                      {isMyTeam ? "대기 중" : entry.status === "FINISHED" ? "확정" : "진행 중"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 내 팀 상태 요약 */}
          <div style={{
            marginTop: 10, padding: "8px 10px", background: "var(--red-bg)",
            borderRadius: 8, display: "flex", alignItems: "center", gap: 6,
          }}>
            <img src={FLAG_URL(myTeam?.flag || "")} style={{ width: 22, height: 16, borderRadius: 2, objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>
                {teamStatus.groupPosition <= 2 && teamStatus.groupPosition > 0
                  ? `현재 조 ${teamStatus.groupPosition}위 — 32강 자동 진출권`
                  : `현재 3위팀 중 ${teamStatus.position}위 — ${teamStatus.qualified ? "32강 진출권 안에 있음" : "진출권 밖"}`}
              </div>
              <div style={{ fontSize: 11, color: "var(--w60)" }}>
                조 1~2위 자동 진출 · 3위는 8위까지 진출 · 남은 경기 결과에 따라 변동
              </div>
            </div>
          </div>
        </div>}
      </div>

      {/* 관전 포인트 (토글) */}
      {data.scenarios && data.scenarios.length > 0 && (
        <div style={{ padding: "0 16px", marginTop: 16 }}>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", background: "var(--card)", borderRadius: 14, border: "none",
              cursor: "pointer", marginBottom: showScenarios ? 10 : 0, fontFamily: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>관전 포인트</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{data.scenarios.length}경기</span>
            </div>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)", transition: "transform .2s", transform: showScenarios ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </button>
          {showScenarios && <>
          {data.scenarios.map((sc, idx) => {
            const homeTeam = teams[sc.match.home];
            const awayTeam = teams[sc.match.away];
            const matchTime = new Date(sc.match.date).toLocaleString("ko-KR", {
              month: "numeric", day: "numeric", weekday: "short",
              hour: "2-digit", minute: "2-digit", hour12: false,
            });
            const borderColor = sc.impact === "must_watch" ? "var(--gold)" : sc.impact === "dangerous" ? "var(--red)" : "var(--teal)";

            return (
              <div key={idx} style={{
                background: "var(--card2)", borderRadius: 14, padding: 14, marginBottom: 10,
                borderLeft: `3px solid ${borderColor}`,
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
                {/* ELO 기반 예상 승률 */}
                {sc.probabilities && (
                  <div style={{ marginBottom: 10, padding: "8px 10px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 6 }}>예상 승률 (ELO 레이팅 기반)</div>
                    <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ width: `${sc.probabilities.homeWin}%`, background: "#E4002B" }} />
                      <div style={{ width: `${sc.probabilities.draw}%`, background: "rgba(255,255,255,.3)" }} />
                      <div style={{ width: `${sc.probabilities.awayWin}%`, background: "#0033A0" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ color: "#E4002B", fontWeight: 600 }}>{homeTeam?.name} {sc.probabilities.homeWin}%</span>
                      <span style={{ color: "rgba(255,255,255,.4)" }}>무 {sc.probabilities.draw}%</span>
                      <span style={{ color: "#5577CC", fontWeight: 600 }}>{awayTeam?.name} {sc.probabilities.awayWin}%</span>
                    </div>
                  </div>
                )}
                {sc.conditions.map((cond, ci) => (
                  <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 4 }}>
                    {(() => {
                      const isGood = cond.startsWith("✅");
                      const isBad = cond.startsWith("❌");
                      const isTip = cond.startsWith("💡");
                      const color = isTip ? "#fff" : isGood ? "#00856A" : isBad ? "#E4002B" : "#D4AF37";
                      const bg = isTip ? "rgba(228,0,43,.25)" : isGood ? "rgba(0,133,106,.15)" : isBad ? "rgba(228,0,43,.15)" : "rgba(212,175,55,.15)";
                      const icon = isTip ? "★" : isGood ? "▲" : isBad ? "▼" : "●";
                      const text = cond.replace(/^[✅❌⚠️💡]\s*/, "");
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
          </>}
        </div>
      )}

      {/* 광고 배너 */}
      <div style={{ marginTop: 20 }}>
        <BannerAd adGroupId={AD_IDS.BANNER_TAB1} />
      </div>
    </div>
  );
}
