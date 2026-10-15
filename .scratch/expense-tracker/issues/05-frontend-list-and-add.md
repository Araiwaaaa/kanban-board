# 05: Show the expense list and add form

**Goal:** Let the person review saved expenses and add a new expense from the single page.

**Blocked by:** 02: Create and list expenses through the API.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] The single page loads and displays the expense list from the API.
- [ ] The page shows an empty state when there are no expenses and a loading state while data is being fetched.
- [ ] The add form requires title, amount, category, and expense date; category is selected from the five allowed values.
- [ ] The form prevents invalid values and displays backend validation errors clearly.
- [ ] A successfully added expense appears in the list without requiring a manual page refresh.
- [ ] API failures are visible and do not appear as successful saves.

**Tests to write first:**

- Verify loading, empty, and populated list states.
- Verify the category dropdown contains exactly the allowed categories.
- Verify valid submission calls the API and displays the saved expense.
- Verify validation and API failures are shown to the person.
