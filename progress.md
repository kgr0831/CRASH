# CRASH 프로젝트 진행 현황

> 최종 업데이트: 2026-05-29

## 전체 진행률: 19/19 (100%) — 코드 완료

```
██████████████████████ 100%
```

---

## 완료된 작업

### 백엔드 (FastAPI + Python) — 8/8 완료

| Step | 작업 | 주요 파일 | 상태 |
|------|------|-----------|------|
| 1 | 프로젝트 초기 구조 세팅 | `api/index.py`, `requirements.txt`, `.gitignore` | ✅ |
| 2 | Pydantic 스키마 정의 | `api/schemas.py` | ✅ |
| 3 | 설정 모듈 (환경변수 관리) | `api/config.py`, `.env.example` | ✅ |
| 4 | 프롬프트 엔진 (AI 프롬프트 템플릿) | `api/prompt.py` | ✅ |
| 5 | AI 프로바이더 (Gateway API 호출) | `api/providers.py` | ✅ |
| 6 | 응답 파서 (JSON 파싱/검증/복구) | `api/parser.py` | ✅ |
| 7 | API 엔트리포인트 (POST /api/analyze) | `api/analyze.py` | ✅ |
| 8 | Vercel 배포 설정 (초기) | `vercel.json`, `runtime.txt` | ✅ |

### 프론트엔드 (Next.js) — 7/7 완료

| Step | 작업 | 주요 파일 | 상태 |
|------|------|-----------|------|
| 9 | Next.js 프로젝트 초기화 + 기본 레이아웃 | `package.json`, `tsconfig.json`, `app/layout.tsx` | ✅ |
| 10 | 랜딩 페이지 마이그레이션 | `app/page.tsx`, `app/globals.css` | ✅ |
| 11 | 코드 에디터 컴포넌트 (열화상 히트맵) | `components/Editor.tsx`, `lib/heat.ts`, `lib/types.ts` | ✅ |
| 12 | 사이드 패널 컴포넌트 (위험도+미니맵+3축바) | `components/SidePanel.tsx` | ✅ |
| 13 | API 연동 + 스캔 애니메이션 | `lib/api.ts`, `app/analyzer/page.tsx` | ✅ |
| 14 | 테마/스펙트럼 설정 + 반응형 | `components/SettingsBar.tsx` | ✅ |
| 15 | Vercel 통합 배포 설정 (코드 준비 완료) | `vercel.json`, `next.config.ts`, `.vercelignore` | ✅ |

### 인증 + 캐싱 (Supabase) — 4/4 완료

| Step | 작업 | 주요 파일 | 상태 |
|------|------|-----------|------|
| 16 | Supabase 클라이언트 설정 | `lib/supabase.ts`, `.env` | ✅ |
| 17 | Google 로그인 연동 | `components/AuthProvider.tsx`, `AuthButton.tsx`, `app/auth/callback/route.ts` | ✅ |
| 18 | 분석 결과 캐싱 (SHA-256 해시 + localStorage 폴백) | `lib/api.ts` | ✅ |
| 19 | 분석 히스토리 UI | `app/history/page.tsx` | ✅ |

### 버그 수정 이력

| 이슈 | 원인 | 수정 내용 |
|------|------|-----------|
| `run.bat` TIMEOUT 무한 오류 | Windows `timeout /noq` 호환성 | `ping` 기반 대기로 변경 |
| 긴 코드 분석 시 JSON 파싱 실패 | AI 응답이 `max_tokens=4096`에서 잘림 | `max_tokens` 8192로 증가 + JSON 복구 로직 추가 |
| 404 (favicon 누락) | `public/` 폴더 비어있음 | `favicon.svg` 생성 + metadata 등록 |
| 500 (/api/analyze) | 백엔드 미실행 시 rewrite 실패 | uvicorn 설치 + 에러 메시지 개선 |

---

## 남은 작업 — 수동 설정

### 배포 (Vercel)

