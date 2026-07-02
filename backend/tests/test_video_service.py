from unittest.mock import patch, MagicMock

import pytest

from app.services.video import (
    VideoProcessingError,
    VideoResult,
    extract_audio,
)


def test_extract_audio_success(tmp_path):
    """mock subprocess + ffmpeg binary present, verify wav bytes returned + metadata."""
    wav_bytes = b"RIFF...."
    fake_wav_path = tmp_path / "out.wav"
    fake_wav_path.write_bytes(wav_bytes)

    def fake_run(cmd, **kwargs):
        out_path = cmd[cmd.index("-y") + 1] if "-y" in cmd else cmd[-1]
        with open(out_path, "wb") as f:
            f.write(wav_bytes)
        m = MagicMock()
        m.returncode = 0
        m.stderr = "Duration: 00:01:23.45"
        return m

    with patch("app.services.video.subprocess.run", side_effect=fake_run):
        result = extract_audio(b"fake-video-bytes")

    assert isinstance(result, VideoResult)
    assert result.audio_bytes == wav_bytes
    assert result.metadata["format"] == "wav"
    assert result.metadata["size_bytes"] == len(wav_bytes)
    assert result.metadata["duration_seconds"] == pytest.approx(83.45, abs=0.1)


def test_extract_audio_empty_raises():
    with pytest.raises(VideoProcessingError):
        extract_audio(b"")


def test_extract_audio_none_raises():
    with pytest.raises(VideoProcessingError):
        extract_audio(None)  # type: ignore[arg-type]


def test_extract_audio_ffmpeg_failure_wraps(tmp_path):
    """returncode != 0 should raise VideoProcessingError containing stderr summary."""
    def fake_run(cmd, **kwargs):
        m = MagicMock()
        m.returncode = 1
        m.stderr = "Invalid data found when processing input"
        return m

    with patch("app.services.video.subprocess.run", side_effect=fake_run):
        with pytest.raises(VideoProcessingError) as exc_info:
            extract_audio(b"corrupt-video")
    assert "ffmpeg" in str(exc_info.value).lower() or "Invalid" in str(exc_info.value)


def test_extract_audio_propagates_subprocess_exception():
    """subprocess.run raising OSError should be wrapped as VideoProcessingError."""
    with patch("app.services.video.subprocess.run", side_effect=OSError("no such file")):
        with pytest.raises(VideoProcessingError):
            extract_audio(b"some-bytes")
