import { useState } from "react";
import type { WorldCupData, MatchResult } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";

interface Props { data: WorldCupData }

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

interface MatchScenario {
  conditions: string[];
  probabilities?: { homeWin: number; draw: number; awayWin: number };
}

function MatchCard({ match, teams, isKorea, scenario, isExpanded, onToggle }: {
  match: MatchResult; teams: WorldCupData["teams"]; isKorea: boolean;
  scenario?: MatchScenario; isExpanded: boolean; onToggle: () => void;
}) {
  const home = teams[match.homeTeam];
  const away = teams[match.awayTeam];
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const time = new Date(match.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div style={{ marginBottom: 10 }}>
      <div onClick={scenario ? onToggle : undefined} style={{
        background: "var(--card2)", borderRadius: isExpanded ? "14px 14px 0 0" : 14, padding: 14,
        display: "flex", alignItems: "center",
        border: isKorea ? "1px solid var(--red)" : "none",
        backgroundColor: isKorea ? "rgba(228,0,43,.06)" : "var(--card2)",
        cursor: scenario ? "pointer" : "default",
      }}>
        <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{time}</div>
          <div style={{ fontSize: 10, marginTop: 2, color: isLive ? "var(--red)" : isFinished ? "var(--teal)" : "var(--w40)", fontWeight: isLive ? 700 : 400 }}>
            {isLive ? (match.minute ? `${match.minute}'` : "LIVE") : isFinished ? "종료" : "예정"}
          </div>
        </div>
        <div style={{ flex: 1, margin: "0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--w80)", padding: "2px 0" }}>
            <img src={FLAG_URL(home?.flag || "")} style={{ width: 18, height: 13, borderRadius: 2 }} />
            {home?.name || match.homeTeam}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--w80)", padding: "2px 0" }}>
            <img src={FLAG_URL(away?.flag || "")} style={{ width: 18, height: 13, borderRadius: 2 }} />
            {away?.name || match.awayTeam}
          </div>
        </div>
        <div style={{ width: 40, textAlign: "center" }}>
          {match.homeScore !== null ? (
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, color: "#fff" }}>
              {match.homeScore}<br/>{match.awayScore}
            </div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, color: "rgba(255,255,255,.4)" }}>-<br/>-</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ fontSize: 10, color: "var(--w40)", padding: "2px 6px", background: "var(--w20)", borderRadius: 4 }}>
            {match.group}조
          </div>
          {scenario && (
            <div style={{ fontSize: 8, color: "var(--gold)", fontWeight: 600 }}>
              {isExpanded ? "▲" : "관전▼"}
            </div>
          )}
        </div>
      </div>
      {isExpanded && scenario && (
        <div style={{
          background: "rgba(212,175,55,.06)", borderRadius: "0 0 14px 14px",
          padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,.05)",
        }}>
          {scenario.probabilities && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 4 }}>예상 승률</div>
              <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ width: `${scenario.probabilities.homeWin}%`, background: "#E4002B" }} />
                <div style={{ width: `${scenario.probabilities.draw}%`, background: "rgba(255,255,255,.3)" }} />
                <div style={{ width: `${scenario.probabilities.awayWin}%`, background: "#0033A0" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span style={{ color: "#E4002B" }}>{home?.name} {scenario.probabilities.homeWin}%</span>
                <span style={{ color: "rgba(255,255,255,.4)" }}>무 {scenario.probabilities.draw}%</span>
                <span style={{ color: "#5577CC" }}>{away?.name} {scenario.probabilities.awayWin}%</span>
              </div>
            </div>
          )}
          {scenario.conditions.map((cond, ci) => {
            const isGood = cond.startsWith("✅");
            const isBad = cond.startsWith("❌");
            const color = isGood ? "#00856A" : isBad ? "#E4002B" : "#D4AF37";
            const bg = isGood ? "rgba(0,133,106,.15)" : isBad ? "rgba(228,0,43,.15)" : "rgba(212,175,55,.15)";
            const icon = isGood ? "▲" : isBad ? "▼" : "●";
            const text = cond.replace(/^[✅❌⚠️💡]\s*/, "");
            return (
              <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 4 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)", lineHeight: 1.4 }}>{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MatchesTab({ data }: Props) {
  const { teams, groups, matches, allStandings, todayMatches } = data;

  const [dateOffset, setDateOffset] = useState(0);
  const [showGroups, setShowGroups] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + dateOffset);
  const dateStr = baseDate.toISOString().slice(0, 10);
  const dateLabel = baseDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  const displayMatches = dateOffset === 0
    ? todayMatches
    : matches.filter(m => m.date.slice(0, 10) === dateStr);

  const koreaTeams = new Set(["KOR"]);

  const groupKeys = Object.keys(groups).sort();

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* 오늘의 경기 */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--w40)", letterSpacing: 1, marginBottom: 10 }}>
          경기 일정
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "8px 0", marginBottom: 12 }}>
          <button onClick={() => setDateOffset(d => d - 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 18 }}>◀</button>
          <div style={{ fontSize: 16, fontWeight: 700, textAlign: "center", color: "#fff" }}>
            {dateLabel}
            <small style={{ display: "block", fontSize: 12, color: dateOffset === 0 ? "#E4002B" : "rgba(255,255,255,.4)", fontWeight: dateOffset === 0 ? 600 : 400 }}>
              {dateOffset === 0 ? "오늘" : ""}
            </small>
          </div>
          <button onClick={() => setDateOffset(d => d + 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 18 }}>▶</button>
        </div>

        {displayMatches.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: "var(--w40)", fontSize: 13 }}>
            이 날짜에 경기가 없습니다
          </div>
        ) : (
          displayMatches.map(m => {
            const sc = data.scenarios?.find(s => s.match.home === m.homeTeam && s.match.away === m.awayTeam);
            const scenario = sc ? { conditions: sc.conditions, probabilities: sc.probabilities } : undefined;
            return (
              <MatchCard
                key={m.id}
                match={m}
                teams={teams}
                isKorea={koreaTeams.has(m.homeTeam) || koreaTeams.has(m.awayTeam)}
                scenario={scenario}
                isExpanded={expandedMatch === m.id}
                onToggle={() => setExpandedMatch(expandedMatch === m.id ? null : m.id)}
              />
            );
          })
        )}
      </div>

      {/* 전체 조별리그 (토글) */}
      <div style={{ padding: "20px 16px 0" }}>
        <button
          onClick={() => setShowGroups(!showGroups)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", background: "var(--card)", borderRadius: 14, border: "none",
            cursor: "pointer", marginBottom: showGroups ? 10 : 0, fontFamily: "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>조별리그 전체</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>12조</span>
          </div>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)", transition: "transform .2s", transform: showGroups ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
        </button>
        {showGroups && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {groupKeys.map(g => {
            const standings = allStandings[g] || [];
            const isKoreaGroup = g === "A";
            const groupMatches = matches.filter(m => m.group === g);
            const finished = groupMatches.filter(m => m.status === "FINISHED").length;
            const total = groupMatches.length;
            const isDone = finished >= total;

            return (
              <div key={g} style={{
                background: "var(--card2)", borderRadius: 12, padding: 10,
                border: isKoreaGroup ? "1px solid var(--red)" : "none",
                backgroundColor: isKoreaGroup ? "rgba(228,0,43,.06)" : "var(--card2)",
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, marginBottom: 6,
                  color: isKoreaGroup ? "var(--red)" : "var(--w40)",
                }}>
                  {g}조 {isDone ? "(종료)" : `(${finished}/${total})`}
                </div>
                {standings.map(s => {
                  const team = teams[s.team];
                  const isKorea = s.team === "KOR";
                  const isFirst = s.position <= 2;
                  const isThirdGood = s.position === 3;

                  return (
                    <div key={s.team} style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 0",
                      color: isKorea ? "var(--red)" : isFirst ? "var(--teal)" : isThirdGood ? "var(--gold)" : "var(--w60)",
                      fontWeight: isKorea ? 700 : isFirst ? 600 : 400,
                      opacity: s.position === 4 ? 0.4 : 1,
                    }}>
                      <img src={FLAG_URL(team?.flag || "")} style={{ width: 14, height: 10, borderRadius: 1 }} />
                      {team?.name || s.team} {s.points}pts
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>}
      </div>

      {/* 광고 배너 */}
      <div style={{ marginTop: 20 }}>
        <BannerAd adGroupId={AD_IDS.BANNER_TAB2} />
      </div>
    </div>
  );
}
