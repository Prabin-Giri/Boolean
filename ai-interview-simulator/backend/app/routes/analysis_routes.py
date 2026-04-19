from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analysis import AnalysisResponse
from app.services.analysis_service import analyze_submission
from app.services.session_service import get_session_by_id


router = APIRouter(tags=["analysis"])


@router.post("/answer/upload", response_model=AnalysisResponse)
async def upload_answer(
    session_id: int = Form(...),
    question_id: int = Form(...),
    duration_seconds: float = Form(default=60.0),
    transcript_hint: str | None = Form(default=None),
    audio: UploadFile | None = File(default=None),
    video: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    session = get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    analysis = await analyze_submission(
        db=db,
        session_id=session_id,
        question_id=question_id,
        duration_seconds=duration_seconds,
        transcript_hint=transcript_hint,
        audio_file=audio,
        video_file=video,
    )
    return analysis


@router.get("/health")
def health_check():
    return {"status": "ok"}
