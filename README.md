# Expense Tracker

## Local backend development

Run the FastAPI backend with `uv run --directory backend python -m expense_tracker.dev`.
The development launcher loads `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and
`ALLOWED_ORIGIN` from the repository-root `.env` file. The file is not committed;
see `.env.example` for the required variable names.
