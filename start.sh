#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================================"
echo "    Starting NLP_DL Project"
echo "============================================================"

# Assuming a virtual environment exists. If not, it uses system python.
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Clear __pycache__ in case of corrupted .pyc files causing import hangs
echo "Clearing pycache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

echo "Bundling Frontend using ESBuild..."
cd frontend
../package/bin/esbuild src/main.jsx --bundle --outfile=dist/bundle.js
cd ..

echo "Starting Unified FastAPI Server..."
echo "The frontend is now served statically from the backend!"
echo "Server will be available at: http://127.0.0.1:8000"
echo "============================================================"
python3 -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for the server to actually be ready (loads PyTorch, chromadb, etc.)
echo "Waiting for server to start (loading ML models)..."
for i in $(seq 1 30); do
    if curl -s --max-time 2 http://127.0.0.1:8000/ > /dev/null 2>&1; then
        echo "Server is ready!"
        open http://127.0.0.1:8000
        break
    fi
    sleep 1
done

wait
