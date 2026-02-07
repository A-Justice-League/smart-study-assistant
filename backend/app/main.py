"""
Entry point for Smart Study Assistant API.

Sets up:
- FastAPI app instance
- CORS
- Custom middleware
- API routes
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.middleware import RequestLoggingMiddleware

# -----------------------------
# Initialize FastAPI
# -----------------------------
app = FastAPI(
    title="Smart Study Assistant API",
    description="AI-powered study assistant for summarization, quizzes, and diagrams",
    version="1.0.0",
)

# -----------------------------
# Middleware
# -----------------------------
# Log requests duration
app.add_middleware(RequestLoggingMiddleware)

# CORS for dev/prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Include API routes
# -----------------------------
app.include_router(api_router)
