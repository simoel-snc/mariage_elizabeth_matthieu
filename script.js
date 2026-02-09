// ============================================================
// CONFIGURATION — Replace this URL with your Google Apps Script
// ============================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYmqNn8PU0vywrCUeoa8LCAXlBWv0Opl2x-g4g-5lXx-Xr-cyQ67jvR8T1dJ11Rkv6/exec';

// ============================================================
// TRANSLATIONS
// ============================================================
const T = {
  fr: {
    guestN: 'Invité',
    name: 'Nom complet',
    namePlaceholder: 'Prénom et nom',
    presence: 'Présence',
    yes: 'Sera présent(e) ✓',
    no: 'Ne pourra pas venir ✗',
    confirm: 'Merci de confirmer votre présence à :',
    reception: 'Réception',
    diner: 'Dîner',
    allergies: 'Allergies ou régime alimentaire',
    allergiesPlaceholder: 'Ex: végétarien, sans gluten, allergie aux noix…',
    addGuest: 'Ajouter un invité',
    submit: 'Envoyer la réponse',
    sending: 'Envoi en cours…',
    successMsg: 'Votre réponse a bien été enregistrée. Nous avons hâte de partager ce moment avec vous !',
    errorMsg: 'Une erreur est survenue. Veuillez réessayer.',
    errorName: 'Veuillez renseigner le nom de chaque invité.',
    errorPresence: 'Veuillez indiquer la présence pour chaque invité.',
    errorCode: 'Le code d\'invitation est incorrect. Vérifiez le code sur votre carton d\'invitation.',
    noCode: 'Veuillez scanner le QR code figurant sur votre invitation pour accéder au formulaire.',
    thankTitle: 'Merci !',
    thankSub: 'À bientôt ✦'
  },
  nl: {
    guestN: 'Gast',
    name: 'Volledige naam',
    namePlaceholder: 'Voornaam en achternaam',
    presence: 'Aanwezigheid',
    yes: 'Zal aanwezig zijn ✓',
    no: 'Kan niet komen ✗',
    confirm: 'Gelieve uw aanwezigheid te bevestigen bij:',
    reception: 'Receptie',
    diner: 'Diner',
    allergies: 'Allergieën of dieet',
    allergiesPlaceholder: 'Bv: vegetarisch, glutenvrij, notenallergie…',
    addGuest: 'Gast toevoegen',
    submit: 'Antwoord versturen',
    sending: 'Bezig met verzenden…',
    successMsg: 'Uw antwoord is geregistreerd. We kijken ernaar uit om dit moment met u te delen!',
    errorMsg: 'Er is een fout opgetreden. Probeer het opnieuw.',
    errorName: 'Gelieve de naam van elke gast in te vullen.',
    errorPresence: 'Gelieve de aanwezigheid voor elke gast aan te geven.',
    errorCode: 'De uitnodigingscode is onjuist. Controleer de code op uw uitnodigingskaart.',
    noCode: 'Gelieve de QR-code op uw uitnodiging te scannen om het formulier te openen.',
    thankTitle: 'Bedankt!',
    thankSub: 'Tot binnenkort ✦'
  }
};

let currentLang = 'fr';
let guestCount = 0;

// ============================================================
// LANGUAGE SWITCHING
// ============================================================
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add('active');

  // Update all elements with data-fr / data-nl
  document.querySelectorAll('[data-fr]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  // Update placeholders
  document.querySelectorAll('[data-ph-fr]').forEach(el => {
    el.placeholder = el.getAttribute(`data-ph-${lang}`);
  });

  // Re-render guest cards labels
  updateGuestLabels();
}

function t(key) {
  return T[currentLang][key] || key;
}

function updateGuestLabels() {
  document.querySelectorAll('.guest-card').forEach((card, idx) => {
    const num = idx + 1;
    card.querySelector('.guest-number').textContent = `${t('guestN')} ${num}`;
    card.querySelector('.field-label-name').textContent = t('name');
    card.querySelector('.name-input').placeholder = t('namePlaceholder');
    card.querySelector('.field-label-presence').textContent = t('presence');
    card.querySelector('.label-yes').textContent = t('yes');
    card.querySelector('.label-no').textContent = t('no');
    card.querySelector('.field-label-confirm').textContent = t('confirm');
    card.querySelector('.label-reception .checkbox-text').textContent = t('reception');
    card.querySelector('.label-diner .checkbox-text').textContent = t('diner');
    card.querySelector('.field-label-allergies').textContent = t('allergies');
    card.querySelector('.allergies-input').placeholder = t('allergiesPlaceholder');
  });

  // Update add button and submit
  const addBtn = document.querySelector('.add-guest-btn span[data-fr]');
  if (addBtn) addBtn.textContent = t('addGuest');

  const subBtn = document.querySelector('#submitBtn span[data-fr]');
  if (subBtn) subBtn.textContent = t('submit');
}

