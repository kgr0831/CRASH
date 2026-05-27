// Landing — minimal hero only, single CTA, links to Analyzer.html
const { useState: useStateL, useEffect: useEffectL } = React;

const SPECTRUMS_L = {
  classic:  ["#1e3a8a", "#2563eb", "#facc15", "#f97316", "#dc2626"],
  infrared: ["#1c1917", "#7c2d12", "#f97316", "#fde047", "#fef9c3"],
  coolhot:  ["#06b6d4", "#84cc16", "#facc15", "#ef4444"],
  bipolar:  ["#2563eb", "#a5b4fc", "#fca5a5", "#dc2626"],
  night:    ["#1e1b4b", "#7c3aed", "#ec4899", "#fb7185"],
};

const LANDING_DEFAULTS = /*EDITMODE-BEGIN*/{
  "spectrum": "classic",
  "dark": false
}/*EDITMODE-END*/;

function LandingApp() {
  const [t, setTweak] = window.useTweaks(LANDING_DEFAULTS);
  const spectrum = SPECTRUMS_L[t.spectrum] || SPECTRUMS_L.classic;

  useEffectL(() => {
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
  }, [t.dark]);

  const stops = spectrum.map((c, i) => `${c} ${(i / (spectrum.length - 1)) * 100}%`).join(", ");

  return (
    <div className="landing-page">
      <header className="lp-nav">
        <div className="logo">
          <span className="logo-mark">
            <span className="logo-block b1"></span>
            <span className="logo-block b2"></span>
            <span className="logo-block b3"></span>
            <span className="logo-block b4"></span>
          </span>
          <span className="logo-text">CRASH</span>
        </div>
        <a className="lp-link" href="Analyzer.html">분석 툴 열기 →</a>
      </header>

      <main className="lp-main">
        <div className="lp-eyebrow">
          <span className="eyebrow-dot"></span>
          Code Risk Avoidance Safety Helper
        </div>

        <h1 className="lp-title">
          코드의 <span className="hot" style={{ background: `linear-gradient(90deg, ${stops})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>열</span>을<br/>
          한눈에 본다.
        </h1>

        <p className="lp-sub">
          CRASH는 코드 한 줄 한 줄의 위험도와 성능 병목을<br/>
          열화상 카메라처럼 시각화합니다.
        </p>

        <a className="btn-primary lg" href="Analyzer.html">
          분석 시작 →
        </a>

        <div className="lp-bar">
          <div className="lp-bar-fill" style={{ background: `linear-gradient(90deg, ${stops})` }}></div>
          <div className="lp-bar-labels">
            <span>cold · safe</span>
            <span>hot · risky</span>
          </div>
        </div>
      </main>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="컬러 스펙트럼">
          <window.TweakSelect
            label="프리셋"
            value={t.spectrum}
            onChange={(v) => setTweak("spectrum", v)}
            options={[
              { value: "classic",  label: "Classic thermal" },
              { value: "infrared", label: "Infrared" },
              { value: "coolhot",  label: "Cool → Hot" },
              { value: "bipolar",  label: "Blue ↔ Red" },
              { value: "night",    label: "Night spectrum" },
            ]}
          />
          <div style={{ background: `linear-gradient(90deg, ${spectrum.join(", ")})`, height: 22, borderRadius: 4, marginTop: 6 }}></div>
        </window.TweakSection>
        <window.TweakSection label="테마">
          <window.TweakRadio
            label="모드"
            value={t.dark ? "dark" : "light"}
            onChange={(v) => setTweak("dark", v === "dark")}
            options={[
              { value: "light", label: "Light" },
              { value: "dark",  label: "Dark" },
            ]}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

const rootL = ReactDOM.createRoot(document.getElementById("root"));
rootL.render(<LandingApp />);
