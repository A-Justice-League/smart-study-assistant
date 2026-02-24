from typing import List, Literal

from pydantic import BaseModel, Field


class SummarizationRequest(BaseModel):
    content: str = Field(..., min_length=50, max_length=100000)
    style: Literal["brief", "detailed", "bullet-points"] = "detailed"
    tone: Literal["academic", "simple"] = "academic"

class VocabularyItem(BaseModel):
    word: str
    definition: str

class SummarizationResponse(BaseModel):
    summary: str
    key_points: List[str]
    vocabulary: List[VocabularyItem]
