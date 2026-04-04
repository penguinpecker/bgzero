import io
import time
import modal

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "torch==2.6.0",
        "torchvision==0.21.0",
        "transformers==4.48.0",
        "pillow",
        "numpy",
        "opencv-python-headless",
        "scipy",
        "safetensors",
        "einops",
        "timm",
        "kornia",
        "fastapi",
        "python-multipart",
        "huggingface-hub",
    )
)

app = modal.App("bgzero", image=image)
volume = modal.Volume.from_name("bgzero-models", create_if_missing=True)
MODEL_DIR = "/models/birefnet"


@app.function(
    gpu="T4",
    scaledown_window=120,
    volumes={"/models": volume},
    secrets=[modal.Secret.from_name("huggingface")],
)
@modal.asgi_app()
def serve():
    import torch
    import torch.nn.functional as F
    import numpy as np
    import cv2
    from PIL import Image
    from scipy.ndimage import gaussian_filter
    from transformers import AutoModelForImageSegmentation
    from fastapi import FastAPI, File, Form, UploadFile
    from fastapi.responses import Response
    from starlette.responses import Response as SResponse
    from pathlib import Path

    import os
    hf_token = os.environ.get("HF_TOKEN")
    rmbg_path = Path("/models/rmbg2")
    need_download = (not rmbg_path.exists()) or (rmbg_path.exists() and len(list(rmbg_path.glob("*"))) < 3)
    if need_download:
        from huggingface_hub import snapshot_download
        print(f"Downloading RMBG 2.0... token={'set' if hf_token else 'MISSING'}")
        snapshot_download("yuvraj108c/RMBG-2.0", local_dir=str(rmbg_path), ignore_patterns=["*.md","*.txt",".gitattributes"], token=hf_token)
        volume.commit()
        print("RMBG 2.0 saved to volume")
    model_path = rmbg_path
    print(f"Using model from {model_path}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = AutoModelForImageSegmentation.from_pretrained(
        str(model_path), trust_remote_code=True, low_cpu_mem_usage=False
    )
    model.to(device).float().eval()

    web = FastAPI(title="BGZERO")

    @web.middleware("http")
    async def cors(request, call_next):
        if request.method == "OPTIONS":
            return SResponse(status_code=200, headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Expose-Headers": "X-Processing-Time-Ms, X-Processing-Mode",
            })
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "X-Processing-Time-Ms, X-Processing-Mode"
        return response

    def process(img_bytes, mode, bg_color, fmt):
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        orig_w, orig_h = img.size

        size = (768, 768) if mode == "fast" else (1024, 1024)
        img_resized = img.resize(size, Image.LANCZOS)
        arr = np.array(img_resized).astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        normalized = (arr - mean) / std
        tensor = torch.from_numpy(normalized).permute(2, 0, 1).unsqueeze(0).float().to(device)

        with torch.no_grad():
            output = model(tensor)

        mask = output[-1] if isinstance(output, (list, tuple)) else output
        mask = torch.sigmoid(mask[:, 0:1, :, :]) if mask.shape[1] > 1 else torch.sigmoid(mask)
        mask = F.interpolate(mask, size=(orig_h, orig_w), mode="bilinear", align_corners=False)
        alpha = (mask.squeeze().cpu().numpy() * 255).clip(0, 255).astype(np.uint8)

        if mode != "fast":
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel, iterations=2)
            alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel, iterations=1)
            edges = cv2.Canny(alpha, 50, 150)
            edge_zone = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=2)
            ef = edge_zone.astype(np.float32) / 255.0
            af = alpha.astype(np.float32) / 255.0
            ab = gaussian_filter(af, sigma=1.0)
            af = af * (1 - ef) + ab * ef
            alpha = (af * 255).clip(0, 255).astype(np.uint8)

        img_rgba = np.array(img.convert("RGBA"))
        img_rgba[:, :, 3] = alpha
        result = Image.fromarray(img_rgba, "RGBA")

        if bg_color and bg_color not in ("none", "transparent", ""):
            c = bg_color.strip().lstrip("#")
            if c == "white": c = "ffffff"
            if c == "black": c = "000000"
            if len(c) == 6:
                r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
                bg = Image.new("RGBA", result.size, (r, g, b, 255))
                result = Image.alpha_composite(bg, result).convert("RGB")

        buf = io.BytesIO()
        if fmt == "webp":
            result.save(buf, format="WEBP", quality=95)
        elif fmt in ("jpg", "jpeg"):
            if result.mode == "RGBA":
                bg = Image.new("RGB", result.size, (255, 255, 255))
                bg.paste(result, mask=result.split()[-1])
                result = bg
            result.save(buf, format="JPEG", quality=95)
        else:
            result.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    @web.get("/health")
    def health():
        return {
            "status": "ok",
            "device": str(device),
            "models_loaded": ["rmbg2" if "rmbg2" in str(model_path) else "birefnet"],
            "modes": ["fast", "quality", "ultra", "matting"],
            "limits": {"max_image_size": 8192, "max_file_size_mb": 50, "max_batch_size": 50},
        }

    @web.post("/remove")
    async def remove(
        file: UploadFile = File(...),
        mode: str = Form("quality"),
        format: str = Form("png"),
        bg_color: str = Form("none"),
    ):
        try:
            contents = await file.read()
            if not contents or len(contents) < 100:
                spooled = file.file
                spooled.seek(0)
                contents = spooled.read()
            t0 = time.time()
            result = process(contents, mode=mode, bg_color=bg_color, fmt=format)
            elapsed = (time.time() - t0) * 1000
            mime = {"png": "image/png", "webp": "image/webp", "jpg": "image/jpeg"}.get(format, "image/png")
            return Response(
                content=result,
                media_type=mime,
                headers={
                    "X-Processing-Time-Ms": str(round(elapsed, 1)),
                    "X-Processing-Mode": mode,
                },
            )
        except Exception as e:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=500, content={"error": str(e), "bytes_received": len(contents) if "contents" in dir() else 0})

    return web
