from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid

from src.core.database import get_db
from src.core.config import settings
from src.schemas.document import DocumentResponse
from src.services.document_service import DocumentService
from src.dependencies import get_document_service
from src.models.document import Document

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    doc_service: DocumentService = Depends(get_document_service)
):
    # Validate extension
    ext = f".{file.filename.split('.')[-1].lower()}" if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Save file
    file_path = await doc_service.save_upload_file(file)
    
    # Create DB record
    doc_id = uuid.uuid4()
    db_doc = Document(
        id=doc_id,
        filename=file.filename,
        file_path=file_path,
        content_type=file.content_type,
        status="processing"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Background processing
    background_tasks.add_task(doc_service.process_document, str(doc_id), file_path, db)
    
    return db_doc

@router.get("/", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: uuid.UUID, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{document_id}")
def delete_document(document_id: uuid.UUID, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Deleted successfully"}
