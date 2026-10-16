from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status

from expense_tracker.dependencies import ExpenseRepository, get_repository
from expense_tracker.models import Expense, ExpenseInput, ExpenseTotal

app = FastAPI()


@app.post("/expenses", response_model=Expense, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseInput,
    repository: Annotated[ExpenseRepository, Depends(get_repository)],
) -> Expense:
    created = repository.create_expense(expense.model_dump())
    return Expense.model_validate(created)


@app.get("/expenses", response_model=list[Expense])
def list_expenses(
    repository: Annotated[ExpenseRepository, Depends(get_repository)],
) -> list[Expense]:
    expenses = (Expense.model_validate(item) for item in repository.list_expenses())
    return sorted(expenses, key=lambda item: (item.spent_on, item.id), reverse=True)


@app.get("/expenses/total", response_model=ExpenseTotal)
def get_expense_total(
    repository: Annotated[ExpenseRepository, Depends(get_repository)],
) -> ExpenseTotal:
    total_baht = sum(
        int(expense["amount_baht"]) for expense in repository.list_expenses()
    )
    return ExpenseTotal(total_baht=total_baht)


@app.put("/expenses/{expense_id}", response_model=Expense)
def update_expense(
    expense_id: int,
    expense: ExpenseInput,
    repository: Annotated[ExpenseRepository, Depends(get_repository)],
) -> Expense:
    updated = repository.update_expense(expense_id, expense.model_dump())
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )
    return Expense.model_validate(updated)


@app.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    repository: Annotated[ExpenseRepository, Depends(get_repository)],
) -> None:
    if not repository.delete_expense(expense_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )
