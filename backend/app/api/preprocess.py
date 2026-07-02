from fastapi import APIRouter, HTTPException, UploadFile

from app.schemas.preprocess import PreprocessResponse, WebFetchRequest
from app.services.audio import AudioProcessingError, transcribe_audio
from app.services.pdf import PdfProcessingError, extract_pdf_text
from app.services.video import VideoProcessingError, VideoResult, extract_audio
from app.services.web import WebFetchingError, fetch_url_text

router = APIRouter()

VIDEO_MAX_BYTES = 100 * 1024 * 1024  # 100 MB
VIDEO_SUPPORTED_MIMES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
}


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


@router.post("/preprocess/audio", response_model=PreprocessResponse)
async def preprocess_audio(file: UploadFile) -> PreprocessResponse:
    raw = await file.read()
    mime_type = file.content_type or ""
    try:
        result = transcribe_audio(raw, mime_type)
    except AudioProcessingError as e:
        raise HTTPException(status_code=500, detail=f"Audio preprocess failed: {e}") from e
    return PreprocessResponse(
        text=result.text,
        source_type="audio",
        metadata=result.metadata,
    )


@router.post("/preprocess/video", response_model=PreprocessResponse)
async def preprocess_video(file: UploadFile) -> PreprocessResponse:
    mime_type = file.content_type or ""
    if mime_type not in VIDEO_SUPPORTED_MIMES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video mime type: {mime_type or 'unknown'}",
        )
    raw = await file.read()
    if len(raw) > VIDEO_MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Video too large: {len(raw)} bytes (max {VIDEO_MAX_BYTES})",
        )
    try:
        video_result = extract_audio(raw)
    except VideoProcessingError as e:
        raise HTTPException(status_code=500, detail=f"Video preprocess failed: {e}") from e
    try:
        audio_result = transcribe_audio(video_result.audio_bytes, "audio/wav")
    except AudioProcessingError as e:
        raise HTTPException(status_code=500, detail=f"Video preprocess failed: {e}") from e
    merged_metadata = {**video_result.metadata, **audio_result.metadata, "source_format": "video"}
    return PreprocessResponse(
        text=audio_result.text,
        source_type="video",
        metadata=merged_metadata,
    )
