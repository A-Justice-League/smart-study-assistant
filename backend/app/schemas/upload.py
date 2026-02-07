"""
Pydantic schemas for PDF upload endpoint.
"""

from pydantic import BaseModel


class UploadResponse(BaseModel):
    text: str
    page_count: int
    word_count: int


class UploadResult(BaseModel):
    success: bool = True
    data: UploadResponse
