import io

import pdfplumber
from fastapi import HTTPException, UploadFile

from .schemas import ExtractionMetadata


class ExtractionService:
    """
    Business logic for extracting text and metadata from PDF files.
    """
    
    async def extract_text_from_pdf(self, file: UploadFile) -> tuple[str, ExtractionMetadata]:
        """
        Extracts text and metadata from an uploaded PDF file.
        
        Args:
            file: The uploaded PDF file.
            
        Returns:
            A tuple containing the extracted text and an ExtractionMetadata object.
            
        Raises:
            HTTPException: If the file is not a valid PDF or extraction fails.
        """
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

        try:
            content = await file.read()
            text_parts = []
            page_count = 0
            
            # Use io.BytesIO to handle the file in memory
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                page_count = len(pdf.pages)
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            
            full_text = "\n".join(text_parts)
            word_count = len(full_text.split())
            
            metadata = ExtractionMetadata(
                page_count=page_count,
                word_count=word_count,
                language="en"  # Defaulting to English for MVP
            )
            
            return full_text, metadata
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to extract text from PDF: {str(e)}"
            )
        finally:
            await file.seek(0)  # Reset file pointer for potential future use

extraction_service = ExtractionService()
