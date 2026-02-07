"""
Standardized API error helper.
Used across services and routes to raise uniform errors.
"""

from fastapi import HTTPException


def api_error(code: str, message: str, status_code: int) -> None:
    """
    Raise a structured FastAPI HTTPException with consistent format.

    Args:
        code: Short error code (e.g., 'CONTENT_TOO_SHORT')
        message: Human-readable message
        status_code: HTTP status code
    """
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "error": {"code": code, "message": message}},
    )
