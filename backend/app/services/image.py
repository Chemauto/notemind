import base64
import io
import re

from PIL import Image

MAX_INPUT_BYTES_DEFAULT = 10 * 1024 * 1024  # 单张原图上限 10MB
MAX_LONG_EDGE = 1024
JPEG_QUALITY = 85

_DATA_URL_RE = re.compile(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", re.DOTALL)


class ImageProcessingError(Exception):
    """图片处理失败。"""


def parse_data_url(data_url: str) -> tuple[str, bytes]:
    """拆 data URL → (mime, raw_bytes)。失败抛 ImageProcessingError。"""
    if not data_url.startswith("data:"):
        raise ImageProcessingError("不是 data URL（必须以 'data:' 开头）")
    match = _DATA_URL_RE.match(data_url)
    if not match:
        raise ImageProcessingError("data URL 格式非法")
    mime, b64 = match.group(1), match.group(2)
    try:
        payload = base64.b64decode(b64, validate=True)
    except (ValueError, base64.binascii.Error) as e:
        raise ImageProcessingError(f"base64 解码失败: {e}") from e
    return mime, payload


def compress_image(
    raw: bytes,
    max_size: int = MAX_LONG_EDGE,
    quality: int = JPEG_QUALITY,
) -> bytes:
    """把原始图片字节 → 压缩后的 JPEG 字节。长边 ≤ max_size。"""
    try:
        img = Image.open(io.BytesIO(raw))
        img.load()
    except Exception as e:
        raise ImageProcessingError(f"Pillow 无法解码图片: {e}") from e

    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    if max(img.size) > max_size:
        img.thumbnail((max_size, max_size), resample=Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue()


def encode_image_data_url(
    raw: bytes,
    mime: str = "image/jpeg",
) -> str:
    """字节 → data URL。"""
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{b64}"


def validate_and_normalize(
    data_url: str,
    max_input_bytes: int = MAX_INPUT_BYTES_DEFAULT,
    max_size: int = MAX_LONG_EDGE,
) -> str:
    """对外主入口：原始 data URL（任意 mime/尺寸）→ 压缩后 JPEG data URL。"""
    mime, payload = parse_data_url(data_url)
    if len(payload) > max_input_bytes:
        raise ImageProcessingError(
            f"原图 {len(payload)} 字节超过上限 {max_input_bytes}"
        )
    compressed = compress_image(payload, max_size=max_size)
    return encode_image_data_url(compressed, mime="image/jpeg")
