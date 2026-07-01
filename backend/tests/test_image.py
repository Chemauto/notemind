import base64
import io

import pytest
from PIL import Image

from app.services.image import (
    ImageProcessingError,
    compress_image,
    encode_image_data_url,
    parse_data_url,
    validate_and_normalize,
)


def _make_image_bytes(size: tuple[int, int], format: str = "PNG") -> bytes:
    img = Image.new("RGB", size, color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


def _make_data_url(img_bytes: bytes, mime: str = "image/png") -> str:
    b64 = base64.b64encode(img_bytes).decode("ascii")
    return f"data:{mime};base64,{b64}"


def test_compress_image_downscales_large_image() -> None:
    raw = _make_image_bytes((4000, 3000))
    result = compress_image(raw, max_size=1024)
    result_img = Image.open(io.BytesIO(result))
    assert max(result_img.size) <= 1024
    assert result_img.format == "JPEG"


def test_compress_image_keeps_small_image_unchanged_size() -> None:
    raw = _make_image_bytes((500, 400))
    result = compress_image(raw, max_size=1024)
    result_img = Image.open(io.BytesIO(result))
    assert result_img.size == (500, 400)


def test_compress_image_output_is_jpeg() -> None:
    raw = _make_image_bytes((100, 100), format="PNG")
    result = compress_image(raw)
    result_img = Image.open(io.BytesIO(result))
    assert result_img.format == "JPEG"


def test_compress_image_raises_on_corrupt_input() -> None:
    with pytest.raises(ImageProcessingError):
        compress_image(b"not an image at all")


def test_parse_data_url_extracts_mime_and_bytes() -> None:
    raw = _make_image_bytes((10, 10))
    url = _make_data_url(raw, mime="image/png")
    mime, payload = parse_data_url(url)
    assert mime == "image/png"
    assert payload == raw


def test_parse_data_url_raises_on_invalid_scheme() -> None:
    with pytest.raises(ImageProcessingError):
        parse_data_url("https://example.com/foo.png")


def test_parse_data_url_raises_on_non_image_mime() -> None:
    url = "data:text/plain;base64," + base64.b64encode(b"hello").decode()
    with pytest.raises(ImageProcessingError):
        parse_data_url(url)


def test_encode_image_data_url_format() -> None:
    url = encode_image_data_url(b"\xff\xd8\xff\xe0fake-jpeg-bytes")
    assert url.startswith("data:image/jpeg;base64,")


def test_validate_and_normalize_round_trip() -> None:
    raw = _make_image_bytes((2000, 1500))
    url = _make_data_url(raw, mime="image/png")
    result = validate_and_normalize(url)
    assert result.startswith("data:image/jpeg;base64,")
    mime, payload = parse_data_url(result)
    result_img = Image.open(io.BytesIO(payload))
    assert max(result_img.size) <= 1024


def test_validate_and_normalize_rejects_oversized_payload() -> None:
    big_bytes = b"x" * (11 * 1024 * 1024)
    b64 = base64.b64encode(big_bytes).decode()
    url = f"data:image/png;base64,{b64}"
    with pytest.raises(ImageProcessingError):
        validate_and_normalize(url, max_input_bytes=10 * 1024 * 1024)
