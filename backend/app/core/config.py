"""
Configuration module using Pydantic BaseSettings.
Stores environment variables for the app.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = "default_key"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
