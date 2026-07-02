from pydantic import BaseModel, Field


class WebFetchRequest(BaseModel):
    url: str = Field(..., min_length=1)


class PreprocessResponse(BaseModel):
    text: str
    source_type: str  # "pdf" | "web" | ...
    metadata: dict
