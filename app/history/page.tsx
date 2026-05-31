"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";
import { getHistory, clearLocalHistory, type HistoryEntry } from "@/lib/api";
import { heatColor, SPECTRUMS } from "@/lib/heat";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

function riskLabel(score: number): string {
  if (score >= 80) return "치명적";
  if (score >= 60) return "경고";
  if (score >= 40) return "주의";
  if (score >= 20) return "양호";
  return "안전";
}

export default function HistoryPage() {
  const { user, configured, spectrumKey } = useAuth();
  const spectrum = SPECTRUMS[spectrumKey] || SPECTRUMS.classic;
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getHistory()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = async (entry: HistoryEntry) => {
    const isOpen = expanded === entry.id;
    if (isOpen) {
      setExpanded(null);
    } else {
      setExpanded(entry.id);
      if (!entry.result) {
        try {
          const { getHistoryResult } = await import("@/lib/api");
          const fullResult = await getHistoryResult(entry.codeHash);
          if (fullResult) {
            setEntries((prev) =>
              prev.map((e) => (e.id === entry.id ? { ...e, result: fullResult } : e))
            );
          }
        } catch {
          // ignore
        }
      }
    }
  };

  const handleClear = () => {
    if (!confirm("로컬 히스토리를 모두 삭제하시겠습니까?")) return;
    clearLocalHistory();
    setEntries([]);
  };

  return (
    <div className="history-page">
      <header className="ap-nav">
        <Link href="/" className="logo logo-link">
          <span className="logo-mark">
            <span className="logo-block b1" />
            <span className="logo-block b2" />
            <span className="logo-block b3" />
            <span className="logo-block b4" />
          </span>
          <span className="logo-text">CRASH</span>
        </Link>
        <div className="ap-file">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ opacity: 0.5 }}>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
              clipRule="evenodd"
            />
          </svg>
          분석 히스토리
        </div>
        <div className="ap-nav-right">
          <Link href="/analyzer" className="btn-primary sm">
            + 새 분석
          </Link>
          <AuthButton />
        </div>
      </header>

      <main className="history-main">
        {/* 상태 배너 */}
        <div className="history-status">
          {configured && user ? (
            <span className="status-cloud">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
              클라우드 동기화
            </span>
          ) : (
            <span className="status-local">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  clipRule="evenodd"
                />
              </svg>
              로컬 저장 (최근 30건)
            </span>
          )}
          {entries.length > 0 && (
            <button className="btn-ghost sm" onClick={handleClear}>
              전체 삭제
            </button>
          )}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="history-loading">
            <span className="spinner" />
            <span>불러오는 중…</span>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && entries.length === 0 && (
          <div className="history-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="8" y="6" width="32" height="36" rx="4" />
                <path d="M16 16h16M16 24h12M16 32h8" strokeLinecap="round" />
              </svg>
            </div>
            <h2>아직 분석 기록이 없습니다</h2>
            <p>코드를 분석하면 여기에 기록이 쌓입니다.</p>
            <Link href="/analyzer" className="btn-primary lg">
              첫 번째 분석 시작 →
            </Link>
          </div>
        )}

        {/* 히스토리 목록 */}
        {!loading && entries.length > 0 && (
          <div className="history-list">
            {entries.map((entry) => {
              const color = heatColor(entry.riskScore, spectrum, false, 1);
              const isOpen = expanded === entry.id;

              return (
                <div
                  key={entry.id}
                  className={"history-card" + (isOpen ? " open" : "")}
                >
                  <button
                    className="history-card-header"
                    onClick={() => handleExpand(entry)}
                  >
                    <div className="hc-left">
                      <span
                        className="hc-risk-dot"
                        style={{ background: color }}
                      />
                      <span className="hc-risk-score" style={{ color }}>
                        {entry.riskScore}
                      </span>
                      <span className="hc-risk-label">
                        {riskLabel(entry.riskScore)}
                      </span>
                    </div>
                    <div className="hc-center">
                      <span className="hc-lang">{entry.language}</span>
                      <span className="hc-lines">{entry.linesCount}줄</span>
                      <pre className="hc-preview">{entry.codePreview}</pre>
                    </div>
                    <div className="hc-right">
                      <span className="hc-time">{timeAgo(entry.createdAt)}</span>
                      <span className={"hc-chevron" + (isOpen ? " open" : "")}>
                        ▸
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="history-card-body">
                      {!entry.result ? (
                        <div className="hcb-loading">
                          <span className="spinner" /> 상세 데이터 로딩 중...
                        </div>
                      ) : (
                        <>
                          <div className="hcb-summary">
                            <div className="hcb-stat">
                              <span className="hcb-stat-label">위험도</span>
                              <span className="hcb-stat-value" style={{ color }}>
                                {entry.result.summary.riskScore}/100
                              </span>
                            </div>
                            <div className="hcb-stat">
                              <span className="hcb-stat-label">핫스팟</span>
                              <span className="hcb-stat-value">
                                {entry.result.summary.hotspots}
                              </span>
                            </div>
                            <div className="hcb-stat">
                              <span className="hcb-stat-label">복잡도</span>
                              <span className="hcb-stat-value">
                                {entry.result.summary.estComplexity}
                              </span>
                            </div>
                            <div className="hcb-stat">
                              <span className="hcb-stat-label">이슈</span>
                              <span className="hcb-stat-value">
                                🔴 {entry.result.summary.issues.critical} · ⚠️{" "}
                                {entry.result.summary.issues.warning} · ℹ️{" "}
                                {entry.result.summary.issues.info}
                              </span>
                            </div>
                          </div>
                          <div className="hcb-minimap">
                            {entry.result.lines.map((l, i) => (
                              <span
                                key={i}
                                className="hcb-mm-block"
                                style={{
                                  background: heatColor(l.score, spectrum, false, 1),
                                  opacity: l.score < 1 ? 0.15 : 0.85 + (l.score / 100) * 0.15,
                                }}
                              />
                            ))}
                          </div>
                          <div className="hcb-actions" style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                            <Link
                              href={`/analyzer?hash=${entry.codeHash}`}
                              className="btn-primary sm"
                            >
                              분석 결과 화면에서 보기 →
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
