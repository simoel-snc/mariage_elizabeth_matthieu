// ============================================================
// CONFIGURATION
// ============================================================
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

// ============================================================
// GATE LOGIC (setLang and currentLang provided by header.js)
// ============================================================
const urlParams = new URLSearchParams(location.search);
const urlCode = (urlParams.get('code') || '').trim();
const storedCode = (localStorage.getItem('inviteCode') || '').trim();
const redirect = urlParams.get('redirect') || 'index.html';

const pinBoxes = Array.from(document.querySelectorAll('.pin-box'));
const pinError = document.getElementById('pinError');
const pinForm = document.getElementById('pinForm');

function showLoader() {
  document.getElementById('gateLoader').style.display = '';
  document.getElementById('gateText').style.display = 'none';
  document.querySelector('.gate-icon').style.display = 'none';
  if (pinForm) pinForm.style.display = 'none';
}

function hideLoader() {
  document.getElementById('gateLoader').style.display = 'none';
  document.getElementById('gateText').style.display = '';
  document.querySelector('.gate-icon').style.display = '';
  if (pinForm) pinForm.style.display = '';
}

function goToSite() {
  location.href = redirect;
}

function showPinError(messageKey) {
  const msg = GATE_MSG[messageKey]?.[currentLang] || GATE_MSG[messageKey]?.fr || '';
  pinError.textContent = msg;
  pinError.style.display = '';
  pinBoxes.forEach(b => { b.value = ''; b.classList.add('error'); });
  pinBoxes[0]?.focus();
}

function clearPinError() {
  pinError.style.display = 'none';
  pinBoxes.forEach(b => b.classList.remove('error'));
}

async function validateCode(code) {
  clearPinError();
  showLoader();
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?code=${encodeURIComponent(code)}`);
    const result = await res.json();
    if (result.status === 'valid') {
      localStorage.setItem('inviteCode', code);
      goToSite();
      return;
    }
    localStorage.removeItem('inviteCode');
    hideLoader();
    if (result.status === 'rate_limited') {
      showPinError('rateLimited');
    } else {
      showPinError('invalid');
    }
  } catch {
    hideLoader();
    showPinError('network');
  }
}

// -- PIN input wiring --
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

// -- Main logic --
if (urlCode && urlCode !== storedCode) {
  validateCode(urlCode);
} else if (urlCode || storedCode) {
  goToSite();
} else {
  // No code → show gate with PIN entry; focus first box
  pinBoxes[0]?.focus();
}
