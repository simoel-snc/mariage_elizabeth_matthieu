// Copy-to-clipboard for the Cadeau page donation fields (beneficiary, IBAN,
// communication). Each .copy-row carries the raw value in data-copy and calls
// copyField(this) on click. Briefly flips the row to a "Copié / Gekopieerd"
// state so the guest gets feedback.

function copyField(row) {
  const value = row.dataset.copy;
  if (!value) return;

  const done = () => {
    row.classList.add('copied');
    clearTimeout(row._copyTimer);
    row._copyTimer = setTimeout(() => row.classList.remove('copied'), 1600);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(done).catch(() => legacyCopy(value, done));
  } else {
    legacyCopy(value, done);
  }
}

// Fallback for browsers without the async Clipboard API (older Safari).
function legacyCopy(value, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch (_) {
    /* clipboard unavailable — silently no-op */
  }
  ta.remove();
}
