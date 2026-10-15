# 01: Create the expense database schema

**Goal:** Persist each person's expenses in Supabase with the required fields and domain constraints.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] An expense stores a title, positive integer amount in whole Baht, required category, and required expense date.
- [ ] The database rejects categories outside Food, Transport, Bills, Shopping, and Other.
- [ ] The database rejects missing required values and non-positive or non-integer amounts.
- [ ] Expense data remains available after the database connection is reopened.

**Tests to write first:**

- Verify valid expense records can be inserted and read back.
- Verify missing required fields, invalid categories, and non-positive or fractional amounts are rejected.
