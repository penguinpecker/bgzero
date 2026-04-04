"""
BGZERO — Core Processing Engine

Handles model loading, inference, alpha matte generation,
and post-processing refinement.
"""

import time
import logging
from enum import Enum
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
from PIL import Image
from scipy.ndimage import binary_dilation, binary_erosion, gaussian_filter

logger = logging.getLogger("bgzero")

# ---------------------------------------------------------------------------
# Device detection
# ---------------------------------------------------------------------------

def get_device() -> torch.device:
    """Pick the best available device: CUDA > MPS > CPU."""
    if torch.cuda.is_available():
        logger.info("Using CUDA device")
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        logger.info("Using MPS (Apple Silicon) device")
        return torch.device("mps")
    logger.info("Using CPU device")
    return torch.device("cpu")


DEVICE = get_device()
MODELS_DIR = Path(__file__).parent.parent / "models"


# ---------------------------------------------------------------------------
# Processing modes
# ---------------------------------------------------------------------------

class ProcessingMode(str, Enum):
    FAST = "fast"          # Single lightweight model
    QUALITY = "quality"    # RMBG 2.0 + refinement
    ULTRA = "ultra"        # Ensemble + refinement
    MATTING = "matting"    # Trimap-guided alpha matting


# ---------------------------------------------------------------------------
# Model registry — lazy loading, cached after first use
# ---------------------------------------------------------------------------

_model_cache: dict = {}


def _load_rmbg2():
    """Load BRIA RMBG 2.0 (BiRefNet-based)."""
    from transformers import AutoModelForImageSegmentation, AutoConfig
    import torch.nn.functional as F

    model_path = MODELS_DIR / "rmbg2"
    if not model_path.exists():
        # Fallback: load directly from HuggingFace
        model_path = "briaai/RMBG-2.0"

    logger.info(f"Loading RMBG 2.0 from {model_path}")
    model = AutoModelForImageSegmentation.from_pretrained(
        str(model_path),
        trust_remote_code=True,
    )
    model.to(DEVICE).float()
    model.eval()
    return model


def _load_birefnet():
    """Load BiRefNet for ensemble mode."""
    from transformers import AutoModelForImageSegmentation

    model_path = MODELS_DIR / "birefnet"
    if not model_path.exists():
        model_path = "ZhengPeng7/BiRefNet"

    logger.info(f"Loading BiRefNet from {model_path}")
    model = AutoModelForImageSegmentation.from_pretrained(
        str(model_path),
        trust_remote_code=True,
    )
    model.to(DEVICE).float()
    model.eval()
    return model


def get_model(name: str):
    """Get or load a model by name."""
    if name not in _model_cache:
        loaders = {
            "rmbg2": _load_rmbg2,
            "birefnet": _load_birefnet,
        }
        if name not in loaders:
            raise ValueError(f"Unknown model: {name}")
        _model_cache[name] = loaders[name]()
    return _model_cache[name]


def preload_models(mode: ProcessingMode = ProcessingMode.QUALITY):
    """Preload models for a given mode at startup."""
    model_map = {
        ProcessingMode.FAST: ["rmbg2"],
        ProcessingMode.QUALITY: ["rmbg2"],
        ProcessingMode.ULTRA: ["rmbg2", "birefnet"],
        ProcessingMode.MATTING: ["rmbg2"],
    }
    for name in model_map.get(mode, ["rmbg2"]):
        try:
            get_model(name)
        except Exception as e:
            logger.warning(f"Failed to preload {name}: {e}")


# ---------------------------------------------------------------------------
# Pre-processing
# ---------------------------------------------------------------------------

