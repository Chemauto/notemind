from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient


def _fake_outline_json() -> str:
    return """{
      "title": "测试",
      "summary": "总览",
      "outline": [{
        "id": "1", "title": "节点", "summary": "",
        "key_points": [], "tags": [], "source_quote": "", "children": []
      }],
      "keywords": [],
      "suggested_style": "academic",
      "suggested_depth": "standard"
    }"""


@patch("app.services.outline_service.LLMClient")
def test_outline_endpoint_returns_outline(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.main import app

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = _fake_outline_json()

    client = TestClient(app)
    response = client.post("/api/outline", json={"text": "测试文字"})

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "测试"
    assert body["outline"][0]["id"] == "1"


def test_outline_endpoint_rejects_empty_text(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.post("/api/outline", json={"text": ""})
    assert response.status_code == 422


def test_outline_endpoint_rejects_missing_text(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.post("/api/outline", json={})
    assert response.status_code == 422


@patch("app.services.outline_service.LLMClient")
def test_outline_endpoint_returns_500_on_generation_error(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.main import app

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = "not json"

    client = TestClient(app)
    response = client.post("/api/outline", json={"text": "x"})
    assert response.status_code == 500
    assert "outline" in response.json()["detail"].lower()
