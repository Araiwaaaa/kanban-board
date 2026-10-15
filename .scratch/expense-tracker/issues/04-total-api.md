# 04: Return the total amount of all expenses

**Goal:** Let the person retrieve the combined amount of every recorded expense.

**Blocked by:** 02: Create and list expenses through the API.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] `GET /api/expenses/total` returns the sum of all persisted expense amounts in whole Baht.
- [ ] The response identifies the currency as `THB`.
- [ ] The total includes every expense regardless of date.
- [ ] With no expenses, the total is zero.

**Tests to write first:**

- Verify the endpoint returns zero for an empty expense collection.
- Verify the endpoint returns the exact sum after creating multiple expenses.
- Verify the total reflects updates and deletions.
