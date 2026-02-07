"""
Aggregates all API routes for FastAPI.
"""

from fastapi import APIRouter
from app.api.routes import upload, ai

api_router = APIRouter()

# PDF upload endpoint
api_router.include_router(upload.router, prefix="/api", tags=["Upload"])

# AI endpoints: summarize, quiz, diagram
api_router.include_router(ai.router, prefix="/api/ai", tags=["AI"])
