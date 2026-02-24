<<<<<<< refactor/api-feature-skeleton-2026-02-18
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Study Assistant"
    
    # Add the missing fields here
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    SECRET_KEY: str

    # We keep this as constructed from the others, or read from env
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/app"

    class Config:
        case_sensitive = True
        env_file = ".env"
        # Optional: if you want to allow extra fields without erroring
        # extra = "ignore" 

settings = Settings()
=======
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Study Assistant Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_STRING"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS_ORIGINS is a JSON-formatted string of list of origins
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
>>>>>>> main
