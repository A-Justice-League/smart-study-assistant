from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ExtractionMetadata(BaseModel):
    """
    Metadata about the extracted PDF content.
    """
    page_count: int = Field(..., description="Number of pages in the PDF")
    word_count: int = Field(..., description="Total word count of extracted text")
    language: str = Field("en", description="Detection language of the content")

    model_config = ConfigDict(from_attributes=True)

class ExtractionData(BaseModel):
    """
    The core data extracted from a document.
    """
    id: UUID = Field(..., description="Unique ID of the document record")
    filename: str = Field(..., description="Original name of the uploaded file")
    text: str = Field(..., description="Full extracted text content")
    metadata: ExtractionMetadata
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
