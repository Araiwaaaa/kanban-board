from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from expense_tracker.dependencies import ExpenseData, get_repository
from expense_tracker.main import app


class FakeExpenseRepository:
    def __init__(self) -> None:
        self.expenses: dict[int, dict[str, object]] = {}
        self.next_id = 1

    def create_expense(self, expense: ExpenseData) -> dict[str, object]:
        created = {"id": self.next_id, **expense}
        self.expenses[self.next_id] = created
        self.next_id += 1
        return created

    def list_expenses(self) -> list[dict[str, object]]:
        return list(self.expenses.values())

    def get_expense(self, expense_id: int) -> dict[str, object] | None:
        return self.expenses.get(expense_id)

    def update_expense(
        self, expense_id: int, expense: ExpenseData
    ) -> dict[str, object] | None:
        if expense_id not in self.expenses:
            return None
        updated = {"id": expense_id, **expense}
        self.expenses[expense_id] = updated
        return updated

    def delete_expense(self, expense_id: int) -> bool:
        return self.expenses.pop(expense_id, None) is not None


@pytest.fixture
def repository() -> FakeExpenseRepository:
    return FakeExpenseRepository()


@pytest.fixture
def client(repository: FakeExpenseRepository) -> TestClient:
    app.dependency_overrides[get_repository] = lambda: repository
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def valid_expense() -> dict[str, object]:
    return {
        "title": "Lunch",
        "amount_baht": 120,
        "category": "Food",
        "spent_on": date.today().isoformat(),
    }


def test_create_expense_returns_created_expense_with_id(
    client: TestClient, valid_expense: dict[str, object]
) -> None:
    response = client.post("/expenses", json=valid_expense)

    assert response.status_code == 201
    assert response.json() == {"id": 1, **valid_expense}


def test_list_expenses_returns_expenses_that_were_added(
    client: TestClient, valid_expense: dict[str, object]
) -> None:
    create_response = client.post("/expenses", json=valid_expense)
    assert create_response.status_code == 201

    response = client.get("/expenses")

    assert response.status_code == 200
    assert response.json() == [create_response.json()]


def test_total_returns_zero_when_there_are_no_expenses(client: TestClient) -> None:
    response = client.get("/expenses/total")

    assert response.status_code == 200
    assert response.json() == {"total_baht": 0, "currency": "THB"}


def test_total_sums_amounts_for_all_expenses(
    client: TestClient, valid_expense: dict[str, object]
) -> None:
    first_created = client.post("/expenses", json=valid_expense)
    assert first_created.status_code == 201
    second_expense = {**valid_expense, "title": "Bus", "amount_baht": 35}
    second_created = client.post("/expenses", json=second_expense)
    assert second_created.status_code == 201

    response = client.get("/expenses/total")

    assert response.status_code == 200
    assert response.json() == {"total_baht": 155, "currency": "THB"}


def test_update_expense_replaces_its_fields(
    client: TestClient,
    valid_expense: dict[str, object],
) -> None:
    created_response = client.post("/expenses", json=valid_expense)
    assert created_response.status_code == 201
    created = created_response.json()
    updated_expense = {
        "title": "Dinner",
        "amount_baht": 250,
        "category": "Food",
        "spent_on": date.today().isoformat(),
    }

    response = client.put(f"/expenses/{created['id']}", json=updated_expense)

    assert response.status_code == 200
    assert response.json() == {"id": created["id"], **updated_expense}


def test_update_unknown_expense_returns_not_found(client: TestClient) -> None:
    response = client.put(
        "/expenses/999",
        json={
            "title": "Dinner",
            "amount_baht": 250,
            "category": "Food",
            "spent_on": date.today().isoformat(),
        },
    )

    assert response.status_code == 404


def test_delete_expense_removes_it_and_repeated_delete_returns_not_found(
    client: TestClient,
    valid_expense: dict[str, object],
) -> None:
    created_response = client.post("/expenses", json=valid_expense)
    assert created_response.status_code == 201
    created = created_response.json()
    expense_id = created["id"]

    deleted = client.delete(f"/expenses/{expense_id}")
    deleted_again = client.delete(f"/expenses/{expense_id}")
    remaining = client.get("/expenses")

    assert deleted.status_code == 204
    assert deleted_again.status_code == 404
    assert remaining.status_code == 200
    assert remaining.json() == []


@pytest.mark.parametrize(
    "invalid_field, invalid_value",
    [
        ("amount_baht", 0),
        ("amount_baht", -1),
        ("amount_baht", 120.5),
        ("title", ""),
        ("title", "   "),
        ("title", "x" * 201),
        ("category", "Entertainment"),
        ("spent_on", "not-a-date"),
        ("spent_on", (date.today() + timedelta(days=1)).isoformat()),
    ],
)
def test_create_expense_rejects_invalid_fields(
    client: TestClient,
    valid_expense: dict[str, object],
    invalid_field: str,
    invalid_value: object,
) -> None:
    invalid_expense = {**valid_expense, invalid_field: invalid_value}

    response = client.post("/expenses", json=invalid_expense)

    assert response.status_code == 422
