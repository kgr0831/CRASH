# CRASH 프로젝트 진행 현황

> 최종 업데이트: 2026-05-27

## 완료된 작업

### 백엔드 (FastAPI + Python)

| Step | 작업 | 파일 | 상태 |
|------|------|------|------|
| 1 | 프로젝트 초기 구조 세팅 | `api/index.py`, `requirements.txt`, `vercel.json`, `.gitignore` | ✅ |
| 2 | Pydantic 스키마 정의 | `api/schemas.py` | ✅ |
| 3 | 설정 모듈 (환경변수 관리) | `api/config.py`, `.env.example` | ✅ |
| 4 | 프롬프트 엔진 (AI 프롬프트 템플릿) | `api/prompt.py` | ✅ |
| 5 | AI 프로바이더 (Gateway API 호출) | `api/providers.py` | ✅ |
| 6 | 응답 파서 (JSON 파싱/검증/복구) | `api/parser.py` | ✅ |
| 7 | API 엔트리포인트 (POST /api/analyze) | `api/analyze.py` | ✅ |
| 8 | Vercel 배포 설정 | `vercel.json`, `runtime.txt`, `api/__init__.py` | ✅ |

### 프론트엔드 (Next.js)

| Step | 작업 | 파일 | 상태 |
|------|------|------|------|
| 9 | Next.js 프로젝트 초기화 + 기본 레이아웃 | `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx` | ✅ |
| 10 | 랜딩 페이지 마이그레이션 | `app/page.tsx`, `app/globals.css` | ✅ |
| 11 | 코드 에디터 컴포넌트 (열화상 히트맵) | `components/Editor.tsx`, `lib/heat.ts`, `lib/types.ts` | ✅ |
| 12 | 사이드 패널 컴포넌트 (위험도+미니맵+3축바) | `components/SidePanel.tsx` | ✅ |
| 13 | API 연동 + 스캔 애니메이션 | `lib/api.ts`, `app/analyzer/page.tsx` | ✅ |
| 14 | 테마/스펙트럼 설정 + 반응형 | `components/SettingsBar.tsx` | ✅ |

### 버그 수정

| 이슈 | 수정 내용 |
|------|-----------|
| `run.bat` TIMEOUT 오류 | `/noq` → `ping` 기반 대기로 변경 |
| 긴 코드 분석 시 JSON 파싱 실패 | `max_tokens` 4096→8192, JSON 복구 로직 추가 |

---

## 남은 작업

### 프론트엔드

| Step | 작업 | 위험도 | 상태 |
|------|------|--------|------|
| 15 | Vercel 통합 배포 (프론트 + 백엔드) | 🟡 | ⬜ |

### 인증 + 캐싱 (Supabase)

| Step | 작업 | 위험도 | 상태 |
|------|------|--------|------|
| 16 | Supabase 프로젝트 설정 + 테이블 스키마 생성 | 🟢 | ⬜ |
| 17 | Supabase Auth 구글 로그인 연동 (Next.js) | 🟡 | ⬜ |
| 18 | 분석 결과 캐싱 — 코드 해시 기반 저장/조회 | 🟡 | ⬜ |
| 19 | 분석 히스토리 조회 UI | 🟢 | ⬜ |

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
│   ├── layout.tsx
│   ├── page.tsx            ← 랜딩 페이지
│   ├── globals.css
│   └── analyzer/
│       └── page.tsx        ← 분석 페이지
├── components/
│   ├── Editor.tsx          ← 열화상 히트맵 에디터
│   ├── SidePanel.tsx       ← 위험도 + 미니맵 + 3축 바
│   └── SettingsBar.tsx     ← 스펙트럼/테마 설정
├── lib/
│   ├── types.ts            ← 공유 타입
│   ├── heat.ts             ← score → rgba 변환
│   └── api.ts              ← API 호출 함수
├── Design/                 ← 원본 디자인 프로토타입 (참조용)
├── .env                    ← API_KEY
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── requirements.txt
├── runtime.txt
├── vercel.json
├── run.bat                 ← 프론트+백 동시 실행
├── CLAUDE.md
├── PLAN.md
└── progress.md             ← 이 파일
```

## 실행 방법

`run.bat` 더블클릭 또는 터미널에서 `.\run.bat` 실행
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Ctrl+C로 전체 종료

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 15, React 19, TypeScript |
| 백엔드 | FastAPI, Pydantic, httpx |
| AI | OpenAI 호환 Gateway (gemini-3-flash-preview 기본) |
| 배포 (예정) | Vercel (Next.js + Python Serverless) |
| DB/인증 (예정) | Supabase (PostgreSQL + Auth) |
