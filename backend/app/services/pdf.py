import io

import pdfplumber

MAX_CHARS_DEFAULT = 32_000


class PdfProcessingError(Exception):
    """PDF 处理失败。"""


def extract_pdf_text(
    raw: bytes,
    max_chars: int = MAX_CHARS_DEFAULT,
) -> "PdfResult":
    """从 PDF 字节提取所有页面的文字。超过 max_chars 截断。"""
    if not raw:
        raise PdfProcessingError("PDF 字节为空")
    try:
        pages_text: list[str] = []
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                pages_text.append(page_text)
    except Exception as e:
        raise PdfProcessingError(f"pdfplumber 解析失败: {e}") from e

    full_text = "\n\n".join(pages_text).strip()
    truncated = False
    if len(full_text) > max_chars:
        full_text = full_text[:max_chars]
        truncated = True

    return PdfResult(
        text=full_text,
        metadata={
            "page_count": len(pages_text),
            "truncated": truncated,
            "char_count": len(full_text),
        },
    )


class PdfResult:
    """简单容器，方便 mock 和类型推导。"""

    def __init__(self, text: str, metadata: dict) -> None:
        self.text = text
        self.metadata = metadata

    def __repr__(self) -> str:
        return f"PdfResult(text=<{len(self.text)} chars>, metadata={self.metadata})"
