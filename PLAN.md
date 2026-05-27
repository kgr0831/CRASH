# CRASH 구현 계획

## 전체 아키텍처

```
[Next.js 프론트엔드]
        │
        ▼  POST /api/analyze  (코드 텍스트 전송)
[Next.js API Route → FastAPI Serverless Function]
        │
        ▼  Gateway API 호출 (모델명으로 프로바이더 자동 라우팅)
[Gateway → OpenAI / Google / Perplexity / xAI]
        │
        ▼  JSON 응답 (라인별 score, tags, advice)
[FastAPI] → 파싱/검증 → 프론트엔드에 반환
```

핵심 원칙: 서버는 **프롬프트 구성 + API 중계 + 응답 검증**만 수행. 로직 최소화.

---

## 코드 분할 단위 (모듈 구조)

| 모듈 | 파일 | 역할 | 위험도 |
|------|------|------|--------|
| API 엔트리포인트 | `api/analyze.py` | FastAPI 라우터, 요청/응답 처리 | 🟡 중 |
| 프롬프트 엔진 | `api/prompt.py` | AI에 보낼 프롬프트 템플릿 구성 | 🔴 고 |
| AI 프로바이더 | `api/providers.py` | 멀티 AI API 호출 추상화 | 🔴 고 |
| 응답 파서 | `api/parser.py` | AI 응답 JSON 파싱/검증/정규화 | 🟡 중 |
| 스키마 정의 | `api/schemas.py` | Pydantic 모델 (요청/응답 타입) | 🟢 저 |
| 설정 | `api/config.py` | API 키, 환경변수 관리 | 🟢 저 |

### 프론트엔드 모듈

| 모듈 | 파일 | 역할 | 위험도 |
|------|------|------|--------|
| 레이아웃/테마 | `app/layout.tsx`, `app/globals.css` | 공통 레이아웃, CSS 변수, 다크모드 | 🟢 저 |
| 랜딩 페이지 | `app/page.tsx` | 히어로 + CTA → /analyzer 이동 | 🟢 저 |
| 에디터 컴포넌트 | `components/Editor.tsx` | 코드 입력 + 열화상 배경색 렌더링 | 🟡 중 |
| 사이드 패널 | `components/SidePanel.tsx` | 위험도 요약, 미니맵, 라인 상세 | 🟡 중 |
| 히트 연산 | `lib/heat.ts` | score → rgba 변환 (Design/heat.js 포팅) | 🟢 저 |
| API 연동 | `lib/api.ts` | POST /api/analyze 호출 + 상태 관리 | 🔴 고 |
| 분석 페이지 | `app/analyzer/page.tsx` | 에디터 + 사이드패널 조합 + 스캔 애니메이션 | 🔴 고 |
| Supabase 클라이언트 | `lib/supabase.ts` | Supabase 초기화, Auth 헬퍼 | 🟢 저 |
| 캐싱/히스토리 | `api/cache.py` | 코드 해시 기반 캐시 저장/조회 | 🟡 중 |
| 히스토리 UI | `app/history/page.tsx` | 과거 분석 결과 목록/상세 | 🟢 저 |

---

## 위험도 기준 정의

### A. 코드 모듈의 개발 위험도

| 등급 | 색상 | 기준 | 해당 모듈 |
|------|------|------|-----------|
| 🔴 고위험 | 빨강 | 외부 API 의존, 프롬프트 품질이 결과 좌우, 파싱 실패 가능 | `providers.py`, `prompt.py` |
| 🟡 중위험 | 노랑 | 입력 검증 누락 시 에러, 엣지케이스 존재 | `analyze.py`, `parser.py` |
| 🟢 저위험 | 파랑 | 정적 구조 정의, 변경 빈도 낮음 | `schemas.py`, `config.py` |

### B. CRASH가 분석하는 코드의 위험도 기준

| 점수 범위 | 열화상 색상 | 의미 | 평가 요소 |
|-----------|-------------|------|-----------|
| 0-19 | 🔵 파랑(차가움) | 안전 | 단순 선언, import, 상수 |
| 20-39 | 🟢 초록 | 양호 | 기본 로직, 적절한 에러 처리 |
| 40-59 | 🟡 노랑 | 주의 | 중첩 루프, 타입 미검증, 중복 코드 |
| 60-79 | 🟠 주황(경고) | 위험 | O(n²), 리소스 미해제, N+1 패턴 |
| 80-100 | 🔴 빨강(뜨거움) | 치명적 | 보안 취약점, 무한 루프 위험, 메모리 누수 |

**평가 3축**:
1. **안전성** (Safety): 엣지 케이스, 에러 상태 처리 — 얼마나 안전한가
2. **성능** (Performance): 시간 복잡도 — 얼마나 효율적인가
3. **구조** (Structure): 코드 구조화, 유지보수성, 가독성 — 얼마나 잘 정리되었는가

