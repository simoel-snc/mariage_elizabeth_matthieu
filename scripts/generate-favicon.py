"""Generate the site favicon + Apple touch icon from the chick illustration.

Reads `img/single_chick.png` and emits two square PNGs centered on a
transparent canvas. The chick is the smallest illustration the user
hand-cropped — already simple enough to read at favicon size.

Outputs (committed):
- img/favicon.png            32x32 — browser tab
- img/apple-touch-icon.png   180x180 — iOS home-screen

Run from the repo root: `python scripts/generate-favicon.py`
"""
import sys
from pathlib import Path

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "img" / "single_chick.png"

# (output filename, square size in px)
OUTPUTS = [
    ("img/favicon.png", 32),
    ("img/apple-touch-icon.png", 180),
]


def render(size: int) -> Image.Image:
    """Center the chick on a transparent square canvas, scaled to fit."""
    chick = Image.open(SRC).convert("RGBA")
    # Leave a little breathing room so the chick doesn't touch the edges.
    target = int(size * 0.86)
    w, h = chick.size
    scale = target / max(w, h)
    chick = chick.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cw, ch = chick.size
    canvas.paste(chick, ((size - cw) // 2, (size - ch) // 2), chick)
    return canvas


def main():
    if not SRC.exists():
        sys.exit(f"Missing source: {SRC}")
    print("== Generating favicon assets ==")
    for rel_path, size in OUTPUTS:
        out = ROOT / rel_path
        render(size).save(out, "PNG", optimize=True)
        kb = out.stat().st_size / 1024
        print(f"  {rel_path}: {size}x{size} ({kb:.1f}KB)")
    print("Done.")


if __name__ == "__main__":
    main()
