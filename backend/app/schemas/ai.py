from pydantic import BaseModel
from typing import List, Optional, Any

class SummarizeRequest(BaseModel):
    content: str
    style: str = "standard"

class QuizRequest(BaseModel):
    content: str
    question_count: int = 5
    difficulty: str = "medium"

class DiagramRequest(BaseModel):
    content: str
    diagram_type: str = "flowchart"

class SummaryResponse(BaseModel):
    summary: str
    key_points: List[str]
    topics: Optional[List[str]] = None
    word_count: int

class QuizQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: Any
    explanation: Optional[str] = None

class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]
    total_questions: int

class DiagramResponse(BaseModel):
    title: str
    image_url: Optional[str] = None
    mermaid_code: Optional[str] = None
    explanation: Optional[str] = None
