from typing import Any

from zhipuai import ZhipuAI

from app.core.config import get_settings


class LLMError(Exception):
    """LLM 调用相关错误。"""


class LLMClient:
    """智谱 GLM 客户端的薄封装，便于 mock。"""

    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.zhipu_model
        self._client = ZhipuAI(api_key=settings.zhipu_api_key)

    def complete(
        self,
        messages: list[dict[str, Any]],
        temperature: float = 0.7,
    ) -> str:
        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
        )
        if not response.choices:
            raise LLMError("LLM 返回空 choices")
        return response.choices[0].message.content or ""

    def complete_json(
        self,
        messages: list[dict[str, Any]],
        temperature: float = 0.3,
    ) -> str:
        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        if not response.choices:
            raise LLMError("LLM 返回空 choices")
        return response.choices[0].message.content or ""
