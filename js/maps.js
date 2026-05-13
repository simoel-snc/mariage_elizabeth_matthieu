// On mobile, intercepts clicks on .info-link[data-href-google] and shows
// a chooser for Google Maps / Apple Maps (iOS only) / Waze. On desktop
// browsers the default href falls through (always Google Maps).

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/i.test(navigator.userAgent);
const isMobileNav = isIOS || isAndroid;

const CHOOSER_LABELS = {
  title:  { fr: 'Ouvrir avec',  nl: 'Openen met' },
  cancel: { fr: 'Annuler',      nl: 'Annuleren' },
};

function collectApps(link) {
  const apps = [];
  const google = link.dataset.hrefGoogle || link.href;
  if (google) apps.push({ name: 'Google Maps', url: google, icon: 'G' });
  if (isIOS && link.dataset.hrefApple) {
    apps.push({ name: 'Apple Maps', url: link.dataset.hrefApple, icon: 'A' });
  }
  if (link.dataset.hrefWaze) {
    apps.push({ name: 'Waze', url: link.dataset.hrefWaze, icon: 'W' });
  }
  return apps;
}

function showChooser(apps) {
  document.querySelector('.map-chooser')?.remove();

  const lng = typeof currentLang === 'string' ? currentLang : 'fr';
  const optionsHTML = apps.map(app => `
    <a class="map-chooser-option" href="${app.url}" target="_blank" rel="noopener">
      <span class="map-chooser-option-icon" aria-hidden="true">${app.icon}</span>
      <span class="map-chooser-option-name">${app.name}</span>
    </a>
  `).join('');

  const overlay = document.createElement('div');
  overlay.className = 'map-chooser';
  overlay.innerHTML = `
    <div class="map-chooser-sheet" role="dialog" aria-label="${CHOOSER_LABELS.title[lng]}">
      <p class="map-chooser-title">${CHOOSER_LABELS.title[lng]}</p>
      ${optionsHTML}
      <button class="map-chooser-cancel" type="button">${CHOOSER_LABELS.cancel[lng]}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };

  overlay.querySelector('.map-chooser-cancel').addEventListener('click', close);
  overlay.querySelectorAll('.map-chooser-option').forEach(opt => {
    opt.addEventListener('click', () => setTimeout(close, 120));
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
}

document.querySelectorAll('.info-link[data-href-google]').forEach(link => {
  link.addEventListener('click', (e) => {
    if (!isMobileNav) return;            // desktop: always Google Maps
    const apps = collectApps(link);
    if (apps.length <= 1) return;        // only one option — let default fire
    e.preventDefault();
    showChooser(apps);
  });
});
