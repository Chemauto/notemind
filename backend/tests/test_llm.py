from unittest.mock import MagicMock, patch

import pytest


def test_llm_client_initializes_with_key(fake_env: dict[str, str]) -> None:
    from app.core.llm import LLMClient

    client = LLMClient()
    assert client.model == "glm-4.5v"


@patch("app.core.llm.ZhipuAI")
def test_llm_client_completion_returns_text(
    mock_zhipu_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.core.llm import LLMClient

    mock_client = MagicMock()
    mock_zhipu_cls.return_value = mock_client
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="hello world"))]
    mock_client.chat.completions.create.return_value = mock_response

    client = LLMClient()
    result = client.complete(messages=[{"role": "user", "content": "hi"}])

    assert result == "hello world"
    mock_client.chat.completions.create.assert_called_once()


@patch("app.core.llm.ZhipuAI")
def test_llm_client_json_mode_passes_response_format(
    mock_zhipu_cls: MagicMock, fake_env: dict[str, str]
) -> None:
    from app.core.llm import LLMClient

    mock_client = MagicMock()
    mock_zhipu_cls.return_value = mock_client
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content='{"k": "v"}'))]
    mock_client.chat.completions.create.return_value = mock_response

    client = LLMClient()
    client.complete_json(messages=[{"role": "user", "content": "x"}])

    call_kwargs = mock_client.chat.completions.create.call_args.kwargs
    assert call_kwargs["response_format"] == {"type": "json_object"}


def test_llm_client_complete_raises_on_empty_choices(fake_env: dict[str, str]) -> None:
    from app.core.llm import LLMClient, LLMError

    with patch("app.core.llm.ZhipuAI") as mock_zhipu_cls:
        mock_client = MagicMock()
        mock_zhipu_cls.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = []
        mock_client.chat.completions.create.return_value = mock_response

        client = LLMClient()
        with pytest.raises(LLMError):
            client.complete(messages=[{"role": "user", "content": "hi"}])
