// ============================================================
// AUTH — shared access check for all content pages
// ============================================================
// Include this script AFTER header.js (which injects .lang-toggle
// and .header) and BEFORE the page-specific script.
// It redirects to gate.html if needed, or reveals the page.

const authPage = location.pathname.split('/').pop() || 'index.html';
const authHash = location.hash;
const authRedirect = authPage + authHash;
const urlCode = new URLSearchParams(location.search).get('code');

if (urlCode && urlCode !== localStorage.getItem('inviteCode')) {
  // New/different code in URL — forward to gate for validation
  location.href = `gate.html?code=${encodeURIComponent(urlCode)}&redirect=${encodeURIComponent(authRedirect)}`;
} else if (!urlCode && !localStorage.getItem('inviteCode')) {
  // No code at all — redirect to gate
  location.href = `gate.html?redirect=${encodeURIComponent(authRedirect)}`;
} else {
  // Valid code in localStorage — show page
  document.querySelector('.lang-toggle').style.display = '';
  document.querySelector('.header').style.display = '';
  document.querySelector('.container').style.display = '';
  document.querySelector('.footer').style.display = '';
}
