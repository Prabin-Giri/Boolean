import json

from sqlalchemy.orm import Session, joinedload

from app.models.response import Response
from app.models.session import InterviewSession
from app.schemas.session import SessionCreate


def create_session(db: Session, payload: SessionCreate) -> InterviewSession:
    session = InterviewSession(
        category=payload.category,
        difficulty=payload.difficulty,
        total_questions=payload.total_questions,
        status="in_progress",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session_by_id(db: Session, session_id: int) -> InterviewSession | None:
    return db.query(InterviewSession).filter(InterviewSession.id == session_id).first()


def refresh_session_score(db: Session, session_id: int) -> bool:
    session = get_session_by_id(db, session_id)
    if not session:
        return False

    responses = db.query(Response).filter(Response.session_id == session_id).all()
    if responses:
        session.total_score = round(sum(item.overall_score for item in responses) / len(responses), 2)
    else:
        session.total_score = 0.0
    session.status = "completed" if len(responses) >= session.total_questions else "in_progress"
    db.commit()
    return True


def build_session_results(db: Session, session_id: int) -> dict | None:
    session = get_session_by_id(db, session_id)
    if not session:
        return None

    refresh_session_score(db, session_id)

    responses = (
        db.query(Response)
        .options(joinedload(Response.question))
        .filter(Response.session_id == session_id)
        .order_by(Response.created_at.asc())
        .all()
    )

    summary_feedback = []
    if responses:
        average_eye_contact = sum(item.eye_contact_score for item in responses) / len(responses)
        total_fillers = sum(item.filler_count for item in responses)
        silent_answers = sum(1 for item in responses if not (item.transcript or "").strip())

        if average_eye_contact < 65:
            summary_feedback.append("Camera focus drifted across the session, so keeping your eyes on the lens should be a priority.")
        else:
            summary_feedback.append("Your overall visual presence stayed fairly steady across the interview.")

        if total_fillers > len(responses) * 3:
            summary_feedback.append("Filler words still interrupted several answers, so slower breathing and cleaner pauses would help.")
        else:
            summary_feedback.append("Your verbal delivery stayed fairly clean across most answers.")

        if silent_answers:
            summary_feedback.append(
                f"{silent_answers} answer{'s' if silent_answers != 1 else ''} had no detected speech, so those results are limited until you speak through the response."
            )

    return {
        "session_id": session.id,
        "category": session.category,
        "difficulty": session.difficulty,
        "total_score": session.total_score or 0.0,
        "completed_questions": len(responses),
        "responses": [
            {
                "id": item.id,
                "question": item.question,
                "transcript": item.transcript,
                "metrics": {
                    "filler_count": item.filler_count,
                    "words_per_minute": item.words_per_minute,
                    "eye_contact_score": item.eye_contact_score,
                    "emotion_summary": item.emotion_summary,
                    "common_fillers": [],
                    "focus_score": item.eye_contact_score,
                    "presence_score": item.eye_contact_score,
                    "looking_away_ratio": round(max(0.0, 100 - item.eye_contact_score), 2),
                    "stability_score": item.eye_contact_score,
                    "focus_status": "Stored summary",
                    "investigation_summary": "Detailed frame-by-frame video notes are available immediately after submission.",
                    "silence_detected": not (item.transcript or "").strip(),
                },
                "scores": {
                    "communication": item.communication_score,
                    "confidence": item.confidence_score,
                    "clarity": item.clarity_score,
                    "relevance": item.relevance_score,
                    "eye_contact": item.eye_contact_score,
                    "overall": item.overall_score,
                },
                "feedback": json.loads(item.feedback) if item.feedback else [],
                "created_at": item.created_at,
            }
            for item in responses
        ],
        "summary_feedback": summary_feedback,
    }
