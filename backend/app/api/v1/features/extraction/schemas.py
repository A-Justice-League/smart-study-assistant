from pydantic import BaseModel

class ExtractionMetadata(BaseModel):
    page_count: int
    word_count: int
    language: str = "en"

class ExtractionData(BaseModel):
    text: str
    metadata: ExtractionMetadata
