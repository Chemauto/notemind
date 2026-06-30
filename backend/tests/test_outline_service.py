from unittest.mock import MagicMock, patch

import pytest


def _fake_outline_json() -> str:
    return """{
      "title": "机器学习基础",
      "summary": "介绍 ML 基础概念",
      "outline": [
        {
          "id": "1",
          "title": "监督学习",
          "summary": "需要标注数据",
          "key_points": ["回归", "分类"],
          "tags": ["ML"],
          "source_quote": "",
          "children": []
        }
      ],
      "keywords": ["ML"],
      "suggested_style": "academic",
      "suggested_depth": "standard"
    }"""


@patch("app.services.outline_service.LLMClient")
def test_generate_outline_returns_parsed_outline(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.outline_service import generate_outline

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = _fake_outline_json()

    result = generate_outline(text="这是关于机器学习的文字")

    assert result.title == "机器学习基础"
    assert result.outline[0].title == "监督学习"
    mock_client.complete_json.assert_called_once()


@patch("app.services.outline_service.LLMClient")
def test_generate_outline_strips_markdown_fences(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.outline_service import generate_outline

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = "```json\n" + _fake_outline_json() + "\n```"

    result = generate_outline(text="x")
    assert result.title == "机器学习基础"


@patch("app.services.outline_service.LLMClient")
def test_generate_outline_raises_on_invalid_json(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.outline_service import OutlineGenerationError, generate_outline

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = "not json at all"

    with pytest.raises(OutlineGenerationError):
        generate_outline(text="x")


@patch("app.services.outline_service.LLMClient")
def test_generate_outline_includes_text_in_messages(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.outline_service import generate_outline

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = _fake_outline_json()

    generate_outline(text="关于量子物理的笔记")
    call_kwargs = mock_client.complete_json.call_args.kwargs
    messages = call_kwargs["messages"]
    user_msg = next(m for m in messages if m["role"] == "user")
    assert "量子物理" in user_msg["content"]
