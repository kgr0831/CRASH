"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase";

/* ── 컨텍스트 타입 ──────────────────────────────────── */
interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  dark: boolean;
  spectrumKey: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setDark: (dark: boolean) => Promise<void>;
  setSpectrumKey: (key: string) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  configured: false,
  dark: false,
  spectrumKey: "classic",
  signInWithGoogle: async () => {},
  signOut: async () => {},
  setDark: async () => {},
  setSpectrumKey: async () => {},
});

export const useAuth = () => useContext(AuthContext);

/* ── Provider ───────────────────────────────────────── */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDarkState] = useState(false);
  const [spectrumKey, setSpectrumKeyState] = useState("classic");

  // 1. 마운트 시 localStorage에서 테마 설정 불러오기 및 적용
  useEffect(() => {
    const savedTheme = localStorage.getItem("crash_theme");
    const savedSpectrum = localStorage.getItem("crash_spectrum");

    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setDarkState(isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
    } else {
      // 기본값 설정 (light)
      document.documentElement.dataset.theme = "light";
    }

    if (savedSpectrum) {
      setSpectrumKeyState(savedSpectrum);
    }
  }, []);

  // 2. 유저 정보가 변경되거나 로드되었을 때 유저 메타데이터의 테마 설정 동기화
  const syncUserPreferences = useCallback((u: User | null) => {
    if (u) {
      const userTheme = u.user_metadata?.theme;
      const userSpectrum = u.user_metadata?.spectrumKey;

      if (userTheme) {
        const isDark = userTheme === "dark";
        setDarkState(isDark);
        localStorage.setItem("crash_theme", userTheme);
        document.documentElement.dataset.theme = userTheme;
      }
      if (userSpectrum) {
        setSpectrumKeyState(userSpectrum);
        localStorage.setItem("crash_spectrum", userSpectrum);
      }
    }
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setLoading(false);
      return;
    }

    /* 현재 세션 가져오기 */
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      syncUserPreferences(currentUser);
      setLoading(false);
    });

    /* 세션 변경 리스너 */
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      const currentUser = sess?.user ?? null;
      setUser(currentUser);
      syncUserPreferences(currentUser);
    });

    return () => subscription.unsubscribe();
  }, [syncUserPreferences]);

  const signInWithGoogle = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.auth.signOut();
  }, []);

  // 테마 변경 함수 (메모리 반영 + 로컬저장소 + Supabase 메타데이터 동기화)
  const setDark = useCallback(async (isDark: boolean) => {
    setDarkState(isDark);
    const themeStr = isDark ? "dark" : "light";
    localStorage.setItem("crash_theme", themeStr);
    document.documentElement.dataset.theme = themeStr;

    const sb = getSupabaseBrowser();
    if (sb && user) {
      try {
        await sb.auth.updateUser({ data: { theme: themeStr } });
      } catch {
        // ignore
      }
    }
  }, [user]);

  // 스펙트럼 키 변경 함수 (메모리 반영 + 로컬저장소 + Supabase 메타데이터 동기화)
  const setSpectrumKey = useCallback(async (key: string) => {
    setSpectrumKeyState(key);
    localStorage.setItem("crash_spectrum", key);

    const sb = getSupabaseBrowser();
    if (sb && user) {
      try {
        await sb.auth.updateUser({ data: { spectrumKey: key } });
      } catch {
        // ignore
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        configured: isSupabaseConfigured,
        dark,
        spectrumKey,
        signInWithGoogle,
        signOut,
        setDark,
        setSpectrumKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
