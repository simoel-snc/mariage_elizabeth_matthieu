"""Generate the wedding-invitation QR codes.

Output (gitignored):
- invite-qr-black.png  — square modules, pure black on white
- invite-qr-blue.png   — square modules, cobalt #2E4F8A on white

Both are tuned for maximum scan reliability when printed very small:
- Error correction H (30%)
- Square modules (no rounding gaps that bleed at small sizes)
- Pure-white background, full-contrast foreground
- 4-module quiet zone (the standard minimum)
- box_size=45 -> ~1500x1500 PNG so the printer has plenty of headroom

The PIN is read from the WEDDING_PIN environment variable (or .pin file
at the repo root) so it stays out of the committed source. Run from the
repo root:

    WEDDING_PIN=XXXX python scripts/generate-qr.py        # bash
    $env:WEDDING_PIN='XXXX'; python scripts/generate-qr.py # PowerShell
"""

import os
import sys
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H

ROOT = Path(__file__).resolve().parent.parent

PIN = os.environ.get("WEDDING_PIN")
if not PIN and (ROOT / ".pin").exists():
    PIN = (ROOT / ".pin").read_text(encoding="utf-8").strip()
if not PIN:
    sys.exit("Set WEDDING_PIN env var or create a .pin file at the repo root "
             "(see SETUP.md). Refusing to embed a placeholder PIN.")

URL = f"https://elizabethetmatthieu.be/?code={PIN}"
OUT_DIR = ROOT
COBALT = "#2E4F8A"


def build(fill_color: str, filename: str) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=45,
        border=4,
    )
    qr.add_data(URL)
    qr.make(fit=True)

    img = qr.make_image(fill_color=fill_color, back_color="white")
    out = OUT_DIR / filename
    img.save(out)
    print(f"{filename}: {img.size[0]}x{img.size[1]} (version {qr.version})")


if __name__ == "__main__":
    build("black", "invite-qr-black.png")
    build(COBALT, "invite-qr-blue.png")
