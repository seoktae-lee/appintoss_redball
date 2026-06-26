import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { QualifyTab } from "./pages/QualifyTab";
import { MatchesTab } from "./pages/MatchesTab";
import { useWorldCup } from "./hooks/useWorldCup";

type Tab = "qualify" | "matches";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("redball_token"));
  const [tab, setTab] = useState<Tab>("qualify");
  const { data, loading, error, refresh } = useWorldCup();

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F1E", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--red)", letterSpacing: -.5 }}>REDBALL</h1>
          <small style={{ fontSize: 11, color: "var(--w40)" }}>2026 FIFA 북중미 월드컵</small>
        </div>
        <div style={{ textAlign: "right" }} onClick={refresh}>
          <small style={{ fontSize: 11, color: "var(--w40)" }}>업데이트</small><br/>
          <span style={{ fontSize: 12, color: "var(--w60)" }}>
            {data ? timeAgo(data.lastUpdated) : "..."}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 16px", borderBottom: "1px solid var(--w20)" }}>
        <TabButton label="진출 가능성" active={tab === "qualify"} onClick={() => setTab("qualify")} />
        <TabButton label="대진표 · 경기" active={tab === "matches"} onClick={() => setTab("matches")} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && !data && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--w40)" }}>
            로딩 중...
          </div>
        )}
        {error && !data && (
          <div style={{ padding: 20, textAlign: "center", color: "var(--red)" }}>
            {error}<br/>
            <button onClick={refresh} style={{ marginTop: 12, padding: "8px 16px", background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
              다시 시도
            </button>
          </div>
        )}
        {data && tab === "qualify" && <QualifyTab data={data} />}
        {data && tab === "matches" && <MatchesTab data={data} />}
      </div>
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
