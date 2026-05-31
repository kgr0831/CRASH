"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Editor from "@/components/Editor";
import SidePanel from "@/components/SidePanel";
import SettingsBar from "@/components/SettingsBar";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";
import { SPECTRUMS } from "@/lib/heat";
import { analyzeCode } from "@/lib/api";
import type { AnalyzeResponse } from "@/lib/types";

function AnalyzerPageContent() {
  const { user, loading, configured, dark, setDark, spectrumKey, setSpectrumKey } = useAuth();
  const searchParams = useSearchParams();
  const hash = searchParams.get("hash");

  const spectrum = SPECTRUMS[spectrumKey] || SPECTRUMS.classic;

  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [cached, setCached] = useState(false);
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runScan = useCallback((data: AnalyzeResponse, isCached = false) => {
    if (scanRef.current) clearInterval(scanRef.current);
    setResult(data);
    setCached(isCached);
    setAnalyzed(false);
    setScanLine(0);
    setSelected(null);

    if (isCached) {
      /* 캐시 히트: 스캔 애니메이션을 빠르게 */
      let i = 0;
      scanRef.current = setInterval(() => {
        i += 3;
        setScanLine(i);
        if (i >= data.lines.length) {
          clearInterval(scanRef.current!);
          scanRef.current = null;
          setAnalyzed(true);
        }
      }, 15);
    } else {
      let i = 0;
      scanRef.current = setInterval(() => {
        i += 1;
        setScanLine(i);
        if (i >= data.lines.length) {
          clearInterval(scanRef.current!);
          scanRef.current = null;
          setAnalyzed(true);
        }
      }, 55);
    }
  }, []);

  /* 쿼리 스트링의 hash 값이 바뀔 때 히스토리 불러오기 */
  useEffect(() => {
    if (hash) {
      setAnalyzing(true);
      import("@/lib/api").then(async ({ getHistoryResult }) => {
        try {
          const res = await getHistoryResult(hash);
          if (res) {
            const reconstructedCode = res.lines.map((l) => l.code).join("\n");
            setCode(reconstructedCode);
            runScan(res, true);
          } else {
            setError("해당 분석 기록을 찾을 수 없습니다.");
          }
        } catch {
          setError("기록을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setAnalyzing(false);
        }
      });
    }
  }, [hash, runScan]);

  useEffect(() => {
    return () => {
      if (scanRef.current) clearInterval(scanRef.current);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    setError(null);
    setCached(false);
    try {
      const { data, cached: wasCached } = await analyzeCode(code);
      runScan(data, wasCached);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (scanRef.current) clearInterval(scanRef.current);
    setResult(null);
    setAnalyzed(false);
    setScanLine(0);
    setSelected(null);
    setError(null);
    setCached(false);
  };

  /* 로그인 제한 화면 */
  if (configured && !loading && !user) {
    return (
      <div className="analyzer-page">
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
          <div className="ap-nav-right">
            <AuthButton />
          </div>
        </header>
        <main className="ap-main ap-main-single" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 120px)" }}>
          <div className="login-required-card" style={{ maxWidth: "480px", width: "100%", padding: "48px 32px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: "56px", marginBottom: "24px" }}>🔒</div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px", color: "var(--text-main)", letterSpacing: "-0.5px" }}>로그인이 필요합니다</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>
              CRASH의 열화상 코드 분석 툴을 이용해 취약점과 병목 구간을 시각화하려면 Google 계정으로 로그인이 필요합니다.
            </p>
            <div style={{ display: "inline-flex", justifyContent: "center" }}>
              <AuthButton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="analyzer-page">
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
          <span className="file-dot" />
          {result?.filename ?? "새 분석"}
          {result && <span className="ap-lang">{result.language}</span>}
          {cached && analyzed && (
            <span className="cache-badge">⚡ 캐시</span>
          )}
        </div>
        <div className="ap-nav-right">
          <Link href="/history" className="nav-history-link" title="히스토리">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          {result ? (
            <div className="ap-actions">
              <button className="btn-secondary sm" onClick={handleReset}>
                ← 새 코드
              </button>
              <button
                className="btn-primary sm"
                onClick={() => runScan(result)}
                disabled={!analyzed}
              >
                ↻ 다시 분석
              </button>
            </div>
          ) : (
            <div />
          )}
          <AuthButton />
        </div>
      </header>

      <SettingsBar
        spectrumKey={spectrumKey}
        dark={dark}
        onSpectrumChange={setSpectrumKey}
        onDarkChange={setDark}
      />

      <main className={result ? "ap-main" : "ap-main ap-main-single"}>
        {result ? (
          <>
            <Editor
              lines={result.lines}
              spectrum={spectrum}
              dark={dark}
              analyzed={analyzed}
              scanLine={scanLine}
              selected={selected}
              onSelect={setSelected}
            />
            <SidePanel
              data={result}
              spectrum={spectrum}
              dark={dark}
              analyzed={analyzed}
              scanLine={scanLine}
              selected={selected}
              onSelect={setSelected}
            />
          </>
        ) : (
          <div className="code-input-wrap">
            <textarea
              className="code-input"
              placeholder={"분석할 코드를 붙여넣으세요...\n\n예시:\ndef hello(name):\n    print('Hello, ' + name)\n\nhello(input())"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              autoFocus
            />
            {error && <div className="error-msg">{error}</div>}
            <div className="input-footer">
              <span className="line-count">
                {code.trim() ? `${code.split("\n").length} 라인` : ""}
              </span>
              <button
                className="btn-primary lg"
                onClick={handleAnalyze}
                disabled={!code.trim() || analyzing}
              >
                {analyzing ? (
                  <>
                    <span className="spinner" /> AI 분석 중…
                  </>
                ) : (
                  "분석 시작 →"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="analyzer-page">
        <main className="ap-main ap-main-single" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <span className="spinner" /> 로딩 중…
        </main>
      </div>
    }>
      <AnalyzerPageContent />
    </Suspense>
  );
}
