from pydantic import BaseModel, Field


class OutlineRequest(BaseModel):
    text: str = Field(default="", description="原始文字材料，可空")
    images: list[str] = Field(
        default_factory=list,
        description="图片 data URL 列表（data:image/...;base64,...）",
    )


class GenerateMarkdownRequest(BaseModel):
    outline: dict  # Outline 的 dict 形式
    style: str = "academic"
    depth: str = "standard"


class MarkdownResponse(BaseModel):
    markdown: str
