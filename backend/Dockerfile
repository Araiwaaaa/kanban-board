FROM python:3.12-slim

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir uv \
    && groupadd --system app \
    && useradd --system --gid app --create-home app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY kanban_board ./kanban_board
RUN chown -R app:app /app

USER app

CMD ["sh", "-c", "uvicorn kanban_board.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
