import os
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.nlp.document_parser import parse_document
from backend.nlp.chunker import smart_chunk_legal_document, estimate_token_count
from backend.dl.summarizer import generate_plain_english_summary
from backend.dl.extractor import extract_clauses_and_entities_llm
from backend.dl.report_generator import generate_report
from backend.utils.config import get_system_telemetry, MAX_CHUNK_TOKENS

router = APIRouter()

METRICS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports", "training_metrics.json")

class AnalyzePayload(BaseModel):
    text: Optional[str] = None
    raw_text: Optional[str] = None
    document_name: Optional[str] = "Pasted_Contract.txt"

class GenerateReportPayload(BaseModel):
    mode: str = "simplified"
    document_name: Optional[str] = "Contract_Audit.pdf"
    analysis_data: Optional[Dict[str, Any]] = None
    text: Optional[str] = None

@router.get("/health")
def health_check():
    telemetry = get_system_telemetry()
    return {
        "status": "healthy",
        "telemetry": telemetry
    }

@router.get("/metrics")
def get_model_metrics():
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(status_code=404, detail="Model metrics file not found. Train the model first.")
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics_data = json.load(f)
    return metrics_data

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
        extracted_text = parse_document(file_content=file_bytes, filename=doc_title)
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
        raise HTTPException(status_code=400, detail="No text or document provided for analysis.")

    token_count = estimate_token_count(extracted_text)
    chunks = smart_chunk_legal_document(text=extracted_text, max_tokens=MAX_CHUNK_TOKENS)
    words = extracted_text.split()
    summary_data = generate_plain_english_summary(text=extracted_text, max_tokens=MAX_CHUNK_TOKENS)
    extraction_data = extract_clauses_and_entities_llm(text=extracted_text)

    analysis_bundle = {
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
            "risk_score": 25,
            "verdict": "Low risk identified.",
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0,
            "critical_flags": []
        }),
        "raw_text": extracted_text
    }

    simplified_report = generate_report(analysis_data=analysis_bundle, mode="simplified")
    in_depth_report = generate_report(analysis_data=analysis_bundle, mode="in_depth")

    analysis_bundle["reports"] = {
        "simplified": simplified_report,
        "in_depth": in_depth_report
    }

    return analysis_bundle

@router.post("/generate-report")
def generate_report_endpoint(payload: GenerateReportPayload):
    analysis_data = payload.analysis_data
    if not analysis_data:
        if payload.text:
            token_count = estimate_token_count(payload.text)
            chunks = smart_chunk_legal_document(text=payload.text, max_tokens=MAX_CHUNK_TOKENS)
            summary_data = generate_plain_english_summary(text=payload.text, max_tokens=MAX_CHUNK_TOKENS)
            extraction_data = extract_clauses_and_entities_llm(text=payload.text)
            analysis_data = {
                "document_name": payload.document_name or "Generated_Report.pdf",
                "stats": {
                    "char_count": len(payload.text),
                    "word_count": len(payload.text.split()),
                    "token_count": token_count,
                    "chunk_count": len(chunks),
                    "is_chunked": len(chunks) > 1
                },
                "summary": summary_data,
                "entities": extraction_data.get("entities", {}),
                "clauses": extraction_data.get("clauses", []),
                "risk_analysis": extraction_data.get("risk_analysis", {})
            }
        else:
            raise HTTPException(status_code=400, detail="Either analysis_data or text must be provided.")

    report = generate_report(analysis_data=analysis_data, mode=payload.mode)
    return report

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
        raise HTTPException(status_code=400, detail="Either a file or raw_text must be provided.")
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
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")
    chunks = smart_chunk_legal_document(text=text, max_tokens=MAX_CHUNK_TOKENS)
    return {
        "total_chunks": len(chunks),
        "chunks": chunks
    }
