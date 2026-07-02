import io
import threading

from faster_whisper import WhisperModel

DEFAULT_MODEL = "small"
SUPPORTED_MIMES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/x-m4a",
    "audio/webm",
    "audio/ogg",
    "audio/flac",
}

_MODEL_CACHE: dict[str, WhisperModel] = {}
_MODEL_LOCK = threading.Lock()


class AudioProcessingError(Exception):
    """音频处理失败。"""


class AudioResult:
    def __init__(self, text: str, metadata: dict) -> None:
        self.text = text
        self.metadata = metadata

    def __repr__(self) -> str:
        return f"AudioResult(text=<{len(self.text)} chars>, metadata={self.metadata})"


def _get_model(model_name: str) -> WhisperModel:
    """进程级单例。首次调用下载并加载模型，之后复用。"""
    if model_name in _MODEL_CACHE:
        return _MODEL_CACHE[model_name]
    with _MODEL_LOCK:
        if model_name in _MODEL_CACHE:
            return _MODEL_CACHE[model_name]
        try:
            model = WhisperModel(model_name, device="cpu", compute_type="int8")
        except Exception as e:
            raise AudioProcessingError(f"加载 Whisper 模型失败: {e}") from e
        _MODEL_CACHE[model_name] = model
        return model


def transcribe_audio(
    raw: bytes,
    mime_type: str,
    language: str | None = None,
    model_name: str = DEFAULT_MODEL,
) -> AudioResult:
    """转写音频字节为文字。"""
    if not raw:
        raise AudioProcessingError("音频字节为空")
    if mime_type not in SUPPORTED_MIMES:
        raise AudioProcessingError(f"不支持的 MIME 类型: {mime_type}")

    model = _get_model(model_name)

    buf = io.BytesIO(raw)
    try:
        segments_iter, info = model.transcribe(buf, language=language, beam_size=5)
    except Exception as e:
        raise AudioProcessingError(f"Whisper 转写失败: {e}") from e

    try:
        text = "".join(segment.text for segment in segments_iter).strip()
    except Exception as e:
        raise AudioProcessingError(f"读取转写结果失败: {e}") from e

    return AudioResult(
        text=text,
        metadata={
            "language": info.language,
            "duration": float(info.duration),
            "model": model_name,
        },
    )
