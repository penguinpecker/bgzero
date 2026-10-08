# BGZERO — Background removal studio

[Open the studio](https://bgzero-rho.vercel.app/) · [Read the guides](https://bgzero-rho.vercel.app/blog) · [Privacy](https://bgzero-rho.vercel.app/privacy)

A React/Vite background removal workspace with a FastAPI processing backend.
The public deployment uses the existing hosted Modal processor.

## Web studio

- Drag-and-drop, clipboard paste, samples, sequential batches, retry, cancel, and clear.
- Accessible before/after comparison and original/result views.
- Per-image transparent or custom-color backgrounds, canvas presets, image scale, and soft shadows.
- PNG, WebP, and JPG exports and downloadable ZIPs.
- Ten practical guides, searchable journal, about, terms, privacy, cookies, and branded 404.
- Prerendered HTML, unique metadata, structured data, sitemap, and robots.txt.

### Run and verify

```bash
cd frontend
npm ci
cp .env.example .env.local
# Set VITE_API_URL to your backend origin.
npm run dev
```

```bash
npm test
npm run build
npm run check:pages
```

The build generates 17 HTML pages in `frontend/dist`. Deploy `frontend` with
its `vercel.json` and clean HTML URLs. Production needs `VITE_API_URL`.
`SITE_URL` controls canonical URLs; it defaults to the public site above.

With the dev server at port 4198, run:

```bash
opera-browser-cli run < scripts/verify-browser.js
```

The browser verification uses public sample photos, exercises real processing,
and temporarily intercepts downloads in the test tab to inspect exported files.

### Content and operating notes

Guides live in `frontend/src/content/articles.js`; policies live in
`frontend/src/content/policies.js`. See [the SEO plan](docs/SEO.md) for the topic
map and proposed earned-link work. No external backlinks or rankings are claimed.

The hosted backend currently shares one refinement path for Quality, Ultra, and
Matting. The self-hosted engine has different paths. Public images go to the
configured backend; browser edits do not persist an image library. There are no
application analytics tags or cookies. Policies use the existing project contact;
the operator should add its business identity and private contact when available.
Underlying model licenses are separate from access to the interface.

## Self-hosted backend

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

| Model    | Size   | Speed (M4 Max) | Quality | License                                  |
| -------- | ------ | -------------- | ------- | ---------------------------------------- |
| RMBG 2.0 | ~750MB | ~4s            | ★★★★★   | Non-commercial free, commercial via BRIA |
| BiRefNet | ~450MB | ~3s            | ★★★★☆   | Apache 2.0                               |
| BEN2     | ~300MB | ~2s            | ★★★★☆   | MIT                                      |
| Ensemble | ~1.5GB | ~8s            | ★★★★★+  | Mixed                                    |

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
