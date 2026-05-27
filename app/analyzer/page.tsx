"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Editor from "@/components/Editor";
import SidePanel from "@/components/SidePanel";
import SettingsBar from "@/components/SettingsBar";
import { SPECTRUMS } from "@/lib/heat";
import { analyzeCode } from "@/lib/api";
import type { AnalyzeResponse } from "@/lib/types";

export default function AnalyzerPage() {
  const [spectrumKey, setSpectrumKey] = useState("classic");
  const [dark, setDark] = useState(false);
  const spectrum = SPECTRUMS[spectrumKey] || SPECTRUMS.classic;

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runScan = useCallback((data: AnalyzeResponse) => {
    if (scanRef.current) clearInterval(scanRef.current);
    setResult(data);
    setAnalyzed(false);
    setScanLine(0);
    setSelected(null);
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
  }, []);

  useEffect(() => {
    return () => {
      if (scanRef.current) clearInterval(scanRef.current);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeCode(code);
      runScan(data);
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
  };

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
        </div>
        {result ? (
          <div className="ap-actions">
            <button
              className="btn-secondary sm"
              onClick={handleReset}
            >
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
