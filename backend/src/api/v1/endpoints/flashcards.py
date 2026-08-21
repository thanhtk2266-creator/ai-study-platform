from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from src.core.database import get_db
from src.schemas.flashcard import (
    FlashcardGenerateRequest,
    FlashcardDeckResponse,
    FlashcardDeckSummaryResponse,
)
from src.services.flashcard_service import FlashcardService
from src.dependencies import get_flashcard_service, get_current_user
from src.models.user import User

router = APIRouter()

@router.post("/generate", response_model=FlashcardDeckResponse)
def generate_deck(
    request: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    flashcard_service: FlashcardService = Depends(get_flashcard_service),
    current_user: User = Depends(get_current_user),
):
    try:
        return flashcard_service.create_deck(
            request.document_id, request.num_cards, current_user.id, db
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[FlashcardDeckSummaryResponse])
def list_decks(
    db: Session = Depends(get_db),
    flashcard_service: FlashcardService = Depends(get_flashcard_service),
    current_user: User = Depends(get_current_user),
):
    decks = flashcard_service.list_decks(current_user.id, db)
    return [
        FlashcardDeckSummaryResponse(
            id=d.id,
            document_id=d.document_id,
            title=d.title,
            created_at=d.created_at,
            card_count=len(d.cards),
        )
        for d in decks
    ]

@router.get("/{deck_id}", response_model=FlashcardDeckResponse)
def get_deck(
    deck_id: uuid.UUID,
    db: Session = Depends(get_db),
    flashcard_service: FlashcardService = Depends(get_flashcard_service),
    current_user: User = Depends(get_current_user),
):
    deck = flashcard_service.get_deck(deck_id, current_user.id, db)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck

@router.delete("/{deck_id}")
def delete_deck(
    deck_id: uuid.UUID,
    db: Session = Depends(get_db),
    flashcard_service: FlashcardService = Depends(get_flashcard_service),
    current_user: User = Depends(get_current_user),
):
    deleted = flashcard_service.delete_deck(deck_id, current_user.id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"message": "Deleted successfully"}