최종 점수 = `(safety × 0.4) + (performance × 0.35) + (structure × 0.25)`

---

## Step-by-Step 구현 계획

| Step | 작업 | 검증 기준 | 위험도 | 상태 |
|------|------|-----------|--------|------|
| 1 | 프로젝트 초기 구조 세팅 (requirements.txt, api/ 디렉토리, Vercel 설정) | uvicorn 로컬 실행 성공 | 🟢 | ✅ |
| 2 | Pydantic 스키마 정의 (schemas.py) | 타입 체크 통과 | 🟢 | ✅ |
| 3 | 설정 모듈 (config.py) — 환경변수 기반 API 키 관리 | .env 로드 확인 | 🟢 | ✅ |
| 4 | 프롬프트 엔진 (prompt.py) — AI 프롬프트 템플릿 | 프롬프트 출력 수동 검증 | 🔴 | ✅ |
| 5 | AI 프로바이더 (providers.py) — Gateway API 호출 로직 | 실제 API 호출 → JSON 응답 수신 | 🔴 | ✅ |
| 6 | 응답 파서 (parser.py) — AI 응답 → CRASH_DATA 변환 | 더미 응답으로 파싱 테스트 | 🟡 | ✅ |
| 7 | API 엔트리포인트 (analyze.py) — POST /api/analyze | curl로 E2E 테스트 | 🟡 | ✅ |
| 8 | Vercel 배포 설정 (vercel.json, api/index.py) | vercel dev 로컬 확인 | 🟡 | ✅ |

### 프론트엔드 (Next.js)

| Step | 작업 | 검증 기준 | 위험도 | 상태 |
|------|------|-----------|--------|------|
| 9 | Next.js 프로젝트 초기화 + 기본 레이아웃 | `npm run dev` 로 빈 페이지 정상 렌더링 | 🟢 | ✅ |
| 10 | 랜딩 페이지 (`/`) — Design/landing-app.jsx 마이그레이션 | 히어로 섹션, CTA 버튼, 스펙트럼 바 표시 | 🟢 | ✅ |
| 11 | 코드 에디터 컴포넌트 — 코드 입력 + 열화상 히트맵 렌더링 | 코드 붙여넣기 → 라인별 배경색 표시 확인 | 🟡 | ✅ |
| 12 | 사이드 패널 컴포넌트 — 전체 위험도 + 미니맵 + 라인 상세 | 라인 클릭 → 상세 점수/조언 표시 확인 | 🟡 | ✅ |
| 13 | API 연동 — 분석 요청/응답 + 스캔 애니메이션 | 실제 코드 제출 → AI 분석 → 열화상 표시 E2E 확인 | 🔴 | ✅ |
| 14 | 테마/스펙트럼 설정 + 반응형 처리 | 다크/라이트 전환, 모바일 레이아웃 확인 | 🟢 | ✅ |
| 15 | Vercel 통합 배포 (프론트 + 백엔드) | 프로덕션 URL에서 E2E 동작 확인 | 🟡 | ⬜ |

### 인증 + 캐싱 (Supabase)

| Step | 작업 | 검증 기준 | 위험도 | 상태 |
|------|------|-----------|--------|------|
| 16 | Supabase 프로젝트 설정 + 테이블 스키마 생성 | Supabase 대시보드에서 테이블 확인 | 🟢 | ⬜ |
| 17 | Supabase Auth 구글 로그인 연동 (Next.js) | 구글 로그인 → 세션 발급 확인 | 🟡 | ⬜ |
| 18 | 분석 결과 캐싱 — 코드 해시 기반 저장/조회 | 동일 코드 재분석 시 캐시 히트 확인 | 🟡 | ⬜ |
| 19 | 분석 히스토리 조회 UI | 로그인 유저의 과거 분석 목록 표시 확인 | 🟢 | ⬜ |

---

## API 명세

**POST `/api/analyze`**

```json
// Request
{
  "code": "def hello():\n    print('hi')",
  "language": "python",
  "model": "gemini-3-flash-preview"
}

// Response (CRASH_DATA 포맷 호환)
{
  "language": "Python",
  "filename": "submitted_code",
  "summary": {
    "riskScore": 67,
    "linesScanned": 42,
    "hotspots": 8,
    "estComplexity": "O(n²)",
    "issues": { "critical": 2, "warning": 4, "info": 5 }
  },
  "lines": [
    { "code": "import json", "score": 4, "tags": [], "advice": "" }
  ]
}
```

---

## 비용 최적화 전략

| 전략 | 설명 |
|------|------|
| 짧은 프롬프트 | 시스템 프롬프트 500토큰 이내 |
| 저가 모델 우선 | Gateway 경유: gemini-3-flash-preview (기본), gpt-5.4-mini |
| 코드 길이 제한 | 최대 500줄 |
| Stateless | 서버 상태 없음 → Vercel 무료 티어 |
| 스트리밍 미사용 | 단순 request-response |
