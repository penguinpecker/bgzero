#!/usr/bin/env python3
"""Download and cache all background removal models."""

import os
import sys
from pathlib import Path

def main():
    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("  BGZERO — Model Downloader")
    print("=" * 60)

    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("Installing huggingface_hub...")
        os.system(f"{sys.executable} -m pip install huggingface-hub")
        from huggingface_hub import snapshot_download

    models = {
        "briaai/RMBG-2.0": {
            "desc": "RMBG 2.0 (BiRefNet-based, SOTA quality)",
            "dir": "rmbg2",
        },
        "ZhengPeng7/BiRefNet": {
            "desc": "BiRefNet (high-res dichotomous segmentation)",
            "dir": "birefnet",
        },
    }

    for repo_id, info in models.items():
        target = models_dir / info["dir"]
        if target.exists() and any(target.iterdir()):
            print(f"\n✓ {info['desc']} — already downloaded")
            continue

        print(f"\n↓ Downloading {info['desc']}...")
        print(f"  From: {repo_id}")
        try:
            snapshot_download(
                repo_id=repo_id,
                local_dir=str(target),
                ignore_patterns=["*.md", "*.txt", ".gitattributes"],
            )
            print(f"  ✓ Saved to {target}")
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            print(f"  Try manually: huggingface-cli download {repo_id}")

    print("\n" + "=" * 60)
    print("  All models ready. Run the server with:")
    print("  cd backend && uvicorn main:app --port 8420")
    print("=" * 60)


if __name__ == "__main__":
    main()
