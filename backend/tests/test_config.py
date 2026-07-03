import pytest


def test_config_loads_from_env(fake_env: dict[str, str]) -> None:
    from app.core.config import Settings

    settings = Settings()
    assert settings.zhipu_api_key == "test-key-12345"
    assert settings.zhipu_model == "glm-4.5v"
    assert settings.backend_port == 8000


def test_config_missing_api_key_defaults_empty() -> None:
    """部署模式下 env 可没有 key（用户从 header 传）。"""
    from app.core.config import Settings

    # 显式禁用 .env 加载，模拟部署环境没配 key
    settings = Settings(_env_file=None)
    assert settings.zhipu_api_key == ""


def test_config_port_string_coerced_to_int(fake_env: dict[str, str]) -> None:
    from app.core.config import Settings

    settings = Settings()
    assert isinstance(settings.backend_port, int)
    assert settings.backend_port == 8000
