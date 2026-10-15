# Expense Tracker

## Problem Statement

People lose track of where their money goes each month because their expenses are not recorded in one place.

## Solution

Build a single-page expense tracker for one person, with no login. The user can record, view, edit, and delete expenses and see the total amount spent across all recorded expenses.

## User Stories

1. As the person tracking my spending, I want to add an expense with its title, amount, category, and expense date, so that I can keep a record of money I have spent.
2. As the person tracking my spending, I want to see all my expenses in one list, so that I can review where my money went.
3. As the person tracking my spending, I want to edit an expense, so that I can correct its details.
4. As the person tracking my spending, I want to delete an expense, so that records I no longer want are removed.
5. As the person tracking my spending, I want to see the expense total for all recorded expenses, so that I can understand my overall spending at a glance.
6. As the person tracking my spending, I want my expenses and total to remain correct after refreshing the page, so that my records are not limited to one browser session.

## Implementation Decisions

- Use the existing project direction: a FastAPI backend, a React TypeScript Vite frontend, and Supabase as the persistent database.
- Track one person's expenses without login or multiple-user ownership.
- An expense has a required title, amount, category, and expense date.
- Titles are trimmed, non-empty text of at most 200 characters.
- Amounts are positive whole numbers of Thai Baht. Fractional Baht and zero are invalid. Store the amount as an integer, as recorded in ADR-0001.
- Categories are required and limited to `Food`, `Transport`, `Bills`, `Shopping`, and `Other`. Users cannot add or edit categories. Persist the category as text and enforce the allowed values in the database.
- Expense dates are required calendar dates in `YYYY-MM-DD` format. Past dates and today are valid; future dates are invalid. Compare future dates using the `Asia/Bangkok` calendar date.
- Provide these API operations:
  - `GET /api/expenses` returns all expenses, ordered by expense date descending, with a stable order for ties.
  - `POST /api/expenses` creates an expense and returns the created record.
  - `PUT /api/expenses/{id}` replaces all editable fields of an expense and returns the updated record.
  - `DELETE /api/expenses/{id}` deletes an expense.
  - `GET /api/expenses/total` returns the sum of all expense amounts in whole Baht and identifies the currency as `THB`.
- Return a validation error with HTTP 422 for invalid input, including an unknown category, non-positive or fractional amount, invalid date, or future date. Return HTTP 404 when an update or delete references an expense that does not exist.
- The single page displays the total, expense list, and an add form. Editing uses the same form prefilled with the selected expense. Deleting requires confirmation. Show loading, empty, and actionable error states.
- After a successful create, update, or delete, refresh the displayed list and total from persisted data. On initial page load and browser refresh, fetch both from the backend.
- Format amounts with the Thai Baht symbol and no fractional digits.

## Testing Decisions

- Test externally observable behavior rather than implementation details.
- Test database constraints for required fields, positive integer amounts, and the fixed category set.
- Test all API operations, validation responses, ordering, not-found responses, and the total calculation through the API boundary.
- Test the single page's loading and empty states, add/edit/delete flows, validation and error display, and correct total refresh after each mutation.
- Include an end-to-end persistence check: add an expense through the deployed URL, refresh, and verify that the expense remains and the all-expenses total is correct.

## Out of Scope

- Login, authentication, or multiple users.
- Budgets.
- Charts or reports.
- Bank connections or transaction imports.
- Currency conversion or support for multiple currencies.
- User-managed categories.
- Fractional Baht amounts.

## Further Notes

The success criterion is met when an expense added on the live URL remains after a browser refresh and the displayed all-expenses total equals the sum of the persisted expense amounts.
