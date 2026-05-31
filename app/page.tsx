"use client";

import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";

const SPECTRUM = ["#1e3a8a", "#2563eb", "#facc15", "#f97316", "#dc2626"];

export default function Home() {
  const { user, configured, signInWithGoogle, loading } = useAuth();
  const stops = SPECTRUM.map(
    (c, i) => `${c} ${(i / (SPECTRUM.length - 1)) * 100}%`
  ).join(", ");

  return (
    <div className="landing-page">
      <header className="lp-nav">
        <div className="logo">
          <span className="logo-mark">
            <span className="logo-block b1" />
            <span className="logo-block b2" />
            <span className="logo-block b3" />
            <span className="logo-block b4" />
          </span>
          <span className="logo-text">CRASH</span>
        </div>
        <div className="lp-nav-right">
          <Link href="/history" className="lp-link">
            히스토리
          </Link>
          <Link className="lp-link" href="/analyzer">
            분석 툴 열기 →
          </Link>
          <AuthButton />
        </div>
      </header>

      <main className="lp-main">
        <div className="lp-eyebrow">
          <span className="eyebrow-dot" />
          Code Risk Avoidance Safety Helper
        </div>

        <h1 className="lp-title">
          코드의{" "}
          <span
            className="hot"
            style={{
              background: `linear-gradient(90deg, ${stops})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            열
          </span>
          을
          <br />
          한눈에 본다.
        </h1>

        <p className="lp-sub">
          CRASH는 코드 한 줄 한 줄의 위험도와 성능 병목을
          <br />
          열화상 카메라처럼 시각화합니다.
        </p>

        {configured && !user ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <button
              className="btn-primary lg"
              onClick={signInWithGoogle}
              disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#fff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#fff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google 계정으로 로그인하고 시작하기 →
            </button>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", opacity: 0.8 }}>코드 분석을 하려면 먼저 로그인이 필요합니다.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" width={24} height={24} style={{ borderRadius: "50%" }} />
                ) : (
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--brand-main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", color: "#fff" }}>
                    {(user.user_metadata?.full_name || user.email || "?")[0]}
                  </span>
                )}
                <span style={{ fontSize: "14px", color: "var(--text-main)", fontWeight: "500" }}>
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}님 환영합니다!
                </span>
              </div>
            )}
            <Link className="btn-primary lg" href="/analyzer">
              분석 시작하기 →
            </Link>
          </div>
        )}

        <div className="lp-bar">
          <div
            className="lp-bar-fill"
            style={{ background: `linear-gradient(90deg, ${stops})` }}
          />
          <div className="lp-bar-labels">
            <span>cold · safe</span>
            <span>hot · risky</span>
          </div>
        </div>
      </main>
    </div>
  );
}
