"use client";

import { useState, useEffect } from "react";
import type { AnalyzeResponse } from "@/lib/types";
import { heatColor } from "@/lib/heat";

function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
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

interface SidePanelProps {
  data: AnalyzeResponse;
  spectrum: string[];
  dark: boolean;
  analyzed: boolean;
  scanLine: number;
  selected: number | null;
  onSelect: (i: number) => void;
}

export default function SidePanel({
  data,
  spectrum,
  dark,
  analyzed,
  scanLine,
  selected,
  onSelect,
}: SidePanelProps) {
  const s = data.summary;
  const line = selected !== null ? data.lines[selected] : null;
  const color = line ? heatColor(line.score, spectrum, dark, 1) : null;
  const verdict = !line
    ? ""
    : line.score >= 80
      ? "치명적"
      : line.score >= 60
        ? "경고"
        : line.score >= 30
          ? "주의"
          : line.score >= 10
            ? "양호"
            : "안전";

  return (
    <aside className="side">
      <div className="side-card">
        <div className="side-tag">전체 위험도</div>
        <div
          className="risk-num"
          style={{ color: heatColor(s.riskScore, spectrum, dark, 1) }}
        >
          {analyzed ? <CountUp to={s.riskScore} duration={1400} /> : 0}
          <span className="risk-of">/100</span>
        </div>
        <div className="risk-bar">
          <div
            className="risk-bar-fill"
            style={{
              width: analyzed ? `${s.riskScore}%` : "0%",
              background: `linear-gradient(90deg, ${spectrum.join(", ")})`,
            }}
          />
        </div>
      </div>

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
                  background: revealed
                    ? heatColor(l.score, spectrum, dark, 1)
                    : dark
                      ? "#1a1a1f"
                      : "#ececea",
                  opacity: revealed
                    ? l.score < 1
                      ? 0.15
                      : 0.85 + (l.score / 100) * 0.15
                    : 0.4,
                }}
                onClick={() => onSelect(i)}
                title={`L${i + 1} · ${l.score}`}
              />
            );
          })}
        </div>
      </div>

      <div className="side-card detail">
        <div className="side-tag">
          {line ? `L${selected! + 1} 상세` : "라인 선택"}
        </div>
        {line ? (
          <>
            <div className="detail-score">
              <div className="detail-num" style={{ color: color! }}>
                <CountUp to={line.score} key={selected} duration={700} />
              </div>
              <div className="detail-verdict">
                <div className="verdict-dot" style={{ background: color! }} />
                <span>{verdict}</span>
              </div>
            </div>
            <div className="detail-axes">
              <div className="axis-row">
                <span className="axis-label">안전성</span>
                <div className="axis-bar">
                  <div
                    className="axis-fill"
                    style={{
                      width: `${line.safety}%`,
                      background: heatColor(line.safety, spectrum, dark, 1),
                    }}
                  />
                </div>
                <span className="axis-val">{line.safety}</span>
              </div>
              <div className="axis-row">
                <span className="axis-label">성능</span>
                <div className="axis-bar">
                  <div
                    className="axis-fill"
                    style={{
                      width: `${line.performance}%`,
                      background: heatColor(line.performance, spectrum, dark, 1),
                    }}
                  />
                </div>
                <span className="axis-val">{line.performance}</span>
              </div>
              <div className="axis-row">
                <span className="axis-label">구조</span>
                <div className="axis-bar">
                  <div
                    className="axis-fill"
                    style={{
                      width: `${line.structure}%`,
                      background: heatColor(line.structure, spectrum, dark, 1),
                    }}
                  />
                </div>
                <span className="axis-val">{line.structure}</span>
              </div>
            </div>
            <pre className="detail-code">{line.code || "(빈 줄)"}</pre>
            <div className="detail-advice">
              {line.advice ||
                "위험 신호가 감지되지 않았습니다. 차가운 라인입니다."}
            </div>
          </>
        ) : (
          <div className="detail-empty">
            왼쪽에서 라인을 클릭하면
            <br />
            여기에 분석이 표시됩니다.
          </div>
        )}
      </div>
    </aside>
  );
}
