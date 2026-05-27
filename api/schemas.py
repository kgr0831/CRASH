from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50_000)
    language: str | None = Field(default=None, examples=["python", "javascript"])
    model: str = Field(default="gemini-3-flash-preview")


class LineResult(BaseModel):
    code: str
    score: int = Field(ge=0, le=100)
    tags: list[str] = Field(default_factory=list)
    advice: str = ""
    safety: int = Field(ge=0, le=100, default=0)
    performance: int = Field(ge=0, le=100, default=0)
    structure: int = Field(ge=0, le=100, default=0)


class IssueCounts(BaseModel):
    critical: int = 0
    warning: int = 0
    info: int = 0


class Summary(BaseModel):
    riskScore: int = Field(ge=0, le=100)
    linesScanned: int
    hotspots: int
    estComplexity: str = "O(1)"
    issues: IssueCounts = Field(default_factory=IssueCounts)


class AnalyzeResponse(BaseModel):
    language: str
    filename: str = "submitted_code"
    summary: Summary
    lines: list[LineResult]
