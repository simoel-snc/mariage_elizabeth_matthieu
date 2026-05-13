"""Generate navigation QR codes shown on the info page.

The QR codes appear on hover next to each "Naviguer vers ..." button on
desktop, so guests on a laptop can scan them with their phone instead
of switching apps. URLs MUST stay in sync with the `<a href>` values
in index.html.

Outputs to img/ (overwrites existing files):
- qr-church.png   — directions to Église Saint-Étienne
- qr-parking.png  — directions: church → waypoint → Le Chenoy parking

Run from the repo root: `python scripts/generate-nav-qr.py`
"""
import sys
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_M

sys.stdout.reconfigure(encoding="utf-8")

OUT_DIR = Path(__file__).resolve().parent.parent / "img"

# Keep these URLs identical to the corresponding <a href> values in
# index.html (church + Le Chenoy "Naviguer vers..." buttons).
QRS = {
    "qr-church.png": (
        "https://www.google.com/maps/place//"
        "data=!4m2!3m1!1s0x47c3d58f5ba09869:0xe15385fa60ff5af3"
    ),
    "qr-parking.png": (
        "https://www.google.com/maps/dir/"
        "%C3%89glise+Saint-%C3%89tienne+de+Court-Saint-%C3%89tienne,"
        "+Rue+du+Village+1,+1490+Court-Saint-%C3%89tienne/"
        "50.6284462,4.5923186/"
        "50.6168451,4.5867892/"
    ),
}


# Site sage — matches --sage-deep CSS variable
SAGE_DEEP = "#4A6B40"


def build(filename: str, url: str) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,  # 15% — fine for on-screen scanning
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=SAGE_DEEP, back_color="white")
    out = OUT_DIR / filename
    img.save(out)
    print(f"  {filename}: {img.size[0]}x{img.size[1]} "
          f"(version {qr.version}, url len {len(url)})")


if __name__ == "__main__":
    print("== Regenerating navigation QR codes ==")
    for filename, url in QRS.items():
        build(filename, url)
    print("Done.")