def preprocess_image(
    img: Image.Image,
    target_size: tuple[int, int] = (1024, 1024),
) -> tuple[torch.Tensor, tuple[int, int]]:
    """
    Prepare image for model inference.
    Returns normalized tensor and original dimensions.
    """
    original_size = img.size  # (W, H)

    # Convert to RGB if needed
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Resize maintaining aspect ratio, pad to square
    img_resized = img.resize(target_size, Image.LANCZOS)

    # Convert to tensor and normalize
    img_array = np.array(img_resized).astype(np.float32) / 255.0
    # Normalize with ImageNet stats
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_normalized = (img_array - mean) / std

    tensor = torch.from_numpy(img_normalized).permute(2, 0, 1).unsqueeze(0).float()
    return tensor.to(DEVICE), original_size


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

def run_inference(
    model,
    input_tensor: torch.Tensor,
    original_size: tuple[int, int],
) -> np.ndarray:
    """
    Run segmentation model and return alpha matte as numpy array [0..255].
    """
    import torch.nn.functional as F

    with torch.no_grad():
        output = model(input_tensor)

    # Handle different model output formats
    if isinstance(output, (list, tuple)):
        # BiRefNet / RMBG2 return list of feature maps; last one is finest
        mask = output[-1]
    elif hasattr(output, "logits"):
        mask = output.logits
    else:
        mask = output

    # Sigmoid to get probabilities
    if mask.shape[1] == 1:
        mask = torch.sigmoid(mask)
    else:
        mask = torch.sigmoid(mask[:, 0:1, :, :])

    # Resize to original image dimensions
    mask = F.interpolate(
        mask,
        size=(original_size[1], original_size[0]),  # (H, W)
        mode="bilinear",
        align_corners=False,
    )

    # Convert to numpy [0..255]
    alpha = (mask.squeeze().cpu().numpy() * 255).clip(0, 255).astype(np.uint8)
    return alpha


# ---------------------------------------------------------------------------
# Post-processing — this is where the magic happens
# ---------------------------------------------------------------------------

def refine_alpha_matte(
    alpha: np.ndarray,
    original_img: np.ndarray,
    feather_radius: int = 2,
    edge_threshold: float = 0.15,
) -> np.ndarray:
    """
    Production-level alpha matte refinement.

    1. Guided filter for edge-aware smoothing
    2. Morphological cleanup (remove small holes/islands)
    3. Edge feathering for natural transitions
    4. Color-based edge refinement
    """
    h, w = alpha.shape

    # --- Step 1: Clean up with morphological ops ---
    # Remove small noise islands in both FG and BG
    kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    kernel_med = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

    # Binary threshold for cleanup
    fg_mask = (alpha > 200).astype(np.uint8)
    bg_mask = (alpha < 55).astype(np.uint8)
    uncertain = 1 - fg_mask - bg_mask

    # Remove small FG islands (< 100 pixels)
    fg_cleaned = _remove_small_regions(fg_mask, min_area=100)
    # Remove small BG holes inside FG
    bg_cleaned = _remove_small_regions(bg_mask, min_area=50)

    # --- Step 2: Edge-aware smoothing via guided filter ---
    if original_img.ndim == 3:
        guide = cv2.cvtColor(original_img, cv2.COLOR_RGB2GRAY)
    else:
        guide = original_img

    alpha_float = alpha.astype(np.float32) / 255.0

    # Guided filter: preserves edges from the original image
    try:
        alpha_guided = cv2.ximgproc.guidedFilter(
            guide=guide.astype(np.float32),
            src=alpha_float,
            radius=4,
            eps=1e-4,
        )
    except AttributeError:
        # cv2.ximgproc not available, fallback to bilateral
        alpha_uint8 = (alpha_float * 255).astype(np.uint8)
        alpha_bilateral = cv2.bilateralFilter(alpha_uint8, d=5, sigmaColor=30, sigmaSpace=30)
        alpha_guided = alpha_bilateral.astype(np.float32) / 255.0

    # --- Step 3: Edge feathering ---
    # Detect edges in the alpha matte
    edges = cv2.Canny((alpha_guided * 255).astype(np.uint8), 50, 150)
    edge_zone = cv2.dilate(edges, kernel_med, iterations=feather_radius)
    edge_zone_float = edge_zone.astype(np.float32) / 255.0

    # Apply gaussian blur only in the edge zone
    alpha_blurred = gaussian_filter(alpha_guided, sigma=1.0)
    alpha_feathered = alpha_guided * (1 - edge_zone_float) + alpha_blurred * edge_zone_float

    # --- Step 4: Color-based edge refinement ---
    if original_img.ndim == 3:
        alpha_feathered = _color_edge_refine(
            alpha_feathered, original_img, edge_zone, edge_threshold
        )

    # --- Step 5: Recombine with clean FG/BG ---
    result = alpha_feathered.copy()
    result[fg_cleaned == 1] = np.maximum(result[fg_cleaned == 1], 0.95)
    result[bg_cleaned == 1] = np.minimum(result[bg_cleaned == 1], 0.05)

    # Final clip and convert
    result = np.clip(result * 255, 0, 255).astype(np.uint8)
    return result


