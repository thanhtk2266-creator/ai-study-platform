from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from typing import Dict, List, Optional
from src.core.config import settings

class QuizGenerateRequest(BaseModel):
    document_id: UUID
    num_questions: int = Field(default=settings.DEFAULT_NUM_QUESTIONS, le=settings.MAX_NUM_QUESTIONS)

class QuestionResponse(BaseModel):
    id: UUID
    question_text: str
    options: Dict[str, str]
    category: Optional[str] = None
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class QuestionResultResponse(QuestionResponse):
    correct_answer: str
    explanation: str

class QuizResponse(BaseModel):
    id: UUID
    document_id: UUID
    title: Optional[str] = None
    questions: List[QuestionResponse]
    num_questions: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SubmitAnswersRequest(BaseModel):
    answers: Dict[str, str]

class QuizAttemptResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    answers: Dict[str, str]
    score: float
    correct_count: int
    total_questions: int
    submitted_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class QuizResultResponse(BaseModel):
    attempt: QuizAttemptResponse
    questions: List[QuestionResultResponse]
    user_answers: Dict[str, str]
