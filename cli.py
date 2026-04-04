#!/usr/bin/env python3
"""
BGZERO CLI — Remove backgrounds from the command line.

Usage:
    python cli.py photo.jpg                     # → photo_nobg.png
    python cli.py photo.jpg -m ultra            # Ultra quality
    python cli.py photo.jpg -o result.webp      # WebP output
    python cli.py images/*.jpg -m quality        # Batch
    python cli.py photo.jpg --bg white          # White background
    python cli.py photo.jpg --alpha             # Output alpha matte
"""

import argparse
import sys
import time
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(
        description="BGZERO — Background removal from the command line"
    )
    parser.add_argument("inputs", nargs="+", help="Input image file(s)")
    parser.add_argument("-o", "--output", help="Output file (single image) or directory (batch)")
    parser.add_argument("-m", "--mode", default="quality",
                       choices=["fast", "quality", "ultra", "matting"],
                       help="Processing mode (default: quality)")
    parser.add_argument("-f", "--format", default="png", choices=["png", "webp", "jpg"],
                       help="Output format (default: png)")
    parser.add_argument("--bg", default=None,
                       help="Background color: 'white', 'black', hex (e.g. 'ff0000'), or 'transparent'")
    parser.add_argument("--alpha", action="store_true",
                       help="Output alpha matte instead of composited image")
    parser.add_argument("--no-refine", action="store_true",
                       help="Skip post-processing refinement")
    args = parser.parse_args()

    # Import engine (triggers model loading)
    print("Loading models...")
    t0 = time.time()

    sys.path.insert(0, str(Path(__file__).parent / "backend"))
    from engine import ProcessingMode, process_image

    print(f"Models ready in {time.time() - t0:.1f}s")

    # Parse bg color
    bg_color = None
    if args.bg:
        bg = args.bg.lower().strip().lstrip("#")
        if bg == "white":
            bg_color = (255, 255, 255)
        elif bg == "black":
            bg_color = (0, 0, 0)
        elif len(bg) == 6:
            bg_color = (int(bg[0:2], 16), int(bg[2:4], 16), int(bg[4:6], 16))

    mode = ProcessingMode(args.mode)
    from PIL import Image

    input_paths = []
    for pattern in args.inputs:
        p = Path(pattern).expanduser()
        if p.is_file():
            input_paths.append(p)
        elif not p.is_absolute():
            input_paths.extend(Path(".").glob(pattern))

    if not input_paths:
        print("No input files found.")
        sys.exit(1)

    # Determine output
    if len(input_paths) == 1 and args.output and not Path(args.output).is_dir():
        out_paths = [Path(args.output)]
    else:
        out_dir = Path(args.output) if args.output else Path(".")
        out_dir.mkdir(parents=True, exist_ok=True)
        out_paths = [
            out_dir / f"{p.stem}_nobg.{args.format}" for p in input_paths
        ]

    total_time = 0

    for i, (inp, outp) in enumerate(zip(input_paths, out_paths)):
        print(f"\n[{i+1}/{len(input_paths)}] {inp.name}", end=" → ")

        try:
            img = Image.open(inp)
            result = process_image(
                img=img,
                mode=mode,
                bg_color=bg_color,
                refine=not args.no_refine,
                return_alpha=args.alpha,
            )

            if args.alpha:
                out_img = Image.fromarray(result["alpha"], "L")
            else:
                out_img = result["result"]

            # Save
            save_kwargs = {}
            if args.format == "webp":
                save_kwargs = {"quality": 95, "lossless": False}
            elif args.format == "jpg":
                if out_img.mode == "RGBA":
                    bg = Image.new("RGB", out_img.size, (255, 255, 255))
                    bg.paste(out_img, mask=out_img.split()[-1])
                    out_img = bg
                save_kwargs = {"quality": 95}
            else:
                save_kwargs = {"optimize": True}

            out_img.save(outp, **save_kwargs)

            total_time += result["time_ms"]
            print(f"{outp.name} ({result['time_ms']:.0f}ms, {result['mode']}, {'+'.join(result['models'])})")

        except Exception as e:
            print(f"ERROR: {e}")

    print(f"\nDone. {len(input_paths)} images in {total_time/1000:.1f}s total")


if __name__ == "__main__":
    main()
