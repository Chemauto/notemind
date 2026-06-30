from app.core.llm import LLMClient
from app.core.prompts import (
    DEPTH_RULES,
    STYLE_RULES,
    MARKDOWN_SYSTEM,
    MARKDOWN_USER_TEMPLATE,
)
from app.schemas.outline import Outline


class MarkdownGenerationError(Exception):
    """Markdown 生成失败。"""


def generate_markdown(
    outline: Outline,
    style: str = "academic",
    depth: str = "standard",
    llm: LLMClient | None = None,
) -> str:
    if style not in STYLE_RULES:
        raise MarkdownGenerationError(f"未知风格: {style}")
    if depth not in DEPTH_RULES:
        raise MarkdownGenerationError(f"未知详细度: {depth}")

    client = llm or LLMClient()
    messages = [
        {"role": "system", "content": MARKDOWN_SYSTEM},
        {
            "role": "user",
            "content": MARKDOWN_USER_TEMPLATE.format(
                outline_json=outline.model_dump_json(indent=2),
                style_rule=STYLE_RULES[style],
                depth_rule=DEPTH_RULES[depth],
            ),
        },
    ]
    return client.complete(messages=messages)
