from fastapi import APIRouter, HTTPException

from app.schemas.api import OutlineRequest
from app.schemas.outline import Outline
from app.services.outline_service import OutlineGenerationError, generate_outline

router = APIRouter()


@router.post("/outline", response_model=Outline)
def generate_outline_endpoint(request: OutlineRequest) -> Outline:
    try:
        return generate_outline(text=request.text, images=request.images)
    except OutlineGenerationError as e:
        raise HTTPException(status_code=500, detail=f"Outline generation failed: {e}") from e
