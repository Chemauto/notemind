import json
import re

from pydantic import ValidationError

from app.core.llm import LLMClient
from app.core.prompts import (
    OUTLINE_SYSTEM,
    OUTLINE_USER_TEMPLATE,
    OUTLINE_USER_WITH_IMAGES_TEMPLATE,
)
from app.schemas.outline import Outline


class OutlineGenerationError(Exception):
    """大纲生成失败。"""


_FENCE_PATTERN = re.compile(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", re.DOTALL)


def _strip_code_fences(text: str) -> str:
    match = _FENCE_PATTERN.match(text.strip())
    return match.group(1) if match else text


def _build_user_content(text: str, images: list[str]) -> list[dict]:
    """构造 GLM-4.5V 多模态 user content（text 块 + image_url 块）。"""
    if images:
        user_text = OUTLINE_USER_WITH_IMAGES_TEMPLATE.format(text=text, n=len(images))
    else:
        user_text = OUTLINE_USER_TEMPLATE.format(text=text)
    content: list[dict] = [{"type": "text", "text": user_text}]
    for url in images:
        content.append({"type": "image_url", "image_url": {"url": url}})
    return content


def generate_outline(
    text: str = "",
    images: list[str] | None = None,
    llm: LLMClient | None = None,
) -> Outline:
    """从文字 + 图片生成结构化大纲。至少要有 text 或 images 之一。"""
    if not text and not images:
        raise OutlineGenerationError("text 和 images 至少需要一个")
    images = images or []
    client = llm or LLMClient()
    user_content = _build_user_content(text, images)
    messages = [
        {"role": "system", "content": OUTLINE_SYSTEM},
        {"role": "user", "content": user_content},
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
