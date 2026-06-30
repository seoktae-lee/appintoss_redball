import { useState, useEffect, useMemo } from "react";
import { api } from "../api/client";
import type { TeamsResponse } from "../api/types";

const FLAG_URL = (code: string) => `https://flagcdn.com/w40/${code}.png`;

interface Props {
  onSelect: (teamCode: string) => void;
}

export function TeamSelectPage({ onSelect }: Props) {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<TeamsResponse>("/api/worldcup/teams").then(setData).catch(() => {});
  }, []);

  const groupKeys = useMemo(() => (data ? Object.keys(data.groups).sort() : []), [data]);

  const filteredGroups = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return groupKeys
      .map(g => {
        const codes = data.groups[g];
        const teams = codes
          .map(code => data.teams[code])
          .filter(t => !q || t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
        return { group: g, teams };
      })
      .filter(g => g.teams.length > 0);
  }, [data, groupKeys, query]);

  const handleSelect = async (teamCode: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.patch("/api/auth/me", { myTeam: teamCode });
    } catch {}
    onSelect(teamCode);
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F1E", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 8px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>응원할 팀을 골라봐</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>선택한 팀의 32강 진출 경우의 수를 보여줄게요</p>
      </div>

      <div style={{ padding: "8px 20px" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="국가명 검색 (예: 브라질)"
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 32px" }}>
        {!data ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.4)" }}>불러오는 중...</div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.4)" }}>검색 결과가 없어요</div>
        ) : (
          filteredGroups.map(({ group, teams }) => (
            <div key={group} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.35)", marginBottom: 8 }}>{group}조</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {teams.map(team => (
                  <button
                    key={team.code}
                    onClick={() => handleSelect(team.code)}
                    disabled={saving}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                      background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: 12, cursor: saving ? "default" : "pointer", fontFamily: "inherit",
                      opacity: saving ? 0.6 : 1, textAlign: "left",
                    }}
                  >
                    <img src={FLAG_URL(team.flag)} style={{ width: 26, height: 18, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{team.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
