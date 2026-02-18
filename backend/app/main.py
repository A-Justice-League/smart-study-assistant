from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/openapi.json"
)

# Include the main V1 router (currently empty)
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Study Assistant Backend!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}