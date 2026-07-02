import io

import pytest


def _make_pdf_bytes(text_per_page: list[str]) -> bytes:
    """用 fpdf2 生成测试 PDF。"""
    try:
        from fpdf import FPDF
    except ImportError as e:
        pytest.skip(f"fpdf2 未安装，跳过 PDF 生成测试: {e}")

    pdf = FPDF()
    for text in text_per_page:
        pdf.add_page()
        pdf.set_font("helvetica", size=12)
        pdf.cell(0, 10, text=text, new_x="LMARGIN", new_y="NEXT")
    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()


def test_extract_pdf_text_single_page() -> None:
    from app.services.pdf import extract_pdf_text

    raw = _make_pdf_bytes(["Hello PDF world"])
    result = extract_pdf_text(raw)
    assert "Hello PDF world" in result.text
    assert result.metadata["page_count"] == 1


def test_extract_pdf_text_multi_page() -> None:
    from app.services.pdf import extract_pdf_text

    raw = _make_pdf_bytes(["Page one content", "Page two content", "Page three"])
    result = extract_pdf_text(raw)
    assert "Page one content" in result.text
    assert "Page two content" in result.text
    assert "Page three" in result.text
    assert result.metadata["page_count"] == 3


def test_extract_pdf_text_empty_input_raises() -> None:
    from app.services.pdf import PdfProcessingError, extract_pdf_text

    with pytest.raises(PdfProcessingError):
        extract_pdf_text(b"")


def test_extract_pdf_text_corrupt_input_raises() -> None:
    from app.services.pdf import PdfProcessingError, extract_pdf_text

    with pytest.raises(PdfProcessingError):
        extract_pdf_text(b"not a pdf at all")


def test_extract_pdf_text_truncates_overlong() -> None:
    """超过 32k 字的 PDF 应该被截断到 32000 字。"""
    from app.services.pdf import extract_pdf_text

    big_text = "x" * 50000
    raw = _make_pdf_bytes([big_text])
    result = extract_pdf_text(raw, max_chars=32000)
    assert len(result.text) <= 32000
    assert result.metadata.get("truncated") is True
