from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.question import QuestionRead


class SessionCreate(BaseModel):
    category: str = Field(..., examples=["technical"])
    difficulty: str = Field(..., examples=["medium"])
    career_focus: str = Field(..., min_length=2, max_length=120, examples=["frontend developer"])
    seniority: str = Field(default="mid-level", min_length=2, max_length=50, examples=["mid-level"])
    tech_stack: str = Field(default="", max_length=200, examples=["React, TypeScript, Node.js"])
    target_market: str = Field(default="United States", min_length=2, max_length=80, examples=["United States"])
    company_type: str = Field(default="product company", min_length=2, max_length=80, examples=["startup"])
    interview_emphasis: str = Field(default="balanced", min_length=2, max_length=40, examples=["technical-heavy"])
    total_questions: int = Field(default=5, ge=1, le=10)


class SessionRead(BaseModel):
    id: int
    category: str
    difficulty: str
    total_questions: int
    status: str
    total_score: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionStartResponse(BaseModel):
    session: SessionRead
    questions: list[QuestionRead]
