"""请求级依赖：从 header 读取用户的 API key。

部署模式下，用户在前端填入自己的智谱 API key，
通过 `X-Zhipu-Api-Key` header 传给后端。
本地开发可直接用 .env 的 ZHIPU_API_KEY，header 可省略。
"""

from typing import Annotated

from fastapi import Header

UserApiKey = Annotated[str | None, Header(alias="X-Zhipu-Api-Key")]
