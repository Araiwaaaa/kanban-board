# 03: Update and delete expenses through the API

**Goal:** Let the person correct an expense or remove it from their records.

**Blocked by:** 02: Create and list expenses through the API.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] `PUT /api/expenses/{id}` replaces all editable fields and returns the persisted updated expense.
- [ ] Updates enforce the same validation rules as expense creation.
- [ ] Updating an unknown expense returns HTTP 404.
- [ ] `DELETE /api/expenses/{id}` removes the expense and returns HTTP 204.
- [ ] Deleting an unknown expense returns HTTP 404.

**Tests to write first:**

- Verify a valid update is persisted and returned.
- Verify invalid updates return HTTP 422 without changing the existing record.
- Verify update and delete operations on unknown IDs return HTTP 404.
- Verify a deleted expense no longer appears in the list.
