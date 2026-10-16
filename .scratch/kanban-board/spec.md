# Kanban Board

## Problem Statement

People lose track of what is in progress and what is finished when their tasks are not visible in one place.

## Solution

Provide one persistent board with three columns—To do, Doing, and Done. A person can add a card, move it between columns using buttons, and delete it after confirmation.

## User Stories

1. As the person using the board, I want to see all cards grouped into To do, Doing, and Done, so that I can understand the state of my work at a glance.
2. As the person using the board, I want to add a card with a title, so that I can capture a task I need to work on.
3. As the person using the board, I want a new card to start in To do, so that new work is clearly distinguished from work already underway or finished.
4. As the person using the board, I want to move a card directly to either of the other columns with a button, so that I can update its status without drag and drop.
5. As the person using the board, I want to delete a card after confirming, so that I can remove a task I no longer need.
6. As the person using the board, I want titles to be required and limited to 100 characters, so that cards remain identifiable and readable.
7. As the person using the board, I want cards and their statuses to remain after refreshing the live page, so that the board reflects saved work rather than temporary browser state.
8. As the person opening the board, I want loading, empty, and error states to be clear, so that I know whether the board is available and whether my changes succeeded.

## Implementation Decisions

- Use the existing full-stack structure: FastAPI backend, React with TypeScript and Vite frontend, and Supabase persistence.
- Keep the product to one board with no login or multiple users. All visitors to the public URL access the same cards, as recorded in ADR-0001.
- A card contains an integer ID, title, status, and creation timestamp.
- A title is trimmed before it is saved, must contain at least one non-whitespace character after trimming, and may contain at most 100 characters after trimming.
- A card's status is exactly one of `todo`, `doing`, or `done`; the corresponding column labels are To do, Doing, and Done.
- Creating a card always assigns status `todo`; clients cannot select the initial status during creation.
- Provide these API operations:
  - `GET /cards` returns all cards. No custom ordering within a column is supported or promised.
  - `POST /cards` accepts a title, creates a card in `todo`, and returns the created card.
  - `PATCH /cards/{id}` accepts a valid status and returns the updated card. A card may move directly to any other status.
  - `DELETE /cards/{id}` deletes the card and returns no content.
- Invalid titles and statuses return HTTP 422. Updating or deleting an unknown card returns HTTP 404.
- The single-page UI fetches all cards from the API and groups them by status into the three columns. It does not store board data in browser storage.
- The add-card form requires a title and prevents blank-after-trim or over-100-character values. Backend validation errors are shown clearly.
- Each card has buttons to move it to either other column and a delete button. Deletion requires confirmation. There is no drag and drop.
- After a successful create, move, or delete, reload cards from the API. After page refresh, fetch them again so persisted status is reflected.
- The application uses the backend's environment-based Supabase configuration. The Supabase service key is not sent to the browser.

## Testing Decisions

- Test observable behavior through public boundaries rather than implementation details.
- Test the card API through FastAPI `TestClient`, including creation defaults, list contents, status transitions, deletion, validation, and not-found behavior. Use a fake repository through dependency override; do not make network calls in unit tests.
- Test the frontend board through user-visible interactions: three columns, add form and validation, card placement, move buttons, delete confirmation, and visible request failures.
- Test the deployed success path by adding a card on the live URL, refreshing, and verifying that the card remains in the column matching its last saved status.

## Out of Scope

- Login, authentication, multiple users, or multiple boards.
- Drag and drop.
- Custom ordering within a column.
- Labels, due dates, and comments.
- Editing card titles after creation.

## Further Notes

The success criterion is met when a card added on the live URL remains after refresh and stays in the column to which it was last moved.
