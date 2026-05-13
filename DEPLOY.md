# Deployment invariants

The QR code on the wedding invitations encodes a URL of the form:

```
https://elizabethetmatthieu.be/?code=<PIN>
```

The actual PIN is stored in `SETUP.md` (gitignored) and in
`google-apps-script.js`. **Do not commit it.**

The QR will keep working **only as long as all six invariants below remain
true**. Breaking any one of them invalidates every printed QR.

## 1. Domain registered

`elizabethetmatthieu.be` must stay registered at behostings.
Current expiry: **24/04/2027**. Auto-renewal is enabled.

## 2. DNS records intact

At the behostings DNS zone editor, these records must remain:

| Type  | Host | Value                                                |
|-------|------|------------------------------------------------------|
| A     | @    | 185.199.108.153                                      |
| A     | @    | 185.199.109.153                                      |
| A     | @    | 185.199.110.153                                      |
| A     | @    | 185.199.111.153                                      |
| CNAME | www  | simoel-snc.github.io.                                |

Nameservers stay as default (`ns1.behostings.net` / `ns2.behostings.net`).

## 3. Repo deployed

- `main` branch pushed to GitHub.
- GitHub Pages enabled (Settings → Pages → Source: `main` / `/`).
- `CNAME` file at repo root contains exactly `elizabethetmatthieu.be`.
- "Enforce HTTPS" ticked.

## 4. Apps Script URL unchanged

The frontend calls a fixed Apps Script URL (hardcoded in `js/gate.js` and
`js/rsvp.js`). To update the backend code, **always redeploy in place**:

> Apps Script editor → **Deploy** → **Manage deployments** → select the
> existing deployment → click the pencil (**Edit**) → **Version: New
> version** → **Deploy**.

⚠ **NEVER click "New deployment"** — that generates a brand-new URL and
breaks the QR's auto-validation until the frontend is updated *and*
redeployed to GitHub Pages.

## 5. PIN unchanged

`INVITE_CODE` in `google-apps-script.js` must match the value stamped on
every printed QR code. Changing it invalidates them all. A banner comment
in that file flags this. The PIN itself lives in `SETUP.md` (gitignored)
— don't paste it into any committed file.

## 6. Routing unchanged

`?code=XXXX` on any page is handled by:

`js/auth.js` → redirects to `gate.html` → `js/gate.js` validates with the
Apps Script backend → stores code in `localStorage` → redirects back to
the original page.

Don't refactor this flow without regenerating QR codes.

---

## Regenerating the QR code

If invariants 1–4 change in a way that forces a new URL, edit `URL` in
`scripts/generate-qr.py` and run:

```bash
pip install qrcode[pil]
python scripts/generate-qr.py
```

That writes two PNGs at the repo root:

- `invite-qr-black.png` — pure black on white
- `invite-qr-blue.png` — cobalt `#2E4F8A` on white

Both use square modules, ECC H (30%), a 4-module quiet zone, and
`box_size=45` (≈2025×2025 px) — tuned for maximum scan reliability when
printed very small. The PNGs are gitignored; they live locally and are
embedded in the physical invitation design only.

## Regenerating the navigation QR codes

`img/qr-church.png` and `img/qr-parking.png` appear on hover next to the
"Naviguer vers ..." buttons on the info page (so a guest on a laptop
can scan and continue navigation on their phone). The encoded URLs MUST
match the corresponding `<a href>` values in `index.html` exactly.

If you change either map URL, also update `QRS` in
`scripts/generate-nav-qr.py` and run:

```bash
python scripts/generate-nav-qr.py
```

ECC M (15%) — fine for on-screen scanning. Outputs are committed to
`img/`.

## Regenerating site illustrations

`img/assets/*.{png,webp}` are checked-in build outputs of
`scripts/convert_user_crops.py`, which reads the hand-cropped sources
in `img/` and resizes each to the slug referenced by HTML/CSS. There's
no build step on Pages, so when you add or re-crop a source illustration:

```bash
python scripts/convert_user_crops.py
```

Then commit the updated `img/assets/`. To add a new illustration, append
a `(source, slug, max_long_edge)` row to `ASSETS` first.
