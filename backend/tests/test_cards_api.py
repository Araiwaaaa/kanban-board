from collections.abc import Mapping

import pytest
from fastapi.testclient import TestClient

from expense_tracker.dependencies import get_repository
from expense_tracker.main import app


CardData = Mapping[str, object]


class FakeCardRepository:
    def __init__(self) -> None:
        self.cards: dict[int, dict[str, object]] = {}
        self.next_id = 1

    def create_card(self, card: CardData) -> dict[str, object]:
        created = {"id": self.next_id, **card}
        self.cards[self.next_id] = created
        self.next_id += 1
        return created

    def list_cards(self) -> list[dict[str, object]]:
        return list(self.cards.values())

    def update_status(
        self, card_id: int, status: str
    ) -> dict[str, object] | None:
        card = self.cards.get(card_id)
        if card is None:
            return None
        updated = {**card, "status": status}
        self.cards[card_id] = updated
        return updated

    def delete_card(self, card_id: int) -> bool:
        return self.cards.pop(card_id, None) is not None


@pytest.fixture
def repository() -> FakeCardRepository:
    return FakeCardRepository()


@pytest.fixture
def client(repository: FakeCardRepository) -> TestClient:
    app.dependency_overrides[get_repository] = lambda: repository
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_create_card_returns_trimmed_title_and_todo_status(
    client: TestClient,
) -> None:
    response = client.post("/cards", json={"title": "  Write docs  "})

    assert response.status_code == 201
    assert response.json()["id"] == 1
    assert response.json()["title"] == "Write docs"
    assert response.json()["status"] == "todo"


def test_create_card_always_starts_todo_when_status_is_sent(
    client: TestClient,
) -> None:
    response = client.post("/cards", json={"title": "Review PR", "status": "done"})

    assert response.status_code == 201
    assert response.json()["status"] == "todo"


@pytest.mark.parametrize(
    "title",
    [
        "",
        "   ",
        f"  {'x' * 101}  ",
    ],
)
def test_create_card_rejects_invalid_title(
    client: TestClient, title: str
) -> None:
    response = client.post("/cards", json={"title": title})

    assert response.status_code == 422


def test_list_cards_returns_cards_that_were_added(client: TestClient) -> None:
    first = client.post("/cards", json={"title": "Write docs"})
    second = client.post("/cards", json={"title": "Review PR"})
    assert first.status_code == 201
    assert second.status_code == 201

    response = client.get("/cards")

    assert response.status_code == 200
    assert response.json() == [first.json(), second.json()]


def test_card_can_move_between_all_statuses(
    client: TestClient,
) -> None:
    created = client.post("/cards", json={"title": "Ship feature"})
    assert created.status_code == 201
    card_id = created.json()["id"]

    for new_status in ("doing", "done", "todo"):
        moved = client.patch(f"/cards/{card_id}", json={"status": new_status})
        assert moved.status_code == 200
        assert moved.json()["status"] == new_status

        listed = client.get("/cards")
        assert listed.status_code == 200
        assert listed.json()[0]["status"] == new_status


def test_patch_card_rejects_invalid_status(client: TestClient) -> None:
    created = client.post("/cards", json={"title": "Ship feature"})
    assert created.status_code == 201

    response = client.patch(
        f"/cards/{created.json()['id']}", json={"status": "blocked"}
    )

    assert response.status_code == 422


def test_patch_unknown_card_returns_not_found(client: TestClient) -> None:
    response = client.patch("/cards/999", json={"status": "doing"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Card not found"}


def test_delete_card_removes_it_and_repeated_delete_returns_not_found(
    client: TestClient,
) -> None:
    created = client.post("/cards", json={"title": "Ship feature"})
    assert created.status_code == 201
    card_id = created.json()["id"]

    deleted = client.delete(f"/cards/{card_id}")
    deleted_again = client.delete(f"/cards/{card_id}")
    remaining = client.get("/cards")

    assert deleted.status_code == 204
    assert deleted_again.status_code == 404
    assert deleted_again.json() == {"detail": "Card not found"}
    assert remaining.status_code == 200
    assert remaining.json() == []
