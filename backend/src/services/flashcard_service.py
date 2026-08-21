import uuid
from sqlalchemy.orm import Session
from src.models.flashcard import FlashcardDeck, Flashcard
from src.models.document import Document
from src.services.ai_service import AIService

class FlashcardService:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    def create_deck(
        self,
        document_id: uuid.UUID,
        num_cards: int,
        owner_id: uuid.UUID,
        db: Session,
    ) -> FlashcardDeck:
        doc = db.query(Document).filter(
            Document.id == document_id, Document.owner_id == owner_id
        ).first()
        if not doc:
            raise ValueError("Document not found")
        if doc.status != "ready":
            raise ValueError("Document is not ready for generating flashcards")

        raw_cards = self.ai_service.generate_flashcards(str(document_id), num_cards)
        if not raw_cards:
            raise ValueError("AI could not extract vocabulary from this document")

        deck_id = uuid.uuid4()
        db_deck = FlashcardDeck(
            id=deck_id,
            owner_id=owner_id,
            document_id=document_id,
            title=f"Từ vựng: {doc.filename}",
        )
        db.add(db_deck)

        for i, card in enumerate(raw_cards):
            db_card = Flashcard(
                id=uuid.uuid4(),
                deck_id=deck_id,
                word=card["word"],
                ipa=card.get("ipa", ""),
                meaning=card.get("meaning", ""),
                example=card.get("example", ""),
                synonyms=card.get("synonyms", []),
                order_index=i,
            )
            db.add(db_card)

        db.commit()
        db.refresh(db_deck)
        return db_deck

    def list_decks(self, owner_id: uuid.UUID, db: Session) -> list[FlashcardDeck]:
        return (
            db.query(FlashcardDeck)
            .filter(FlashcardDeck.owner_id == owner_id)
            .order_by(FlashcardDeck.created_at.desc())
            .all()
        )

    def get_deck(self, deck_id: uuid.UUID, owner_id: uuid.UUID, db: Session) -> FlashcardDeck | None:
        return (
            db.query(FlashcardDeck)
            .filter(FlashcardDeck.id == deck_id, FlashcardDeck.owner_id == owner_id)
            .first()
        )

    def delete_deck(self, deck_id: uuid.UUID, owner_id: uuid.UUID, db: Session) -> bool:
        deck = self.get_deck(deck_id, owner_id, db)
        if not deck:
            return False
        db.delete(deck)
        db.commit()
        return True
