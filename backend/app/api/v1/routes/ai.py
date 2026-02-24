from fastapi import APIRouter, HTTPException
from app.schemas.common import SuccessResponse
from app.schemas.ai import SummarizeRequest, SummaryResponse, QuizRequest, QuizResponse, DiagramRequest, DiagramResponse
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/summarize", response_model=SuccessResponse[SummaryResponse])
async def summarize(req: SummarizeRequest):
    result = await gemini_service.summarize(req.content, req.style)
    return SuccessResponse(data=SummaryResponse(**result))

@router.post("/quiz", response_model=SuccessResponse[QuizResponse])
async def generate_quiz(req: QuizRequest):
    result = await gemini_service.generate_quiz(req.content, req.question_count, req.difficulty)
    return SuccessResponse(data=QuizResponse(**result))

@router.post("/diagram", response_model=SuccessResponse[DiagramResponse])
async def generate_diagram(req: DiagramRequest):
    result = await gemini_service.generate_diagram(req.content, req.diagram_type)
    return SuccessResponse(data=DiagramResponse(**result))
