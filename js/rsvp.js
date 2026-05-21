// Apps Script backend (must match the deployment in gate.js — see DEPLOY.md §4).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYmqNn8PU0vywrCUeoa8LCAXlBWv0Opl2x-g4g-5lXx-Xr-cyQ67jvR8T1dJ11Rkv6/exec';

const T = {
  fr: {
    guestN: 'Invité',
    namePlaceholder: 'Prénom et nom',
    yes: 'Sera présent(e) ✓',
    no: 'Ne pourra pas venir ✗',
    confirm: 'Présent(e) pour :',
    reception: 'Réception',
    diner: 'Dîner',
    allergies: 'Allergies',
    allergiesPlaceholder: 'Allergies alimentaires, grossesse, intolérances…',
    addGuest: 'Ajouter un invité',
    submit: 'Envoyer la réponse',
    sending: 'Envoi en cours…',
    successMsg: 'Votre réponse a bien été enregistrée. Nous avons hâte de partager ce moment avec vous !',
    errorMsg: 'Une erreur est survenue. Veuillez réessayer.',
    errorName: 'Veuillez renseigner le nom de chaque invité.',
    errorPresence: 'Veuillez indiquer la présence pour chaque invité.',
    errorCode: 'Le code d\'invitation est incorrect. Vérifiez le code sur votre carton d\'invitation.'
  },
  nl: {
    guestN: 'Gast',
    namePlaceholder: 'Voornaam en achternaam',
    yes: 'Zal aanwezig zijn ✓',
    no: 'Kan niet komen ✗',
    confirm: 'Aanwezig voor :',
    reception: 'Receptie',
    diner: 'Diner',
    allergies: 'Allergieën',
    allergiesPlaceholder: 'Voedselallergieën, zwangerschap, intoleranties…',
    addGuest: 'Gast toevoegen',
    submit: 'Antwoord versturen',
    sending: 'Bezig met verzenden…',
    successMsg: 'Uw antwoord is geregistreerd. We kijken ernaar uit om dit moment met u te delen!',
    errorMsg: 'Er is een fout opgetreden. Probeer het opnieuw.',
    errorName: 'Gelieve de naam van elke gast in te vullen.',
    errorPresence: 'Gelieve de aanwezigheid voor elke gast aan te geven.',
    errorCode: 'De uitnodigingscode is onjuist. Controleer de code op uw uitnodigingskaart.'
  }
};

// currentLang and setLang() provided by header.js
let guestCount = 0;

function t(key) {
  return T[currentLang][key] || key;
}

// Translates labels inside dynamically-generated guest cards. Placeholders
// and the add/submit buttons are handled by setLang() via their data-fr/
// data-ph-fr attributes — no need to touch them here.
function updateGuestLabels() {
  document.querySelectorAll('.guest-card').forEach((card, idx) => {
    card.querySelector('.guest-number').textContent = `${t('guestN')} ${idx + 1}`;
    card.querySelector('.label-yes').textContent = t('yes');
    card.querySelector('.label-no').textContent = t('no');
    card.querySelector('.field-label-confirm').textContent = t('confirm');
    card.querySelector('.label-reception .checkbox-text').textContent = t('reception');
    card.querySelector('.label-diner .checkbox-text').textContent = t('diner');
    card.querySelector('.field-label-allergies').textContent = t('allergies');
  });
}

