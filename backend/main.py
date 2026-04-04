"""
BGZERO — API Server

FastAPI application with endpoints for single image,
batch processing, and WebSocket progress reporting.
"""

import asyncio
import io
import json
import logging
import os
import time
import zipfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from PIL import Image

from engine import (
    DEVICE,
    ProcessingMode,
    apply_alpha,
    get_model,
    preload_models,
    process_image,
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
DEFAULT_MODE = os.getenv("DEFAULT_MODE", "quality")
PRELOAD_MODE = os.getenv("PRELOAD_MODE", "quality")
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "8192"))  # max dimension
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(50 * 1024 * 1024)))  # 50MB
MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", "50"))

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(name)s] %(levelname)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("bgzero.api")


# ---------------------------------------------------------------------------
# Lifespan — preload models on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 50)
    logger.info("  BGZERO starting up")
    logger.info(f"  Device: {DEVICE}")
    logger.info(f"  Default mode: {DEFAULT_MODE}")
    logger.info("=" * 50)

    try:
        preload_models(ProcessingMode(PRELOAD_MODE))
        logger.info("Models preloaded successfully")
    except Exception as e:
        logger.error(f"Model preload failed: {e}")
        logger.error("Run: python scripts/download_models.py")

    yield

    logger.info("BGZERO shutting down")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="BGZERO",
    description="Self-hosted background removal engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def validate_image(data: bytes) -> Image.Image:
    """Validate and load an image from bytes."""
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File too large. Max: {MAX_FILE_SIZE // 1024 // 1024}MB")

    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        img = Image.open(io.BytesIO(data))  # Re-open after verify
    except Exception:
        raise HTTPException(400, "Invalid image file")

    # Auto-orient based on EXIF
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    w, h = img.size
    if max(w, h) > MAX_IMAGE_SIZE:
        # Downscale to max dimension
        scale = MAX_IMAGE_SIZE / max(w, h)
        new_w, new_h = int(w * scale), int(h * scale)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        logger.info(f"Downscaled {w}x{h} → {new_w}x{new_h}")

    return img


def encode_result(
    img: Image.Image,
    fmt: str = "png",
    quality: int = 95,
) -> tuple[bytes, str]:
    """Encode result image to bytes."""
    buf = io.BytesIO()
    if fmt == "webp":
        img.save(buf, format="WEBP", quality=quality, lossless=False)
        mime = "image/webp"
    elif fmt == "jpg" or fmt == "jpeg":
        # JPEG doesn't support alpha, flatten first
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1])
            img = bg
        img.save(buf, format="JPEG", quality=quality)
        mime = "image/jpeg"
    else:
        img.save(buf, format="PNG", optimize=True)
        mime = "image/png"

    return buf.getvalue(), mime


