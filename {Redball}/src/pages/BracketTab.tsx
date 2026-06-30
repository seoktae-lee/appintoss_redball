import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { BracketResponse, KnockoutMatch, TeamPathResponse } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

const ROUND_LABEL: Record<string, string> = {
  R32: "32강", R16: "16강", QF: "8강", SF: "4강", F: "결승",
};

const ROUND_ORDER: KnockoutMatch["round"][] = ["R32", "R16", "QF", "SF", "F"];

function WatchPointCard({ match, teams }: { match: KnockoutMatch; teams: BracketResponse["teams"] }) {
  const wp = match.watchPoint;
  if (!wp) return null;
  const home = teams[match.homeTeam!];
  const away = teams[match.awayTeam!];

  return (
    <div style={{
      marginTop: 6, padding: "10px 12px", borderRadius: 10,
      background: "rgba(212,175,55,.06)", border: "1px solid rgba(212,175,55,.15)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 8 }}>{wp.headline}</div>
      <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ width: `${wp.probabilities.homeWin}%`, background: "#E4002B" }} />
        <div style={{ width: `${wp.probabilities.awayWin}%`, background: "#0033A0" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 8 }}>
        <span style={{ color: "#E4002B", fontWeight: 600 }}>{home?.name} {wp.probabilities.homeWin}%</span>
        <span style={{ color: "#5577CC", fontWeight: 600 }}>{away?.name} {wp.probabilities.awayWin}%</span>
      </div>
      {wp.points.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,.7)", lineHeight: 1.5, marginTop: 3 }}>{p}</div>
      ))}
    </div>
  );
}

