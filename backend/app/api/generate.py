from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import UserApiKey
from app.schemas.api import GenerateMarkdownRequest, MarkdownResponse
from app.schemas.outline import Outline
from app.services.markdown_service import MarkdownGenerationError, generate_markdown

router = APIRouter()


@router.post("/generate", response_model=MarkdownResponse)
def generate_endpoint(request: GenerateMarkdownRequest, api_key: UserApiKey = None) -> MarkdownResponse:
    try:
        outline = Outline.model_validate(request.outline)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid outline: {e}") from e

    try:
        markdown = generate_markdown(
            outline, style=request.style, depth=request.depth, api_key=api_key
        )
    except MarkdownGenerationError as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}") from e

    return MarkdownResponse(markdown=markdown)