def parse_bg_color(color_str: Optional[str]) -> Optional[tuple[int, int, int]]:
    """Parse background color from string (hex or rgb)."""
    if not color_str or color_str.lower() in ("none", "transparent", ""):
        return None

    color_str = color_str.strip().lstrip("#")

    if len(color_str) == 6:
        try:
            r = int(color_str[0:2], 16)
            g = int(color_str[2:4], 16)
            b = int(color_str[4:6], 16)
            return (r, g, b)
        except ValueError:
            pass

    if color_str.lower() == "white":
        return (255, 255, 255)
    if color_str.lower() == "black":
        return (0, 0, 0)

    return None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Health check with model status."""
    from engine import _model_cache

    return {
        "status": "ok",
        "device": str(DEVICE),
        "models_loaded": list(_model_cache.keys()),
        "modes": [m.value for m in ProcessingMode],
        "limits": {
            "max_image_size": MAX_IMAGE_SIZE,
            "max_file_size_mb": MAX_FILE_SIZE // 1024 // 1024,
            "max_batch_size": MAX_BATCH_SIZE,
        },
    }


@app.post("/remove")
async def remove_background(
    file: UploadFile = File(...),
    mode: str = Form(DEFAULT_MODE),
    format: str = Form("png"),
    quality: int = Form(95),
    bg_color: Optional[str] = Form(None),
    return_alpha: bool = Form(False),
):
    """
    Remove background from a single image.

    - **file**: Image file (JPEG, PNG, WebP)
    - **mode**: Processing mode (fast, quality, ultra, matting)
    - **format**: Output format (png, webp, jpg)
    - **quality**: JPEG/WebP quality (1-100)
    - **bg_color**: Background color (hex like 'ffffff' or 'transparent')
    - **return_alpha**: If true, return the alpha matte instead
    """
    data = await file.read()
    img = validate_image(data)

    try:
        proc_mode = ProcessingMode(mode)
    except ValueError:
        raise HTTPException(400, f"Invalid mode. Choose from: {[m.value for m in ProcessingMode]}")

    bg = parse_bg_color(bg_color)

    result = await asyncio.to_thread(
        process_image,
        img=img,
        mode=proc_mode,
        bg_color=bg,
        return_alpha=return_alpha,
    )

    if return_alpha:
        # Return alpha matte as grayscale PNG
        alpha_img = Image.fromarray(result["alpha"], "L")
        encoded, mime = encode_result(alpha_img, "png")
    else:
        encoded, mime = encode_result(result["result"], format, quality)

    return Response(
        content=encoded,
        media_type=mime,
        headers={
            "X-Processing-Time-Ms": str(result["time_ms"]),
            "X-Processing-Mode": result["mode"],
            "X-Models-Used": ",".join(result["models"]),
            "Content-Disposition": f'attachment; filename="bgzero_result.{format}"',
        },
    )


@app.post("/batch")
async def batch_remove(
    files: list[UploadFile] = File(...),
    mode: str = Form(DEFAULT_MODE),
    format: str = Form("png"),
    quality: int = Form(95),
    bg_color: Optional[str] = Form(None),
):
    """
    Remove backgrounds from multiple images. Returns a ZIP file.
    """
    if len(files) > MAX_BATCH_SIZE:
        raise HTTPException(400, f"Max {MAX_BATCH_SIZE} images per batch")

    try:
        proc_mode = ProcessingMode(mode)
    except ValueError:
        raise HTTPException(400, f"Invalid mode")

    bg = parse_bg_color(bg_color)

    zip_buffer = io.BytesIO()
    total_time = 0
    results_meta = []

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, file in enumerate(files):
            data = await file.read()
            try:
                img = validate_image(data)
                result = await asyncio.to_thread(
                    process_image, img=img, mode=proc_mode, bg_color=bg
                )

                encoded, _ = encode_result(result["result"], format, quality)

                # Use original filename with new extension
                stem = Path(file.filename or f"image_{i}").stem
                out_name = f"{stem}.{format}"
                zf.writestr(out_name, encoded)

                total_time += result["time_ms"]
                results_meta.append({
                    "file": out_name,
                    "time_ms": result["time_ms"],
                    "status": "ok",
                })
            except Exception as e:
                logger.error(f"Batch item {i} failed: {e}")
                results_meta.append({
                    "file": file.filename,
                    "status": "error",
                    "error": str(e),
                })

        # Add manifest
        zf.writestr("manifest.json", json.dumps({
            "total_images": len(files),
            "successful": sum(1 for r in results_meta if r["status"] == "ok"),
            "total_time_ms": round(total_time, 1),
            "mode": mode,
            "results": results_meta,
        }, indent=2))

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="bgzero_batch.zip"',
            "X-Total-Processing-Time-Ms": str(round(total_time, 1)),
            "X-Images-Processed": str(len(results_meta)),
        },
    )


@app.websocket("/ws/batch")
async def ws_batch(websocket: WebSocket):
    """
    WebSocket endpoint for batch processing with real-time progress.

    Protocol:
    1. Client sends JSON: {"mode": "quality", "format": "png", "count": N}
    2. Client sends N binary image frames
    3. Server sends JSON progress: {"index": i, "status": "ok", "time_ms": 123}
    4. Server sends binary result for each image
    5. Server sends JSON: {"done": true, "total_time_ms": 456}
    """
    await websocket.accept()

    try:
        # Receive config
        config = await websocket.receive_json()
        mode = ProcessingMode(config.get("mode", "quality"))
        fmt = config.get("format", "png")
        quality = config.get("quality", 95)
        count = config.get("count", 1)
        bg_color = parse_bg_color(config.get("bg_color"))

        total_time = 0

        for i in range(count):
            # Receive image bytes
            data = await websocket.receive_bytes()
            img = validate_image(data)

            # Process
            result = await asyncio.to_thread(
                process_image, img=img, mode=mode, bg_color=bg_color
            )

            # Send progress
            await websocket.send_json({
                "index": i,
                "status": "ok",
                "time_ms": result["time_ms"],
            })

            # Send result image
            encoded, _ = encode_result(result["result"], fmt, quality)
            await websocket.send_bytes(encoded)

            total_time += result["time_ms"]

        await websocket.send_json({
            "done": True,
            "total_time_ms": round(total_time, 1),
            "images_processed": count,
        })

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