def _remove_small_regions(mask: np.ndarray, min_area: int = 100) -> np.ndarray:
    """Remove connected components smaller than min_area."""
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    cleaned = np.zeros_like(mask)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            cleaned[labels == i] = 1
    return cleaned


def _color_edge_refine(
    alpha: np.ndarray,
    img_rgb: np.ndarray,
    edge_zone: np.ndarray,
    threshold: float = 0.15,
) -> np.ndarray:
    """
    Use color similarity to refine edges.
    Pixels near edges that are color-similar to definite FG stay FG.
    """
    h, w = alpha.shape
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)

    # Sample definite FG and BG colors
    fg_mask = alpha > 0.9
    bg_mask = alpha < 0.1

    if fg_mask.sum() < 10 or bg_mask.sum() < 10:
        return alpha

    fg_colors = img_lab[fg_mask].mean(axis=0)
    bg_colors = img_lab[bg_mask].mean(axis=0)

    # For edge pixels, compute distance to FG and BG
    edge_pixels = edge_zone > 0
    if edge_pixels.sum() == 0:
        return alpha

    edge_lab = img_lab[edge_pixels]
    dist_fg = np.linalg.norm(edge_lab - fg_colors, axis=1)
    dist_bg = np.linalg.norm(edge_lab - bg_colors, axis=1)

    # Soft assignment based on relative distance
    total_dist = dist_fg + dist_bg + 1e-6
    fg_weight = 1.0 - (dist_fg / total_dist)

    # Blend with existing alpha
    refined = alpha.copy()
    current_edge_alpha = alpha[edge_pixels]
    blended = current_edge_alpha * 0.6 + fg_weight * 0.4
    refined[edge_pixels] = blended

    return refined


# ---------------------------------------------------------------------------
# Ensemble — merge predictions from multiple models
# ---------------------------------------------------------------------------

