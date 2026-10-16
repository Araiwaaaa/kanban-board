# 03: Move and delete cards through the API

**Goal:** Let the person update a card's column or remove the card from the board.

**Blocked by:** 02: Create and list cards through the API.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] `PATCH /cards/{id}` accepts one of `todo`, `doing`, or `done` and returns the card with its new status.
- [ ] A card can move directly from any status to either of the other statuses.
- [ ] An invalid status returns HTTP 422.
- [ ] Updating an unknown card returns HTTP 404.
- [ ] `DELETE /cards/{id}` deletes an existing card and returns HTTP 204.
- [ ] Deleting an unknown card returns HTTP 404.

**Tests to write first:**

- Verify a card's status can be moved between each of the three statuses.
- Verify an invalid status returns HTTP 422 without changing the card.
- Verify updates and deletes for unknown IDs return HTTP 404.
- Verify a deleted card no longer appears in the list.
