import { supabase } from '/src/js/supabase.js'

const errorEl    = document.getElementById('login-error')
const loginView  = document.getElementById('login-view')
const loadingEl  = document.getElementById('login-loading')

// ── Mostrar error ──────────────────────────────────────────────────────────
function showError(msg) {
  errorEl.textContent = msg
  errorEl.classList.add('visible')
}

// ── Redirigir según rol ────────────────────────────────────────────────────
async function redirectByRole(email) {
  const { data: perfil, error } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !perfil) {
    await supabase.auth.signOut()
    loadingEl.hidden = true
    loginView.hidden = false
    showError('Tu correo no está autorizado. Contacta a Paulet.')
    return
  }

  window.location.href = perfil.rol === 'admin' ? '/admin.html' : '/portal.html'
}

// ── Verificar sesión existente (incluye callback de OAuth) ─────────────────
async function handleAuth() {
  if (!supabase) {
    // Sin Supabase configurado — modo desarrollo sin OAuth
    loadingEl.hidden = true
    loginView.hidden = false
    return
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user?.email) {
    await redirectByRole(session.user.email)
    return
  }

  // Sin sesión — mostrar botón de login
  loadingEl.hidden = true
  loginView.hidden = false
}

// ── Botón Google ───────────────────────────────────────────────────────────
document.getElementById('btn-google-login')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-google-login')
  btn.disabled = true
  btn.textContent = 'Redirigiendo...'

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/',
      queryParams: { hd: 'sicobenediciones.com' },
    },
  })

  if (error) {
    btn.disabled = false
    btn.innerHTML = `<span class="google-icon">G</span> Continuar con Google`
    showError('Error al conectar con Google. Intenta de nuevo.')
  }
})

handleAuth()
