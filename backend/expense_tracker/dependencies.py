import os
from collections.abc import Mapping, Sequence
from functools import lru_cache
from typing import Protocol

from supabase import Client, create_client

from expense_tracker.models import Expense


ExpenseData = Mapping[str, object]


class ExpenseRepository(Protocol):
    def create_expense(self, expense: ExpenseData) -> ExpenseData: ...

    def list_expenses(self) -> Sequence[ExpenseData]: ...

    def get_expense(self, expense_id: int) -> ExpenseData | None: ...

    def update_expense(
        self, expense_id: int, expense: ExpenseData
    ) -> ExpenseData | None: ...

    def delete_expense(self, expense_id: int) -> bool: ...


class InMemoryExpenseRepository:
    def __init__(self) -> None:
        self._expenses: dict[int, dict[str, object]] = {}
        self._next_id = 1

    def create_expense(self, expense: ExpenseData) -> ExpenseData:
        created = {"id": self._next_id, **expense}
        self._expenses[self._next_id] = created
        self._next_id += 1
        return created

    def list_expenses(self) -> Sequence[ExpenseData]:
        return list(self._expenses.values())

    def get_expense(self, expense_id: int) -> ExpenseData | None:
        return self._expenses.get(expense_id)

    def update_expense(
        self, expense_id: int, expense: ExpenseData
    ) -> ExpenseData | None:
        if expense_id not in self._expenses:
            return None
        updated = {"id": expense_id, **expense}
        self._expenses[expense_id] = updated
        return updated

    def delete_expense(self, expense_id: int) -> bool:
        return self._expenses.pop(expense_id, None) is not None


class SupabaseExpenseRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create_expense(self, expense: ExpenseData) -> ExpenseData:
        response = (
            self.client.table("expenses")
            .insert(dict(expense))
            .select("*")
            .execute()
        )
        return self._map_response_row(response.data, "create")

    def list_expenses(self) -> Sequence[ExpenseData]:
        response = (
            self.client.table("expenses")
            .select("*")
            .order("spent_on", desc=True)
            .order("id", desc=True)
            .execute()
        )
        return [self._map_row(row) for row in response.data]

    def get_expense(self, expense_id: int) -> ExpenseData | None:
        response = (
            self.client.table("expenses")
            .select("*")
            .eq("id", expense_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_row(response.data[0])

    def update_expense(
        self, expense_id: int, expense: ExpenseData
    ) -> ExpenseData | None:
        response = (
            self.client.table("expenses")
            .update(dict(expense))
            .eq("id", expense_id)
            .select("*")
            .execute()
        )
        if not response.data:
            return None
        return self._map_row(response.data[0])

    def delete_expense(self, expense_id: int) -> bool:
        response = (
            self.client.table("expenses")
            .delete()
            .eq("id", expense_id)
            .select("id")
            .execute()
        )
        return bool(response.data)

    @staticmethod
    def _map_response_row(rows: object, operation: str) -> ExpenseData:
        if not isinstance(rows, list) or not rows:
            raise RuntimeError(f"Supabase did not return an expense after {operation}")
        return SupabaseExpenseRepository._map_row(rows[0])

    @staticmethod
    def _map_row(row: Mapping[str, object]) -> ExpenseData:
        expense = Expense.model_validate(row)
        mapped = expense.model_dump()
        if expense.created_at is not None:
            mapped["created_at"] = expense.created_at.isoformat()
        return mapped


def create_repository() -> ExpenseRepository:
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    if supabase_url and service_key:
        return SupabaseExpenseRepository(create_client(supabase_url, service_key))
    return InMemoryExpenseRepository()


@lru_cache
def get_repository() -> ExpenseRepository:
    return create_repository()
