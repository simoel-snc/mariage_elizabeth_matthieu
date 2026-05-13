// Shared header component. Pages set globalThis.PAGE_CONFIG before
// loading this script.
//   pages:      { slug: { fr, nl, shortFr?, shortNl? }, ... } — SPA pages
//   nav:        boolean — render navigation links
//   hideHeader: boolean — skip the auto-injected wordmark (e.g. gate.html)

const PAGE = globalThis.PAGE_CONFIG || {};

const SUPPORTED_LANGS = new Set(['fr', 'nl']);
const storedLang = localStorage.getItem('lang');
let currentLang = SUPPORTED_LANGS.has(storedLang) ? storedLang : 'fr';

function getPageFromHash() {
  const hash = location.hash.replace('#', '');
  return PAGE.pages?.[hash] ? hash : 'infos';
}

let currentPage = getPageFromHash();

const langToggleHTML = `
  <div class="lang-toggle"${PAGE.nav ? ' style="display:none"' : ''}>
    <button type="button" class="lang-btn" data-lang="fr" onclick="setLang('fr')">FR</button>
    <button type="button" class="lang-btn" data-lang="nl" onclick="setLang('nl')">NL</button>
  </div>
`;
document.body.insertAdjacentHTML('afterbegin', langToggleHTML);

const pageTitleHTML = PAGE.pages
  ? (() => {
      const p = PAGE.pages[currentPage];
      return `<p class="page-title" data-fr="${p.fr}" data-nl="${p.nl}">${p[currentLang]}</p>`;
    })()
  : '';

// Build nav from PAGE.pages — short labels keep the nav row tight when
// the page-title itself is long (e.g. "Nous nous marions" → "RSVP").
const navHTML = PAGE.nav && PAGE.pages
  ? `<nav class="nav">
      ${Object.entries(PAGE.pages).map(([slug, p]) => {
        const fr = p.shortFr || p.fr;
        const nl = p.shortNl || p.nl;
        const label = currentLang === 'fr' ? fr : nl;
        return `<a href="#${slug}" onclick="navigateTo('${slug}');return false;" data-fr="${fr}" data-nl="${nl}" data-page="${slug}">${label}</a>`;
      }).join('\n      ')}
    </nav>`
  : '';

const headerHTML = `
  <header class="header"${PAGE.nav ? ' style="display:none"' : ''}>
    <picture>
      <source srcset="img/assets/title-elizabeth-matthieu.webp" type="image/webp">
      <img class="wordmark" src="img/assets/title-elizabeth-matthieu.png" alt="Elizabeth & Matthieu" width="780" height="139">
    </picture>
    <picture>
      <source srcset="img/assets/date-29-aout.webp" type="image/webp">
      <img class="wordmark-date" src="img/assets/date-29-aout.png" alt="29 août 2026" width="405" height="104">
    </picture>
    ${pageTitleHTML}
    ${navHTML}
  </header>
`;

if (!PAGE.hideHeader) {
  const host = document.querySelector('.container') || document.querySelector('.gate-screen');
  host?.insertAdjacentHTML('beforebegin', headerHTML);
}

// Show the named page section, refresh the page-title, and sync the nav.
// Used by both navigateTo (click) and the popstate handler (back/forward).
function applyPage(page) {
  currentPage = page;

  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');

  const titleEl = document.querySelector('.page-title');
  const meta = PAGE.pages?.[page];
  if (titleEl && meta) {
    titleEl.dataset.fr = meta.fr;
    titleEl.dataset.nl = meta.nl;
    titleEl.textContent = meta[currentLang];
  }

  document.querySelectorAll('.nav a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function navigateTo(page) {
  if (!PAGE.pages?.[page]) return;
  applyPage(page);
  history.pushState(null, '', `#${page}`);
  globalThis.scrollTo({ top: 0, behavior: 'smooth' });
}

globalThis.addEventListener('popstate', () => {
  const page = getPageFromHash();
  if (page !== currentPage) applyPage(page);
});

applyPage(currentPage);

function setLang(lang) {
  if (!SUPPORTED_LANGS.has(lang)) lang = 'fr';
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  document.querySelectorAll('[data-fr]').forEach(el => {
    el.textContent = el.dataset[lang];
  });

  const phKey = 'ph' + lang.charAt(0).toUpperCase() + lang.slice(1);
  document.querySelectorAll('[data-ph-fr]').forEach(el => {
    el.placeholder = el.dataset[phKey];
  });

  if (typeof updateGuestLabels === 'function') updateGuestLabels();
}

setLang(currentLang);
