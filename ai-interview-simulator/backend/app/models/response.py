from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), nullable=False, index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), nullable=False, index=True)
    transcript: Mapped[str] = mapped_column(Text, nullable=False, default="")
    filler_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    words_per_minute: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    eye_contact_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    communication_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    clarity_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    relevance_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    emotion_summary: Mapped[str] = mapped_column(Text, nullable=False, default="neutral")
    feedback: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("InterviewSession", back_populates="responses")
    question = relationship("Question", back_populates="responses")
