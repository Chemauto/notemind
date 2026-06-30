from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient


def _sample_outline_dict() -> dict:
    return {
        "title": "测试",
        "summary": "",
        "outline": [
            {"id": "1", "title": "节点", "summary": "",
             "key_points": [], "tags": [], "source_quote": "", "children": []}
        ],
        "keywords": [],
        "suggested_style": "academic",
        "suggested_depth": "standard",
    }


@patch("app.services.markdown_service.LLMClient")
def test_generate_endpoint_returns_markdown(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.main import app

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete.return_value = "# 测试\n\n正文"

    client = TestClient(app)
    response = client.post(
        "/api/generate",
        json={"outline": _sample_outline_dict(), "style": "academic", "depth": "standard"},
    )
    assert response.status_code == 200
    assert response.json()["markdown"].startswith("# 测试")


def test_generate_endpoint_rejects_invalid_outline(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/generate",
        json={"outline": {"title": "x", "outline": []},
              "style": "academic", "depth": "standard"},
    )
    assert response.status_code == 422


def test_generate_endpoint_rejects_invalid_style(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/generate",
        json={"outline": _sample_outline_dict(),
              "style": "wrong-style", "depth": "standard"},
    )
    assert response.status_code == 500
