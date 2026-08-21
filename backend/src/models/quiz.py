from sqlalchemy import Column, String, Integer, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.core.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    title = Column(String)
    num_questions = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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
    order_index = Column(Integer)

    quiz = relationship("Quiz", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"))
    answers = Column(JSON)
    score = Column(Float)
    correct_count = Column(Integer)
    total_questions = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    quiz = relationship("Quiz", back_populates="attempts")
