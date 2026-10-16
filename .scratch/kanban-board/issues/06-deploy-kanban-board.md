# 06: Deploy and verify the Kanban board

**Goal:** Make the persistent board available at a public URL and verify that cards retain their status.

**Blocked by:** 05: Move and delete cards from the board.

**Status:** ready-for-agent

**Acceptance criteria:**

- [ ] The frontend and backend are deployed and connected to the configured Supabase database.
- [ ] Runtime configuration is provided without committing secrets.
- [ ] The live page can add, move, and delete cards.
- [ ] A card added on the live URL remains after refresh.
- [ ] A card moved to another column remains in that column after refresh.

**Tests to write first:**

- Verify the deployed board can add a card, refresh, and still display it in To do.
- Verify the deployed board can move the card, refresh, and display it in the selected column.
- Verify the public app uses environment-provided configuration and exposes no service key to the frontend.
