from pydantic import BaseModel, Field


class OutlineRequest(BaseModel):
    text: str = Field(..., min_length=1)


class GenerateMarkdownRequest(BaseModel):
    outline: dict  # Outline 的 dict 形式
    style: str = "academic"
    depth: str = "standard"


class MarkdownResponse(BaseModel):
    markdown: str
