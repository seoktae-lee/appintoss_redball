import { useState } from "react";
import type { WorldCupData, MatchResult } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";

interface Props { data: WorldCupData }

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

function MatchCard({ match, teams, isKorea }: { match: MatchResult; teams: WorldCupData["teams"]; isKorea: boolean }) {
  const home = teams[match.homeTeam];
  const away = teams[match.awayTeam];
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const time = new Date(match.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div style={{
      background: "var(--card2)", borderRadius: 14, padding: 14, marginBottom: 10,
      display: "flex", alignItems: "center",
      border: isKorea ? "1px solid var(--red)" : "none",
      backgroundColor: isKorea ? "rgba(228,0,43,.06)" : "var(--card2)",
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
      <div style={{ fontSize: 10, color: "var(--w40)", padding: "2px 6px", background: "var(--w20)", borderRadius: 4 }}>
        {match.group}조
      </div>
    </div>
  );
}

export function MatchesTab({ data }: Props) {
  const { teams, groups, matches, allStandings, todayMatches } = data;

  const [dateOffset, setDateOffset] = useState(0);
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
          displayMatches.map(m => (
            <MatchCard
              key={m.id}
              match={m}
              teams={teams}
              isKorea={koreaTeams.has(m.homeTeam) || koreaTeams.has(m.awayTeam)}
            />
          ))
        )}
      </div>

      {/* 전체 조별리그 */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--w40)", letterSpacing: 1, marginBottom: 10 }}>
          조별리그 전체
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
        </div>
      </div>

      {/* 광고 배너 */}
      <div style={{ marginTop: 20 }}>
        <BannerAd adGroupId={AD_IDS.BANNER_TAB2} />
      </div>
    </div>
  );
}
