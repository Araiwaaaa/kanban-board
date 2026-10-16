# 04: Show the board and add cards

**Goal:** Let the person see the three board columns and add a card directly from the page.

**Blocked by:** 02: Create and list cards through the API.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] The page displays To do, Doing, and Done columns populated from the cards API.
- [ ] Cards appear in the column matching their current status.
- [ ] A new card form requires a trimmed, non-empty title of at most 100 characters.
- [ ] Successfully adding a card displays it in To do without a manual page refresh.
- [ ] Loading, empty-column, and request-error states are understandable.
- [ ] The page does not use browser storage for board data.

**Tests to write first:**

- Verify the three columns and their cards render according to status.
- Verify the title form rejects blank and overlong values.
- Verify submitting a valid title creates and displays a `todo` card.
- Verify loading, empty, and API error states.
