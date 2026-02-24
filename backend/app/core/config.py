"""
Application configuration module.
Handles environment variables and application settings.
"""

from typing import List, Union, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---------------------------------------------------------
    # Core App Settings
    # ---------------------------------------------------------

    PROJECT_NAME: str = "Smart Study Assistant Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    # ---------------------------------------------------------
    # Security
    # ---------------------------------------------------------

    SECRET_KEY: str  # Required from .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ---------------------------------------------------------
    # Database Settings
    # ---------------------------------------------------------

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str

    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, v, info):
        if isinstance(v, str) and v:
            return v

        values = info.data

        return (
            f"postgresql+asyncpg://"
            f"{values.get('POSTGRES_USER')}:"
            f"{values.get('POSTGRES_PASSWORD')}@"
            f"{values.get('POSTGRES_SERVER')}:"
            f"{values.get('POSTGRES_PORT')}/"
            f"{values.get('POSTGRES_DB')}"
        )

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ---------------------------------------------------------
    # External Services
    # ---------------------------------------------------------

    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # ---------------------------------------------------------
    # Pydantic Config (v2)
    # ---------------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


# Single settings instance
settings = Settings()