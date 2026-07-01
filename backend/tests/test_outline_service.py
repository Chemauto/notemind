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
    content = user_msg["content"]
    if isinstance(content, list):
        text_block = next(b for b in content if b.get("type") == "text")
        assert "量子物理" in text_block["text"]
    else:
        assert "量子物理" in content


@patch("app.services.outline_service.LLMClient")
def test_generate_outline_with_images_builds_multimodal_user_message(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.outline_service import generate_outline

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = _fake_outline_json()

    images = [
        "data:image/jpeg;base64,AAAA",
        "data:image/jpeg;base64,BBBB",
    ]
    generate_outline(text="示意图说明", images=images)

    call_kwargs = mock_client.complete_json.call_args.kwargs
    messages = call_kwargs["messages"]
    user_msg = next(m for m in messages if m["role"] == "user")
    assert isinstance(user_msg["content"], list)
    text_blocks = [b for b in user_msg["content"] if b.get("type") == "text"]
    image_blocks = [b for b in user_msg["content"] if b.get("type") == "image_url"]
    assert len(text_blocks) == 1
    assert len(image_blocks) == 2
    assert image_blocks[0]["image_url"]["url"] == "data:image/jpeg;base64,AAAA"
    assert "示意图说明" in text_blocks[0]["text"]


@patch("app.services.outline_service.LLMClient")
def test_generate_outline_with_images_only_skips_empty_text(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    """只有图片没有文字时，文字占位为空字符串，仍构造多模态消息。"""
    from app.services.outline_service import generate_outline

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete_json.return_value = _fake_outline_json()

    generate_outline(text="", images=["data:image/jpeg;base64,AAAA"])

    call_kwargs = mock_client.complete_json.call_args.kwargs
    messages = call_kwargs["messages"]
    user_msg = next(m for m in messages if m["role"] == "user")
    assert isinstance(user_msg["content"], list)
    image_blocks = [b for b in user_msg["content"] if b.get("type") == "image_url"]
    assert len(image_blocks) == 1


def test_generate_outline_raises_when_neither_text_nor_images(
    fake_env: dict[str, str],
) -> None:
    from app.services.outline_service import OutlineGenerationError, generate_outline

    with pytest.raises(OutlineGenerationError):
        generate_outline(text="", images=[])
