# BGZERO — Self-hosted background removal
# Supports NVIDIA GPU (CUDA) and CPU
# For Apple Silicon, run natively (MPS doesn't work in Docker)

FROM python:3.12-slim AS base

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY cli.py .

# Download models at build time (optional — can also mount volume)
# RUN python scripts/download_models.py

EXPOSE 8420

ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO
ENV DEFAULT_MODE=quality
ENV PRELOAD_MODE=quality

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8420", "--workers", "1"]
