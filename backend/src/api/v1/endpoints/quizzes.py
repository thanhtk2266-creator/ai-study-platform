from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from src.core.database import get_db
from src.schemas.quiz import QuizGenerateRequest, QuizResponse, SubmitAnswersRequest, QuizResultResponse
from src.services.quiz_service import QuizService
from src.dependencies import get_quiz_service, get_current_user
from src.models.user import User

router = APIRouter()

@router.post("/generate", response_model=QuizResponse)
def generate_quiz(
    request: QuizGenerateRequest,
    db: Session = Depends(get_db),
    quiz_service: QuizService = Depends(get_quiz_service),
    current_user: User = Depends(get_current_user),
):
    try:
        return quiz_service.create_quiz(
            request.document_id,
            request.num_questions,
            current_user.id,
            db,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(
    quiz_id: uuid.UUID,
    db: Session = Depends(get_db),
    quiz_service: QuizService = Depends(get_quiz_service),
    current_user: User = Depends(get_current_user),
):
    quiz = quiz_service.get_quiz(quiz_id, current_user.id, db)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz(
    quiz_id: uuid.UUID,
    request: SubmitAnswersRequest,
    db: Session = Depends(get_db),
    quiz_service: QuizService = Depends(get_quiz_service),
    current_user: User = Depends(get_current_user),
):
    try:
        return quiz_service.submit_quiz(quiz_id, current_user.id, request.answers, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quiz_id}/results", response_model=QuizResultResponse)
def get_quiz_results(
    quiz_id: uuid.UUID,
    db: Session = Depends(get_db),
    quiz_service: QuizService = Depends(get_quiz_service),
    current_user: User = Depends(get_current_user),
):
    result = quiz_service.get_quiz_results(quiz_id, current_user.id, db)
    if not result:
        raise HTTPException(status_code=404, detail="No results found")
    return result
