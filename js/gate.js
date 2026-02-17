// ============================================================
// CONFIGURATION
// ============================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYmqNn8PU0vywrCUeoa8LCAXlBWv0Opl2x-g4g-5lXx-Xr-cyQ67jvR8T1dJ11Rkv6/exec';

// ============================================================
// GATE LOGIC (setLang provided by header.js)
// ============================================================
const urlParams = new URLSearchParams(location.search);
const urlCode = (urlParams.get('code') || '').trim();
const storedCode = (localStorage.getItem('inviteCode') || '').trim();
const redirect = urlParams.get('redirect') || 'index.html';

function showLoader() {
  document.getElementById('gateLoader').style.display = '';
  document.getElementById('gateText').style.display = 'none';
  document.querySelector('.gate-icon').style.display = 'none';
}

function hideLoader() {
  document.getElementById('gateLoader').style.display = 'none';
  document.getElementById('gateText').style.display = '';
  document.querySelector('.gate-icon').style.display = '';
}

function goToSite() {
  location.href = redirect;
}

async function validateCode(code) {
  showLoader();
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?code=${encodeURIComponent(code)}`);
    const result = await res.json();
    if (result.status === 'valid') {
      localStorage.setItem('inviteCode', code);
      goToSite();
    } else {
      localStorage.removeItem('inviteCode');
      hideLoader();
    }
  } catch {
    hideLoader();
  }
}

// Main logic
if (urlCode && urlCode !== storedCode) {
  validateCode(urlCode);
} else if (urlCode || storedCode) {
  goToSite();
}
// else: no code → gate screen stays visible
