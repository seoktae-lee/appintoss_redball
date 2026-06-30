import { useState } from "react";
import { ConfirmDialog } from "@toss/tds-mobile";
import { LoginPage } from "./pages/LoginPage";
import { TeamSelectPage } from "./pages/TeamSelectPage";
import { BracketTab } from "./pages/BracketTab";
import { ProbabilityTab } from "./pages/ProbabilityTab";
import { PredictTab } from "./pages/PredictTab";
import { useWorldCup } from "./hooks/useWorldCup";
import { api, clearAuth } from "./api/client";

type Tab = "bracket" | "odds" | "predict";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("redball_token"));
  const [myTeam, setMyTeam] = useState<string | null>(() => localStorage.getItem("redball_my_team"));
  const [tab, setTab] = useState<Tab>("bracket");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { data, refresh } = useWorldCup(myTeam);

  const handleWithdraw = async () => {
    try { await api.delete("/api/auth/me"); } catch {}
    clearAuth();
    localStorage.removeItem("redball_my_team");
    setMyTeam(null);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={(user) => {
          setLoggedIn(true);
          if (user.myTeam) {
            localStorage.setItem("redball_my_team", user.myTeam);
            setMyTeam(user.myTeam);
          }
        }}
      />
    );
  }

  if (!myTeam) {
    return (
      <TeamSelectPage
        onSelect={(teamCode) => {
          localStorage.setItem("redball_my_team", teamCode);
          setMyTeam(teamCode);
        }}
      />
    );
  }

  const myTeamName = data?.teams[myTeam]?.name || myTeam;

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F1E", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--red)", letterSpacing: -.5 }}>REDBALL</h1>
          <small style={{ fontSize: 11, color: "var(--w40)" }}>2026 FIFA 북중미 월드컵 · {myTeamName} 응원 중</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              localStorage.removeItem("redball_my_team");
              setMyTeam(null);
            }}
            style={{
              fontSize: 11, color: "var(--w60)", background: "rgba(255,255,255,.08)",
              border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontFamily: "inherit",
            }}
          >팀 변경</button>
          <button
            onClick={() => window.open("https://seoktae-lee.github.io/appintoss_redball_terms/", "_blank")}
            style={{
              fontSize: 11, color: "var(--w60)", background: "rgba(255,255,255,.08)",
              border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontFamily: "inherit",
            }}
          >약관</button>
          <div style={{ textAlign: "right" }} onClick={refresh}>
            <small style={{ fontSize: 11, color: "var(--w40)" }}>업데이트</small><br/>
            <span style={{ fontSize: 12, color: "var(--w60)" }}>
              {data ? timeAgo(data.lastUpdated) : "..."}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 16px", borderBottom: "1px solid var(--w20)" }}>
        <TabButton label="대진표" active={tab === "bracket"} onClick={() => setTab("bracket")} />
        <TabButton label="우승 확률" active={tab === "odds"} onClick={() => setTab("odds")} />
        <TabButton label="내 예측" active={tab === "predict"} onClick={() => setTab("predict")} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "bracket" && <BracketTab myTeam={myTeam ?? undefined} />}
        {tab === "odds" && <ProbabilityTab myTeam={myTeam ?? undefined} />}
        {tab === "predict" && <PredictTab />}

        <button onClick={() => setShowWithdraw(true)} style={{
          width: "100%", marginTop: 8, padding: "12px 0 28px", border: "none", background: "none",
          color: "var(--w40)", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit",
        }}>서비스 탈퇴</button>
      </div>

      <ConfirmDialog
        open={showWithdraw}
        title={<ConfirmDialog.Title>정말 탈퇴할까요?</ConfirmDialog.Title>}
        description={<ConfirmDialog.Description>탈퇴하면 응원팀 설정과 예측 기록이 모두 삭제되고 되돌릴 수 없어요.</ConfirmDialog.Description>}
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setShowWithdraw(false)}>취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton color="danger" onClick={async () => { setShowWithdraw(false); await handleWithdraw(); }}>탈퇴하기</ConfirmDialog.ConfirmButton>}
        onClose={() => setShowWithdraw(false)}
      />
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: 700,
      border: "none", cursor: "pointer", background: "none", fontFamily: "inherit",
      color: active ? "var(--red)" : "var(--w40)",
      borderBottom: active ? "3px solid var(--red)" : "3px solid transparent",
      transition: ".2s",
    }}>{label}</button>
  );
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
}
