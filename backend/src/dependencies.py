import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.security import decode_access_token
from src.services.ai_service import AIService
from src.services.document_service import DocumentService
from src.services.quiz_service import QuizService
from src.services.flashcard_service import FlashcardService
from src.models.user import User

_ai_service = AIService()
_document_service = DocumentService(_ai_service)
_quiz_service = QuizService(_ai_service)
_flashcard_service = FlashcardService(_ai_service)
bearer_scheme = HTTPBearer(auto_error=False)

def get_ai_service() -> AIService:
    return _ai_service

def get_document_service() -> DocumentService:
    return _document_service

def get_quiz_service() -> QuizService:
    return _quiz_service

def get_flashcard_service() -> FlashcardService:
    return _flashcard_service


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = uuid.UUID(str(payload.get("sub")))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
