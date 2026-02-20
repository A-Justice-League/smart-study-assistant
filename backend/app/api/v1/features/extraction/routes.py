from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.schemas.responses import SuccessResponse

from .crud import create_extraction_record
from .schemas import ExtractionData
from .services import extraction_service

router = APIRouter()

@router.post(
    "/upload",
    response_model=SuccessResponse[ExtractionData],
    summary="Upload and extract PDF content",
    description="Accepts a PDF file, extracts its text, saves it to the database, and returns the results."
)
async def upload_document(
    file: UploadFile = File(..., description="The PDF file to extract content from"),
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint to handle PDF uploads and extraction.
    """
    # 1. Extract content and metadata
    text, metadata = await extraction_service.extract_text_from_pdf(file)
    
    # 2. Persist to database
    db_obj = await create_extraction_record(
        db=db,
        filename=file.filename,
        content=text,
        metadata=metadata
    )
    
    # 3. Construct response data
    extraction_data = ExtractionData(
        id=db_obj.id,
        filename=db_obj.filename,
        text=db_obj.content,
        metadata=metadata,
        created_at=db_obj.created_at
    )
    
    return SuccessResponse(data=extraction_data)
