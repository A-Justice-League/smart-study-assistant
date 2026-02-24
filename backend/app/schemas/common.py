from typing import Generic, TypeVar, Optional, Dict, Any
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")

class ResponseBase(BaseModel, Generic[DataT]):
    success: bool
    data: Optional[DataT] = None
    error: Optional[Dict[str, Any]] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class SuccessResponse(ResponseBase[DataT], Generic[DataT]):
    success: bool = True
    data: DataT

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
