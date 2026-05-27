import json
import re

from api.schemas import AnalyzeResponse, LineResult, Summary, IssueCounts


def _try_repair_json(s: str) -> str:
    """Attempt to close truncated JSON by balancing brackets."""
    opens = 0
    in_string = False
    escape = False
    for ch in s:
        if escape:
            escape = False
            continue
        if ch == "\\":
            escape = True
            continue
        if ch == '"' and not escape:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in "{[":
            opens += 1
        elif ch in "}]":
            opens -= 1

    if in_string:
        s += '"'
    s += "]" * max(0, s.count("[") - s.count("]"))
    s += "}" * max(0, s.count("{") - s.count("}"))
    return s


def _extract_json(raw: str) -> dict:
    stripped = raw.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```\w*\n?", "", stripped)
        stripped = re.sub(r"\n?```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        repaired = _try_repair_json(stripped)
        return json.loads(repaired)


def _calc_score(line: dict) -> int:
    s = line.get("safety", 0)
    p = line.get("performance", 0)
    t = line.get("structure", 0)
    return round(s * 0.4 + p * 0.35 + t * 0.25)


def _classify(score: int) -> str:
    if score >= 80:
        return "critical"
    if score >= 40:
        return "warning"
    if score >= 20:
        return "info"
    return "safe"


def parse_llm_response(raw: str, code: str) -> AnalyzeResponse:
    data = _extract_json(raw)
    code_lines = code.splitlines()
    ai_lines = data.get("lines", [])

    results: list[LineResult] = []
    for i, src in enumerate(code_lines):
        if i < len(ai_lines):
            al = ai_lines[i]
            score = al.get("score", None)
            if score is None:
                score = _calc_score(al)
            results.append(LineResult(
                code=src,
                score=max(0, min(100, score)),
                tags=al.get("tags", []),
                advice=al.get("advice", ""),
                safety=max(0, min(100, al.get("safety", 0))),
                performance=max(0, min(100, al.get("performance", 0))),
                structure=max(0, min(100, al.get("structure", 0))),
            ))
        else:
            results.append(LineResult(code=src, score=0))

    scores = [r.score for r in results if r.score > 0]
    risk = round(sum(scores) / len(scores)) if scores else 0
    hotspots = sum(1 for r in results if r.score >= 60)

    counts = {"critical": 0, "warning": 0, "info": 0}
    for r in results:
        cat = _classify(r.score)
        if cat in counts:
            counts[cat] += 1

    return AnalyzeResponse(
        language=data.get("language", "Unknown"),
        filename="submitted_code",
        summary=Summary(
            riskScore=min(100, risk),
            linesScanned=len(results),
            hotspots=hotspots,
            estComplexity=data.get("estComplexity", "O(?)"),
            issues=IssueCounts(**counts),
        ),
        lines=results,
    )
