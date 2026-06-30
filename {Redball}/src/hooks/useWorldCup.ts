import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { WorldCupData } from "../api/types";

export function useWorldCup(teamCode: string | null) {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!teamCode) return;
    try {
      const result = await api.get<WorldCupData>(`/api/worldcup/data?team=${teamCode}`);
      setData(result);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [teamCode]);

  useEffect(() => {
    if (!teamCode) return;
    setLoading(true);
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [fetch, teamCode]);

  return { data, loading, error, refresh: fetch };
}
