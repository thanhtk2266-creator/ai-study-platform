from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Study Platform"
    DEBUG: bool = True
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_study_platform"
    
    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Auth
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Security
    RATE_LIMIT_PER_MINUTE: int = 120
    
    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    CHROMA_COLLECTION_NAME: str = "documents"
    
    # Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 20 * 1024 * 1024  # 20MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".pptx", ".ppt"]
    
    # Quiz
    DEFAULT_NUM_QUESTIONS: int = 10
    MAX_NUM_QUESTIONS: int = 20
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
