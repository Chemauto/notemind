from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


_VALID_OUTLINE = {
    "title": "测试",
    "summary": "总览",
    "outline": [],
    "keywords": [],
    "suggested_style": "academic",
    "suggested_depth": "standard",
}


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


def test_outline_endpoint_rejects_when_no_text_and_no_images(
    fake_env: dict[str, str],
) -> None:
    """text 和 images 都为空时，schema 通过，service 抛 OutlineGenerationError → 500。"""
    from app.main import app

    client = TestClient(app)
    response = client.post("/api/outline", json={"text": ""})
    assert response.status_code == 500
    assert "outline" in response.json()["detail"].lower()


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


def test_outline_endpoint_accepts_images_field(
    fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    """endpoint 接受 images 字段并把它们压进 generate_outline。"""
    captured: dict = {}

    def _fake_generate(text: str = "", images: list[str] | None = None, llm=None, api_key=None):
        captured["text"] = text
        captured["images"] = images or []
        captured["api_key"] = api_key
        return _VALID_OUTLINE

    monkeypatch.setattr("app.api.outline.generate_outline", _fake_generate)

    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/outline",
        json={
            "text": "截图说明",
            "images": ["data:image/jpeg;base64,AAAA"],
        },
    )
    assert response.status_code == 200
    assert captured["text"] == "截图说明"
    assert captured["images"] == ["data:image/jpeg;base64,AAAA"]


def test_outline_endpoint_works_with_images_only(
    fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    """text 缺省时，images 仍能触发生成。"""
    captured: dict = {}

    def _fake_generate(text: str = "", images: list[str] | None = None, llm=None, api_key=None):
        captured["text"] = text
        captured["images"] = images or []
        return _VALID_OUTLINE

    monkeypatch.setattr("app.api.outline.generate_outline", _fake_generate)

    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/outline",
        json={"images": ["data:image/jpeg;base64,BBBB"]},
    )
    assert response.status_code == 200
    assert captured["text"] == ""
    assert captured["images"] == ["data:image/jpeg;base64,BBBB"]


def test_outline_endpoint_forwards_user_api_key(
    fake_env: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    """用户在前端填的 key 通过 X-Zhipu-Api-Key header 传到 service。"""
    captured: dict = {}

    def _fake_generate(text: str = "", images: list[str] | None = None, llm=None, api_key=None):
        captured["text"] = text
        captured["images"] = images or []
        captured["api_key"] = api_key
        return _VALID_OUTLINE

    monkeypatch.setattr("app.api.outline.generate_outline", _fake_generate)

    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/outline",
        json={"text": "test"},
        headers={"X-Zhipu-Api-Key": "user-provided-key-xyz"},
    )
    assert response.status_code == 200
    assert captured["api_key"] == "user-provided-key-xyz"

    monkeypatch.setattr("app.api.outline.generate_outline", _fake_generate)

    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/outline",
        json={"images": ["data:image/jpeg;base64,BBBB"]},
    )
    assert response.status_code == 200
    assert captured["text"] == ""
    assert captured["images"] == ["data:image/jpeg;base64,BBBB"]
