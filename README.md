# ⚖️ Legal Document Simplifier & Analyzer (`legal_doc_analyzer`)

An end-to-end Deep Learning & NLP platform for legal document parsing, smart boundary-preserving chunking, hierarchical plain-English summarization, and automated clause risk assessment. Optimized strictly for 8GB RAM local workstations using `llama-cpp-python` with `Qwen2.5-1.5B-Instruct` in Q4_K_M GGUF format (`n_ctx=8192`).

---

## 🏛️ Project Architecture

```
legal_doc_analyzer/
├── data/
│   ├── raw/                  # Unprocessed contract datasets (CUAD, Multi-LexSum)
│   ├── processed/            # Cleaned and chunked data
│   └── sample_docs/          # Sample contracts (NDA, SaaS agreement)
├── models/
│   ├── checkpoints/          # Local GGUF models (qwen2.5-1.5b-instruct-q4_k_m.gguf)
│   └── hf_cache/             # Hugging Face cache
├── notebooks/                # Exploratory analysis & model evaluations
│   ├── nlp/                  # NLP Data Exploration & Text Preprocessing
│   │   ├── 01_data_exploration.ipynb
│   │   └── 02_preprocessing.ipynb
│   └── dl/                   # Deep Learning Model Evaluation
│       └── 03_model_evaluation.ipynb
├── backend/
│   ├── app.py                # FastAPI server mounting /api/v1 & serving frontend
│   ├── routes.py             # Modular endpoints consuming NLP & DL pipelines
│   ├── nlp/                  # [NLP Module] Classical & Linguistic NLP Pipeline
│   │   ├── __init__.py
│   │   ├── document_parser.py # PDF/TXT parser with OCR & regex cleaning
│   │   ├── chunker.py         # Boundary-preserving smart chunking & token estimation
│   │   └── extractor.py       # Heuristic & regex clause and entity extraction
│   ├── dl/                   # [DL Module] Deep Learning & Neural Models Pipeline
│   │   ├── __init__.py
│   │   ├── rag_indexer.py     # Dense neural embeddings (SentenceTransformer) & ChromaDB RAG
│   │   ├── extractor.py       # Quantized local LLM (Qwen2.5) neural clause & risk engine
│   │   └── summarizer.py      # Hierarchical plain-English neural summarizer
│   └── utils/
│       ├── __init__.py
│       └── config.py         # 8GB RAM budget, n_ctx=8192, and psutil telemetry
├── frontend/                 # Vite + React + Tailwind CSS dashboard (Lexis Obsidian)
│   ├── src/
│   │   ├── components/       # Header, Sidebar, FileUpload, RiskScorecard, ClauseExplorer, etc.
│   │   ├── App.jsx           # Main dashboard application shell
│   │   └── main.jsx          # React DOM entrypoint
│   ├── tailwind.config.js    # Stitch-generated Lexis Obsidian design tokens
│   ├── vite.config.js        # Vite config with backend proxy
│   └── package.json          # Frontend dependencies
├── tests/
│   ├── nlp/                  # NLP unit tests (parser, chunking, regex extraction)
│   │   ├── test_document_parser.py
│   │   ├── test_chunking.py
│   │   └── test_extractor_nlp.py
│   ├── dl/                   # DL unit tests (neural summarizer, LLM extractor, RAG)
│   │   └── test_dl_components.py
│   └── test_api.py           # End-to-end integration tests for /api/v1 endpoints
├── Dockerfile                # Multi-stage production container build
├── docker-compose.yml        # Orchestration for containerized deployment
├── requirements.txt          # Python dependencies (llama-cpp-python, fastapi, etc.)
├── .env                      # Local environment configuration
└── README.md                 # Project documentation
```

---

## 🧠 Technical Separation: NLP vs. Deep Learning (DL)

This project separates linguistic text preprocessing and heuristic information extraction from neural models and generative architectures:

### 1. Natural Language Processing (NLP Module — `backend/nlp/`)
- **Document Ingestion & Normalization (`document_parser.py`)**: Multi-format PDF and text parsing (via `pdfplumber`/`pypdf`), removal of recurring headers, footers, pagination artifacts, line-break hyphenation repair, and whitespace normalization.
- **Linguistic & Structural Chunking (`chunker.py`)**: Smart partitioning at legal clause boundaries (Section, Article, Clause markers), sliding window word chunking with configurable overlap, and statistical token count estimation.
- **Rule-Based & Regex Extraction (`extractor.py`)**: Deterministic extraction of contractual entities (signatory parties, effective dates, governing law, notice windows, monetary caps) and heuristic clause risk classification.
- **Notebooks (`notebooks/nlp/`)**: Exploratory data analysis (`01_data_exploration.ipynb`) and document cleaning/chunking workflows (`02_preprocessing.ipynb`).

### 2. Deep Learning (DL Module — `backend/dl/`)
- **Dense Semantic Embeddings (`rag_indexer.py`)**: 384-dimensional dense neural embeddings generated via `SentenceTransformer('all-MiniLM-L6-v2')` over historical Indian Supreme Court judgments.
- **ChromaDB Vector Store & RAG Retrieval (`rag_indexer.py`)**: Cosine similarity nearest-neighbor retrieval to enrich summarization prompts with precedent legal context.
- **Quantized Neural LLM Inference (`extractor.py`)**: 4-bit quantized `Qwen2.5-1.5B-Instruct` (`Q4_K_M` GGUF) run via `llama-cpp-python` with strict RAM budget constraints (<1.6 GB RAM).
- **Hierarchical Neural Summarization (`summarizer.py`)**: Two-stage map-reduce neural summarizer distilling multi-page legal contracts into structured executive summaries, obligations, and action items.
- **Evaluation Notebook (`notebooks/dl/`)**: Model inference, perplexity, and context utilization evaluation (`03_model_evaluation.ipynb`).

---

## ⚡ 8GB RAM System Optimization

- **Model Selection**: `Qwen2.5-1.5B-Instruct` in `Q4_K_M` GGUF format requires only ~1.05 GB storage and ~1.6 GB working RAM.
- **Context Guard**: `n_ctx` is capped strictly at `8192` tokens to constrain the KV-cache to <350 MB.
- **Smart Chunking Fallback**: Documents exceeding 8192 tokens are partitioned at natural legal boundaries (sections and articles) with overlapping windows to prevent memory overflow while preserving risk context.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger docs: `http://localhost:8000/docs`

### 2. Frontend Dashboard Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard available at: `http://localhost:5173`

---

## 🐳 Docker Deployment

To build and run the unified container:
```bash
docker-compose up --build
```
Access the application at `http://localhost:8000`.

---

## 🧪 Running Automated Tests

```bash
pytest tests/ -v
```

---

## 📡 API Reference (`/api/v1`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Telemetry, RAM usage meter, model GGUF status |
| `/api/v1/analyze` | `POST` | Core endpoint: extracts entities, classifies clauses, assesses risk, and generates plain-English summary in structured JSON |
| `/api/v1/parse` | `POST` | Clean and extract raw text via `pdfplumber` |
| `/api/v1/chunk` | `POST` | Partition text into smart boundary-preserving chunks |
