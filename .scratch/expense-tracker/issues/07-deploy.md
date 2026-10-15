# 07: Deploy and verify the expense tracker

**Goal:** Make the complete tracker available on a live URL with persisted expenses.

**Blocked by:** 06: Edit and delete expenses and show the total.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] The frontend and backend are deployed and can reach the configured Supabase database.
- [ ] Required runtime configuration is supplied without committing credentials.
- [ ] The live page can create, list, edit, and delete expenses.
- [ ] An expense created on the live URL remains after refreshing the browser.
- [ ] The live total equals the sum of the persisted expenses.

**Tests to write first:**

- Write a deployed smoke test that creates an expense, reloads the live page, and verifies the expense remains.
- Verify the displayed live total is correct before and after a mutation.
