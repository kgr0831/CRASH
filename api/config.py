from functools import lru_cache

from pydantic_settings import BaseSettings

AVAILABLE_MODELS = {
    "gpt-5.4-mini": "OpenAI",
    "gemini-3-flash-preview": "Google",
    "sonar-reasoning-pro": "Perplexity",
    "grok-3-mini": "xAI",
}

DEFAULT_MODEL = "gemini-3-flash-preview"


class Settings(BaseSettings):
    api_key: str = ""
    gateway_base_url: str = "https://factchat-cloud.mindlogic.ai/v1/gateway"
    max_code_lines: int = 500

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