function addGuest() {
  guestCount++;
  const id = guestCount;
  const container = document.getElementById('guestsContainer');

  const checkSvg = `<svg viewBox="0 0 16 16"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg>`;

  const card = document.createElement('div');
  card.className = 'guest-card';
  card.id = `guest-${id}`;
  card.style.animationDelay = '0s';
  card.innerHTML = `
  <div class="guest-card-header">
    <span class="guest-number">${t('guestN')} ${id}</span>
    ${id > 1 ? `<button type="button" class="remove-guest" onclick="removeGuest(${id})" title="Remove">×</button>` : ''}
  </div>

  <div class="field-group">
    <input type="text" class="text-input name-input" maxlength="100" placeholder="${t('namePlaceholder')}"
           data-ph-fr="${T.fr.namePlaceholder}" data-ph-nl="${T.nl.namePlaceholder}">
  </div>

  <div class="field-group">
    <div class="presence-toggle">
      <div class="presence-option">
        <input type="radio" name="presence-${id}" id="present-yes-${id}" value="yes" onchange="toggleConditional(${id})">
        <label for="present-yes-${id}" class="presence-label yes label-yes">${t('yes')}</label>
      </div>
      <div class="presence-option">
        <input type="radio" name="presence-${id}" id="present-no-${id}" value="no" onchange="toggleConditional(${id})">
        <label for="present-no-${id}" class="presence-label no label-no">${t('no')}</label>
      </div>
    </div>
  </div>

  <!-- Conditional fields (shown when present) -->
  <div class="conditional-fields" id="conditional-${id}">

    <!-- Confirm reception & diner -->
    <div class="field-group">
      <label class="field-label field-label-confirm">${t('confirm')}</label>
      <div class="checkbox-grid">
        <div class="checkbox-item">
          <input type="checkbox" id="reception-${id}">
          <label for="reception-${id}" class="checkbox-label label-reception">
            <span class="check-box">${checkSvg}</span>
            <span class="checkbox-text">${t('reception')}</span>
          </label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="diner-${id}">
          <label for="diner-${id}" class="checkbox-label label-diner">
            <span class="check-box">${checkSvg}</span>
            <span class="checkbox-text">${t('diner')}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Allergies -->
    <div class="field-group">
      <label class="field-label field-label-allergies">${t('allergies')}</label>
      <input type="text" class="text-input allergies-input" maxlength="300" placeholder="${t('allergiesPlaceholder')}"
             data-ph-fr="${T.fr.allergiesPlaceholder}" data-ph-nl="${T.nl.allergiesPlaceholder}">
    </div>
  </div>
`;

  container.appendChild(card);
  renumberGuests();
}

function removeGuest(id) {
  const card = document.getElementById(`guest-${id}`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-10px)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      card.remove();
      renumberGuests();
    }, 300);
  }
}

function renumberGuests() {
  document.querySelectorAll('.guest-card').forEach((card, idx) => {
    card.querySelector('.guest-number').textContent = `${t('guestN')} ${idx + 1}`;
  });
}

function toggleConditional(id) {
  const yesChecked = document.getElementById(`present-yes-${id}`).checked;
  const conditional = document.getElementById(`conditional-${id}`);
  if (yesChecked) {
    conditional.classList.add('visible');
  } else {
    conditional.classList.remove('visible');
  }
}


async function submitForm() {
  const btn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('statusMessage');
  statusEl.className = 'status-message';
  statusEl.style.display = 'none';

  // Bot trap — honeypot filled OR submitted suspiciously fast. Silently
  // pretend success so the bot doesn't learn what tripped it.
  const isBot = document.getElementById('honeypot').value
    || Date.now() - formLoadedAt < MIN_FORM_DURATION_MS;
  if (isBot) {
    document.querySelector('.form-section').style.display = 'none';
    document.querySelector('.intro')?.style.setProperty('display', 'none');
    document.getElementById('thankYou').classList.add('visible');
    return;
  }

  const inviteCode = document.getElementById('inviteCode').value.trim();

  const guests = [];
  let errorMsg = '';

  for (const card of document.querySelectorAll('.guest-card')) {
    const name = card.querySelector('.name-input').value.trim();
    if (!name) { errorMsg = t('errorName'); break; }

    const cardId = card.id.split('-')[1];
    const yesEl = document.getElementById(`present-yes-${cardId}`);
    const noEl = document.getElementById(`present-no-${cardId}`);
    if (!yesEl.checked && !noEl.checked) { errorMsg = t('errorPresence'); break; }

    const present = yesEl.checked;
    guests.push({
      name,
      present,
      reception: present && document.getElementById(`reception-${cardId}`).checked,
      diner:     present && document.getElementById(`diner-${cardId}`).checked,
      allergies: present ? card.querySelector('.allergies-input').value.trim() : '',
      language: currentLang,
      submittedAt: new Date().toISOString()
    });
  }

  if (errorMsg) {
    statusEl.className = 'status-message error';
    statusEl.textContent = errorMsg;
    statusEl.style.display = 'block';
    return;
  }

  // Send data
  btn.disabled = true;
  btn.querySelector('span').textContent = t('sending');

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ guests, code: inviteCode })
    });

    const result = await response.json();

    if (result.status === 'invalid_code') {
      statusEl.className = 'status-message error';
      statusEl.textContent = t('errorCode');
      statusEl.style.display = 'block';
      btn.disabled = false;
      btn.querySelector('span').textContent = t('submit');
      return;
    }

    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown error');
    }

    // Show success
    document.querySelector('.form-section').style.display = 'none';
    document.querySelector('.intro')?.style.setProperty('display', 'none');
    document.getElementById('thankYou').classList.add('visible');

  } catch (err) {
    console.error('RSVP submission failed:', err);
    statusEl.className = 'status-message error';
    statusEl.textContent = t('errorMsg');
    statusEl.style.display = 'block';
    btn.disabled = false;
    btn.querySelector('span').textContent = t('submit');
  }
}

