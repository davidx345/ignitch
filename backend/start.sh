#!/bin/bash

# Simple Railway startup script
echo "Starting Ignitch API on port $PORT"

# Start the application - Railway provides PORT automatically
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