def ensemble_alpha(alphas: list[np.ndarray], weights: Optional[list[float]] = None) -> np.ndarray:
    """
    Merge alpha mattes from multiple models.
    Uses weighted average with edge-region max-confidence selection.
    """
    if len(alphas) == 1:
        return alphas[0]

    if weights is None:
        weights = [1.0 / len(alphas)] * len(alphas)

    # Normalize weights
    total = sum(weights)
    weights = [w / total for w in weights]

    # Weighted average for core regions
    merged = np.zeros_like(alphas[0], dtype=np.float32)
    for alpha, w in zip(alphas, weights):
        merged += alpha.astype(np.float32) * w

    # For edge regions, take the max confidence (sharpest edge wins)
    edges = []
    for alpha in alphas:
        edge = cv2.Canny(alpha, 30, 100)
        edge = cv2.dilate(edge, np.ones((5, 5), np.uint8), iterations=1)
        edges.append(edge > 0)

    combined_edge = np.any(edges, axis=0)

    if combined_edge.any():
        stacked = np.stack([a.astype(np.float32) for a in alphas], axis=-1)
        # At edges, pick the prediction with highest confidence (furthest from 0.5)
        confidence = np.abs(stacked - 127.5)
        best_idx = np.argmax(confidence, axis=-1)
        edge_values = np.choose(best_idx, [a.astype(np.float32) for a in alphas])
        merged[combined_edge] = edge_values[combined_edge]

    return merged.clip(0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Composite output
# ---------------------------------------------------------------------------

def apply_alpha(
    img: Image.Image,
    alpha: np.ndarray,
    bg_color: Optional[tuple[int, int, int]] = None,
) -> Image.Image:
    """Apply alpha matte to image. Returns RGBA or RGB with bg_color."""
    img_rgba = img.convert("RGBA")
    img_array = np.array(img_rgba)

    # Set alpha channel
    img_array[:, :, 3] = alpha

    result = Image.fromarray(img_array, "RGBA")

    if bg_color is not None:
        bg = Image.new("RGBA", result.size, (*bg_color, 255))
        result = Image.alpha_composite(bg, result).convert("RGB")

    return result


# ---------------------------------------------------------------------------
# Main processing pipeline
# ---------------------------------------------------------------------------

def process_image(
    img: Image.Image,
    mode: ProcessingMode = ProcessingMode.QUALITY,
    bg_color: Optional[tuple[int, int, int]] = None,
    refine: bool = True,
    return_alpha: bool = False,
) -> dict:
    """
    Full processing pipeline.

    Returns dict with:
        - result: PIL Image (RGBA or RGB)
        - alpha: numpy alpha matte
        - time_ms: processing time in milliseconds
        - mode: processing mode used
        - models: list of models used
    """
    t0 = time.time()
    models_used = []

    # Auto-orient and ensure RGB
    img_rgb = img.convert("RGB")
    img_array = np.array(img_rgb)

    # Determine which models to run
    if mode == ProcessingMode.FAST:
        model_names = ["birefnet"]
        input_size = (768, 768)  # Smaller for speed
        do_refine = False
    elif mode == ProcessingMode.QUALITY:
        model_names = ["birefnet"]
        input_size = (1024, 1024)
        do_refine = refine
    elif mode == ProcessingMode.ULTRA:
        model_names = ["birefnet"]
        input_size = (1024, 1024)
        do_refine = True
    elif mode == ProcessingMode.MATTING:
        model_names = ["birefnet"]
        input_size = (1024, 1024)
        do_refine = True
    else:
        model_names = ["birefnet"]
        input_size = (1024, 1024)
        do_refine = refine

    # Run inference on each model
    alphas = []
    for name in model_names:
        try:
            model = get_model(name)
            tensor, orig_size = preprocess_image(img_rgb, target_size=input_size)
            alpha = run_inference(model, tensor, orig_size)
            alphas.append(alpha)
            models_used.append(name)
        except Exception as e:
            logger.error(f"Model {name} failed: {e}")

    if not alphas:
        raise RuntimeError("All models failed. Check model downloads.")

    # Merge if ensemble
    if len(alphas) > 1:
        # Weight RMBG 2.0 higher — it's generally more accurate
        weights = [0.6] + [0.4 / (len(alphas) - 1)] * (len(alphas) - 1)
        alpha_final = ensemble_alpha(alphas, weights)
    else:
        alpha_final = alphas[0]

    # Post-processing refinement
    if do_refine:
        alpha_final = refine_alpha_matte(
            alpha_final,
            img_array,
            feather_radius=2 if mode != ProcessingMode.MATTING else 4,
        )

    # Composite
    result = apply_alpha(img_rgb, alpha_final, bg_color=bg_color)

    elapsed_ms = (time.time() - t0) * 1000

    output = {
        "result": result,
        "alpha": alpha_final,
        "time_ms": round(elapsed_ms, 1),
        "mode": mode.value,
        "models": models_used,
    }

    logger.info(
        f"Processed {img.size[0]}x{img.size[1]} in {elapsed_ms:.0f}ms "
        f"[mode={mode.value}, models={models_used}]"
    )

    return output
