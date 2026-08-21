from src.core.database import get_db
from src.services.ai_service import AIService
from src.services.document_service import DocumentService
from src.services.quiz_service import QuizService

_ai_service = AIService()
_document_service = DocumentService(_ai_service)
_quiz_service = QuizService(_ai_service)

def get_ai_service() -> AIService:
    return _ai_service

def get_document_service() -> DocumentService:
    return _document_service

def get_quiz_service() -> QuizService:
    return _quiz_service