// Used by the bot-trap below: a real guest takes at least a few seconds
// to read the form and start typing. Scripts that POST immediately fail
// this threshold.
const formLoadedAt = Date.now();
const MIN_FORM_DURATION_MS = 1500;

// Bonus mini-game shown on the thank-you screen. Frontend-only by design.
//
// Flow:
//   - Correct → caption + celebratory media + confetti, form hides
//   - Wrong attempts 1-3 → next Kaamelott reaction gif, life fades,
//     button text escalates, form stays open
//   - Wrong attempt 4 (last gif) → that gif + reveal caption together,
//     form hides. Total clicks max = 4, no dead "5th click to reveal".
const BONUS_ANSWER = 11;
const BONUS_WRONG_GIFS = [
  'https://kaamelott-gifboard.fr/gifs/pas-des-fleches-hein.gif',
  'https://kaamelott-gifboard.fr/gifs/mais-absolument-pas.gif',
  'https://kaamelott-gifboard.fr/gifs/non.gif',
  'https://kaamelott-gifboard.fr/gifs/debile-toujours-inattendu.gif'
];
// Celebratory clip — YouTube embed via the privacy-enhanced nocookie
// domain. To trim to a specific window, append &start=NN&end=NN to
// the src URL (seconds). Loop quirk: YouTube requires both loop=1 AND
// playlist=<same id> for autoplay-loop to work.
const BONUS_CORRECT_YT_ID = 'Hqfsukw9S6Y';
const BONUS_CORRECT_YT_SRC =
  `https://www.youtube-nocookie.com/embed/${BONUS_CORRECT_YT_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${BONUS_CORRECT_YT_ID}` +
  `&modestbranding=1&rel=0&playsinline=1`;

// Wrong-attempt captions vary per attempt for personality. Index = which
// wrong it is (0-based). Last entry doubles as the reveal caption — it
// fires together with the 4th gif and gives the answer away.
const BONUS_WRONG_CAPTIONS = [
  { fr: 'Pas tout à fait…',                       nl: 'Niet helemaal…' },
  { fr: 'Mais non, voyons !',                     nl: 'Maar nee, kom op!' },
  { fr: 'Toujours pas…',                          nl: 'Nog steeds niet…' },
  { fr: `Et hop, c'était ${BONUS_ANSWER} ! 🐣`,   nl: `En hop, het was ${BONUS_ANSWER}! 🐣` }
];
const BONUS_CORRECT_CAPTION = {
  fr: `Bingo ! Toutes les ${BONUS_ANSWER} trouvées 🎉`,
  nl: `Bingo! Alle ${BONUS_ANSWER} gevonden 🎉`
};

// Submit-button label per attempt count (0 = first try). Last entry
// reused if it ever goes higher (it shouldn't, since 4th wrong ends).
const BONUS_BUTTON_LABELS = [
  { fr: 'Je tente !',         nl: 'Ik probeer!' },
  { fr: 'Encore !',           nl: 'Nog eens!' },
  { fr: 'Toujours pas…',      nl: 'Nog steeds niet…' },
  { fr: 'Dernière chance !',  nl: 'Laatste kans!' }
];

const CONFETTI_COLORS = ['#6F9460', '#3F5F92', '#BED8A9', '#E8C766', '#A87D4F'];

let bonusWrongCount = 0;

