from unittest.mock import patch, MagicMock

import pytest


def test_fetch_url_text_success() -> None:
    from app.services.web import fetch_url_text

    fake_html = """
    <html><head><title>Example Article</title></head>
    <body><article><p>This is the main article content.</p>
    <p>Second paragraph with more text.</p></article></body></html>
    """
    with patch("app.services.web.httpx.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = fake_html
        mock_resp.content = fake_html.encode("utf-8")
        mock_get.return_value = mock_resp

        result = fetch_url_text("https://example.com/article")

    assert "main article content" in result.text
    assert "Second paragraph" in result.text
    assert result.metadata["source_url"] == "https://example.com/article"


def test_fetch_url_text_strips_boilerplate() -> None:
    from app.services.web import fetch_url_text

    fake_html = """
    <html><head><title>Page</title></head>
    <body>
      <nav>Home About Contact</nav>
      <article><p>The real article content.</p></article>
      <footer>Copyright 2026</footer>
    </body></html>
    """
    with patch("app.services.web.httpx.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = fake_html
        mock_resp.content = fake_html.encode("utf-8")
        mock_get.return_value = mock_resp

        result = fetch_url_text("https://example.com")

    assert "real article content" in result.text
    # 导航和页脚的 boilerplate 应该被 trafilatura 剥掉
    assert "Copyright 2026" not in result.text


def test_fetch_url_text_raises_on_http_error() -> None:
    from app.services.web import WebFetchingError, fetch_url_text

    with patch("app.services.web.httpx.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_resp.text = "Not Found"
        mock_get.return_value = mock_resp

        with pytest.raises(WebFetchingError):
            fetch_url_text("https://example.com/missing")


def test_fetch_url_text_raises_on_invalid_url() -> None:
    from app.services.web import WebFetchingError, fetch_url_text

    with pytest.raises(WebFetchingError):
        fetch_url_text("not a url at all")


def test_fetch_url_text_raises_on_request_exception() -> None:
    from app.services.web import WebFetchingError, fetch_url_text

    with patch("app.services.web.httpx.get", side_effect=Exception("network down")):
        with pytest.raises(WebFetchingError):
            fetch_url_text("https://example.com")
