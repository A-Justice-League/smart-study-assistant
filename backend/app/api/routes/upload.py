"""
Upload endpoint: accepts PDF files and extracts text.
"""

from fastapi import APIRouter, UploadFile, File
from app.services.pdf_service import PDFService
from app.schemas.upload import UploadResult

router = APIRouter()


@router.post("/upload", response_model=UploadResult)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and extract its text content.

    Returns:
        UploadResult: text, page count, and word count
    """
    pdf_service = PDFService()
    data = await pdf_service.extract_text(file)
    return {"success": True, "data": data}
