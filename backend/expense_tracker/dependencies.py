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


_repository = InMemoryExpenseRepository()


def get_repository() -> ExpenseRepository:
    return _repository
