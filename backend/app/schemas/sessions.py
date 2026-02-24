from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, UUID4
from app.schemas.common import ResponseBase

class SessionBase(BaseModel):
    title: str
    
class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    id: UUID4
    user_id: UUID4
    original_text: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
         from_attributes = True

class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int
