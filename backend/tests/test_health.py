from fastapi.testclient import TestClient


def test_health_endpoint(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "version" in body


def test_cors_allows_frontend_origin(fake_env: dict[str, str]) -> None:
    from app.main import app

    client = TestClient(app)
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code in (200, 204)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
