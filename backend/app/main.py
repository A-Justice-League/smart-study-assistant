"""
Application entrypoint.

- Initializes FastAPI app
- Configures middleware
- Registers routers
- Sets up global exception handlers
- Provides health and root endpoints
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import APIError
from app.core.logging import setup_logging
from app.api.v1.api import api_router


# ------------------------------------------------------------
# Logging Setup
# ------------------------------------------------------------

setup_logging()


# ------------------------------------------------------------
# FastAPI App Initialization
# ------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/openapi.json"
)

# Include the main V1 router (currently empty)
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "success": True,
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}