| 작업 | 내용 | 상태 |
|------|------|------|
| Vercel 프로젝트 연결 | GitHub 연동 또는 CLI 배포 | ⬜ (수동) |
| 환경변수 등록 | `API_KEY`, `GATEWAY_BASE_URL`을 Vercel 대시보드에 설정 | ⬜ (수동) |
| 프로덕션 E2E 테스트 | 배포 URL에서 코드 분석 동작 확인 | ⬜ (수동) |

### Supabase 연결

| 작업 | 내용 | 상태 |
|------|------|------|
| Supabase 프로젝트 생성 | supabase.com에서 프로젝트 생성 | ⬜ (수동) |
| 테이블 생성 | `analysis_cache`, `analysis_history` 테이블 SQL 실행 | ⬜ (수동) |
| Google OAuth 설정 | Supabase Auth → Google 프로바이더 활성화 | ⬜ (수동) |
| 환경변수 입력 | `.env`에 `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY` 입력 | ⬜ (수동) |

---

## 프로젝트 구조

```
C:\CSS\
├── api/                    ← Python 백엔드 (FastAPI)
│   ├── __init__.py
│   ├── index.py            ← 앱 진입점 + CORS
│   ├── analyze.py          ← POST /api/analyze 라우터
│   ├── schemas.py          ← Pydantic 모델
│   ├── config.py           ← 환경변수 설정
│   ├── prompt.py           ← AI 프롬프트 템플릿
│   ├── providers.py        ← Gateway API 호출
│   ├── parser.py           ← 응답 파싱/검증/복구
│   └── LLM_API_사용법.md
├── app/                    ← Next.js 프론트엔드
│   ├── layout.tsx          ← AuthProvider 래핑
│   ├── page.tsx            ← 랜딩 페이지
│   ├── globals.css
│   ├── analyzer/
│   │   └── page.tsx        ← 분석 페이지 (캐시 표시)
│   ├── history/
│   │   └── page.tsx        ← 히스토리 페이지
│   └── auth/
│       └── callback/
│           └── route.ts    ← OAuth 콜백
├── components/
│   ├── Editor.tsx          ← 열화상 히트맵 에디터
│   ├── SidePanel.tsx       ← 위험도 + 미니맵 + 3축 바
│   ├── SettingsBar.tsx     ← 스펙트럼/테마 설정
│   ├── AuthProvider.tsx    ← Supabase Auth 컨텍스트
│   └── AuthButton.tsx      ← 로그인/아바타/로그아웃 버튼
├── lib/
│   ├── types.ts            ← 공유 타입
│   ├── heat.ts             ← score → rgba 변환
│   ├── api.ts              ← API 호출 + 캐싱 + 히스토리
│   └── supabase.ts         ← Supabase 클라이언트
├── public/
│   └── favicon.svg         ← 브랜드 파비콘
├── .env                    ← API_KEY + Supabase (git 미추적)
├── .env.example
├── .gitignore
├── .vercelignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── requirements.txt
├── runtime.txt             ← Python 3.12
├── vercel.json             ← Vercel 배포 설정
├── run.bat                 ← 프론트+백 동시 실행
├── PLAN.md                 ← 전체 구현 계획
├── README.md
└── progress.md             ← 이 파일
```

## 실행 방법

`run.bat` 더블클릭 또는 터미널에서 `.\run.bat` 실행
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Ctrl+C로 전체 종료

## 히스토리 정책

| 상태 | 저장소 | 한도 |
|------|--------|------|
| 비로그인 | localStorage | 최근 30건 |
| 로그인 (Supabase) | 클라우드 DB | 최근 50건 |

## 기술 스택

| 영역 | 기술 | 상태 |
|------|------|------|
| 프론트엔드 | Next.js 15, React 19, TypeScript | ✅ 완료 |
| 백엔드 | FastAPI, Pydantic, httpx | ✅ 완료 |
| AI | OpenAI 호환 Gateway (gemini-3-flash-preview 기본) | ✅ 완료 |
| 인증 | Supabase Auth (Google OAuth) | ✅ 코드 완료, 연결 대기 |
| 캐싱 | Supabase DB + localStorage 폴백 | ✅ 코드 완료, 연결 대기 |
| 배포 | Vercel (Next.js + Python Serverless) | 🔶 코드 준비 완료, 배포 대기 |
