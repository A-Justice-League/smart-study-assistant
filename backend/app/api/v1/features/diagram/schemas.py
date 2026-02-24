from typing import Literal

from pydantic import BaseModel, Field


class DiagramRequest(BaseModel):
    content: str = Field(..., min_length=50)
    diagram_type: Literal["flowchart", "mindmap", "concept-map"] = "flowchart"

class DiagramResponse(BaseModel):
    image_url: str
    mime_type: str
    description: str
