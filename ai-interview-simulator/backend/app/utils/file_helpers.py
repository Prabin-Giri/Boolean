import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def save_upload_file(upload: UploadFile, destination_dir: Path) -> Path:
    destination_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(upload.filename or "").suffix or ".bin"
    target_path = destination_dir / f"{uuid.uuid4().hex}{suffix}"
    with target_path.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)
    return target_path


def safe_unlink(path: Path | None) -> None:
    if path and path.exists():
        path.unlink(missing_ok=True)
