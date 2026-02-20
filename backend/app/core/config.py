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