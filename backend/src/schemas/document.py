from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    content_type: Optional[str] = None
    status: str
    chunk_count: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
