import httpx

from api.config import get_settings, AVAILABLE_MODELS, DEFAULT_MODEL
from api.prompt import SYSTEM_PROMPT, build_user_prompt

TIMEOUT = 60.0


async def call_llm(code: str, language: str | None = None, model: str = DEFAULT_MODEL) -> str:
    settings = get_settings()

    if not settings.api_key:
        raise ValueError("API_KEY is not set in .env")

    if model not in AVAILABLE_MODELS:
        raise ValueError(f"Unknown model: {model}. Available: {list(AVAILABLE_MODELS.keys())}")

    user_prompt = build_user_prompt(code, language)

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 8192,
    }

    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            f"{settings.gateway_base_url}/chat/completions",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()

    data = resp.json()
    return data["choices"][0]["message"]["content"]
