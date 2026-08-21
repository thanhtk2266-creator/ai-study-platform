import uuid
from sqlalchemy.orm import Session
from src.models.quiz import Quiz, Question, QuizAttempt
from src.models.document import Document
from src.services.ai_service import AIService

class QuizService:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    def create_quiz(self, document_id: uuid.UUID, num_questions: int, owner_id: uuid.UUID, db: Session) -> Quiz:
        doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == owner_id).first()
        if not doc:
            raise ValueError("Document not found")

        # Gọi AI để sinh câu hỏi
        raw_questions = self.ai_service.generate_quiz_questions(str(document_id), num_questions)
        
        # Lưu Quiz
        quiz_id = uuid.uuid4()
        db_quiz = Quiz(
            id=quiz_id,
            owner_id=owner_id,
            document_id=document_id,
            title=f"Luyện tập: {doc.filename}",
            num_questions=len(raw_questions)
        )
        db.add(db_quiz)

        # Lưu các câu hỏi
        for i, q in enumerate(raw_questions):
            db_question = Question(
                id=uuid.uuid4(),
                quiz_id=quiz_id,
                question_text=q.get("question_text", ""),
                options=q.get("options", {}),
                correct_answer=q.get("correct_answer", ""),
                explanation=q.get("explanation", ""),
                category=q.get("category") or "Khác",
                order_index=i
            )
            db.add(db_question)
            
        db.commit()
        db.refresh(db_quiz)
        return db_quiz

    def get_quiz(self, quiz_id: uuid.UUID, owner_id: uuid.UUID, db: Session) -> Quiz:
        return db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == owner_id).first()

    def submit_quiz(self, quiz_id: uuid.UUID, owner_id: uuid.UUID, answers: dict, db: Session) -> dict:
        quiz = self.get_quiz(quiz_id, owner_id, db)
        if not quiz:
            raise ValueError("Quiz not found")
            
        questions = quiz.questions
        correct_count = 0
        total_questions = len(questions)
        
        for q in questions:
            user_answer = answers.get(str(q.id))
            if user_answer and user_answer.upper() == q.correct_answer.upper():
                correct_count += 1
                
        score = (correct_count / total_questions) * 10 if total_questions > 0 else 0
        
        attempt_id = uuid.uuid4()
        db_attempt = QuizAttempt(
            id=attempt_id,
            owner_id=owner_id,
            quiz_id=quiz_id,
            answers=answers,
            score=score,
            correct_count=correct_count,
            total_questions=total_questions
        )
        
        db.add(db_attempt)
        db.commit()
        db.refresh(db_attempt)
        
        return {
            "attempt": db_attempt,
            "questions": questions,
            "user_answers": answers
        }

    def get_quiz_results(self, quiz_id: uuid.UUID, owner_id: uuid.UUID, db: Session):
        attempt = db.query(QuizAttempt).filter(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.owner_id == owner_id,
        ).order_by(QuizAttempt.submitted_at.desc()).first()
        if not attempt:
            return None
            
        quiz = self.get_quiz(quiz_id, owner_id, db)
        
        return {
            "attempt": attempt,
            "questions": quiz.questions,
            "user_answers": attempt.answers
        }
