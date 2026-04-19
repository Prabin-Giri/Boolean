from datetime import datetime

from pydantic import BaseModel

from app.schemas.analysis import MetricSummary, ScoreSummary
from app.schemas.question import QuestionRead


class InterviewResponseRead(BaseModel):
    id: int
    question: QuestionRead
    transcript: str
    metrics: MetricSummary
    scores: ScoreSummary
    feedback: list[str]
    created_at: datetime


class SessionResultRead(BaseModel):
    session_id: int
    category: str
    difficulty: str
    total_score: float
    completed_questions: int
    responses: list[InterviewResponseRead]
    summary_feedback: list[str]
