import PyPDF2
from io import BytesIO
from app.core.errors import APIError

class PDFService:
    @staticmethod
    async def extract_text(file_content: bytes) -> str:
        try:
            reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise APIError(code="EXTRACTION_FAILED", message="Failed to extract text from PDF", details={"error": str(e)}, status_code=500)

pdf_service = PDFService()
