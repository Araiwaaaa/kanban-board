import os
from collections.abc import Mapping, Sequence
from functools import lru_cache
from typing import Protocol

from supabase import Client, create_client

from kanban_board.models import Card


CardData = Mapping[str, object]


class CardRepository(Protocol):
    def create_card(self, card: CardData) -> CardData: ...

    def list_cards(self) -> Sequence[CardData]: ...

    def update_status(self, card_id: int, status: str) -> CardData | None: ...

    def delete_card(self, card_id: int) -> bool: ...


class InMemoryCardRepository:
    def __init__(self) -> None:
        self._cards: dict[int, dict[str, object]] = {}
        self._next_id = 1

    def create_card(self, card: CardData) -> CardData:
        created = {"id": self._next_id, **card}
        self._cards[self._next_id] = created
        self._next_id += 1
        return created

    def list_cards(self) -> Sequence[CardData]:
        return list(self._cards.values())

    def update_status(self, card_id: int, status: str) -> CardData | None:
        card = self._cards.get(card_id)
        if card is None:
            return None
        updated = {**card, "status": status}
        self._cards[card_id] = updated
        return updated

    def delete_card(self, card_id: int) -> bool:
        return self._cards.pop(card_id, None) is not None


class SupabaseCardRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create_card(self, card: CardData) -> CardData:
        response = (
            self.client.table("cards")
            .insert(dict(card))
            .select("*")
            .execute()
        )
        return self._map_response_row(response.data, "create")

    def list_cards(self) -> Sequence[CardData]:
        response = self.client.table("cards").select("*").execute()
        return [self._map_row(row) for row in response.data]

    def update_status(self, card_id: int, status: str) -> CardData | None:
        response = (
            self.client.table("cards")
            .update({"status": status})
            .eq("id", card_id)
            .select("*")
            .execute()
        )
        if not response.data:
            return None
        return self._map_row(response.data[0])

    def delete_card(self, card_id: int) -> bool:
        response = (
            self.client.table("cards")
            .delete()
            .eq("id", card_id)
            .select("id")
            .execute()
        )
        return bool(response.data)

    @staticmethod
    def _map_response_row(rows: object, operation: str) -> CardData:
        if not isinstance(rows, list) or not rows:
            raise RuntimeError(f"Supabase did not return a card after {operation}")
        return SupabaseCardRepository._map_row(rows[0])

    @staticmethod
    def _map_row(row: Mapping[str, object]) -> CardData:
        card = Card.model_validate(row)
        mapped = card.model_dump()
        if card.created_at is not None:
            mapped["created_at"] = card.created_at.isoformat()
        return mapped


def create_repository() -> CardRepository:
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    if supabase_url and service_key:
        return SupabaseCardRepository(create_client(supabase_url, service_key))
    return InMemoryCardRepository()


@lru_cache
def get_repository() -> CardRepository:
    return create_repository()
