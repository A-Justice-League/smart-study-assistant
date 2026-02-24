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
# Application Factory
# ------------------------------------------------------------

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # -------------------- Middleware -------------------------

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------------- Exception Handlers ---------------------

    @app.exception_handler(APIError)
    async def api_error_handler(request: Request, exc: APIError):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred.",
                    "details": {"error": str(exc)},
                },
            },
        )

    # ---------------------- Routers --------------------------

    app.include_router(api_router, prefix=settings.API_V1_STR)

    # -------------------- Core Routes ------------------------

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "success": True,
            "message": f"Welcome to {settings.PROJECT_NAME}",
            "version": settings.VERSION,
        }

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "ok",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
        }

    return app


# ------------------------------------------------------------
# App Instance
# ------------------------------------------------------------

app = create_application()