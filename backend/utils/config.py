import os
import sys
from pathlib import Path
import psutil
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")
SAMPLE_DOCS_DIR = os.path.join(DATA_DIR, "sample_docs")
MODELS_DIR = os.path.join(BASE_DIR, "models")
CHECKPOINTS_DIR = os.getenv("CHECKPOINTS_DIR", os.path.join(MODELS_DIR, "checkpoints"))
MODEL_REPO_ID = os.getenv("MODEL_REPO_ID", "Qwen/Qwen2.5-1.5B-Instruct-GGUF")
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "qwen2.5-1.5b-instruct-q4_k_m.gguf")
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(CHECKPOINTS_DIR, MODEL_FILENAME))
N_CTX = int(os.getenv("N_CTX", "8192"))
N_THREADS = int(os.getenv("N_THREADS", "4"))
N_GPU_LAYERS = int(os.getenv("N_GPU_LAYERS", "-1"))
MAX_CHUNK_TOKENS = int(os.getenv("MAX_CHUNK_TOKENS", "8192"))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("DEFAULT_CHUNK_OVERLAP", "512"))
RAM_LIMIT_GB = float(os.getenv("RAM_LIMIT_GB", "8.0"))
os.makedirs(CHECKPOINTS_DIR, exist_ok=True)
os.makedirs(SAMPLE_DOCS_DIR, exist_ok=True)
def get_system_telemetry():
    mem = psutil.virtual_memory()
    total_gb = round(mem.total / (1024 ** 3), 2)
    used_gb = round(mem.used / (1024 ** 3), 2)
    percent = mem.percent
    model_cached = os.path.isfile(MODEL_PATH)
    return {
        "ram_total_gb": total_gb,
        "ram_used_gb": used_gb,
        "ram_percent": percent,
        "ram_budget_gb": RAM_LIMIT_GB,
        "model_repo_id": MODEL_REPO_ID,
        "model_filename": MODEL_FILENAME,
        "model_cached": model_cached,
        "n_ctx": N_CTX
    }
