from fastapi import APIRouter
from app.schemas.common import SuccessResponse
from typing import Dict

router = APIRouter()

@router.get("", response_model=SuccessResponse[Dict[str, str]])
async def health_check():
    return SuccessResponse(data={"status": "healthy", "version": "1.0.0"})
