from unittest.mock import MagicMock, patch

import pytest

from app.schemas.outline import Outline, OutlineNode


def _sample_outline() -> Outline:
    return Outline(
        title="机器学习",
        summary="介绍 ML",
        outline=[
            OutlineNode(
                id="1",
                title="监督学习",
                summary="需要标注数据",
                key_points=["回归", "分类"],
                tags=["ML"],
                source_quote="原始数据带标签",
                children=[
                    OutlineNode(id="1.1", title="线性回归", summary=""),
                ],
            )
        ],
        keywords=["ML"],
        suggested_style="academic",
        suggested_depth="standard",
    )


@patch("app.services.markdown_service.LLMClient")
def test_generate_markdown_returns_markdown(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.markdown_service import generate_markdown

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete.return_value = "# 机器学习\n\n正文..."

    result = generate_markdown(_sample_outline())
    assert result.startswith("# 机器学习")
    mock_client.complete.assert_called_once()


@patch("app.services.markdown_service.LLMClient")
def test_generate_markdown_passes_style_to_prompt(
    mock_client_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.services.markdown_service import generate_markdown
    from app.core.prompts import STYLE_RULES

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.complete.return_value = "# x"

    generate_markdown(_sample_outline(), style="exam")

    messages = mock_client.complete.call_args.kwargs["messages"]
    user_msg = next(m for m in messages if m["role"] == "user")
    assert STYLE_RULES["exam"] in user_msg["content"]


def test_generate_markdown_invalid_style_raises(fake_env: dict[str, str]) -> None:
    from app.services.markdown_service import MarkdownGenerationError, generate_markdown

    with pytest.raises(MarkdownGenerationError):
        generate_markdown(_sample_outline(), style="nonexistent")


def test_generate_markdown_invalid_depth_raises(fake_env: dict[str, str]) -> None:
    from app.services.markdown_service import MarkdownGenerationError, generate_markdown

    with pytest.raises(MarkdownGenerationError):
        generate_markdown(_sample_outline(), depth="invalid")
