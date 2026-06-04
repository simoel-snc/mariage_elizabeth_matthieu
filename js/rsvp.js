// Apps Script backend (must match the deployment in gate.js — see DEPLOY.md §4).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYmqNn8PU0vywrCUeoa8LCAXlBWv0Opl2x-g4g-5lXx-Xr-cyQ67jvR8T1dJ11Rkv6/exec';

const T = {
  fr: {
    namePlaceholder: 'Prénom et nom',
    yes: 'Sera présent',
    no: 'Ne sera pas présent',
    confirm: 'pour :',
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
    errorEmail: 'Veuillez indiquer une adresse mail valide.',
    errorCode: 'Le code d\'invitation est incorrect. Vérifiez le code sur votre carton d\'invitation.'
  },
  nl: {
    namePlaceholder: 'Voornaam en achternaam',
    yes: 'Zal aanwezig zijn',
    no: 'Zal niet aanwezig zijn',
    confirm: 'voor :',
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
    errorEmail: 'Gelieve een geldig e-mailadres in te voeren.',
    errorCode: 'De uitnodigingscode is onjuist. Controleer de code op uw uitnodiging.'
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
  document.querySelectorAll('.guest-card').forEach((card) => {
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
  // Top row: name input on the left, an aside on the right holding either the
  // perched chicken (first, un-removable card) or the remove button (others).
  // Both variants share the row so every card is laid out — and sized — alike.
  const aside = id > 1
    ? `<button type="button" class="remove-guest" onclick="removeGuest(${id})" title="Remove">×</button>`
    : `<span class="guest-chicken" aria-hidden="true">
        <picture>
          <source srcset="img/assets/chicken-3-fence.webp" type="image/webp">
          <img src="img/assets/chicken-3-fence.png" alt="" width="406" height="465">
        </picture>
      </span>`;

  card.innerHTML = `
  <div class="guest-top">
    <div class="field-group name-field">
      <input type="text" class="text-input name-input" maxlength="100" placeholder="${t('namePlaceholder')}"
             data-ph-fr="${T.fr.namePlaceholder}" data-ph-nl="${T.nl.namePlaceholder}">
    </div>
    <div class="guest-aside">${aside}</div>
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
}

function removeGuest(id) {
  const card = document.getElementById(`guest-${id}`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-10px)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      card.remove();
    }, 300);
  }
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


// Swap the rsvp page into its thank-you state. Shared by the real-success
// path, the bot-trap path, and the reload-restore path so the DOM ends up
// identical regardless of how the user got here.
function showThankYouScreen() {
  document.querySelector('.form-section').style.display = 'none';
  document.querySelector('.intro')?.style.setProperty('display', 'none');
  document.getElementById('thankYou').classList.add('visible');
}

// Backend rejection statuses → translation key for the message to show.
const SUBMIT_ERROR_KEYS = {
  invalid_code: 'errorCode',
  invalid_email: 'errorEmail'
};

function showFormError(message) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.className = 'status-message error';
  statusEl.textContent = message;
  statusEl.style.display = 'block';
}

// Read each guest card into a plain object. Returns { guests, errorMsg } —
// errorMsg is the first validation failure (empty name / missing presence),
// or '' when every card is valid.
function collectGuests() {
  const guests = [];
  for (const card of document.querySelectorAll('.guest-card')) {
    const name = card.querySelector('.name-input').value.trim();
    if (!name) return { guests, errorMsg: t('errorName') };

    const cardId = card.id.split('-')[1];
    const yesEl = document.getElementById(`present-yes-${cardId}`);
    const noEl = document.getElementById(`present-no-${cardId}`);
    if (!yesEl.checked && !noEl.checked) return { guests, errorMsg: t('errorPresence') };

    const present = yesEl.checked;
    guests.push({
      name,
      present,
      reception: present && document.getElementById(`reception-${cardId}`).checked,
      diner: present && document.getElementById(`diner-${cardId}`).checked,
      allergies: present ? card.querySelector('.allergies-input').value.trim() : '',
      language: currentLang,
      submittedAt: new Date().toISOString()
    });
  }
  return { guests, errorMsg: '' };
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
    localStorage.setItem('rsvpSubmittedAt', new Date().toISOString());
    showThankYouScreen();
    return;
  }

  const inviteCode = document.getElementById('inviteCode').value.trim();
  const { guests, errorMsg: guestError } = collectGuests();

  // One email per RSVP — required, and used to send the confirmation summary.
  const email = document.getElementById('contactEmail').value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const errorMsg = guestError || (emailOk ? '' : t('errorEmail'));

  if (errorMsg) {
    showFormError(errorMsg);
    return;
  }

  // Send data
  btn.disabled = true;
  btn.querySelector('span').textContent = t('sending');

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ guests, code: inviteCode, email })
    });

    const result = await response.json();

    // Known backend rejections (bad code / bad email): show the message and
    // let the guest fix it.
    const errKey = SUBMIT_ERROR_KEYS[result.status];
    if (errKey) {
      showFormError(t(errKey));
      btn.disabled = false;
      btn.querySelector('span').textContent = t('submit');
      return;
    }

    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown error');
    }

    // Show success
    localStorage.setItem('rsvpSubmittedAt', new Date().toISOString());
    showThankYouScreen();

  } catch (err) {
    console.error('RSVP submission failed:', err);
    showFormError(t('errorMsg'));
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
// domain. NOT autoplayed on purpose: guests press play themselves, which
// means it starts with sound (browsers force muted on autoplay). YouTube
// shows its poster + play button until then. To trim to a specific window,
// append &start=NN&end=NN to the src URL (seconds). Loop quirk: YouTube
// requires both loop=1 AND playlist=<same id> for the loop to work.
const BONUS_CORRECT_YT_ID = 'Hqfsukw9S6Y';
const BONUS_CORRECT_YT_SRC =
  `https://www.youtube-nocookie.com/embed/${BONUS_CORRECT_YT_ID}` +
  `?loop=1&playlist=${BONUS_CORRECT_YT_ID}` +
  `&modestbranding=1&rel=0&playsinline=1`;
// Same video markup reused for the win flow and the post-loss reveal.
const BONUS_VIDEO_HTML = `<iframe class="bonus-video-iframe"
  src="${BONUS_CORRECT_YT_SRC}"
  title="Bonus video"
  allow="autoplay; encrypted-media; picture-in-picture"
  allowfullscreen
  referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

// Outcome copy shown when the bonus ends — either by winning (celebration)
// or by clicking "voir la bonne réponse" after 4 wrong guesses (consolation).
// Same shape so they share the same renderer.
const BONUS_CELEBRATION = {
  titleFr: 'FÉLICITATIONS !',
  titleNl: 'GEFELICITEERD !',
  introFr: "Vous venez d'éviter de devoir nous interpréter la chanson suivante le jour J !",
  introNl: 'U hebt nipt vermeden het onderstaande lied te moeten uitvoeren op de grote dag !'
};
const BONUS_REVEAL = {
  titleFr: 'QUELLE DÉCEPTION…',
  titleNl: 'WAT EEN TELEURSTELLING...',
  subtitleFr: `La bonne réponse était ${BONUS_ANSWER}`,
  subtitleNl: `Het juiste antwoord was ${BONUS_ANSWER}`,
  introFr: 'Pour remonter dans notre estime, vous serez gentil de nous interpréter la chanson suivante le jour J … ou pas 😄',
  introNl: 'Om het goed te maken, zou u zo vriendelijk zijn het onderstaande lied uit te voeren op de grote dag … of toch niet 😄'
};

// Submit-button label per attempt count (0 = first try). Last entry
// reused if it ever goes higher (it shouldn't, since 4th wrong ends).
const BONUS_BUTTON_LABELS = [
  { fr: 'Je tente !', nl: 'Ik probeer!' },
  { fr: 'Encore !', nl: 'Nog eens!' },
  { fr: 'Toujours pas…', nl: 'Nog steeds niet…' },
  { fr: 'Dernière chance !', nl: 'Laatste kans!' }
];

const CONFETTI_COLORS = ['#6F9460', '#3F5F92', '#BED8A9', '#E8C766', '#A87D4F'];

// Mirrors of the in-memory game state — persisted so a reload after
// submission doesn't hand a fresh 4-attempt board back to the guest.
// outcome: 'pending' | 'win' | 'loss'.
let bonusWrongCount = 0;
let bonusGuesses = [];

function saveBonusState(outcome) {
  localStorage.setItem(
    'bonusState',
    JSON.stringify({ guesses: bonusGuesses, outcome })
  );
}

function loadBonusState() {
  try {
    const raw = localStorage.getItem('bonusState');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.guesses)) return null;
    return s;
  } catch {
    return null;
  }
}

function showBonusResult(mediaHtml) {
  const result = document.getElementById('bonusResult');
  result.innerHTML = mediaHtml;
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
    nl = `Resterende pogingen: ${remaining}`;
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

  if (guess === BONUS_ANSWER) {
    form.hidden = true;
    saveBonusState('win');
    showBonusOutcome(BONUS_CELEBRATION);
    fireConfetti();
    return false;
  }

  // Wrong attempt — show next gif. After the 4th gif the form hides.
  const gif = BONUS_WRONG_GIFS[bonusWrongCount];
  const isLast = bonusWrongCount === BONUS_WRONG_GIFS.length - 1;
  // Stamp the guess onto the chicken about to be marked used — guests
  // can glance at the row and remember what they've already tried.
  const lives = document.querySelectorAll('#bonusLives .life');
  if (lives[bonusWrongCount]) lives[bonusWrongCount].dataset.guess = String(guess);
  bonusWrongCount++;
  bonusGuesses.push(guess);
  updateBonusLives();
  showBonusResult(
    `<img class="bonus-media" src="${gif}" alt="" onerror="this.style.display='none'">`
  );

  if (isLast) {
    form.hidden = true;
    saveBonusState('loss');
    document.getElementById('bonusReveal').hidden = false;
  } else {
    saveBonusState('pending');
    escalateBonusButton();
    // Blur (not select) — on mobile, keeping focus pops the soft keyboard
    // straight back up and hides the gif, which is the whole punchline.
    input.blur();
  }

  // Pull the gif AND the call-to-action below into view. Scrolling the
  // CTA (form on retry, reveal button on game-over) into the bottom of
  // the viewport leaves the gif visible above it.
  const scrollTarget = isLast
    ? document.getElementById('bonusReveal')
    : document.getElementById('bonusForm');
  scrollBonusIntoView(scrollTarget);
  return false;
}

// Scroll the bonus CTA to the bottom of the viewport AFTER the mobile soft
// keyboard finishes collapsing. The old fixed 80ms timeout was unreliable:
// it often fired while the keyboard was still animating away, so the scroll
// computed against a shrunken viewport and stopped short of the gif. Instead
// we wait for the visualViewport resize that the collapse triggers, with a
// timeout fallback for desktop / already-closed-keyboard cases.
function scrollBonusIntoView(target) {
  const doScroll = () =>
    target.scrollIntoView({ behavior: 'smooth', block: 'end' });
  const vv = globalThis.visualViewport;
  if (!vv) { setTimeout(doScroll, 80); return; }
  let done = false;
  const fire = () => {
    if (done) return;
    done = true;
    vv.removeEventListener('resize', fire);
    doScroll();
  };
  vv.addEventListener('resize', fire);   // keyboard finished collapsing
  setTimeout(fire, 350);                  // fallback: no resize fired
}

function revealBonusAnswer() {
  document.getElementById('bonusReveal').hidden = true;
  showBonusOutcome(BONUS_REVEAL);
}

// Swap the thank-you card into an outcome framing — same DOM choreography
// for the win (BONUS_CELEBRATION) and the post-loss reveal (BONUS_REVEAL).
// Hides the chicken / "Merci !" / question / lives, mutates the h2 to the
// outcome title, renders an optional subtitle + the intro paragraph + the
// bonus video.
function showBonusOutcome(copy) {
  document.querySelector('.thank-illustration')?.setAttribute('hidden', '');
  const h2 = document.querySelector('.thank-you h2');
  if (h2) {
    h2.dataset.fr = copy.titleFr;
    h2.dataset.nl = copy.titleNl;
    h2.textContent = currentLang === 'nl' ? copy.titleNl : copy.titleFr;
  }
  document.querySelector('.bonus-question')?.setAttribute('hidden', '');
  document.getElementById('bonusLives')?.setAttribute('hidden', '');

  const children = [];
  if (copy.subtitleFr) {
    const subtitle = document.createElement('p');
    subtitle.className = 'bonus-outcome-subtitle';
    subtitle.dataset.fr = copy.subtitleFr;
    subtitle.dataset.nl = copy.subtitleNl;
    subtitle.textContent = currentLang === 'nl' ? copy.subtitleNl : copy.subtitleFr;
    children.push(subtitle);
  }
  const intro = document.createElement('p');
  intro.className = 'bonus-outcome-intro';
  intro.dataset.fr = copy.introFr;
  intro.dataset.nl = copy.introNl;
  intro.textContent = currentLang === 'nl' ? copy.introNl : copy.introFr;
  children.push(intro);

  const result = document.getElementById('bonusResult');
  result.replaceChildren(...children);
  result.insertAdjacentHTML('beforeend', BONUS_VIDEO_HTML);

  // Finish action — closes the bonus game and returns to the Informations
  // home page. Also wipes the submission flags so a later visit to the RSVP
  // tab shows a clean form rather than this end-game screen.
  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'bonus-back';
  done.dataset.fr = 'Terminer';
  done.dataset.nl = 'Voltooien';
  done.textContent = currentLang === 'nl' ? done.dataset.nl : done.dataset.fr;
  done.addEventListener('click', finishBonus);
  result.appendChild(done);

  result.hidden = false;
}

// Clears every trace of the previous RSVP from localStorage and reloads
// onto the Informations home page. Clearing the flags means the next load
// re-renders a clean RSVP form (restoreSubmittedState becomes a no-op); a
// full reload is simpler — and less buggy — than manually unwinding the
// mutated thank-you DOM (h2 text, hidden illustration, hidden question, etc).
function finishBonus() {
  localStorage.removeItem('rsvpSubmittedAt');
  localStorage.removeItem('bonusState');
  // Open Informations scrolled to the top after the reload. Without this the
  // browser restores the end-game scroll position (the guest was near the
  // bottom) and '#infos' matches no element id, so nothing pulls it back up.
  // The flag is consumed on the next load; disabling scrollRestoration keeps
  // the browser from fighting our scroll.
  sessionStorage.setItem('scrollTopOnLoad', '1');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  location.hash = 'infos';
  location.reload();
}

// On reload after a successful submission, jump straight to the thank-you
// screen and resume the bonus mini-game where the guest left off. Without
// this, guests would land on a fresh form (and could re-submit) and the
// bonus game would offer 4 fresh attempts after a partial play.
function restoreSubmittedState() {
  if (!localStorage.getItem('rsvpSubmittedAt')) return;
  showThankYouScreen();

  const state = loadBonusState();
  if (!state) return;

  bonusGuesses = state.guesses.slice();
  bonusWrongCount = bonusGuesses.length;

  const lives = document.querySelectorAll('#bonusLives .life');
  bonusGuesses.forEach((g, i) => {
    if (lives[i]) lives[i].dataset.guess = String(g);
  });
  updateBonusLives();
  escalateBonusButton();

  if (state.outcome === 'win') {
    document.getElementById('bonusForm').hidden = true;
    showBonusOutcome(BONUS_CELEBRATION);
    return;
  }

  if (state.outcome === 'loss') {
    document.getElementById('bonusForm').hidden = true;
    showBonusOutcome(BONUS_REVEAL);
    return;
  }

  // Still playing — re-show the last wrong-guess gif so the page looks
  // exactly like it did before the reload.
  if (bonusWrongCount > 0) {
    const gif = BONUS_WRONG_GIFS[bonusWrongCount - 1];
    showBonusResult(
      `<img class="bonus-media" src="${gif}" alt="" onerror="this.style.display='none'">`
    );
  }
}

document.getElementById('inviteCode').value = localStorage.getItem('inviteCode') || '';
addGuest();
restoreSubmittedState();

// finishBonus() asks the post-reload home page to open at the top. Run on the
// load event so it lands after any browser scroll restoration would have fired.
if (sessionStorage.getItem('scrollTopOnLoad')) {
  sessionStorage.removeItem('scrollTopOnLoad');
  globalThis.addEventListener('load', () => globalThis.scrollTo(0, 0));
}

