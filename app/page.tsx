import Link from "next/link";

const SPECTRUM = ["#1e3a8a", "#2563eb", "#facc15", "#f97316", "#dc2626"];

export default function Home() {
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
        <Link className="lp-link" href="/analyzer">
          분석 툴 열기 →
        </Link>
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

        <Link className="btn-primary lg" href="/analyzer">
          분석 시작 →
        </Link>

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
