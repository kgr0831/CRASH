import type { AnalyzeResponse } from "./types";
import { getSupabaseBrowser } from "./supabase";

/* ── SHA-256 해시 ──────────────────────────────────── */
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── localStorage 히스토리 ─────────────────────────── */
const HISTORY_KEY = "crash_history";
const MAX_LOCAL_HISTORY = 30;

export interface HistoryEntry {
  id: string;
  codeHash: string;
  codePreview: string;
  language: string;
  riskScore: number;
  linesCount: number;
  createdAt: string;
  result: AnalyzeResponse;
}

function getLocalHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalHistory(entries: HistoryEntry[]) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(entries.slice(0, MAX_LOCAL_HISTORY))
  );
}

function addToLocalHistory(entry: HistoryEntry) {
  const history = getLocalHistory();
  /* 같은 해시의 이전 항목 제거 */
  const filtered = history.filter((h) => h.codeHash !== entry.codeHash);
  saveLocalHistory([entry, ...filtered]);
}

/* ── Supabase 캐시 조회 ────────────────────────────── */
async function checkCache(
  hash: string,
  model: string
): Promise<AnalyzeResponse | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;

  try {
    const { data } = await sb
      .from("analysis_cache")
      .select("result")
      .eq("code_hash", hash)
      .eq("model", model)
      .maybeSingle();

    return data?.result ?? null;
  } catch {
    return null;
  }
}

/* ── Supabase 캐시 저장 ────────────────────────────── */
async function saveCache(
  hash: string,
  language: string | null,
  model: string,
  result: AnalyzeResponse
) {
  const sb = getSupabaseBrowser();
  if (!sb) return;

  try {
    await sb.from("analysis_cache").upsert(
      {
        code_hash: hash,
        language,
        model,
        result,
      },
      { onConflict: "code_hash" }
    );
  } catch {
    /* 캐시 저장 실패는 무시 */
  }
}

/* ── Supabase 히스토리 저장 ─────────────────────────── */
async function saveCloudHistory(
  hash: string,
  code: string,
  result: AnalyzeResponse
) {
  const sb = getSupabaseBrowser();
  if (!sb) return;

  try {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;

    const preview = code.split("\n").slice(0, 3).join("\n");

    await sb.from("analysis_history").insert({
      user_id: user.id,
      code_hash: hash,
      code_preview: preview,
      language: result.language,
      risk_score: result.summary.riskScore,
      lines_count: result.summary.linesScanned,
    });
  } catch {
    /* 히스토리 저장 실패는 무시 */
  }
}

/* ── 메인 분석 함수 ────────────────────────────────── */
export interface AnalyzeResult {
  data: AnalyzeResponse;
  cached: boolean;
}

export async function analyzeCode(
  code: string,
  language?: string,
  model = "gemini-3-flash-preview"
): Promise<AnalyzeResult> {
  const hash = await sha256(code);

  /* 1) Supabase 캐시 확인 */
  const cached = await checkCache(hash, model);
  if (cached) {
    addToLocalHistory({
      id: crypto.randomUUID(),
      codeHash: hash,
      codePreview: code.split("\n").slice(0, 3).join("\n"),
      language: cached.language,
      riskScore: cached.summary.riskScore,
      linesCount: cached.summary.linesScanned,
      createdAt: new Date().toISOString(),
      result: cached,
    });
    return { data: cached, cached: true };
  }

  /* 2) API 호출 */
  let res: Response;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language: language || null, model }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(
        "분석 시간이 초과되었습니다. 코드를 줄여서 다시 시도하세요."
      );
    }
    throw new Error(
      "백엔드 서버에 연결할 수 없습니다. run.bat으로 서버를 시작했는지 확인하세요."
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error: ${res.status}`);
  }

  const data: AnalyzeResponse = await res.json();

  /* 3) 캐시 & 히스토리 저장 (비동기, 논블로킹) */
  saveCache(hash, language || null, model, data);
  saveCloudHistory(hash, code, data);

  /* 4) 로컬 히스토리 저장 */
  addToLocalHistory({
    id: crypto.randomUUID(),
    codeHash: hash,
    codePreview: code.split("\n").slice(0, 3).join("\n"),
    language: data.language,
    riskScore: data.summary.riskScore,
    linesCount: data.summary.linesScanned,
    createdAt: new Date().toISOString(),
    result: data,
  });

  return { data, cached: false };
}

/* ── 히스토리 조회 ─────────────────────────────────── */
export async function getHistory(): Promise<HistoryEntry[]> {
  /* Supabase 로그인 상태면 클라우드에서 조회 */
  const sb = getSupabaseBrowser();
  if (sb) {
    try {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        const { data } = await sb
          .from("analysis_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (data && data.length > 0) {
          return data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            codeHash: row.code_hash as string,
            codePreview: row.code_preview as string,
            language: row.language as string,
            riskScore: row.risk_score as number,
            linesCount: row.lines_count as number,
            createdAt: row.created_at as string,
            result: null as unknown as AnalyzeResponse,
          }));
        }
      }
    } catch {
      /* 클라우드 실패 시 로컬 폴백 */
    }
  }

  /* 비로그인 또는 클라우드 실패 → 로컬 */
  return getLocalHistory();
}

/** 특정 해시값의 전체 분석 결과를 조회 (로컬 또는 Supabase 캐시) */
export async function getHistoryResult(hash: string): Promise<AnalyzeResponse | null> {
  // 1) 로컬 히스토리에서 검색
  const local = getLocalHistory().find((h) => h.codeHash === hash);
  if (local?.result) return local.result;

  // 2) Supabase 캐시에서 검색
  const sb = getSupabaseBrowser();
  if (sb) {
    try {
      const { data } = await sb
        .from("analysis_cache")
        .select("result")
        .eq("code_hash", hash)
        .maybeSingle();
      return (data?.result as AnalyzeResponse) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export function clearLocalHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
