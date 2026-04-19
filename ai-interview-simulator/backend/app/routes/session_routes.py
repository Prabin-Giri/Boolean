from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.response import SessionResultRead
from app.schemas.session import SessionCreate, SessionRead, SessionStartResponse
from app.services.question_service import get_questions_for_session
from app.services.session_service import (
    build_session_results,
    create_session,
    get_session_by_id,
)


router = APIRouter(prefix="/session", tags=["session"])


@router.post("/start", response_model=SessionStartResponse)
def start_session(payload: SessionCreate, db: Session = Depends(get_db)):
    try:
        questions = get_questions_for_session(
            db,
            payload.category,
            payload.difficulty,
            payload.total_questions,
            payload.career_focus,
            payload.seniority,
            payload.tech_stack,
            payload.target_market,
            payload.company_type,
            payload.interview_emphasis,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    if len(questions) < payload.total_questions:
        raise HTTPException(status_code=400, detail="Not enough questions for the selected filters.")
    session = create_session(db, payload)
    return {"session": session, "questions": questions}


@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session


@router.get("/{session_id}/results", response_model=SessionResultRead)
def get_results(session_id: int, db: Session = Depends(get_db)):
    result = build_session_results(db, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found.")
    return result
