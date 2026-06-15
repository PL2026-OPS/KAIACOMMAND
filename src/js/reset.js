const params   = new URLSearchParams(location.search)
const tokenKey = params.get('token')

const resetForm    = document.getElementById('reset-form')
const resetInvalid = document.getElementById('reset-invalid')
const resetError   = document.getElementById('reset-error')
const forEmailEl   = document.getElementById('reset-for-email')
const newPwInput   = document.getElementById('reset-new-pw')
const confirmInput = document.getElementById('reset-confirm-pw')

function getTokenData() {
  if (!tokenKey) return null
  const tokens = JSON.parse(localStorage.getItem('kaia_reset_tokens') || '{}')
  const data = tokens[tokenKey]
  if (!data || Date.now() > data.exp) return null
  return data
}

const tokenData = getTokenData()

if (!tokenData) {
  resetInvalid.hidden = false
} else {
  forEmailEl.textContent = tokenData.email
  resetForm.hidden = false
  newPwInput.focus()
}

function showError(msg) {
  resetError.textContent = msg
  resetError.classList.add('visible')
}

resetForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const newPw   = newPwInput.value
  const confirm = confirmInput.value

  if (newPw.length < 6) {
    showError('La contraseña debe tener al menos 6 caracteres.')
    return
  }

  if (newPw !== confirm) {
    showError('Las contraseñas no coinciden.')
    confirmInput.value = ''
    confirmInput.focus()
    return
  }

  const stored = JSON.parse(localStorage.getItem('kaia_passwords') || '{}')
  stored[tokenData.email] = newPw
  localStorage.setItem('kaia_passwords', JSON.stringify(stored))

  const tokens = JSON.parse(localStorage.getItem('kaia_reset_tokens') || '{}')
  delete tokens[tokenKey]
  localStorage.setItem('kaia_reset_tokens', JSON.stringify(tokens))

  window.location.href = '/?reset=ok'
})

resetForm.addEventListener('input', () => resetError.classList.remove('visible'))