function showBonusResult(mediaHtml, captionFr, captionNl) {
  const result = document.getElementById('bonusResult');
  const text = currentLang === 'nl' ? captionNl : captionFr;
  result.innerHTML = `
    ${mediaHtml}
    <p class="bonus-caption" data-fr="${captionFr}" data-nl="${captionNl}">${text}</p>
  `;
  result.hidden = false;
}

// Updates BOTH the text label and the chicken row so the meaning of the
// chickens is unambiguous (they represent the number on the label).
function updateBonusLives() {
  document.querySelectorAll('#bonusLives .life').forEach((el, i) => {
    el.classList.toggle('used', i < bonusWrongCount);
  });

  const label = document.getElementById('bonusLivesLabel');
  if (!label) return;
  const remaining = Math.max(0, BONUS_WRONG_GIFS.length - bonusWrongCount);
  let fr;
  let nl;
  if (remaining === 1) {
    fr = 'Dernière tentative !';
    nl = 'Laatste poging!';
    label.classList.add('urgent');
  } else {
    fr = `Tentatives restantes : ${remaining}`;
    nl = `Pogingen over: ${remaining}`;
    label.classList.toggle('urgent', remaining === 0);
  }
  label.dataset.fr = fr;
  label.dataset.nl = nl;
  label.textContent = currentLang === 'nl' ? nl : fr;
}

function escalateBonusButton() {
  const btn = document.querySelector('.bonus-submit');
  if (!btn) return;
  const idx = Math.min(bonusWrongCount, BONUS_BUTTON_LABELS.length - 1);
  const { fr, nl } = BONUS_BUTTON_LABELS[idx];
  btn.dataset.fr = fr;
  btn.dataset.nl = nl;
  btn.textContent = currentLang === 'nl' ? nl : fr;
}

// Center-burst confetti. Each particle gets random direction/rotation/
// duration via inline custom properties consumed by the CSS keyframes.
function fireConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  for (let i = 0; i < 90; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    p.style.left = (28 + Math.random() * 44) + '%';
    p.style.setProperty('--dx', (Math.random() - 0.5) * 900 + 'px');
    p.style.setProperty('--dy', (220 + Math.random() * 500) + 'px');
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    p.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
    p.style.animationDelay = (Math.random() * 0.25) + 's';
    container.appendChild(p);
  }

  setTimeout(() => container.remove(), 4500);
}

function submitBonus(e) {
  e.preventDefault();
  const input = document.getElementById('bonusInput');
  const guess = Number(input.value);
  const form = document.getElementById('bonusForm');

  // Reusable celebratory media — YouTube iframe (16:9 aspect handled in CSS).
  const correctMedia = `<iframe class="bonus-video-iframe"
    src="${BONUS_CORRECT_YT_SRC}"
    title="Celebration"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

  if (guess === BONUS_ANSWER) {
    showBonusResult(correctMedia, BONUS_CORRECT_CAPTION.fr, BONUS_CORRECT_CAPTION.nl);
    form.hidden = true;
    fireConfetti();
    return false;
  }

  // Wrong attempt — show next gif. Last gif AND reveal happen together.
  const gif = BONUS_WRONG_GIFS[bonusWrongCount];
  const isLast = bonusWrongCount === BONUS_WRONG_GIFS.length - 1;
  const caption = BONUS_WRONG_CAPTIONS[bonusWrongCount];
  bonusWrongCount++;
  updateBonusLives();
  showBonusResult(
    `<img class="bonus-media" src="${gif}" alt="" onerror="this.style.display='none'">`,
    caption.fr, caption.nl
  );

  if (isLast) {
    form.hidden = true;          // game over — reveal already shown via caption
  } else {
    escalateBonusButton();
    input.select();
  }
  return false;
}

document.getElementById('inviteCode').value = localStorage.getItem('inviteCode') || '';
addGuest();

// Test shortcut — visit ?test=bonus to skip the form and go straight to
// the thank-you screen with the bonus game ready (no submission).
if (new URLSearchParams(location.search).get('test') === 'bonus') {
  if (typeof navigateTo === 'function') navigateTo('rsvp');
  document.querySelector('.form-section')?.style.setProperty('display', 'none');
  document.getElementById('thankYou')?.classList.add('visible');
}

