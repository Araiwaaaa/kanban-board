# 05: Move and delete cards from the board

**Goal:** Let the person move cards between columns or delete them from the board.

**Blocked by:** 03: Move and delete cards through the API; 04: Show the board and add cards.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] Each card has buttons to move it to either of the other two columns.
- [ ] Moving a card calls the API and displays it in the destination column after reloading cards.
- [ ] Each card has a delete button that asks for confirmation before deletion.
- [ ] Confirmed deletion calls the API and removes the card from the board.
- [ ] Cancelling deletion leaves the card unchanged.
- [ ] Request failures are clearly shown and do not appear successful.

**Tests to write first:**

- Verify move buttons submit the destination status and the card appears in its new column.
- Verify moving to each other column is supported without drag and drop.
- Verify confirming deletion removes the card and cancelling does not.
- Verify API failures are displayed.
