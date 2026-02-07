"""
AI endpoints: summarize, quiz, diagram.
"""

from fastapi import APIRouter
from app.schemas.ai import (
    SummarizeRequest,
    SummarizeResult,
    QuizRequest,
    QuizResult,
    DiagramRequest,
    DiagramResult,
)
from app.services.ai_service import AIService
from app.providers.gemini_provider import GeminiProvider

router = APIRouter()

# Shared AI provider instance
provider = GeminiProvider()
service = AIService(provider)


@router.post("/summarize", response_model=SummarizeResult)
async def summarize(req: SummarizeRequest):
    """Generate AI summary for given text."""
    result = await service.summarize(req.content, req.style)
    return {"success": True, "data": result}


@router.post("/quiz", response_model=QuizResult)
async def quiz(req: QuizRequest):
    """Generate AI multiple-choice questions for given text."""
    result = await service.quiz(req.content, req.count, req.difficulty)
    return {"success": True, "data": result}


@router.post("/diagram", response_model=DiagramResult)
async def diagram(req: DiagramRequest):
    """Generate AI diagram from text content."""
    result = await service.diagram(req.content, req.diagram_type)
    return {"success": True, "data": result}
