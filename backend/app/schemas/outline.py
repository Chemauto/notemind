from typing import Literal

from pydantic import BaseModel, Field

Style = Literal["academic", "exam", "casual", "meeting"]
Depth = Literal["minimal", "standard", "detailed"]


class OutlineNode(BaseModel):
    id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    summary: str = ""
    key_points: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    source_quote: str = ""
    children: list["OutlineNode"] = Field(default_factory=list)


OutlineNode.model_rebuild()


class Outline(BaseModel):
    title: str = Field(..., min_length=1)
    summary: str = ""
    outline: list[OutlineNode]
    keywords: list[str] = Field(default_factory=list)
    suggested_style: Style
    suggested_depth: Depth
