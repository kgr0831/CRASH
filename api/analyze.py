from fastapi import APIRouter, HTTPException

from api.config import get_settings, AVAILABLE_MODELS
from api.schemas import AnalyzeRequest, AnalyzeResponse
from api.providers import call_llm
from api.parser import parse_llm_response

router = APIRouter()


@router.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    settings = get_settings()

    if not settings.api_key:
        raise HTTPException(status_code=500, detail="API_KEY is not configured")

    if req.model not in AVAILABLE_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model: {req.model}. Available: {list(AVAILABLE_MODELS.keys())}",
        )

    lines = req.code.splitlines()
    if len(lines) > settings.max_code_lines:
        raise HTTPException(
            status_code=400,
            detail=f"Code exceeds {settings.max_code_lines} lines limit (got {len(lines)})",
        )

    try:
        raw = await call_llm(req.code, req.language, req.model)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")

    try:
        result = parse_llm_response(raw, req.code)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse LLM response: {e}")

    return result
