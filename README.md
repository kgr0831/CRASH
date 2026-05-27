# CRASH — Code Risk Avoidance Safety Helper

코드의 위험도를 **열화상 카메라**처럼 시각화하는 AI 코드 분석 도구입니다.

코드를 붙여넣고 분석 버튼을 누르면, AI가 각 라인의 **안전성·성능·구조**를 0~100점으로 평가하고
위험한 코드는 빨간색(뜨거움), 안전한 코드는 파란색(차가움)으로 표시합니다.

## 실행 방법

### 1. 환경 준비

- Python 3.12+
- Node.js 18+
- `.env` 파일에 API 키 설정

```env
API_KEY=your_gateway_api_key
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
npm install
```

### 3. 실행

```bash
# Windows — 프론트+백 동시 실행 + 브라우저 자동 오픈
run.bat

# 또는 수동 실행
python -m uvicorn api.index:app --port 8000   # 백엔드
npm run dev                                    # 프론트엔드 (별도 터미널)
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 15, React 19, TypeScript |
| 백엔드 | FastAPI, Pydantic |
| AI 분석 | OpenAI 호환 Gateway API |
