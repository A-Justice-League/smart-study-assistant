import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ExtractionDocument(Base):
    """
    Database model for stored extracted PDF content.
    """
    __tablename__ = "extraction_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    page_count = Column(Integer, nullable=False)
    word_count = Column(Integer, nullable=False)
    language = Column(String(10), default="en")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ExtractionDocument(filename='{self.filename}', pages={self.page_count})>"
