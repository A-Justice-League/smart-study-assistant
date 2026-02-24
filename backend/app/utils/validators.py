from app.core.errors import APIError

def validate_content_length(content: str, min_len: int = 50, max_len: int = 100000):
    length = len(content)
    if length < min_len:
        raise APIError(
            code="CONTENT_TOO_SHORT",
            message=f"Content must be at least {min_len} characters long.",
            status_code=400
        )
    if length > max_len:
        raise APIError(
            code="CONTENT_TOO_LONG",
            message=f"Content must be at most {max_len} characters long.",
            status_code=400
        )

def validate_file_size(file_size: int, max_size_mb: int = 10):
    max_bytes = max_size_mb * 1024 * 1024
    if file_size > max_bytes:
        raise APIError(
            code="FILE_TOO_LARGE",
            message=f"File exceeds maximum size of {max_size_mb}MB.",
            status_code=400
        )

def validate_file_type(content_type: str, allowed_types: list[str] = None):
    if allowed_types is None:
        allowed_types = ["application/pdf", "text/plain", "image/png", "image/jpeg", "image/webp"]
    
    if content_type not in allowed_types:
        raise APIError(
            code="INVALID_FILE_TYPE",
            message=f"File type {content_type} is not allowed. Allowed types: {', '.join(allowed_types)}",
            status_code=400
        )
