from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1.api import api_router
from src.core.config import settings
import os

app = FastAPI(
    title="AI Study Platform API",
    description="API cho nền tảng ôn thi thông minh với AI",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "AI Study Platform API", "docs": "/docs"}
