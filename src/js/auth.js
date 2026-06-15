// Shared password-change modal — imported by admin.js and portal.js

const DEFAULT_PASSWORD = 'kaia2025'

function getStoredPasswords() {
  return JSON.parse(localStorage.getItem('kaia_passwords') || '{}')
}

export function resolvePassword(email) {
  return getStoredPasswords()[email] ?? DEFAULT_PASSWORD
}

function setPassword(email, password) {
  const stored = getStoredPasswords()
  stored[email] = password
  localStorage.setItem('kaia_passwords', JSON.stringify(stored))
}

export function initPasswordModal() {
  const sessionUser = JSON.parse(sessionStorage.getItem('kaia_user') || 'null')

  const modal      = document.getElementById('pwModal')
  const modalClose = document.getElementById('pwModalClose')
  const pwForm     = document.getElementById('pw-change-form')
  const currentInp = document.getElementById('pw-current')
  const newInp     = document.getElementById('pw-new')
  const confirmInp = document.getElementById('pw-confirm')
  const pwError    = document.getElementById('pw-error')
  const pwSuccess  = document.getElementById('pw-success')

  document.querySelectorAll('[data-action="change-pw"]').forEach(btn =>
    btn.addEventListener('click', openModal)
  )
  modalClose.addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })

  function openModal() {
    modal.hidden = false
    pwForm.reset()
    pwError.classList.remove('visible')
    pwSuccess.hidden = true
    currentInp.focus()
  }

  function closeModal() {
    modal.hidden = true
  }

  pwForm.addEventListener('submit', (e) => {
    e.preventDefault()

    if (!sessionUser?.email) {
      showPwError('Sesión no encontrada. Vuelve a iniciar sesión.')
      return
    }

    const email   = sessionUser.email
    const current = currentInp.value
    const next    = newInp.value
    const confirm = confirmInp.value

    if (current !== resolvePassword(email)) {
      showPwError('La contraseña actual no es correcta.')
      currentInp.value = ''
      currentInp.focus()
      return
    }

    if (next.length < 6) {
      showPwError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (next !== confirm) {
      showPwError('Las contraseñas nuevas no coinciden.')
      confirmInp.value = ''
      confirmInp.focus()
      return
    }

    setPassword(email, next)
    pwForm.reset()
    pwError.classList.remove('visible')
    pwSuccess.textContent = '✓ Contraseña actualizada. Úsala la próxima vez que inicies sesión.'
    pwSuccess.hidden = false
  })

  pwForm.addEventListener('input', () => pwError.classList.remove('visible'))

  function showPwError(msg) {
    pwError.textContent = msg
    pwError.classList.add('visible')
    pwSuccess.hidden = true
  }
}
