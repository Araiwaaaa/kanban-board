from pathlib import Path

from dotenv import load_dotenv
import uvicorn


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPOSITORY_ROOT / ".env")

uvicorn.run("expense_tracker.main:app", host="127.0.0.1", port=8000)
