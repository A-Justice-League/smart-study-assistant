"""
Pydantic schemas for AI endpoints: summarize, quiz, diagram.
"""

from pydantic import BaseModel
from typing import List, Optional

# -----------------------
# Summarize
# -----------------------
class SummarizeRequest(BaseModel):
    content: str
    style: str


class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    topics: List[str]
    word_count: int


class SummarizeResult(BaseModel):
    success: bool = True
    data: SummarizeResponse


# -----------------------
# Quiz
# -----------------------
class QuizRequest(BaseModel):
    content: str
    count: int = 5  # number of questions
    difficulty: Optional[str] = "medium"  # easy, medium, hard


class QuizQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: Optional[str]


class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]
    total_questions: int


class QuizResult(BaseModel):
    success: bool = True
    data: QuizResponse


# -----------------------
# Diagram
# -----------------------
class DiagramRequest(BaseModel):
    content: str
    diagram_type: Optional[str] = "flowchart"  # e.g., flowchart, mindmap, sequence


class DiagramResponse(BaseModel):
    title: str
    image_url: str
    explanation: Optional[str]


class DiagramResult(BaseModel):
    success: bool = True
    data: DiagramResponse
