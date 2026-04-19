from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.response import SessionResultRead
from app.services.session_service import build_session_results, refresh_session_score


router = APIRouter(prefix="/score", tags=["scoring"])


@router.post("/session/{session_id}", response_model=SessionResultRead)
def score_session(session_id: int, db: Session = Depends(get_db)):
    success = refresh_session_score(db, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found.")
    return build_session_results(db, session_id)
