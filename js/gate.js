// Apps Script backend (must match rsvp.js — see DEPLOY.md §4).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYmqNn8PU0vywrCUeoa8LCAXlBWv0Opl2x-g4g-5lXx-Xr-cyQ67jvR8T1dJ11Rkv6/exec';

const GATE_MSG = {
  invalid: {
    fr: 'Code incorrect. Veuillez réessayer.',
    nl: 'Onjuiste code. Probeer opnieuw.'
  },
  rateLimited: {
    fr: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
    nl: 'Te veel pogingen. Probeer het over enkele minuten opnieuw.'
  },
  network: {
    fr: 'Erreur de connexion. Vérifiez votre connexion internet.',
    nl: 'Verbindingsfout. Controleer uw internetverbinding.'
  }
};

// currentLang is provided by header.js.
const urlParams = new URLSearchParams(location.search);
const urlCode = (urlParams.get('code') || '').trim();
const storedCode = (localStorage.getItem('inviteCode') || '').trim();

// Same-origin redirect only. Reject anything that resolves to a different
// origin (https://evil.com, //evil.com, javascript:, etc.) so the gate
// can't be turned into a phishing entry point.
const redirect = (() => {
  const raw = urlParams.get('redirect');
  if (!raw) return 'index.html';
  try {
    const url = new URL(raw, location.origin);
    if (url.origin !== location.origin) return 'index.html';
    return url.pathname + url.search + url.hash;
  } catch {
    return 'index.html';
  }
})();

const pinBoxes = Array.from(document.querySelectorAll('.pin-box'));
const pinError = document.getElementById('pinError');
const pinForm = document.getElementById('pinForm');
const pinSubmit = document.getElementById('pinSubmit');

// Re-entry guard so the input auto-submit and the explicit click can't
// both fire while a request is already in-flight.
let submitting = false;

function showLoader() {
  document.getElementById('gateLoader')?.style.setProperty('display', '');
  if (pinSubmit) pinSubmit.disabled = true;
  pinBoxes.forEach(b => { b.disabled = true; });
}

function hideLoader() {
  document.getElementById('gateLoader')?.style.setProperty('display', 'none');
  if (pinSubmit) pinSubmit.disabled = false;
  pinBoxes.forEach(b => { b.disabled = false; });
}

function goToSite() {
  location.href = redirect;
}

function showPinError(messageKey) {
  const entry = GATE_MSG[messageKey];
  if (!entry) return;
  // Stash both translations on the element so the global setLang()
  // (which walks every [data-fr]) re-translates it on language toggle.
  pinError.dataset.fr = entry.fr;
  pinError.dataset.nl = entry.nl;
  pinError.textContent = entry[currentLang] || entry.fr;
  pinError.style.display = '';
  pinBoxes.forEach(b => { b.value = ''; b.classList.add('error'); });
  pinBoxes[0]?.focus();
}

function clearPinError() {
  pinError.style.display = 'none';
  pinBoxes.forEach(b => b.classList.remove('error'));
}

async function validateCode(code) {
  if (submitting) return;
  submitting = true;
  clearPinError();
  showLoader();
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?code=${encodeURIComponent(code)}`);
    const result = await res.json();
    if (result.status === 'valid') {
      localStorage.setItem('inviteCode', code);
      goToSite();
      return;  // submitting stays true on purpose — page is navigating away
    }
    localStorage.removeItem('inviteCode');
    hideLoader();
    submitting = false;
    if (result.status === 'rate_limited') {
      showPinError('rateLimited');
    } else {
      showPinError('invalid');
    }
  } catch {
    hideLoader();
    submitting = false;
    showPinError('network');
  }
}

function readPin() {
  return pinBoxes.map(b => b.value).join('');
}

function submitPin() {
  const code = readPin();
  if (code.length === 4) validateCode(code);
}

pinBoxes.forEach((box, i) => {
  box.addEventListener('input', (e) => {
    // Keep only the last digit typed
    const digit = (e.target.value || '').replaceAll(/\D/g, '').slice(-1);
    e.target.value = digit;
    clearPinError();
    if (digit) {
      if (i < pinBoxes.length - 1) {
        pinBoxes[i + 1].focus();
      } else if (readPin().length === 4) {
        submitPin();
      }
    }
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      pinBoxes[i - 1].focus();
      pinBoxes[i - 1].value = '';
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      pinBoxes[i - 1].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && i < pinBoxes.length - 1) {
      pinBoxes[i + 1].focus();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      submitPin();
      e.preventDefault();
    }
  });

  box.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replaceAll(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    for (let j = 0; j < 4; j++) {
      pinBoxes[j].value = pasted[j] || '';
    }
    clearPinError();
    const next = Math.min(pasted.length, 3);
    pinBoxes[next].focus();
    if (pasted.length === 4) submitPin();
  });
});

pinForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  submitPin();
});

if (urlCode && urlCode !== storedCode) {
  validateCode(urlCode);
} else if (urlCode || storedCode) {
  goToSite();
} else {
  pinBoxes[0]?.focus();
}
