from sqlalchemy import Column, String, Integer, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.core.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    title = Column(String)
    num_questions = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="quizzes")
    document = relationship("Document", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz")
    attempts = relationship("QuizAttempt", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"))
    question_text = Column(Text)
    options = Column(JSON)
    correct_answer = Column(String)
    explanation = Column(Text)
    # Dạng câu hỏi (vd: Từ vựng, Ngữ pháp, Đọc hiểu...) dùng để phân tích điểm yếu
    category = Column(String, default="Khác")
    order_index = Column(Integer)

    quiz = relationship("Quiz", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"))
    answers = Column(JSON)
    score = Column(Float)
    correct_count = Column(Integer)
    total_questions = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="attempts")
    quiz = relationship("Quiz", back_populates="attempts")
