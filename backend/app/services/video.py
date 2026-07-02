"""视频音轨提取：用 imageio-ffmpeg 提供 ffmpeg 二进制，subprocess 抽 16kHz mono wav。"""

from __future__ import annotations

import re
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from imageio_ffmpeg import get_ffmpeg_exe


class VideoProcessingError(Exception):
    """视频处理失败（ffmpeg 不可用、损坏视频、无音轨等）。"""


class VideoResult:
    def __init__(self, audio_bytes: bytes, metadata: dict) -> None:
        self.audio_bytes = audio_bytes
        self.metadata = metadata


_DURATION_RE = re.compile(
    r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)"
)


def _parse_duration(stderr: str) -> Optional[float]:
    """从 ffmpeg stderr 中 parse 'Duration: HH:MM:SS.SS'."""
    m = _DURATION_RE.search(stderr)
    if not m:
        return None
    h, mi, s = m.group(1), m.group(2), m.group(3)
    try:
        return int(h) * 3600 + int(mi) * 60 + float(s)
    except ValueError:
        return None


def extract_audio(raw: bytes) -> VideoResult:
    """从视频字节提取音轨，返回 16kHz mono pcm_s16le wav 字节。"""
    if not raw:
        raise VideoProcessingError("视频内容为空")

    try:
        ffmpeg_exe = get_ffmpeg_exe()
    except Exception as e:
        raise VideoProcessingError(f"无法定位 ffmpeg 二进制：{e}") from e

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        in_path = tmp_path / "input.mp4"
        out_path = tmp_path / "out.wav"

        in_path.write_bytes(raw)

        cmd = [
            ffmpeg_exe,
            "-i", str(in_path),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            "-y",
            str(out_path),
        ]

        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                timeout=300,
            )
        except (subprocess.TimeoutExpired, OSError) as e:
            raise VideoProcessingError(f"ffmpeg 调用失败：{e}") from e

        stderr_raw = proc.stderr or b""
        if isinstance(stderr_raw, bytes):
            stderr_text = stderr_raw.decode("utf-8", errors="replace")
        else:
            stderr_text = str(stderr_raw)

        if proc.returncode != 0:
            stderr_tail = stderr_text[-500:]
            raise VideoProcessingError(
                f"ffmpeg 处理失败（returncode={proc.returncode}）：{stderr_tail}"
            )

        if not out_path.exists():
            raise VideoProcessingError("ffmpeg 未生成输出文件（可能无音轨）")

        audio_bytes = out_path.read_bytes()
        if not audio_bytes:
            raise VideoProcessingError("提取的音轨为空")

        duration = _parse_duration(stderr_text)

        metadata = {
            "duration_seconds": duration,
            "format": "wav",
            "size_bytes": len(audio_bytes),
        }
        return VideoResult(audio_bytes=audio_bytes, metadata=metadata)
