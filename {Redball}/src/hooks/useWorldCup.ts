import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { WorldCupData } from "../api/types";

export function useWorldCup() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await api.get<WorldCupData>("/api/worldcup/data");
      setData(result);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