// ============================================================
// GUEST CARD MANAGEMENT
// ============================================================
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

  <!-- Name -->
  <div class="field-group">
    <label class="field-label field-label-name">${t('name')}</label>
    <input type="text" class="text-input name-input" placeholder="${t('namePlaceholder')}"
           data-ph-fr="${T.fr.namePlaceholder}" data-ph-nl="${T.nl.namePlaceholder}">
  </div>

  <!-- Presence -->
  <div class="field-group">
    <label class="field-label field-label-presence">${t('presence')}</label>
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
      <input type="text" class="text-input allergies-input" placeholder="${t('allergiesPlaceholder')}"
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

// ============================================================
// CHECKBOX LOGIC
// ============================================================
function toggleConditional(id) {
  const yesChecked = document.getElementById(`present-yes-${id}`).checked;
  const conditional = document.getElementById(`conditional-${id}`);
  if (yesChecked) {
    conditional.classList.add('visible');
  } else {
    conditional.classList.remove('visible');
  }
}


// ============================================================
// FORM SUBMISSION
// ============================================================
async function submitForm() {
  const btn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('statusMessage');
  statusEl.className = 'status-message';
  statusEl.style.display = 'none';

  // Honeypot check — if filled, silently pretend success (it's a bot)
  if (document.getElementById('honeypot').value) {
    document.querySelector('.form-section').style.display = 'none';
    document.querySelector('.intro').style.display = 'none';
    document.getElementById('thankYou').classList.add('visible');
    return;
  }

  const inviteCode = document.getElementById('inviteCode').value.trim();

  // Collect data
  const cards = document.querySelectorAll('.guest-card');
  const guests = [];
  let valid = true;
  let errorMsg = '';

  cards.forEach((card) => {
    const name = card.querySelector('.name-input').value.trim();
    if (!name) { valid = false; errorMsg = t('errorName'); return; }

    const cardId = card.id.split('-')[1];
    const yesEl = document.getElementById(`present-yes-${cardId}`);
    const noEl = document.getElementById(`present-no-${cardId}`);

    if (!yesEl.checked && !noEl.checked) {
      valid = false; errorMsg = t('errorPresence'); return;
    }

    const present = yesEl.checked;

    let reception = false;
    let diner = false;
    let allergies = '';

    if (present) {
      reception = document.getElementById(`reception-${cardId}`).checked;
      diner = document.getElementById(`diner-${cardId}`).checked;
      allergies = card.querySelector('.allergies-input').value.trim();
    }

    guests.push({
      name,
      present,
      reception,
      diner,
      allergies,
      language: currentLang,
      submittedAt: new Date().toISOString()
    });
  });

  if (!valid) {
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
    document.querySelector('.intro').style.display = 'none';
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

// ============================================================
// INIT
// ============================================================

// Read invite code from URL parameter (?code=XXXX)
const urlParams = new URLSearchParams(globalThis.location.search);
const urlCode = (urlParams.get('code') || '').trim();

// Hide everything until code is verified
document.querySelector('.form-section').style.display = 'none';
document.querySelector('.intro').style.display = 'none';

(async () => {
  if (urlCode) {
    // Verify invite code with the backend before showing the form
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?code=${encodeURIComponent(urlCode)}`);
      const result = await res.json();
      if (result.status === 'valid') {
        document.getElementById('inviteCode').value = urlCode;
        document.querySelector('.form-section').style.display = '';
        document.querySelector('.intro').style.display = '';
        addGuest();
      } else {
        document.getElementById('noCodeMessage').classList.add('visible');
      }
    } catch {
      document.getElementById('noCodeMessage').classList.add('visible');
    }
  } else {
    document.getElementById('noCodeMessage').classList.add('visible');
  }
})();
