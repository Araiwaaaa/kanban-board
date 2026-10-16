from collections.abc import Mapping, Sequence
from typing import Protocol


ExpenseData = Mapping[str, object]


class ExpenseRepository(Protocol):
    def create_expense(self, expense: ExpenseData) -> ExpenseData: ...

    def list_expenses(self) -> Sequence[ExpenseData]: ...

    def get_expense(self, expense_id: int) -> ExpenseData | None: ...

    def update_expense(
        self, expense_id: int, expense: ExpenseData
    ) -> ExpenseData | None: ...

    def delete_expense(self, expense_id: int) -> bool: ...


def get_repository() -> ExpenseRepository:
    raise RuntimeError("Expense repository is not configured")
