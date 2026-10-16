from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


CardStatus = Literal["todo", "doing", "done"]
CardTitle = Annotated[
    str,
    StringConstraints(strict=True, strip_whitespace=True, min_length=1, max_length=100),
]


class CardCreate(BaseModel):
    title: CardTitle


class CardStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: CardStatus


class Card(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    title: CardTitle
    status: CardStatus
    created_at: datetime | None = Field(default=None, exclude=True)
