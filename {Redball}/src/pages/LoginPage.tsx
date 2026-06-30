import { useState, useEffect } from "react";
import { appLogin, getAnonymousKey } from "@apps-in-toss/web-framework";
import { api, saveAuth } from "../api/client";
import type { LoginResponse } from "../api/types";
import logo from "../assets/logo.png";

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AIT === "true";

interface Props {
  onLogin: (user: LoginResponse["user"]) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let anonymousKey: string;

      if (DEV_BYPASS) {
        anonymousKey = "dev-bypass-key";
      } else {
        const keyResult = await getAnonymousKey();
        if (!keyResult || keyResult === "ERROR") {
          throw new Error("유저 식별키를 가져올 수 없어요.");
        }
        anonymousKey = typeof keyResult === "object" && "hash" in keyResult
          ? keyResult.hash
          : String(keyResult);
      }

      const response = await api.post<LoginResponse>("/api/auth/login", { anonymousKey });
      saveAuth(response.token);

      if (!DEV_BYPASS) {
        try {
          await appLogin();
        } catch {}
      }

      onLogin(response.user);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F0F1E",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 32px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* 태극문양 배경 */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {/* 빨간 반원 (상단 우측) */}
        <div style={{
          position: "absolute", top: "15%", right: "-15%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(228,0,43,.15) 0%, rgba(228,0,43,.03) 70%, transparent 100%)",
        }} />
        {/* 파란 반원 (하단 좌측) */}
        <div style={{
          position: "absolute", bottom: "15%", left: "-15%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,51,160,.15) 0%, rgba(0,51,160,.03) 70%, transparent 100%)",
        }} />
        {/* 태극 S자 커브 */}
        <svg style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.06, animation: "spinSlow 60s linear infinite" }} width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
          <path d="M200 20 A180 180 0 0 1 200 380 A90 90 0 0 0 200 200 A90 90 0 0 1 200 20Z" fill="rgba(228,0,43,.4)"/>
          <path d="M200 380 A180 180 0 0 1 200 20 A90 90 0 0 0 200 200 A90 90 0 0 1 200 380Z" fill="rgba(0,51,160,.4)"/>
        </svg>
        {/* 건곤감리 라인 힌트 */}
        <div style={{ position: "absolute", top: "12%", left: "12%", display: "flex", flexDirection: "column", gap: 4, opacity: 0.08 }}>
          <div style={{ width: 40, height: 3, background: "#fff", borderRadius: 2 }} />
          <div style={{ width: 40, height: 3, background: "#fff", borderRadius: 2 }} />
          <div style={{ width: 40, height: 3, background: "#fff", borderRadius: 2 }} />
        </div>
        <div style={{ position: "absolute", top: "12%", right: "12%", display: "flex", flexDirection: "column", gap: 4, opacity: 0.08 }}>
          <div style={{ display: "flex", gap: 6 }}><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /></div>
          <div style={{ width: 40, height: 3, background: "#fff", borderRadius: 2 }} />
          <div style={{ display: "flex", gap: 6 }}><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /></div>
        </div>
        <div style={{ position: "absolute", bottom: "12%", left: "12%", display: "flex", flexDirection: "column", gap: 4, opacity: 0.08 }}>
          <div style={{ width: 40, height: 3, background: "#fff", borderRadius: 2 }} />
          <div style={{ display: "flex", gap: 6 }}><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /></div>
          <div style={{ width: 40, height: 3, background: "#fff", borderRadius: 2 }} />
        </div>
        <div style={{ position: "absolute", bottom: "12%", right: "12%", display: "flex", flexDirection: "column", gap: 4, opacity: 0.08 }}>
          <div style={{ display: "flex", gap: 6 }}><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /></div>
          <div style={{ display: "flex", gap: 6 }}><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /></div>
          <div style={{ display: "flex", gap: 6 }}><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /><div style={{ width: 17, height: 3, background: "#fff", borderRadius: 2 }} /></div>
        </div>
      </div>

      {/* 앱 로고 */}
      <img
        src={logo}
        alt="레드볼"
        style={{
          width: 120, height: 120, objectFit: "contain", borderRadius: 28,
          position: "relative", zIndex: 1,
          animation: ready ? "logoFloat 3s ease-in-out infinite" : "none",
        }}
      />

      <h1 style={{
        fontSize: 32, fontWeight: 800, color: "#E4002B", marginTop: 16,
        letterSpacing: -1, position: "relative", zIndex: 1,
        opacity: ready ? 1 : 0,
        animation: ready ? "fadeUp 0.5s ease-out 0.1s both" : "none",
      }}>REDBALL</h1>

      <p style={{
        fontSize: 15, color: "rgba(255,255,255,.6)", lineHeight: 1.7,
        margin: "12px 0 40px", position: "relative", zIndex: 1,
        opacity: ready ? 1 : 0,
        animation: ready ? "fadeUp 0.5s ease-out 0.2s both" : "none",
      }}>
        내가 응원하는 팀의 32강 진출 경우의 수<br/>실시간으로 확인하세요
      </p>

      {errorMsg && (
        <p style={{ fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{errorMsg}</p>
      )}

      <div style={{
        width: "100%", position: "relative", zIndex: 1,
        opacity: ready ? 1 : 0,
        animation: ready ? "fadeUp 0.5s ease-out 0.4s both" : "none",
      }}>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%", height: 54, borderRadius: 100, border: "none",
            backgroundColor: "#E4002B", color: "#fff", fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(228,0,43,0.4)",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "로그인 중..." : "토스로 시작하기"}
        </button>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 12 }}>
          시작하면{" "}
          <span
            onClick={() => window.open("https://seoktae-lee.github.io/appintoss_redball_terms/", "_blank")}
            style={{ textDecoration: "underline", cursor: "pointer" }}
          >이용약관</span>에 동의합니다
        </p>
      </div>
    </div>
  );
}
