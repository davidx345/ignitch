FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including image processing libraries
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libmagic1 \
    libmagic-dev \
    file \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install production WSGI server
RUN pip install --no-cache-dir gunicorn uvicorn[standard]

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Expose port (Railway uses PORT env var, default to 8000)
EXPOSE ${PORT:-8000}

# Production command optimized for Railway
CMD gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000} --access-logfile - --error-logfile - --log-level info --timeout 120
