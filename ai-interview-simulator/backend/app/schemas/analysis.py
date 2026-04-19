from pydantic import BaseModel


class MetricSummary(BaseModel):
    filler_count: int
    words_per_minute: float
    eye_contact_score: float
    emotion_summary: str
    common_fillers: list[str] = []
    focus_score: float = 0.0
    presence_score: float = 0.0
    looking_away_ratio: float = 0.0
    stability_score: float = 0.0
    focus_status: str = ""
    investigation_summary: str = ""
    silence_detected: bool = False


class ScoreSummary(BaseModel):
    communication: float
    confidence: float
    clarity: float
    relevance: float
    eye_contact: float
    overall: float


class AnalysisResponse(BaseModel):
    transcript: str
    metrics: MetricSummary
    scores: ScoreSummary
    feedback: list[str]
