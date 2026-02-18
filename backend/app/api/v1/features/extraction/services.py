from fastapi import UploadFile
from .schemas import ExtractionData, ExtractionMetadata

class ExtractionService:
    async def extract_text_from_pdf(self, file: UploadFile) -> ExtractionData:
        # TODO: Implement PDF extraction using pdfplumber
        return ExtractionData(
            text="Starts with placeholder text...",
            metadata=ExtractionMetadata(
                page_count=0,
                word_count=0,
                language="en"
            )
        )

extraction_service = ExtractionService()
