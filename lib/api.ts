import type { AnalyzeResponse } from "./types";

export async function analyzeCode(
  code: string,
  language?: string,
  model = "gemini-3-flash-preview"
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language: language || null, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error: ${res.status}`);
  }

  return res.json();
}
