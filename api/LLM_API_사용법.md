# HELIX 프로젝트 LLM API 사용법

## 1. 호출 구조 개요

```
.env (API Key + Base URL)
        │
    BaseAgent (LangChain ChatOpenAI)
        │
    Gateway API (OpenAI SDK 호환)
        │
  ┌─────┼──────────┬──────────────┐
  │     │          │              │
OpenAI  Google  Perplexity      xAI
```

모든 LLM 호출은 **OpenAI SDK 호환 Gateway** 하나를 통해 이루어집니다. 각 Provider의 API를 직접 호출하지 않고, Gateway가 `model` 파라미터를 보고 적절한 Provider로 라우팅합니다.

## 2. 환경 변수 설정

`.env` 파일에 2개만 설정하면 됩니다:

```env
GATEWAY_API_KEY=your_gateway_api_key_here
GATEWAY_BASE_URL=https://factchat-cloud.mindlogic.ai/v1/gateway
```

## 3. Agent별 모델 매핑

| Agent | 역할 | 모델 | Provider |
|-------|------|------|----------|
| Leader | 작업 분배, 합의 판단 | `gpt-5.4-mini` | OpenAI |
| Researcher | 사실 검증 | `gemini-3-flash-preview` | Google |
| Logician | 논리 검증 | `sonar-reasoning-pro` | Perplexity |
| Critic | 비판적 검토 | `grok-3-mini` | xAI |

## 4. 핵심 호출 코드 (`backend/agents/base.py`)

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# Gateway 클라이언트 생성 (1회)
llm = ChatOpenAI(
    model="gpt-5.4-mini",           # 모델명만 바꾸면 Provider 전환
    api_key=GATEWAY_API_KEY,
    base_url=GATEWAY_BASE_URL,
)

# 비동기 호출
messages = [
    SystemMessage(content="역할 지시문"),
    HumanMessage(content="사용자 질문"),
]
response = await llm.ainvoke(messages, max_tokens=2000)
print(response.content)  # LLM 응답 텍스트
```

## 5. 토큰 관리

- **측정 방식**: API 반환값 대신 `tiktoken`(`cl100k_base`)으로 직접 측정
- **예산**: SAS 8,000 = MAS Agent당 2,000 × 4
- **관련 코드**: `backend/utils/budget_controller.py`, `backend/utils/token_counter.py`

## 6. 모델 추가/변경 방법

새 Agent를 추가하거나 모델을 변경하려면 `BaseAgent`를 상속하고 `model_name`만 바꾸면 됩니다:

```python
from backend.agents.base import BaseAgent

class MyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="MyAgent",
            role="my_role",
            model_name="원하는-모델-id",  # Gateway가 지원하는 모델이면 OK
            system_prompt="역할 지시문",
        )
```
