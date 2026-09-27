from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.nlp.document_parser import parse_document
from backend.nlp.chunker import smart_chunk_legal_document, estimate_token_count, chunk_by_words
from backend.dl.summarizer import generate_plain_english_summary
from backend.dl.extractor import extract_clauses_and_entities_llm
from backend.utils.config import get_system_telemetry, MAX_CHUNK_TOKENS
router = APIRouter()
class AnalyzePayload(BaseModel):
    text: Optional[str] = None
    raw_text: Optional[str] = None
    document_name: Optional[str] = "Pasted_Contract.txt"
@router.get("/health")
def health_check():
    telemetry = get_system_telemetry()
    return {
        "status": "healthy",
        "telemetry": telemetry
    }
@router.post("/analyze")
async def analyze_document_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    document_name: Optional[str] = Form(None)
):
    extracted_text = ""
    doc_title = "Untitled_Contract"
    if file:
        file_bytes = await file.read()
        doc_title = file.filename or "Uploaded_Document"
        extracted_text = parse_document(file_content=file_bytes,filename=doc_title)
    elif raw_text:
        extracted_text = parse_document(file_content=raw_text)
        doc_title = document_name or "Pasted_Document.txt"
    else:
        try:
            body = await request.json()
            raw = body.get("text") or body.get("raw_text")
            if raw:
                extracted_text = parse_document(file_content=raw)
                doc_title = body.get("document_name") or "API_Input_Document.txt"
        except Exception:
            pass
    if not extracted_text or not extracted_text.strip():
        raise HTTPException(status_code=400,detail="No text or document provided for analysis.")
    token_count = estimate_token_count(extracted_text)
    chunks = smart_chunk_legal_document(text=extracted_text,max_tokens=MAX_CHUNK_TOKENS)
    words = extracted_text.split()
    summary_data = generate_plain_english_summary(text=extracted_text,max_tokens=MAX_CHUNK_TOKENS)
    extraction_data = extract_clauses_and_entities_llm(text=extracted_text)
    return {
        "document_name": doc_title,
        "stats": {
            "char_count": len(extracted_text),
            "word_count": len(words),
            "token_count": token_count,
            "chunk_count": len(chunks),
            "is_chunked": len(chunks) > 1
        },
        "summary": summary_data,
        "entities": extraction_data.get("entities", {}),
        "clauses": extraction_data.get("clauses", []),
        "risk_analysis": extraction_data.get("risk_analysis", {
            "overall_risk": "Low",
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0,
            "critical_flags": []
        }),
        "raw_text": extracted_text
    }
@router.post("/parse")
async def parse_document_endpoint(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    if file:
        file_bytes = await file.read()
        extracted_text = parse_document(
            file_content=file_bytes,
            filename=file.filename or "Uploaded_Document"
        )
    elif raw_text:
        extracted_text = parse_document(file_content=raw_text)
    else:
        raise HTTPException(status_code=400,detail="Either a file or raw_text must be provided.")
    words = extracted_text.split()
    return {
        "text": extracted_text,
        "char_count": len(extracted_text),
        "word_count": len(words),
        "token_count": estimate_token_count(extracted_text)
    }
@router.post("/chunk")
def chunk_text_endpoint(payload: AnalyzePayload):
    text = payload.text or payload.raw_text
    if not text:
        raise HTTPException(status_code=400,detail="Text payload cannot be empty.")
    chunks = smart_chunk_legal_document(text=text,max_tokens=MAX_CHUNK_TOKENS)
    return {
        "total_chunks": len(chunks),
        "chunks": chunks
    }
