#!/bin/bash

# Start the backend server
cd "$(dirname "$0")/backend"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start the server
echo "Starting backend server on http://localhost:8001..."
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
