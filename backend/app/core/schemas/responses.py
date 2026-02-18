from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class MetaData(BaseModel):
    processing_time_ms: Optional[float] = None
    tokens_used: Optional[int] = None
    extra: Optional[dict[str, Any]] = None

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    meta: Optional[MetaData] = None

class ErrorDetails(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetails
