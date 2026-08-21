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


class ScoreHistoryItem(BaseModel):
    """Một điểm dữ liệu trên biểu đồ tiến bộ."""
    attempt_id: UUID
    quiz_title: str
    score: float
    correct_count: int
    total_questions: int
    submitted_at: datetime


class CategoryStatItem(BaseModel):
    """Thống kê đúng/sai theo dạng câu hỏi."""
    category: str
    total_answered: int
    correct_count: int
    accuracy: float  # 0..100


class DashboardStatsResponse(BaseModel):
    total_documents: int
    ready_documents: int
    total_attempts: int
    average_score: float
    study_streak_days: int
    recent_attempts: List[RecentAttemptItem]
    # Điểm số các bài làm theo thời gian tăng dần (vẽ biểu đồ tiến bộ)
    score_history: List[ScoreHistoryItem] = []
    # Phân tích điểm yếu theo dạng câu hỏi, sắp xếp accuracy tăng dần
    category_stats: List[CategoryStatItem] = []
