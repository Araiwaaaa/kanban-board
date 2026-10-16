from datetime import date, datetime
from typing import Annotated, Literal
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator


ExpenseCategory = Literal["Food", "Transport", "Bills", "Shopping", "Other"]
ExpenseTitle = Annotated[
    str,
    StringConstraints(strict=True, strip_whitespace=True, min_length=1, max_length=200),
]


class ExpenseInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: ExpenseTitle
    amount_baht: Annotated[int, Field(strict=True, gt=0)]
    category: ExpenseCategory
    spent_on: date

    @field_validator("spent_on")
    @classmethod
    def validate_spent_on_not_in_future(cls, spent_on: date) -> date:
        today_in_bangkok = datetime.now(ZoneInfo("Asia/Bangkok")).date()
        if spent_on > today_in_bangkok:
            raise ValueError("spent_on cannot be in the future")
        return spent_on


class Expense(ExpenseInput):
    id: int
    created_at: datetime | None = Field(default=None, exclude=True)


class ExpenseTotal(BaseModel):
    total_baht: int
    currency: Literal["THB"] = "THB"
