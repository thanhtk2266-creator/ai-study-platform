from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy import text
from src.api.v1.api import api_router
from src.core.config import settings
from src.core.database import Base, engine
from src.core.middlewares import SecurityHeadersMiddleware, SimpleRateLimitMiddleware
from src import models
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

app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(SimpleRateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    # Migration nhẹ: thêm cột category cho bảng questions đã tồn tại từ trước
    with engine.connect() as conn:
        conn.execute(
            text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'Khác'")
        )
        conn.commit()

@app.get("/")
async def root():
    return {"message": "AI Study Platform API", "docs": "/docs"}
