import os
from collections.abc import Iterator

import pytest


@pytest.fixture(autouse=True)
def clean_env(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """每个测试都用干净的环境变量。"""
    for key in list(os.environ):
        if key.startswith(("ZHIPU_", "BACKEND_", "FRONTEND_")):
            monkeypatch.delenv(key, raising=False)
    yield


@pytest.fixture
def fake_env(monkeypatch: pytest.MonkeyPatch) -> dict[str, str]:
    env = {
        "ZHIPU_API_KEY": "test-key-12345",
        "ZHIPU_MODEL": "glm-4.5v",
        "BACKEND_HOST": "127.0.0.1",
        "BACKEND_PORT": "8000",
        "FRONTEND_ORIGIN": "http://localhost:5173",
    }
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    return env
