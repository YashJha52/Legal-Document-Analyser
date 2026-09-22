import os
import json
import requests
import streamlit as st
import pandas as pd
from pathlib import Path
from backend.utils.config import BACKEND_URL, SAMPLE_DOCS_DIR
from backend.nlp.document_parser import parse_document
from backend.nlp.chunker import chunk_by_words
from backend.dl.summarizer import generate_plain_english_summary
from backend.dl.extractor import extract_clauses_and_entities_llm

st.set_page_config(
    page_title="Legal Document Analyzer",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

css_path = Path(__file__).resolve().parent / "assets" / "style.css"
if css_path.exists():
    with open(css_path, "r") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def check_backend_alive():
    try:
        resp = requests.get(f"{BACKEND_URL}/api/health", timeout=2.0)
        return resp.status_code == 200, resp.json()
    except Exception:
        return False, None

def analyze_document_via_api(raw_text=None, file_bytes=None, filename="", chunk_size=1000, chunk_overlap=200):
    backend_up, _ = check_backend_alive()
    if backend_up:
        try:
            if file_bytes is not None:
                files = {"file": (filename, file_bytes, "application/octet-stream")}
                data = {"chunk_size": chunk_size, "chunk_overlap": chunk_overlap}
                resp = requests.post(f"{BACKEND_URL}/api/analyze_full", files=files, data=data, timeout=60.0)
            else:
                data = {"raw_text": raw_text, "chunk_size": chunk_size, "chunk_overlap": chunk_overlap}
                resp = requests.post(f"{BACKEND_URL}/api/analyze_full", data=data, timeout=60.0)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass

    extracted_text = parse_document(file_content=(file_bytes if file_bytes is not None else raw_text), filename=filename)
    chunks = chunk_by_words(text=extracted_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    summary_result = generate_hierarchical_summary(text=extracted_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    extraction_result = extract_clauses_from_document(text=extracted_text)
    
    return {
        "source": filename or "direct_input",
        "stats": {
            "char_count": len(extracted_text),
            "word_count": len(extracted_text.split()),
            "total_chunks": len(chunks)
        },
        "text": extracted_text,
        "summary": summary_result,
        "clauses": extraction_result["clauses"],
        "metadata": extraction_result["metadata"],
        "overall_risk": extraction_result["overall_risk"],
        "total_clauses_found": extraction_result["total_clauses_found"]
    }

st.sidebar.title("⚖️ Contract Intelligence")
st.sidebar.markdown("Automated legal review, clause risk scoring, and hierarchical contract summarization.")

backend_online, backend_info = check_backend_alive()
if backend_online:
    device_name = backend_info.get("device", "cpu").upper()
    st.sidebar.success(f"Backend API: Connected ({device_name})")
else:
    st.sidebar.info("Backend API: Local Pipeline Mode")

doc_mode = st.sidebar.radio(
    "Select Input Method",
    ["Upload Contract (PDF/TXT)", "Sample NDA", "Sample SaaS Agreement", "Paste Text"]
)

st.sidebar.subheader("Chunking & Tokenizer Settings")
chunk_size = st.sidebar.slider("Chunk Size (words)", min_value=200, max_value=2000, value=1000, step=100)
chunk_overlap = st.sidebar.slider("Chunk Overlap (words)", min_value=50, max_value=500, value=200, step=25)

input_text = None
file_bytes = None
filename = ""

if doc_mode == "Upload Contract (PDF/TXT)":
    uploaded_file = st.file_uploader("Upload Legal Document", type=["pdf", "txt", "docx"])
    if uploaded_file is not None:
        file_bytes = uploaded_file.read()
        filename = uploaded_file.name

elif doc_mode == "Sample NDA":
    sample_file_path = os.path.join(SAMPLE_DOCS_DIR, "sample_nda.txt")
    if os.path.exists(sample_file_path):
        with open(sample_file_path, "r", encoding="utf-8") as f:
            input_text = f.read()
        filename = "sample_nda.txt"

elif doc_mode == "Sample SaaS Agreement":
    sample_file_path = os.path.join(SAMPLE_DOCS_DIR, "sample_saas_agreement.txt")
    if os.path.exists(sample_file_path):
        with open(sample_file_path, "r", encoding="utf-8") as f:
            input_text = f.read()
        filename = "sample_saas_agreement.txt"

elif doc_mode == "Paste Text":
    input_text = st.text_area("Paste Contract Text", height=220)
    filename = "pasted_contract.txt"

st.title("📄 Legal Document Analyzer & Clause Risk Detector")
st.markdown("Extract insights, parse key clauses, detect liability risks, and generate executive summaries.")

can_analyze = (file_bytes is not None) or (input_text is not None and len(input_text.strip()) > 20)

if st.button("🚀 Analyze Contract", type="primary", disabled=not can_analyze):
    with st.spinner("Processing document with NLP pipeline..."):
        result = analyze_document_via_api(
            raw_text=input_text,
            file_bytes=file_bytes,
            filename=filename,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        st.session_state["analysis_result"] = result

if "analysis_result" in st.session_state:
    res = st.session_state["analysis_result"]
    stats = res.get("stats", {})
    metadata = res.get("metadata", {})
    overall_risk = res.get("overall_risk", "Low")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Word Count", f"{stats.get('word_count', 0):,}")
    with col2:
        st.metric("Sliding Chunks", stats.get("total_chunks", 0))
    with col3:
        st.metric("Clauses Identified", res.get("total_clauses_found", 0))
    with col4:
        risk_class = f"risk-badge-{overall_risk.lower()}"
        st.markdown(f"**Overall Contract Risk**<br><span class='{risk_class}'>{overall_risk} Risk</span>", unsafe_allow_html=True)
        
    st.divider()

    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Executive Summary",
        "⚖️ Clause Analysis & Risks",
        "🏷️ Entities & Key Terms",
        "🔍 Document Text & Chunks"
    ])
    
    with tab1:
        st.subheader("Executive Summary")
        summary_info = res.get("summary", {})
        exec_summary = summary_info.get("executive_summary", "")
        st.info(exec_summary)
        
        sec_summaries = summary_info.get("section_summaries", [])
        if len(sec_summaries) > 1:
            st.subheader("Section-by-Section Breakdown")
            for sec in sec_summaries:
                with st.expander(f"Section Chunk {sec['section_id'] + 1}"):
                    st.write(sec["summary"])
                    
    with tab2:
        st.subheader("Extracted Legal Clauses")
        clauses = res.get("clauses", [])
        
        if not clauses:
            st.warning("No standard legal clauses matched the confidence threshold.")
        else:
            clause_types = sorted(list(set(c["title"] for c in clauses)))
            selected_type = st.selectbox("Filter by Clause Category", ["All Categories"] + clause_types)
            
            for clause in clauses:
                if selected_type != "All Categories" and clause["title"] != selected_type:
                    continue
                    
                risk_lvl = clause["risk_level"].lower()
                badge_class = f"risk-badge-{risk_lvl}"
                box_class = f"clause-box clause-box-{risk_lvl}"
                
                html_card = f"""
                <div class="{box_class}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:1.1em; font-weight:700;">{clause['title']}</span>
                        <div>
                            <span class="{badge_class}">{clause['risk_level']} Risk</span>
                            <span style="color:#64748b; font-size:0.85em; margin-left:8px;">Confidence: {clause['confidence']*100:.0f}%</span>
                        </div>
                    </div>
                    <p style="margin-bottom:8px; font-size:0.95em; color:#1e293b; line-height:1.5;">{clause['text']}</p>
                    <div style="font-size:0.85em; color:#475569;"><strong>Risk Assessment:</strong> {clause['risk_reason']}</div>
                </div>
                """
                st.markdown(html_card, unsafe_allow_html=True)
                
    with tab3:
        st.subheader("Key Entities & Financial/Temporal Terms")
        
        m_col1, m_col2 = st.columns(2)
        with m_col1:
            st.markdown("#### Contracting Parties")
            parties = metadata.get("parties", [])
            if parties:
                for party in parties:
                    st.markdown(f"- 🏢 **{party}**")
            else:
                st.write("No distinct party names detected.")
                
            st.markdown("#### Governing Jurisdiction")
            jurisdiction = metadata.get("governing_jurisdiction")
            if jurisdiction:
                st.markdown(f"- 🏛️ **{jurisdiction}**")
            else:
                st.write("Jurisdiction not explicitly found.")
                
        with m_col2:
            st.markdown("#### Effective Date")
            eff_date = metadata.get("effective_date")
            if eff_date:
                st.markdown(f"- 📅 **{eff_date}**")
            else:
                st.write("Effective date not explicitly identified.")
                
            st.markdown("#### Monetary Values & Caps")
            money_vals = metadata.get("monetary_values", [])
            if money_vals:
                for val in money_vals:
                    st.markdown(f"- 💵 `{val}`")
            else:
                st.write("No specific currency values extracted.")
                
            st.markdown("#### Notice Periods")
            notices = metadata.get("notice_periods", [])
            if notices:
                for n in notices:
                    st.markdown(f"- ⏱️ `{n}`")
            else:
                st.write("No specific notice periods extracted.")
                
    with tab4:
        st.subheader("Raw Document & Sliding Window Chunks")
        
        chunks = chunk_by_words(text=res.get("text", ""), chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        st.write(f"Document split into **{len(chunks)}** sliding window chunks (Size: {chunk_size} words, Overlap: {chunk_overlap} words):")
        
        for c in chunks:
            with st.expander(f"Chunk #{c['chunk_id'] + 1} ({c['word_count']} words)"):
                st.text(c["text"])
                
        st.subheader("Full Cleaned Document Text")
        st.text_area("Cleaned Text", value=res.get("text", ""), height=250)
        
    st.download_button(
        "📥 Download Analysis JSON",
        data=json.dumps(res, indent=2),
        file_name="legal_analysis_report.json",
        mime="application/json"
    )
