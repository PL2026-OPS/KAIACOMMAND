// ═══════════════════════════════════════════════════════════════
// KAIA Command — Cookie consent banner (GDPR-style, vanilla ES module)
//
// Injects its own DOM, so a page only needs:
//   <script type="module" src="/src/js/cookies.js"></script>
//
// Public API (window.kaiaCookies):
//   .open()        → reopen the preferences panel (e.g. from /cookies)
//   .getConsent()  → current consent object or null
//   .reset()       → clear stored consent (shows the banner again)
//
// Future analytics/marketing scripts must wait for consent. Pattern:
//   window.addEventListener('kaia:consent', (e) => {
//     if (e.detail.analytics) loadAnalytics()
//     if (e.detail.marketing) loadMarketing()
//   })
//   // also check on load in case consent was given earlier:
//   const c = window.kaiaCookies.getConsent()
//   if (c?.analytics) loadAnalytics()
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'kaia_cookie_consent'
const VERSION = 1

function getConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Re-ask consent if the consent schema/version changed
    if (parsed.version !== VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function saveConsent({ analytics, marketing }) {
  const consent = {
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing,
    version: VERSION,
    date: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  } catch {
    /* storage may be unavailable (private mode) — consent simply won't persist */
  }
  // Notify any waiting scripts (analytics/marketing loaders)
  window.dispatchEvent(new CustomEvent('kaia:consent', { detail: consent }))
  return consent
}

// ── DOM ──────────────────────────────────────────────────────────
let root // the overlay element

function buildBanner() {
  root = document.createElement('div')
  root.className = 'cookie-root'
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'false')
  root.setAttribute('aria-label', 'Preferencias de cookies')
  root.innerHTML = `
    <div class="cookie-banner">
      <div class="cookie-main">
        <div class="cookie-rainbow" aria-hidden="true"></div>
        <p class="cookie-title">Tu privacidad importa</p>
        <p class="cookie-text">
          Usamos cookies necesarias para que el sistema funcione (tu sesión).
          Con tu permiso, también podríamos usar cookies de analítica y marketing.
          Consulta nuestra
          <a href="/privacidad">Política de Privacidad</a> y la
          <a href="/cookies">Política de Cookies</a>.
        </p>

        <div class="cookie-prefs" hidden>
          <label class="cookie-option cookie-option--locked">
            <span class="cookie-option-info">
              <span class="cookie-option-name">Necesarias</span>
              <span class="cookie-option-desc">Imprescindibles para iniciar sesión y usar la plataforma. Siempre activas.</span>
            </span>
            <input type="checkbox" checked disabled aria-label="Cookies necesarias (siempre activas)" />
            <span class="cookie-switch" aria-hidden="true"></span>
          </label>

          <label class="cookie-option">
            <span class="cookie-option-info">
              <span class="cookie-option-name">Analítica</span>
              <span class="cookie-option-desc">Nos ayudarían a entender el uso del sistema. Aún no están en uso.</span>
            </span>
            <input type="checkbox" id="cookie-analytics" aria-label="Cookies de analítica" />
            <span class="cookie-switch" aria-hidden="true"></span>
          </label>

          <label class="cookie-option">
            <span class="cookie-option-info">
              <span class="cookie-option-name">Marketing</span>
              <span class="cookie-option-desc">Para comunicaciones o contenidos personalizados. Aún no están en uso.</span>
            </span>
            <input type="checkbox" id="cookie-marketing" aria-label="Cookies de marketing" />
            <span class="cookie-switch" aria-hidden="true"></span>
          </label>
        </div>
      </div>

      <div class="cookie-actions">
        <button type="button" class="cookie-btn cookie-btn--ghost" data-action="customize">Personalizar</button>
        <button type="button" class="cookie-btn cookie-btn--secondary" data-action="reject">Rechazar todas</button>
        <button type="button" class="cookie-btn cookie-btn--secondary" data-action="save" hidden>Guardar preferencias</button>
        <button type="button" class="cookie-btn cookie-btn--primary" data-action="accept">Aceptar todas</button>
      </div>
    </div>
  `

  const prefs        = root.querySelector('.cookie-prefs')
  const analyticsInp = root.querySelector('#cookie-analytics')
  const marketingInp = root.querySelector('#cookie-marketing')
  const customizeBtn = root.querySelector('[data-action="customize"]')
  const saveBtn      = root.querySelector('[data-action="save"]')

  root.querySelector('[data-action="accept"]').addEventListener('click', () => {
    saveConsent({ analytics: true, marketing: true })
    close()
  })

  root.querySelector('[data-action="reject"]').addEventListener('click', () => {
    saveConsent({ analytics: false, marketing: false })
    close()
  })

  customizeBtn.addEventListener('click', () => {
    const opening = prefs.hidden
    prefs.hidden = !opening
    customizeBtn.hidden = opening          // hide "Personalizar" once expanded
    saveBtn.hidden = !opening              // reveal "Guardar preferencias"
    // pre-fill toggles from any prior consent
    const c = getConsent()
    if (c) { analyticsInp.checked = c.analytics; marketingInp.checked = c.marketing }
  })

  saveBtn.addEventListener('click', () => {
    saveConsent({ analytics: analyticsInp.checked, marketing: marketingInp.checked })
    close()
  })

  document.body.appendChild(root)
}

function open() {
  if (!root) buildBanner()
  root.classList.add('cookie-root--visible')
}

function close() {
  if (root) root.classList.remove('cookie-root--visible')
}

function reset() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  open()
}

// ── Boot ─────────────────────────────────────────────────────────
function init() {
  // Expose API (used by the /cookies page "Configurar cookies" button)
  window.kaiaCookies = { open, getConsent, reset }

  // Re-emit stored consent so analytics/marketing loaders can react on load
  const existing = getConsent()
  if (existing) {
    window.dispatchEvent(new CustomEvent('kaia:consent', { detail: existing }))
  } else {
    open() // first visit (or consent reset / version bumped)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
