# 01: Create the cards database schema

**Goal:** Persist cards with a valid title and one of the board's three statuses.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] A card stores an integer ID, required title, status, and creation timestamp.
- [ ] A new card defaults to `todo`.
- [ ] The database rejects blank-after-trim titles and titles longer than 100 characters.
- [ ] The database rejects statuses other than `todo`, `doing`, and `done`.
- [ ] Row-level security is enabled for the cards table.

**Tests to write first:**

- Verify a valid card can be inserted and read back with its generated ID, default status, and creation timestamp.
- Verify blank, overlong, and invalid-status card values are rejected.
