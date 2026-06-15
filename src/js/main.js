// ── Mock users ─────────────────────────────────────────────────────────────
const USERS = {
  'asistente.direccion@sicobenediciones.com': { role: 'admin',  dest: '/admin.html',  name: 'Paulet',     password: 'kaia2025' },
  'daniel.benarroch@sicobenediciones.com':    { role: 'admin',  dest: '/admin.html',  name: 'Sr. Daniel', password: 'kaia2025' },
  'jennibenarroch@sicobenediciones.com':      { role: 'admin',  dest: '/admin.html',  name: 'Jenny',      password: 'kaia2025' },
  'logistica@sicobenediciones.com':           { role: 'portal', dest: '/portal.html', name: 'Yonaida',    password: 'kaia2025' },
  'arte@sicobenediciones.com':                { role: 'portal', dest: '/portal.html', name: 'María',      password: 'kaia2025' },
  'asistenteventas@sicobenediciones.com':     { role: 'portal', dest: '/portal.html', name: 'Aixa',       password: 'kaia2025' },
  'adm.kadi@sicobenediciones.com':            { role: 'portal', dest: '/portal.html', name: 'Ruth',       password: 'kaia2025' },
  'asesoreducativo@sicobenediciones.com':     { role: 'portal', dest: '/portal.html', name: 'Orlando',    password: 'kaia2025' },
}

// ── Password helpers ───────────────────────────────────────────────────────
function getStoredPasswords() {
  return JSON.parse(localStorage.getItem('kaia_passwords') || '{}')
}

function resolvePassword(email) {
  return getStoredPasswords()[email] ?? USERS[email]?.password
}

// ── Reset token helpers ────────────────────────────────────────────────────
function generateToken(email) {
  const payload = { email, exp: Date.now() + 3600000 }
  const token   = btoa(JSON.stringify(payload))
  const tokens  = JSON.parse(localStorage.getItem('kaia_reset_tokens') || '{}')
  tokens[token] = payload
  localStorage.setItem('kaia_reset_tokens', JSON.stringify(tokens))
  return token
}

// ── DOM refs ───────────────────────────────────────────────────────────────
const loginView  = document.getElementById('login-view')
const forgotView = document.getElementById('forgot-view')
const loginForm  = document.getElementById('login-form')
const emailInput = document.getElementById('login-username')
const pwInput    = document.getElementById('login-password')
const errorEl    = document.getElementById('login-error')
const forgotLink = document.getElementById('forgot-link')
const backLink   = document.getElementById('back-to-login')
const forgotForm = document.getElementById('forgot-form')
const forgotEmailInput = document.getElementById('forgot-email')
const forgotResult     = document.getElementById('forgot-result')

// ── Login ──────────────────────────────────────────────────────────────────
function showError(msg, isSuccess = false) {
  errorEl.textContent = msg
  errorEl.classList.add('visible')
  if (isSuccess) {
    errorEl.style.cssText = 'background:rgba(42,189,168,0.14);border-color:rgba(42,189,168,0.3);color:var(--e7)'
  } else {
    errorEl.style.cssText = ''
    emailInput.classList.add('login-input--error')
    pwInput.classList.add('login-input--error')
  }
}

function clearError() {
  errorEl.classList.remove('visible')
  errorEl.style.cssText = ''
  emailInput.classList.remove('login-input--error')
  pwInput.classList.remove('login-input--error')
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const key = emailInput.value.trim().toLowerCase()
  const pw  = pwInput.value

  if (!key || !pw) {
    showError('Por favor completa todos los campos.')
    return
  }

  const user = USERS[key]
  if (!user || pw !== resolvePassword(key)) {
    showError('Correo o contraseña incorrectos.')
    pwInput.value = ''
    pwInput.focus()
    return
  }

  sessionStorage.setItem('kaia_user', JSON.stringify({ email: key, ...user }))
  window.location.href = user.dest
})

emailInput.addEventListener('input', clearError)
pwInput.addEventListener('input', clearError)

// ── Switch to forgot view ──────────────────────────────────────────────────
forgotLink.addEventListener('click', (e) => {
  e.preventDefault()
  loginView.hidden = true
  forgotView.hidden = false
  forgotEmailInput.focus()
})

backLink.addEventListener('click', (e) => {
  e.preventDefault()
  forgotView.hidden = true
  loginView.hidden = false
  // Reset forgot view for next use
  forgotForm.reset()
  forgotForm.hidden = false
  forgotResult.hidden = true
  forgotResult.innerHTML = ''
})

// ── Forgot password ────────────────────────────────────────────────────────
forgotForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const email = forgotEmailInput.value.trim().toLowerCase()

  if (USERS[email]) {
    const token    = generateToken(email)
    const resetUrl = `${location.origin}/reset.html?token=${token}`
    showForgotResult(email, resetUrl)
  } else {
    // Don't reveal whether email exists
    showForgotResult(email, null)
  }

  forgotForm.hidden = true
  forgotResult.hidden = false
})

function showForgotResult(email, resetUrl) {
  forgotResult.innerHTML = `
    <p class="forgot-sent-title">Revisa tu correo</p>
    <p class="forgot-sent-sub">
      Si <strong>${email}</strong> está registrado, recibirás un link de acceso en tu bandeja.
    </p>
    ${resetUrl ? `
    <div class="forgot-dev-block">
      <p class="forgot-dev-label">🛠 Modo prueba — usa este link directamente:</p>
      <a class="forgot-reset-link" href="${resetUrl}">Restablecer contraseña →</a>
    </div>` : ''}
  `
}

// ── Success message after password reset ──────────────────────────────────
const params = new URLSearchParams(location.search)
if (params.get('reset') === 'ok') {
  showError('✓ Contraseña actualizada. Ya puedes iniciar sesión.', true)
}
