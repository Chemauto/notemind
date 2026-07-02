from fastapi import APIRouter, HTTPException, UploadFile

from app.schemas.preprocess import PreprocessResponse, WebFetchRequest
from app.services.pdf import PdfProcessingError, extract_pdf_text
from app.services.web import WebFetchingError, fetch_url_text

router = APIRouter()


@router.post("/preprocess/pdf", response_model=PreprocessResponse)
async def preprocess_pdf(file: UploadFile) -> PreprocessResponse:
    raw = await file.read()
    try:
        result = extract_pdf_text(raw)
    except PdfProcessingError as e:
        raise HTTPException(status_code=500, detail=f"PDF preprocess failed: {e}") from e
    return PreprocessResponse(
        text=result.text,
        source_type="pdf",
        metadata=result.metadata,
    )


@router.post("/preprocess/web", response_model=PreprocessResponse)
def preprocess_web(request: WebFetchRequest) -> PreprocessResponse:
    try:
        result = fetch_url_text(request.url)
    except WebFetchingError as e:
        raise HTTPException(status_code=500, detail=f"Web preprocess failed: {e}") from e
    return PreprocessResponse(
        text=result.text,
        source_type="web",
        metadata=result.metadata,
    )
