from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from typing import Optional
from uuid import UUID, uuid4
from app.schemas.common import SuccessResponse
from app.schemas.sessions import SessionResponse, SessionListResponse, SessionCreate
from app.services.pdf_service import pdf_service
from app.services.storage_service import storage_service
from app.db.repositories.sessions_repo import sessions_repo

router = APIRouter()

# Mock Auth Dependency
async def get_current_user_id():
    return UUID("550e8400-e29b-41d4-a716-446655440000") # Fixed test UUID

@router.post("", response_model=SuccessResponse[SessionResponse])
async def create_session(
    title: str = Form(...),
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    user_id: UUID = Depends(get_current_user_id)
):
    if not file and not text:
        raise HTTPException(status_code=400, detail="Either file or text must be provided")

    file_url = None
    extracted_text = text

    if file:
        content = await file.read()
        # Simple PDF check
        if file.content_type == "application/pdf":
            extracted_text = await pdf_service.extract_text(content)
        
        file_url = await storage_service.upload_file(content, file.filename, file.content_type)
    
    session_res = await sessions_repo.create(
        SessionCreate(title=title), 
        user_id, 
        file_url=file_url, 
        text=extracted_text
    )
    
    return SuccessResponse(data=session_res)

@router.get("", response_model=SuccessResponse[SessionListResponse])
async def get_sessions(user_id: UUID = Depends(get_current_user_id)):
    sessions = await sessions_repo.get_all(user_id)
    return SuccessResponse(data=SessionListResponse(sessions=sessions, total=len(sessions)))
