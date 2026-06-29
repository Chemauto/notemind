import pytest
from pydantic import ValidationError


def test_config_loads_from_env(fake_env: dict[str, str]) -> None:
    from app.core.config import Settings

    settings = Settings()
    assert settings.zhipu_api_key == "test-key-12345"
    assert settings.zhipu_model == "glm-4.5v"
    assert settings.backend_port == 8000


def test_config_missing_api_key_raises() -> None:
    from app.core.config import Settings

    with pytest.raises(ValidationError) as exc_info:
        Settings()
    assert "zhipu_api_key" in str(exc_info.value).lower()


def test_config_port_string_coerced_to_int(fake_env: dict[str, str]) -> None:
    from app.core.config import Settings

    settings = Settings()
    assert isinstance(settings.backend_port, int)
    assert settings.backend_port == 8000
