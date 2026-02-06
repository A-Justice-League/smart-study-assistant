from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from app.schemas.sessions import SessionCreate, SessionResponse

# Mock In-Memory Store for MVP/Testing if DB fails
MOCK_SESSIONS = []

class SessionsRepo:
    async def create(self, session_in: SessionCreate, user_id: UUID, file_url: str = None, text: str = None) -> SessionResponse:
        session = SessionResponse(
            id=uuid4(),
            user_id=user_id,
            title=session_in.title,
            original_text=text,
            file_name=None, # In real app, extract filename
            file_url=file_url,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        MOCK_SESSIONS.append(session)
        return session

    async def get_all(self, user_id: UUID) -> List[SessionResponse]:
        return [s for s in MOCK_SESSIONS if s.user_id == user_id]

    async def get_by_id(self, session_id: UUID, user_id: UUID) -> Optional[SessionResponse]:
        for s in MOCK_SESSIONS:
            if s.id == session_id and s.user_id == user_id:
                return s
        return None

sessions_repo = SessionsRepo()
