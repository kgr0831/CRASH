// Analyzer page — editor + minimap + line detail. No filter, no summary grid.
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

const SPECTRUMS_T = {
  classic:  ["#1e3a8a", "#2563eb", "#facc15", "#f97316", "#dc2626"],
  infrared: ["#1c1917", "#7c2d12", "#f97316", "#fde047", "#fef9c3"],
  coolhot:  ["#06b6d4", "#84cc16", "#facc15", "#ef4444"],
  bipolar:  ["#2563eb", "#a5b4fc", "#fca5a5", "#dc2626"],
  night:    ["#1e1b4b", "#7c3aed", "#ec4899", "#fb7185"],
};

const ANALYZER_DEFAULTS = /*EDITMODE-BEGIN*/{
  "spectrum": "classic",
  "dark": false
}/*EDITMODE-END*/;

function CountUpA({ to, duration = 1200 }) {
  const [v, setV] = useStateT(0);
  useEffectT(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span>{v}</span>;
}

function Editor({ data, spectrum, dark, analyzed, scanLine, selected, setSelected, hovered, setHovered }) {
  return (
    <div className="editor">
      <div className="editor-inner">
        {data.lines.map((line, i) => {
          const revealed = analyzed || i < scanLine;
          const bg = revealed ? window.heatColor(line.score, spectrum, dark, 0.38) : "transparent";
          const isSel = selected === i;
          const isHover = hovered === i;
          return (
            <div
              key={i}
              className={"row" + (isSel ? " sel" : "") + (i === scanLine && !analyzed ? " scanning" : "")}
              style={{ background: bg }}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="ln">{i + 1}</span>
              <span className="code">{line.code || "\u00a0"}</span>
              {revealed && line.score >= 1 && (
                <span className="score-chip" style={{ color: window.heatColor(line.score, spectrum, dark, 1), borderColor: window.heatColor(line.score, spectrum, dark, 0.5) }}>{line.score}</span>
              )}
              {isHover && line.advice && revealed && (
                <div className="tooltip">
                  <div className="tooltip-head">
                    <span className="tooltip-score" style={{ background: window.heatColor(line.score, spectrum, dark, 1) }}>{line.score}</span>
                    <span className="tooltip-tags">
                      {(line.tags || []).map((tag) => <span key={tag} className="tag">{tag}</span>)}
                    </span>
                  </div>
                  <div className="tooltip-body">{line.advice}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SidePanel({ data, spectrum, dark, analyzed, scanLine, selected, setSelected }) {
  const s = data.summary;
  const line = selected !== null ? data.lines[selected] : null;
  const color = line ? window.heatColor(line.score, spectrum, dark, 1) : null;
  const verdict = !line ? "" :
    line.score >= 80 ? "치명적" :
    line.score >= 60 ? "경고" :
    line.score >= 30 ? "주의" :
    line.score >= 10 ? "양호" : "안전";

  return (
    <aside className="side">
      {/* Big risk score */}
      <div className="side-card">
        <div className="side-tag">전체 위험도</div>
        <div className="risk-num" style={{ color: window.heatColor(s.riskScore, spectrum, dark, 1) }}>
          {analyzed ? <CountUpA to={s.riskScore} duration={1400} /> : 0}
          <span className="risk-of">/100</span>
        </div>
        <div className="risk-bar">
          <div className="risk-bar-fill" style={{ width: analyzed ? `${s.riskScore}%` : "0%", background: `linear-gradient(90deg, ${spectrum.join(", ")})` }}></div>
        </div>
      </div>

      {/* Minimap */}
      <div className="side-card">
        <div className="side-tag">히트맵 · {data.lines.length} 라인</div>
        <div className="minimap-strip">
          {data.lines.map((l, i) => {
            const revealed = analyzed || i < scanLine;
            return (
              <button
                key={i}
                className={"mm-block" + (selected === i ? " sel" : "")}
                style={{
                  background: revealed ? window.heatColor(l.score, spectrum, dark, 1) : (dark ? "#1a1a1f" : "#ececea"),
                  opacity: revealed ? (l.score < 1 ? 0.15 : 0.85 + (l.score / 100) * 0.15) : 0.4,
                }}
                onClick={() => setSelected(i)}
                title={`L${i + 1} · ${l.score}`}
              ></button>
            );
          })}
        </div>
      </div>

      {/* Line detail */}
      <div className="side-card detail">
        <div className="side-tag">{line ? `L${selected + 1} 상세` : "라인 선택"}</div>
        {line ? (
          <>
            <div className="detail-score">
              <div className="detail-num" style={{ color }}>
                <CountUpA to={line.score} key={selected} duration={700} />
              </div>
              <div className="detail-verdict">
                <div className="verdict-dot" style={{ background: color }}></div>
                <span>{verdict}</span>
              </div>
            </div>
            <pre className="detail-code">{line.code || "(빈 줄)"}</pre>
            <div className="detail-advice">
              {line.advice || "위험 신호가 감지되지 않았습니다. 차가운 라인입니다."}
            </div>
          </>
        ) : (
          <div className="detail-empty">왼쪽에서 라인을 클릭하면<br/>여기에 분석이 표시됩니다.</div>
        )}
      </div>
    </aside>
  );
}

function AnalyzerApp() {
  const [t, setTweak] = window.useTweaks(ANALYZER_DEFAULTS);
  const spectrum = SPECTRUMS_T[t.spectrum] || SPECTRUMS_T.classic;
  const data = window.CRASH_DATA;

  const [analyzing, setAnalyzing] = useStateT(false);
  const [analyzed, setAnalyzed] = useStateT(false);
  const [scanLine, setScanLine] = useStateT(data.lines.length);
  const [selected, setSelected] = useStateT(14);
  const [hovered, setHovered] = useStateT(null);
  const scanRef = useRefT(null);

  useEffectT(() => {
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
  }, [t.dark]);

  const runScan = () => {
    if (scanRef.current) clearInterval(scanRef.current);
    setAnalyzing(true); setAnalyzed(false); setScanLine(0);
    let i = 0;
    scanRef.current = setInterval(() => {
      i += 1; setScanLine(i);
      if (i >= data.lines.length) {
        clearInterval(scanRef.current);
        setAnalyzing(false); setAnalyzed(true);
      }
    }, 55);
  };

  useEffectT(() => {
    runScan();
    return () => { if (scanRef.current) clearInterval(scanRef.current); };
  }, []);

  return (
    <div className="analyzer-page">
      <header className="ap-nav">
        <a href="CRASH.html" className="logo logo-link">
          <span className="logo-mark">
            <span className="logo-block b1"></span>
            <span className="logo-block b2"></span>
            <span className="logo-block b3"></span>
            <span className="logo-block b4"></span>
          </span>
          <span className="logo-text">CRASH</span>
        </a>
        <div className="ap-file">
          <span className="file-dot"></span>
          {data.filename}
          <span className="ap-lang">{data.language}</span>
        </div>
        <button className="btn-primary sm" onClick={runScan} disabled={analyzing}>
          {analyzing ? <><span className="spinner"></span> 스캔 중…</> : "↻ 다시 분석"}
        </button>
      </header>

      <main className="ap-main">
        <Editor
          data={data} spectrum={spectrum} dark={t.dark}
          analyzed={analyzed} scanLine={scanLine}
          selected={selected} setSelected={setSelected}
          hovered={hovered} setHovered={setHovered}
        />
        <SidePanel
          data={data} spectrum={spectrum} dark={t.dark}
          analyzed={analyzed} scanLine={scanLine}
          selected={selected} setSelected={setSelected}
        />
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

const rootT = ReactDOM.createRoot(document.getElementById("root"));
rootT.render(<AnalyzerApp />);
