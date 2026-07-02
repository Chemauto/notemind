from unittest.mock import MagicMock, patch

import pytest


def _fake_whisper_model(transcribe_text: str = "转写结果"):
    """构造一个假的 WhisperModel，其 transcribe 返回可迭代的 segments。"""
    model = MagicMock()

    segment = MagicMock()
    segment.text = " " + transcribe_text
    info = MagicMock()
    info.language = "zh"
    info.duration = 60.0

    model.transcribe.return_value = (iter([segment]), info)
    return model


def test_transcribe_audio_success() -> None:
    from app.services import audio

    fake = _fake_whisper_model("你好世界")
    with patch.object(audio, "_get_model", return_value=fake):
        result = audio.transcribe_audio(b"fake-audio-bytes", "audio/mpeg")

    assert "你好世界" in result.text
    assert result.metadata["language"] == "zh"
    assert result.metadata["duration"] == 60.0
    assert result.metadata["model"] == "small"


def test_transcribe_audio_empty_raises() -> None:
    from app.services.audio import AudioProcessingError, transcribe_audio

    with pytest.raises(AudioProcessingError):
        transcribe_audio(b"", "audio/mpeg")


def test_transcribe_audio_invalid_mime_raises() -> None:
    from app.services.audio import AudioProcessingError, transcribe_audio

    with pytest.raises(AudioProcessingError):
        transcribe_audio(b"some-bytes", "image/png")


def test_transcribe_audio_transcribe_failure_wraps() -> None:
    from app.services import audio

    fake = MagicMock()
    fake.transcribe.side_effect = RuntimeError("model boom")
    with patch.object(audio, "_get_model", return_value=fake):
        with pytest.raises(audio.AudioProcessingError):
            audio.transcribe_audio(b"bytes", "audio/mpeg")


def test_transcribe_audio_language_passed_through() -> None:
    from app.services import audio

    fake = _fake_whisper_model()
    with patch.object(audio, "_get_model", return_value=fake):
        audio.transcribe_audio(b"bytes", "audio/mpeg", language="en")

    # transcribe 第二位置参数应为 language
    args, kwargs = fake.transcribe.call_args
    assert kwargs.get("language") == "en" or (len(args) > 1 and args[1] == "en")
