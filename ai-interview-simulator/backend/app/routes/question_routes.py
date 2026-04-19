from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.question import QuestionRead
from app.services.question_service import list_questions


router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("", response_model=list[QuestionRead])
def get_questions(db: Session = Depends(get_db)):
    return list_questions(db)
