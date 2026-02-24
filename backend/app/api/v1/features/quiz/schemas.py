from typing import List, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class QuizRequest(BaseModel):
    content: str = Field(..., min_length=50)
    question_count: int = Field(5, ge=1, le=20)
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class Question(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str

class QuizResponse(BaseModel):
    quiz_id: UUID
    questions: List[Question]
