# 02: Create and list cards through the API

**Goal:** Let the person add cards to the board and retrieve the cards currently on it.

**Blocked by:** 01: Create the cards database schema.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] `POST /cards` accepts a title and returns the persisted card with a generated ID and status `todo`.
- [ ] The request cannot choose a card's initial status.
- [ ] `GET /cards` returns all persisted cards with their current status.
- [ ] Blank-after-trim titles and titles longer than 100 characters return HTTP 422.
- [ ] API tests use a fake repository through FastAPI dependency override and make no network calls.

**Tests to write first:**

- Verify creating a card returns its title, generated ID, and `todo` status.
- Verify a created card is returned by the list endpoint.
- Verify blank and over-100-character titles return HTTP 422.
- Verify a requested initial status is rejected.
