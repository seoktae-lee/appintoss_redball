import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { BracketResponse, KnockoutMatch } from "../api/types";
import { BannerAd } from "../components/BannerAd";
import { AD_IDS } from "../data/adConfig";

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

const ROUND_LABEL: Record<string, string> = {
  R32: "32강", R16: "16강", QF: "8강", SF: "4강", F: "결승",
};

const ROUND_ORDER: KnockoutMatch["round"][] = ["R32", "R16", "QF", "SF", "F"];

function MatchSlot({
  match, teams, myTeam, compact = false,
}: {
  match: KnockoutMatch;
  teams: BracketResponse["teams"];
  myTeam?: string;
  compact?: boolean;
}) {
  const home = match.homeTeam ? teams[match.homeTeam] : null;
  const away = match.awayTeam ? teams[match.awayTeam] : null;
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY";

  const winner = isFinished && match.homeScore !== null && match.awayScore !== null
    ? (match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam)
    : null;

  const matchDate = new Date(match.date);
  const dateLabel = matchDate.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" });
  const timeLabel = matchDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  const isMyTeam = (code: string | null) => code === myTeam;

  return (
    <div style={{
      background: "var(--card2)",
      borderRadius: compact ? 8 : 12,
      padding: compact ? "6px 8px" : "10px 12px",
      border: (isMyTeam(match.homeTeam) || isMyTeam(match.awayTeam))
        ? "1px solid var(--red)" : "1px solid rgba(255,255,255,.06)",
      minWidth: compact ? 100 : 140,
    }}>
      {/* 상태 표시 */}
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: isLive ? "var(--red)" : "var(--w40)", fontWeight: isLive ? 700 : 400 }}>
            {isLive ? "● LIVE" : isFinished ? "종료" : `${dateLabel} ${timeLabel}`}
          </span>
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
  );
}

export function BracketTab({ myTeam }: { myTeam?: string }) {
  const [data, setData] = useState<BracketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState<KnockoutMatch["round"]>("R32");

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

  return (
    <div style={{ paddingBottom: 20 }}>
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
                <MatchSlot match={m} teams={data.teams} myTeam={myTeam} />
              </div>
            ))}
          </div>
        ) : activeRound === "SF" ? (
          // 4강: 2경기 세로
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {roundMatches.map(m => (
              <MatchSlot key={m.id} match={m} teams={data.teams} myTeam={myTeam} />
            ))}
          </div>
        ) : (
          // R32/R16/QF: 좌우 2열
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[...leftMatches, ...rightMatches].map(m => (
              <MatchSlot key={m.id} match={m} teams={data.teams} myTeam={myTeam} />
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
