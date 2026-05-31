-- CRASH Supabase 데이터베이스 테이블 스키마 생성 스크립트
-- Supabase 대시보드 -> SQL Editor -> New Query에 붙여넣고 Run을 눌러 실행해주세요.

-- 1. 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS public.analysis_cache (
    code_hash TEXT PRIMARY KEY,
    language TEXT,
    model TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    code_preview TEXT NOT NULL,
    language TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    lines_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 설정
-- 캐시 테이블은 누구나 조회 및 삽입이 가능하도록 설정
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cache" ON public.analysis_cache FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to cache" ON public.analysis_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to cache" ON public.analysis_cache FOR UPDATE USING (true);

-- 히스토리 테이블은 로그인한 본인 데이터만 접근 가능하도록 설정
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own history" ON public.analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own history" ON public.analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own history" ON public.analysis_history FOR DELETE USING (auth.uid() = user_id);
