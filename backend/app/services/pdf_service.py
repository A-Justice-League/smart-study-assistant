"""
Service for handling PDF uploads and text extraction.
"""

from fastapi import UploadFile
import pdfplumber
import uuid
import os
from app.core.errors import api_error


class PDFService:
    async def extract_text(self, file: UploadFile) -> dict:
        """
        Save PDF temporarily, extract text, and return stats.

        Args:
            file: PDF UploadFile object

        Returns:
            dict: text, page_count, word_count
        """
        if not file.filename.endswith(".pdf"):
            api_error("INVALID_FILE_TYPE", "Only PDF files are allowed", 400)

        temp_path = f"/tmp/{uuid.uuid4()}.pdf"

        # Save uploaded PDF temporarily
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        try:
            with pdfplumber.open(temp_path) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
                page_count = len(pdf.pages)
        except Exception:
            api_error("EXTRACTION_FAILED", "Failed to extract text from PDF", 500)
        finally:
            os.remove(temp_path)

        return {"text": text, "page_count": page_count, "word_count": len(text.split())}
