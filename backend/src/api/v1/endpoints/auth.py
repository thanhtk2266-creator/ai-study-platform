from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta

from src.core.database import get_db
from src.core.security import create_access_token, get_password_hash, verify_password
from src.models.user import User
from src.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from src.dependencies import get_current_user
from src.models.document import Document
from src.models.quiz import Quiz, QuizAttempt
from src.schemas.dashboard import DashboardStatsResponse, RecentAttemptItem

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/me/dashboard", response_model=DashboardStatsResponse)
def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_documents = (
        db.query(func.count(Document.id))
        .filter(Document.owner_id == current_user.id)
        .scalar()
        or 0
    )
    ready_documents = (
        db.query(func.count(Document.id))
        .filter(Document.owner_id == current_user.id, Document.status == "ready")
        .scalar()
        or 0
    )
    total_attempts = (
        db.query(func.count(QuizAttempt.id))
        .filter(QuizAttempt.owner_id == current_user.id)
        .scalar()
        or 0
    )
    avg_score = (
        db.query(func.avg(QuizAttempt.score))
        .filter(QuizAttempt.owner_id == current_user.id)
        .scalar()
    )
    average_score = round(float(avg_score or 0), 2)

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.owner_id == current_user.id)
        .order_by(QuizAttempt.submitted_at.desc())
        .all()
    )
    attempted_days = {
        a.submitted_at.date() for a in attempts if a.submitted_at is not None
    }
    streak = 0
    cursor = date.today()
    while cursor in attempted_days:
        streak += 1
        cursor -= timedelta(days=1)

    recent_rows = (
        db.query(QuizAttempt, Quiz, Document)
        .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
        .outerjoin(Document, Quiz.document_id == Document.id)
        .filter(QuizAttempt.owner_id == current_user.id)
        .order_by(QuizAttempt.submitted_at.desc())
        .limit(10)
        .all()
    )
    recent_attempts = [
        RecentAttemptItem(
            attempt_id=attempt.id,
            quiz_id=quiz.id,
            quiz_title=quiz.title or "Quiz",
            document_name=doc.filename if doc else None,
            score=attempt.score,
            correct_count=attempt.correct_count,
            total_questions=attempt.total_questions,
            submitted_at=attempt.submitted_at,
        )
        for attempt, quiz, doc in recent_rows
    ]

    return DashboardStatsResponse(
        total_documents=int(total_documents),
        ready_documents=int(ready_documents),
        total_attempts=int(total_attempts),
        average_score=average_score,
        study_streak_days=streak,
        recent_attempts=recent_attempts,
    )
