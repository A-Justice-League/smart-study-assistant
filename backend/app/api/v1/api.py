from fastapi import APIRouter
from app.api.v1.routes import sessions, ai, health

api_router = APIRouter()
api_router.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
