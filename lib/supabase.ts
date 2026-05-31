import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ── 환경변수 ─────────────────────────────────────── */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Supabase가 설정되어 있는지 여부 */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON.length > 0;

/* ── 브라우저 클라이언트 (싱글턴) ──────────────────── */
let _browser: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_browser) {
    _browser = createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _browser;
}

/* ── 서버 클라이언트 (매 요청마다 새로 생성) ───────── */
export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON);
}
