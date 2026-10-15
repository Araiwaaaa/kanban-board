# 02: Create and list expenses through the API

**Goal:** Let the person record an expense and retrieve their saved expenses through the backend.

**Blocked by:** 01: Create the expense database schema.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] `POST /api/expenses` creates an expense and returns the persisted record.
- [ ] `GET /api/expenses` returns all expenses ordered by expense date, newest first, with stable ordering for ties.
- [ ] The API rejects blank or overlong titles, non-positive or fractional amounts, missing fields, invalid categories, invalid dates, and future dates with HTTP 422.
- [ ] Past expense dates and today's date are accepted; future-date validation uses the `Asia/Bangkok` calendar date.

**Tests to write first:**

- Verify valid expenses can be created and then retrieved from the list.
- Verify list ordering and stable ordering for expenses on the same date.
- Verify invalid payloads return HTTP 422 and do not create records.
