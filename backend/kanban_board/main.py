import os
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from kanban_board.dependencies import CardRepository, get_repository
from kanban_board.models import Card, CardCreate, CardStatusUpdate


def create_app() -> FastAPI:
    application = FastAPI()
    allowed_origin = os.getenv("ALLOWED_ORIGIN")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[allowed_origin] if allowed_origin else [],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return application


app = create_app()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/cards", response_model=Card, status_code=status.HTTP_201_CREATED)
def create_card(
    card: CardCreate,
    repository: Annotated[CardRepository, Depends(get_repository)],
) -> Card:
    created = repository.create_card(
        {"title": card.title, "status": "todo"}
    )
    return Card.model_validate(created)


@app.get("/cards", response_model=list[Card])
def list_cards(
    repository: Annotated[CardRepository, Depends(get_repository)],
) -> list[Card]:
    return [Card.model_validate(card) for card in repository.list_cards()]


@app.patch("/cards/{card_id}", response_model=Card)
def update_card_status(
    card_id: int,
    update: CardStatusUpdate,
    repository: Annotated[CardRepository, Depends(get_repository)],
) -> Card:
    updated = repository.update_status(card_id, update.status)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Card not found"
        )
    return Card.model_validate(updated)


@app.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    repository: Annotated[CardRepository, Depends(get_repository)],
) -> None:
    if not repository.delete_card(card_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Card not found"
        )
