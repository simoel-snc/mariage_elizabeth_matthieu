// ============================================================
// SHARED HEADER COMPONENT
// ============================================================
// Injects the header, language toggle, and provides setLang().
// Each page sets globalThis.PAGE_CONFIG before loading this script.
//
// Config options:
//   pages:  { infos: {fr,nl}, rsvp: {fr,nl} } — page titles (SPA)
//   nav:    boolean — show navigation links (default: false)

const PAGE = globalThis.PAGE_CONFIG || {};

// -- Determine initial page from hash --
function getPageFromHash() {
  const hash = location.hash.replace('#', '');
  return PAGE.pages?.[hash] ? hash : 'infos';
}

let currentPage = getPageFromHash();

// -- Inject language toggle --
const langToggleHTML = `
  <div class="lang-toggle"${PAGE.nav ? ' style="display:none"' : ''}>
    <button class="lang-btn active" onclick="setLang('fr')">FR</button>
    <button class="lang-btn" onclick="setLang('nl')">NL</button>
  </div>
`;
document.body.insertAdjacentHTML('afterbegin', langToggleHTML);

// -- Inject header --
const pageTitleHTML = PAGE.pages
  ? `<p class="page-title" data-fr="${PAGE.pages[currentPage].fr}" data-nl="${PAGE.pages[currentPage].nl}">${PAGE.pages[currentPage].fr}</p>`
  : '';

const navHTML = PAGE.nav
  ? `<nav class="nav">
      <a href="#infos" onclick="navigateTo('infos');return false;" data-fr="Infos" data-nl="Info" data-page="infos">Infos</a>
      <a href="#rsvp" onclick="navigateTo('rsvp');return false;" data-fr="RSVP" data-nl="RSVP" data-page="rsvp">RSVP</a>
    </nav>`
  : '';

const headerHTML = `
  <header class="header"${PAGE.nav ? ' style="display:none"' : ''}>
    <div class="ornament">✦ ✦ ✦</div>
    <h1>Elizabeth et Matthieu</h1>
    ${pageTitleHTML}
    <div class="divider"></div>
    ${navHTML}
  </header>
`;

const headerContainer = document.querySelector('.container') || document.querySelector('.gate-screen');
if (headerContainer) {
  headerContainer.insertAdjacentHTML('beforebegin', headerHTML);
}

// -- SPA navigation --
function navigateTo(page) {
  if (!PAGE.pages?.[page]) return;
  currentPage = page;

  // Switch page sections
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  // Update page title
  const titleEl = document.querySelector('.page-title');
  if (titleEl) {
    titleEl.dataset.fr = PAGE.pages[page].fr;
    titleEl.dataset.nl = PAGE.pages[page].nl;
    titleEl.textContent = PAGE.pages[page][currentLang];
  }

  // Update nav active state
  document.querySelectorAll('.nav a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Update URL hash without triggering popstate
  history.pushState(null, '', `#${page}`);

  // Scroll to top
  globalThis.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle browser back/forward
globalThis.addEventListener('popstate', () => {
  const page = getPageFromHash();
  if (page !== currentPage) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    const titleEl = document.querySelector('.page-title');
    if (titleEl && PAGE.pages) {
      titleEl.dataset.fr = PAGE.pages[page].fr;
      titleEl.dataset.nl = PAGE.pages[page].nl;
      titleEl.textContent = PAGE.pages[page][currentLang];
    }

    document.querySelectorAll('.nav a[data-page]').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  }
});

// Set initial nav active state
document.querySelectorAll('.nav a[data-page]').forEach(a => {
  a.classList.toggle('active', a.dataset.page === currentPage);
});

// Set initial page section
const initialPage = document.getElementById(`page-${currentPage}`);
if (initialPage) {
  initialPage.classList.add('active');
}

// -- Language switching --
let currentLang = localStorage.getItem('lang') || 'fr';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add('active');

  document.querySelectorAll('[data-fr]').forEach(el => {
    el.textContent = el.dataset[lang];
  });

  document.querySelectorAll('[data-ph-fr]').forEach(el => {
    el.placeholder = el.dataset[`ph${lang.charAt(0).toUpperCase()}${lang.slice(1)}`];
  });

  // Call page-specific label update if it exists
  if (typeof updateGuestLabels === 'function') {
    updateGuestLabels();
  }
}

setLang(currentLang);