function MatchSlot({
  match, teams, myTeam, compact = false, isExpanded, onToggle,
}: {
  match: KnockoutMatch;
  teams: BracketResponse["teams"];
  myTeam?: string;
  compact?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const home = match.homeTeam ? teams[match.homeTeam] : null;
  const away = match.awayTeam ? teams[match.awayTeam] : null;
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY";
  const canExpand = !!match.watchPoint && !isFinished;

  const winner = isFinished && match.homeScore !== null && match.awayScore !== null
    ? (match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam)
    : null;

  const matchDate = new Date(match.date);
  const dateLabel = matchDate.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" });
  const timeLabel = matchDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  const isMyTeam = (code: string | null) => code === myTeam;

  return (
    <div>
      <div
        onClick={canExpand ? onToggle : undefined}
        style={{
          background: "var(--card2)",
          borderRadius: compact ? 8 : 12,
          padding: compact ? "6px 8px" : "10px 12px",
          border: (isMyTeam(match.homeTeam) || isMyTeam(match.awayTeam))
            ? "1px solid var(--red)" : "1px solid rgba(255,255,255,.06)",
          minWidth: compact ? 100 : 140,
          cursor: canExpand ? "pointer" : "default",
        }}>
        {/* 상태 표시 */}
        {!compact && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: isLive ? "var(--red)" : "var(--w40)", fontWeight: isLive ? 700 : 400 }}>
              {isLive ? "● LIVE" : isFinished ? "종료" : `${dateLabel} ${timeLabel}`}
            </span>
            {canExpand && (
              <span style={{ fontSize: 9, color: "var(--gold)", fontWeight: 600 }}>{isExpanded ? "▲" : "관전포인트▼"}</span>
            )}
          </div>
        )}

        {/* 홈팀 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5, marginBottom: 3,
          opacity: isFinished && winner !== match.homeTeam ? 0.45 : 1,
        }}>
          {home ? <img src={FLAG_URL(home.flag)} style={{ width: compact ? 14 : 18, height: compact ? 10 : 13, borderRadius: 2, objectFit: "cover" }} /> : <div style={{ width: compact ? 14 : 18, height: compact ? 10 : 13, background: "var(--w20)", borderRadius: 2 }} />}
          <span style={{ fontSize: compact ? 10 : 12, fontWeight: isMyTeam(match.homeTeam) ? 700 : 500, color: isMyTeam(match.homeTeam) ? "var(--red)" : "var(--w80)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {home?.name || "TBD"}
          </span>
          {isFinished && <span style={{ fontSize: compact ? 11 : 14, fontWeight: 800, color: winner === match.homeTeam ? "#fff" : "var(--w40)", minWidth: 14, textAlign: "right" }}>{match.homeScore}</span>}
        </div>

        {/* 어웨이팀 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          opacity: isFinished && winner !== match.awayTeam ? 0.45 : 1,
        }}>
          {away ? <img src={FLAG_URL(away.flag)} style={{ width: compact ? 14 : 18, height: compact ? 10 : 13, borderRadius: 2, objectFit: "cover" }} /> : <div style={{ width: compact ? 14 : 18, height: compact ? 10 : 13, background: "var(--w20)", borderRadius: 2 }} />}
          <span style={{ fontSize: compact ? 10 : 12, fontWeight: isMyTeam(match.awayTeam) ? 700 : 500, color: isMyTeam(match.awayTeam) ? "var(--red)" : "var(--w80)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {away?.name || "TBD"}
          </span>
          {isFinished && <span style={{ fontSize: compact ? 11 : 14, fontWeight: 800, color: winner === match.awayTeam ? "#fff" : "var(--w40)", minWidth: 14, textAlign: "right" }}>{match.awayScore}</span>}
        </div>
      </div>
      {isExpanded && canExpand && <WatchPointCard match={match} teams={teams} />}
    </div>
  );
}

function MyTeamScenarioCard({ myTeam, teams }: { myTeam: string; teams: BracketResponse["teams"] }) {
  const [data, setData] = useState<TeamPathResponse | null>(null);

  useEffect(() => {
    api.get<TeamPathResponse>(`/api/worldcup/path?team=${myTeam}`).then(setData).catch(() => {});
  }, [myTeam]);

  if (!data || !data.scenario.inBracket) return null;
  const { scenario, odds, samples } = data;
  const myName = teams[myTeam]?.name || myTeam;

  return (
    <div style={{
      margin: "0 16px 12px", padding: 16, borderRadius: 16,
      background: "linear-gradient(135deg, #1a1a2e 0%, #2a1a1e 100%)",
      border: "1px solid rgba(228,0,43,.2)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{myName}의 경우의 수</div>

      {scenario.eliminated && (
        <div style={{ fontSize: 13, color: "var(--w60)" }}>
          {ROUND_LABEL[scenario.eliminated.round]}에서 {teams[scenario.eliminated.opponent]?.name || scenario.eliminated.opponent}에게
          {" "}{scenario.eliminated.homeScore}-{scenario.eliminated.awayScore}로 탈락했어요
        </div>
      )}

      {scenario.nextMatch && (
        <div style={{ marginBottom: odds ? 12 : 0 }}>
          <div style={{ fontSize: 12, color: "var(--w40)", marginBottom: 6 }}>
            다음 경기 · {ROUND_LABEL[scenario.nextMatch.round]}
          </div>
          {scenario.nextMatch.opponent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#fff" }}>
              <img src={FLAG_URL(teams[scenario.nextMatch.opponent]?.flag || "")} style={{ width: 20, height: 14, borderRadius: 2 }} />
              vs {teams[scenario.nextMatch.opponent]?.name || scenario.nextMatch.opponent}
            </div>
          ) : scenario.nextMatch.candidates.length > 0 ? (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginBottom: 6 }}>상대 후보 (이전 경기 결과로 결정)</div>
              {scenario.nextMatch.candidates.map(c => (
                <div key={c.teamCode} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <img src={FLAG_URL(teams[c.teamCode]?.flag || "")} style={{ width: 18, height: 13, borderRadius: 2 }} />
                  <span style={{ fontSize: 13, color: "#fff", flex: 1 }}>{teams[c.teamCode]?.name || c.teamCode}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{c.prob}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--w40)" }}>상대가 아직 결정되지 않았어요</div>
          )}
        </div>
      )}

      {odds && (
        <div style={{ paddingTop: 10, borderTop: scenario.nextMatch ? "1px solid rgba(255,255,255,.1)" : "none" }}>
          <div style={{ fontSize: 12, color: "var(--w40)", marginBottom: 4 }}>
            {samples.toLocaleString()}회 시뮬레이션 결과
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)" }}>
            우승 <b style={{ color: "var(--gold)" }}>{Math.round(odds.winPct / 100 * samples).toLocaleString()}회</b> ({odds.winPct}%)
            {" · "}결승 {odds.finalPct}% · 4강 {odds.semiFinalPct}%
          </div>
        </div>
      )}
    </div>
  );
}

export function BracketTab({ myTeam }: { myTeam?: string }) {
  const [data, setData] = useState<BracketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState<KnockoutMatch["round"]>("R32");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get<BracketResponse>("/api/worldcup/bracket")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--w40)" }}>대진표 불러오는 중...</div>;
  if (!data) return <div style={{ padding: 20, textAlign: "center", color: "var(--red)" }}>대진표를 불러올 수 없어요</div>;

  const roundMatches = data.bracket.filter(m => m.round === activeRound);
  const leftMatches = roundMatches.filter(m => m.bracketSide === "L");
  const rightMatches = roundMatches.filter(m => m.bracketSide === "R");

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div style={{ paddingBottom: 20 }}>
      {myTeam && <div style={{ marginTop: 12 }}><MyTeamScenarioCard myTeam={myTeam} teams={data.teams} /></div>}

      {/* 라운드 탭 */}
      <div style={{ display: "flex", padding: "12px 16px 8px", gap: 6, overflowX: "auto" }} className="no-scrollbar">
        {ROUND_ORDER.map(r => {
          const finished = data.bracket.filter(m => m.round === r && m.status === "FINISHED").length;
          const total = data.bracket.filter(m => m.round === r).length;
          return (
            <button key={r} onClick={() => setActiveRound(r)} style={{
              padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: activeRound === r ? 700 : 500,
              border: "none", background: activeRound === r ? "var(--red)" : "var(--card)",
              color: activeRound === r ? "#fff" : "var(--w60)",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {ROUND_LABEL[r]} {finished > 0 && <span style={{ fontSize: 10, opacity: .7 }}>({finished}/{total})</span>}
            </button>
          );
        })}
      </div>

      {/* 경기 목록 (좌/우 두 열) */}
      <div style={{ padding: "8px 16px" }}>
        {activeRound === "F" ? (
          // 결승: 단일 카드 크게
          <div style={{ maxWidth: 300, margin: "0 auto" }}>
            {roundMatches.map(m => (
              <div key={m.id}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 700 }}>🏆 결승</span>
                  <div style={{ fontSize: 11, color: "var(--w40)", marginTop: 2 }}>
                    {new Date(m.date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                  </div>
                </div>
                <MatchSlot match={m} teams={data.teams} myTeam={myTeam} isExpanded={expandedId === m.id} onToggle={() => toggle(m.id)} />
              </div>
            ))}
          </div>
        ) : activeRound === "SF" ? (
          // 4강: 2경기 세로
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {roundMatches.map(m => (
              <MatchSlot key={m.id} match={m} teams={data.teams} myTeam={myTeam} isExpanded={expandedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        ) : (
          // R32/R16/QF: 좌우 2열
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[...leftMatches, ...rightMatches].map(m => (
              <MatchSlot key={m.id} match={m} teams={data.teams} myTeam={myTeam} isExpanded={expandedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        )}
      </div>

      {/* 광고 */}
      <div style={{ marginTop: 16 }}>
        <BannerAd adGroupId={AD_IDS.BANNER_TAB1} />
      </div>
    </div>
  );
}
