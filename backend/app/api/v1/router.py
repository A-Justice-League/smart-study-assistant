from fastapi import APIRouter
from app.api.v1.features.extraction.routes import router as extraction_router
from app.api.v1.features.summarization.routes import router as summarization_router
from app.api.v1.features.quiz.routes import router as quiz_router
from app.api.v1.features.diagram.routes import router as diagram_router

api_router = APIRouter()

# Extraction
api_router.include_router(extraction_router, prefix="/upload", tags=["Extraction"])

# AI Features
api_router.include_router(summarization_router, prefix="/ai/summarize", tags=["Summarization"])
api_router.include_router(quiz_router, prefix="/ai/quiz", tags=["Quiz"])
api_router.include_router(diagram_router, prefix="/ai/diagram", tags=["Diagram"])
