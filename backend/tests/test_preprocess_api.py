from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


def test_preprocess_pdf_endpoint_returns_text(fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch) -> None:
    from app.main import app

    def _fake_extract(raw: bytes, max_chars: int = 32000):
        result = MagicMock()
        result.text = "Extracted PDF text"
        result.metadata = {"page_count": 2, "truncated": False, "char_count": 19}
        return result

    monkeypatch.setattr("app.api.preprocess.extract_pdf_text", _fake_extract)

    client = TestClient(app)
    response = client.post(
        "/api/preprocess/pdf",
        files={"file": ("test.pdf", b"fake-pdf-bytes", "application/pdf")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["text"] == "Extracted PDF text"
    assert body["source_type"] == "pdf"
    assert body["metadata"]["page_count"] == 2


def test_preprocess_pdf_endpoint_rejects_missing_file(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.post("/api/preprocess/pdf", files={})
    assert response.status_code == 422


def test_preprocess_pdf_endpoint_returns_500_on_error(
    fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.api.preprocess import PdfProcessingError
    from app.main import app

    def _raise(raw: bytes, max_chars: int = 32000):
        raise PdfProcessingError("boom")

    monkeypatch.setattr("app.api.preprocess.extract_pdf_text", _raise)

    client = TestClient(app)
    response = client.post(
        "/api/preprocess/pdf",
        files={"file": ("t.pdf", b"x", "application/pdf")},
    )
    assert response.status_code == 500


def test_preprocess_web_endpoint_returns_text(fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch) -> None:
    from app.main import app

    def _fake_fetch(url: str, max_chars: int = 32000, timeout: float = 20.0):
        result = MagicMock()
        result.text = "Extracted web page content"
        result.metadata = {"source_url": url, "char_count": 25, "truncated": False}
        return result

    monkeypatch.setattr("app.api.preprocess.fetch_url_text", _fake_fetch)

    client = TestClient(app)
    response = client.post(
        "/api/preprocess/web",
        json={"url": "https://example.com/article"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["text"] == "Extracted web page content"
    assert body["source_type"] == "web"
    assert body["metadata"]["source_url"] == "https://example.com/article"


def test_preprocess_web_endpoint_rejects_missing_url(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.post("/api/preprocess/web", json={})
    assert response.status_code == 422


def test_preprocess_web_endpoint_returns_500_on_error(
    fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.api.preprocess import WebFetchingError
    from app.main import app

    def _raise(url: str, max_chars: int = 32000, timeout: float = 20.0):
        raise WebFetchingError("network down")

    monkeypatch.setattr("app.api.preprocess.fetch_url_text", _raise)

    client = TestClient(app)
    response = client.post(
        "/api/preprocess/web",
        json={"url": "https://example.com"},
    )
    assert response.status_code == 500
