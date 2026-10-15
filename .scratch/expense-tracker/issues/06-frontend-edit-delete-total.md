# 06: Edit and delete expenses and show the total

**Goal:** Let the person maintain existing expense records and see the correct all-expenses total on the page.

**Blocked by:** 03: Update and delete expenses through the API; 04: Return the total amount of all expenses; 05: Show the expense list and add form.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] The page displays the all-expenses total formatted with the Thai Baht symbol and no fractional digits.
- [ ] The person can edit an expense in a prefilled form and save the validated changes.
- [ ] The person can delete an expense after confirming the action.
- [ ] After an edit or delete, the displayed list and total reflect persisted data.
- [ ] The list and total are loaded from the backend again after a browser refresh.

**Tests to write first:**

- Verify the displayed total matches the API response and is formatted as Baht.
- Verify editing updates the displayed record and total.
- Verify cancelling a delete confirmation leaves the record unchanged.
- Verify confirming deletion removes the record and updates the total.
- Verify a refresh reloads the persisted list and total.
