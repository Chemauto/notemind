from typing import Any

from zhipuai import ZhipuAI

from app.core.config import get_settings


class LLMError(Exception):
    """LLM 调用相关错误。"""


class LLMClient:
    """智谱 GLM 客户端的薄封装，便于 mock。

    api_key 优先级：构造参数 > 环境变量。
    部署模式下用户在前端填 key，通过请求 header 传入；
    本地开发模式可直接用 .env 的 ZHIPU_API_KEY。
    """

    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        self.model = settings.zhipu_model
        key = api_key or settings.zhipu_api_key
        if not key:
            raise LLMError(
                "缺少 API key。请在前端填入智谱 API key，或配置后端 ZHIPU_API_KEY 环境变量。"
            )
        self._client = ZhipuAI(api_key=key)

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
