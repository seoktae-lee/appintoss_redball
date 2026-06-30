const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

function getToken(): string | null {
  return localStorage.getItem("redball_token");
}

export function saveAuth(token: string) {
  localStorage.setItem("redball_token", token);
}

export function clearAuth() {
  localStorage.removeItem("redball_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  get: <T>(path: string) =>
    request<T>(path, { method: "GET" }),
};
