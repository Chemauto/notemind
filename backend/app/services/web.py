from urllib.parse import urlparse

import httpx
import trafilatura

USER_AGENT = "NoteMind/0.1 (+https://github.com/local)"
TIMEOUT_SECONDS = 20.0
MAX_CHARS_DEFAULT = 32_000


class WebFetchingError(Exception):
    """网页抓取失败。"""


class WebResult:
    def __init__(self, text: str, metadata: dict) -> None:
        self.text = text
        self.metadata = metadata

    def __repr__(self) -> str:
        return f"WebResult(text=<{len(self.text)} chars>, metadata={self.metadata})"


def _is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def fetch_url_text(
    url: str,
    max_chars: int = MAX_CHARS_DEFAULT,
    timeout: float = TIMEOUT_SECONDS,
) -> WebResult:
    if not _is_valid_url(url):
        raise WebFetchingError(f"URL 不合法: {url}")
    try:
        response = httpx.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=timeout,
            follow_redirects=True,
        )
    except Exception as e:
        raise WebFetchingError(f"httpx 请求失败: {e}") from e

    if response.status_code >= 400:
        raise WebFetchingError(
            f"HTTP 状态码 {response.status_code}: {response.reason_phrase}"
        )

    try:
        extracted = trafilatura.extract(
            response.text,
            include_comments=False,
            include_tables=True,
            favor_precision=True,
        )
    except Exception as e:
        raise WebFetchingError(f"trafilatura 提取失败: {e}") from e

    if not extracted or not extracted.strip():
        raise WebFetchingError("trafilatura 未能从页面提取正文")

    text = extracted.strip()
    truncated = False
    if len(text) > max_chars:
        text = text[:max_chars]
        truncated = True

    return WebResult(
        text=text,
        metadata={
            "source_url": url,
            "char_count": len(text),
            "truncated": truncated,
        },
    )
