"""Generate the SEPA payment QR code for the Cadeau page donation.

Encodes an EPC069-12 (GiroCode / "EPC QR") payload. When scanned with a
European banking app, it pre-fills a SEPA credit transfer with the
beneficiary, IBAN and communication below — the guest only confirms the
amount and sends.

The QR shows on the donation card on desktop only (CSS-gated). Keep the
fields below in sync with the copy rows in index.html (#page-cadeau).

Outputs to img/ (overwrites existing files):
- qr-ilot.png  — donation to ASBL Ilot

Run from the repo root: `python scripts/generate-gift-qr.py`
"""
import sys
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_M

sys.stdout.reconfigure(encoding="utf-8")

OUT_DIR = Path(__file__).resolve().parent.parent / "img"

# Donation details — MUST match the copy rows in index.html (#page-cadeau).
BENEFICIARY = "ASBL Ilot"
IBAN = "BE33001728922946"           # BE33 0017 2892 2946, spaces stripped
BIC = "GEBABEBB"                    # bank code 001 → BNP Paribas Fortis
COMMUNICATION = "Elizabeth et Matthieu"

# EPC069-12 payload: 12 newline-separated fields. The BIC and the trailing
# (beneficiary-to-originator) field are included on purpose — stricter
# banking apps (notably some Belgian ones) only pre-fill the communication
# when the BIC is present and the unstructured remittance line (11) is
# properly terminated by a trailing field. This mirrors a known-working
# Belgian donation QR. Amount left blank so the guest chooses.
EPC_PAYLOAD = "\n".join([
    "BCD",                # Service tag
    "002",                # Version
    "1",                  # Character set (1 = UTF-8)
    "SCT",                # SEPA Credit Transfer
    BIC,                  # BIC of the beneficiary bank
    BENEFICIARY,          # Name of beneficiary
    IBAN,                 # IBAN
    "EUR0.00",            # Zero amount — guest enters their own sum
    "",                   # Purpose
    "",                   # Structured remittance reference
    COMMUNICATION,        # Unstructured remittance (communication)
    "",                   # Beneficiary-to-originator info (trailing field)
])

# Site sage — matches --sage-deep CSS variable / the nav QR codes.
SAGE_DEEP = "#4A6B40"


def build(filename: str, payload: str) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,  # 15% — fine for on-screen scanning
        box_size=12,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color=SAGE_DEEP, back_color="white")
    out = OUT_DIR / filename
    img.save(out)
    print(f"  {filename}: {img.size[0]}x{img.size[1]} "
          f"(version {qr.version}, payload len {len(payload)})")


if __name__ == "__main__":
    print("== Regenerating gift (SEPA donation) QR code ==")
    build("qr-ilot.png", EPC_PAYLOAD)
    print("Done.")
