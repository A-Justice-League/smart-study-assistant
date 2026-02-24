
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ExtractionDocument
from .schemas import ExtractionMetadata


async def create_extraction_record(
    db: AsyncSession,
    filename: str,
    content: str,
    metadata: ExtractionMetadata
) -> ExtractionDocument:
    """
    Creates a new extraction record in the database.
    
    Args:
        db: The database session.
        filename: Original file name.
        content: Extracted text content.
        metadata: Metadata object containing page_count and word_count.
        
    Returns:
        The created ExtractionDocument instance.
    """
    db_obj = ExtractionDocument(
        filename=filename,
        content=content,
        page_count=metadata.page_count,
        word_count=metadata.word_count,
        language=metadata.language
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
