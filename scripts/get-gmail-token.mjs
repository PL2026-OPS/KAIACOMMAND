// Script one-time: obtiene el refresh token de Gmail
// Ejecutar: node scripts/get-gmail-token.mjs

import http from 'http'
import { spawn } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || '635153220979-3v37tnm2imvn51k6me3bjkttss99cifg.apps.googleusercontent.com'
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI  = 'http://localhost:3333/auth/callback'
const SCOPE         = 'https://www.googleapis.com/auth/gmail.readonly'

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`

if (!CLIENT_SECRET) {
  console.error('❌ Falta GOOGLE_CLIENT_SECRET. Ejecuta así:')
  console.error('   GOOGLE_CLIENT_SECRET="tu-secret" node scripts/get-gmail-token.mjs\n')
  process.exit(1)
}

console.log('\n🔐 Copia esta URL y pégala en tu navegador:\n')
console.log('─'.repeat(60))
console.log(authUrl)
console.log('─'.repeat(60))
console.log('\n')

// Escuchar el callback en localhost:8000
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8000')
  const code = url.searchParams.get('code')

  if (!code) {
    res.end('No se recibió código. Intenta de nuevo.')
    return
  }

  res.end('<h2>✅ Autorizado. Puedes cerrar esta ventana.</h2>')

  // Intercambiar código por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.refresh_token) {
    console.error('❌ No se obtuvo refresh_token. Asegúrate de que prompt=consent esté en la URL.')
    server.close()
    return
  }

  console.log('✅ Refresh token obtenido!')
  console.log('\nAgregando GMAIL_REFRESH_TOKEN a .env.local...\n')

  // Agregar al .env.local
  let envContent = ''
  try { envContent = readFileSync('.env.local', 'utf8') } catch {}

  if (envContent.includes('GMAIL_REFRESH_TOKEN=')) {
    envContent = envContent.replace(/GMAIL_REFRESH_TOKEN=.*/, `GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`)
  } else {
    envContent += `\nGMAIL_REFRESH_TOKEN="${tokens.refresh_token}"\n`
  }

  writeFileSync('.env.local', envContent)
  console.log('✅ Listo. GMAIL_REFRESH_TOKEN guardado en .env.local')
  console.log('\nYa puedes usar la Gmail API en el backend.\n')

  server.close()
})

server.listen(3333, () => {
  console.log('⏳ Esperando autorización en http://localhost:3333...\n')
})
