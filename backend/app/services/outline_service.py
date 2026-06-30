import json
import re

from pydantic import ValidationError

from app.core.llm import LLMClient
from app.core.prompts import OUTLINE_SYSTEM, OUTLINE_USER_TEMPLATE
from app.schemas.outline import Outline


class OutlineGenerationError(Exception):
    """大纲生成失败。"""


_FENCE_PATTERN = re.compile(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", re.DOTALL)


def _strip_code_fences(text: str) -> str:
    match = _FENCE_PATTERN.match(text.strip())
    return match.group(1) if match else text


def generate_outline(text: str, llm: LLMClient | None = None) -> Outline:
    """从文字生成结构化大纲。"""
    client = llm or LLMClient()
    messages = [
        {"role": "system", "content": OUTLINE_SYSTEM},
        {"role": "user", "content": OUTLINE_USER_TEMPLATE.format(text=text)},
    ]
    raw = client.complete_json(messages=messages)
    cleaned = _strip_code_fences(raw)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise OutlineGenerationError(f"LLM 输出不是合法 JSON: {e}") from e
    try:
        return Outline.model_validate(data)
    except ValidationError as e:
        raise OutlineGenerationError(f"LLM 输出不符合 schema: {e}") from e
