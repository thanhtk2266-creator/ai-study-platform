from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from typing import List, Optional
from src.core.config import settings

class FlashcardGenerateRequest(BaseModel):
    document_id: UUID
    num_cards: int = Field(default=15, ge=5, le=40)

class FlashcardResponse(BaseModel):
    id: UUID
    word: str
    ipa: Optional[str] = None
    meaning: Optional[str] = None
    example: Optional[str] = None
    synonyms: Optional[List[str]] = None
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class FlashcardDeckResponse(BaseModel):
    id: UUID
    document_id: Optional[UUID] = None
    title: Optional[str] = None
    created_at: datetime
    cards: List[FlashcardResponse] = []

    model_config = ConfigDict(from_attributes=True)

class FlashcardDeckSummaryResponse(BaseModel):
    """Dùng cho danh sách deck (không kèm cards để nhẹ payload)."""
    id: UUID
    document_id: Optional[UUID] = None
    title: Optional[str] = None
    created_at: datetime
    card_count: int
