import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

APP_DIR = BASE_DIR / "app"
DATA_DIR = APP_DIR / "data"
UPLOAD_DIR = APP_DIR / "uploads"
RESULTS_DIR = APP_DIR / "results"
DATABASE_URL = f"sqlite:///{BASE_DIR / 'interview_simulator.db'}"
API_TITLE = "AI Interview Simulator API"
API_VERSION = "0.1.0"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini").strip() or "gpt-5-mini"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
