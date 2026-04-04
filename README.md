# BGZERO — Self-Hosted Background Removal Engine

Production-grade background removal running entirely on your hardware.
No per-image fees. No cloud dependency. No bullshit.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (React / Vite)        :5173       │
│  - Drag & drop upload                       │
│  - Real-time preview with before/after      │
│  - Batch processing queue                   │
│  - Download as PNG/WebP                     │
└──────────────┬──────────────────────────────┘
               │ HTTP / WebSocket
┌──────────────▼──────────────────────────────┐
│  API Layer (FastAPI)            :8420        │
│  - /remove    → single image                │
│  - /batch     → bulk processing             │
│  - /ws/batch  → websocket progress          │
│  - /health    → status + model info         │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Processing Pipeline                        │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ PreProc │→ │ Segment  │→ │ PostProc  │  │
│  │ resize  │  │ RMBG-2.0 │  │ refine    │  │
│  │ orient  │  │ BiRefNet │  │ feather   │  │
│  │ color   │  │ Ensemble │  │ composite │  │
│  └─────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────┘
```

## Hardware Target

- **Apple M4 Pro Max** — MPS (Metal) backend, ~3-5s per image at full quality
- **NVIDIA GPU** — CUDA backend, ~1-2s per image
- **CPU fallback** — Works anywhere, ~8-12s per image

## Quick Start

```bash
# 1. Clone and setup
cd bgremover
python3 -m venv venv
source venv/bin/activate

# 2. Install deps
pip install -r requirements.txt

# 3. Download models (first run only, ~1.5GB)
python scripts/download_models.py

# 4. Start backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8420 --workers 1

# 5. Start frontend (separate terminal)
cd frontend
npm install && npm run dev
```

## Models

| Model | Size | Speed (M4 Max) | Quality | License |
|-------|------|-----------------|---------|---------|
| RMBG 2.0 | ~750MB | ~4s | ★★★★★ | Non-commercial free, commercial via BRIA |
| BiRefNet | ~450MB | ~3s | ★★★★☆ | Apache 2.0 |
| BEN2 | ~300MB | ~2s | ★★★★☆ | MIT |
| Ensemble | ~1.5GB | ~8s | ★★★★★+ | Mixed |

## Processing Modes

- **fast** — Single model (BEN2), optimized for speed
- **quality** — RMBG 2.0 with edge refinement
- **ultra** — Ensemble (RMBG 2.0 + BiRefNet), merge best alpha regions
- **matting** — For transparent/semi-transparent subjects (hair, glass, smoke)

## API

```bash
# Single image
curl -X POST http://localhost:8420/remove \
  -F "file=@photo.jpg" \
  -F "mode=quality" \
  -F "format=png" \
  -o result.png

# Batch
curl -X POST http://localhost:8420/batch \
  -F "files=@img1.jpg" \
  -F "files=@img2.jpg" \
  -F "mode=quality" \
  --output batch_results.zip
```
