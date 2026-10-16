from fastapi.testclient import TestClient

import kanban_board.dependencies as dependencies
from kanban_board.main import create_app


def test_repository_selection_uses_card_in_memory_repository_when_credentials_are_missing(
    monkeypatch,
) -> None:
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_KEY", raising=False)

    repository = dependencies.create_repository()

    assert repository.__class__.__name__ == "InMemoryCardRepository"


def test_repository_selection_uses_in_memory_repository_when_only_one_credential_is_set(
    monkeypatch,
) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.delenv("SUPABASE_SERVICE_KEY", raising=False)

    repository = dependencies.create_repository()

    assert repository.__class__.__name__ == "InMemoryCardRepository"


def test_repository_selection_uses_card_supabase_repository_when_both_credentials_are_set(
    monkeypatch,
) -> None:
    expected_client = object()
    create_client_calls: list[tuple[str, str]] = []

    def create_client(url: str, service_key: str) -> object:
        create_client_calls.append((url, service_key))
        return expected_client

    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "test-service-key")
    monkeypatch.setattr(dependencies, "create_client", create_client)

    repository = dependencies.create_repository()

    assert repository.__class__.__name__ == "SupabaseCardRepository"
    assert repository.client is expected_client
    assert create_client_calls == [
        ("https://example.supabase.co", "test-service-key")
    ]


def test_cors_allows_only_the_configured_origin(monkeypatch) -> None:
    allowed_origin = "https://kanban.example.com"
    monkeypatch.setenv("ALLOWED_ORIGIN", allowed_origin)
    client = TestClient(create_app())

    allowed_response = client.options(
        "/cards",
        headers={
            "Origin": allowed_origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    disallowed_response = client.options(
        "/cards",
        headers={
            "Origin": "https://other.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert allowed_response.headers["access-control-allow-origin"] == allowed_origin
    assert "access-control-allow-origin" not in disallowed_response.headers
