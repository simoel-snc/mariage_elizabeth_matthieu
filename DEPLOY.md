# Deployment invariants

The QR code on the wedding invitations encodes:

```
https://elizabethetmatthieu.be/?code=2908
```

It will keep working **only as long as all six invariants below remain true**.
Breaking any one of them invalidates every printed QR.

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

`INVITE_CODE` in `google-apps-script.js` must stay `'2908'`. Changing it
breaks every printed QR code. A banner comment in that file flags this.

## 6. Routing unchanged

`?code=XXXX` on any page is handled by:

`js/auth.js` → redirects to `gate.html` → `js/gate.js` validates with the
Apps Script backend → stores code in `localStorage` → redirects back to
the original page.

Don't refactor this flow without regenerating QR codes.

---

## Regenerating the QR code

If invariants 1–4 change in a way that forces a new URL, regenerate the
QR with:

```bash
curl -o invite-qr.png "https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&data=<new-url-encoded>"
```

The file is gitignored — it lives locally and is embedded in the physical
invitation design only.
