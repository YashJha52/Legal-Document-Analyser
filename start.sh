#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Cleanup child processes on exit/interrupt
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT SIGINT SIGTERM

echo "============================================================"
echo "    Starting NLP_DL Project"
echo "============================================================"

# Resolve Python executable
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON_CMD="venv/bin/python"
else
    PYTHON_CMD="python3"
fi

# Clear any lingering process on port 8000
lsof -ti :8000 | xargs kill -9 2>/dev/null || true

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
$PYTHON_CMD -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for the server to actually be ready
echo "Waiting for server to start..."
for i in $(seq 1 30); do
    if curl -s --max-time 1 http://127.0.0.1:8000/api/health > /dev/null 2>&1 || curl -s --max-time 1 http://127.0.0.1:8000/ > /dev/null 2>&1; then
        echo "Server is ready!"
        open http://127.0.0.1:8000 2>/dev/null || true
        break
    fi
    sleep 0.5
done

wait $BACKEND_PID

