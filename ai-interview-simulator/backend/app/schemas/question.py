from pydantic import BaseModel


class QuestionRead(BaseModel):
    id: int
    category: str
    difficulty: str
    text: str

    model_config = {"from_attributes": True}
