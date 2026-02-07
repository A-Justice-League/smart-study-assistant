"""
Custom request logging middleware for performance monitoring.
"""

import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app_logger")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log the duration of each HTTP request.
    """

    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        logger.info(f"{request.url.path} completed in {duration:.2f}s")
        return response
