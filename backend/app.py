import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routes import router
from backend.utils.config import BACKEND_HOST, BACKEND_PORT, BASE_DIR
app = FastAPI(
    title="Legal Document Simplifier & Analyzer API",
    description="NLP & Deep Learning Legal Document Simplifier optimized for 8GB RAM systems with Qwen2.5-1.5B-Instruct GGUF",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(router, prefix="/api/v1")
app.include_router(router, prefix="/api")
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Serve static frontend assets
frontend_dist_path = os.path.join(BASE_DIR, "frontend", "dist")
app.mount("/assets", StaticFiles(directory=frontend_dist_path), name="assets")

@app.get("/")
def root():
    return FileResponse(os.path.join(frontend_dist_path, "index.html"))

if __name__ == "__main__":
    uvicorn.run(
        "backend.app:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=True
    )
