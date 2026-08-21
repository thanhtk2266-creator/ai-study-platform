from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.core.database import Base

class FlashcardDeck(Base):
    __tablename__ = "flashcard_decks"

    id = Column(UUID(as_uuid=True), primary_key=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document")
    cards = relationship(
        "Flashcard",
        back_populates="deck",
        order_by="Flashcard.order_index",
        cascade="all, delete-orphan",
    )

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(UUID(as_uuid=True), primary_key=True)
    deck_id = Column(UUID(as_uuid=True), ForeignKey("flashcard_decks.id"), nullable=False, index=True)
    word = Column(Text, nullable=False)
    ipa = Column(String)
    meaning = Column(Text)
    example = Column(Text)
    # Danh sách từ đồng nghĩa, vd: ["smart", "clever"]
    synonyms = Column(JSON)
    order_index = Column(Integer, default=0)

    deck = relationship("FlashcardDeck", back_populates="cards")
