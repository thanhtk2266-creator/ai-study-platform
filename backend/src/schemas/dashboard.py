from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional


class RecentAttemptItem(BaseModel):
    attempt_id: UUID
    quiz_id: UUID
    quiz_title: str
    document_name: Optional[str] = None
    score: float
    correct_count: int
    total_questions: int
    submitted_at: datetime


class DashboardStatsResponse(BaseModel):
    total_documents: int
    ready_documents: int
    total_attempts: int
    average_score: float
    study_streak_days: int
    recent_attempts: List[RecentAttemptItem]
