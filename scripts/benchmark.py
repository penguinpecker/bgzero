#!/usr/bin/env python3
"""
BGZERO Benchmark — Test processing speed and quality across modes.

Usage:
    python scripts/benchmark.py [test_image.jpg]

If no image is provided, generates a synthetic test image.
"""

import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))


def create_test_image(size=(1920, 1080)):
    """Generate a synthetic test image with complex edges."""
    w, h = size
    img = np.zeros((h, w, 3), dtype=np.uint8)

    # Background gradient
    for y in range(h):
        img[y, :, 0] = int(100 + 80 * (y / h))
        img[y, :, 1] = int(130 + 60 * (y / h))
        img[y, :, 2] = int(180 + 40 * (y / h))

    # Foreground circle with soft edges (simulating a subject)
    cy, cx = h // 2, w // 2
    Y, X = np.ogrid[:h, :w]
    r = min(w, h) // 3
    dist = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
    mask = np.clip(1.0 - (dist - r + 20) / 40, 0, 1)

    fg_color = np.array([220, 180, 140], dtype=np.float32)
    for c in range(3):
        img[:, :, c] = (
            img[:, :, c] * (1 - mask) + fg_color[c] * mask
        ).astype(np.uint8)

    return Image.fromarray(img)


def run_benchmark():
    from engine import ProcessingMode, process_image, preload_models, DEVICE

    print("=" * 60)
    print("  BGZERO Benchmark")
    print(f"  Device: {DEVICE}")
    print("=" * 60)

    # Load test image
    if len(sys.argv) > 1 and Path(sys.argv[1]).is_file():
        test_img = Image.open(sys.argv[1]).convert("RGB")
        print(f"\n  Test image: {sys.argv[1]} ({test_img.size[0]}x{test_img.size[1]})")
    else:
        test_img = create_test_image()
        print(f"\n  Test image: synthetic ({test_img.size[0]}x{test_img.size[1]})")

    # Warm up
    print("\n  Warming up models...")
    preload_models(ProcessingMode.QUALITY)

    modes = [
        ProcessingMode.FAST,
        ProcessingMode.QUALITY,
        ProcessingMode.ULTRA,
    ]

    results = []
    runs_per_mode = 3

    for mode in modes:
        times = []
        print(f"\n  Testing {mode.value}...")

        for i in range(runs_per_mode):
            try:
                result = process_image(test_img, mode=mode, refine=True)
                times.append(result["time_ms"])
                print(f"    Run {i+1}: {result['time_ms']:.0f}ms [{'+'.join(result['models'])}]")
            except Exception as e:
                print(f"    Run {i+1}: FAILED — {e}")

        if times:
            avg = sum(times) / len(times)
            best = min(times)
            results.append((mode.value, avg, best, len(times)))

    # Summary
    print("\n" + "=" * 60)
    print("  Results")
    print("=" * 60)
    print(f"  {'Mode':<12} {'Avg (ms)':<12} {'Best (ms)':<12} {'Runs':<6}")
    print("  " + "-" * 42)
    for mode, avg, best, runs in results:
        print(f"  {mode:<12} {avg:<12.0f} {best:<12.0f} {runs:<6}")

    # Throughput estimate
    if results:
        quality_avg = next((r[1] for r in results if r[0] == "quality"), results[0][1])
        imgs_per_min = 60000 / quality_avg
        print(f"\n  Estimated throughput (quality mode): {imgs_per_min:.0f} images/min")

    print("=" * 60)


if __name__ == "__main__":
    run_benchmark()
