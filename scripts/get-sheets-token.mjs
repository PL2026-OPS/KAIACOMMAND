// Obtiene refresh token con acceso de escritura a Google Sheets
// Ejecutar: $env:GOOGLE_CLIENT_SECRET="..."; node scripts/get-sheets-token.mjs

import http from 'http'
import { readFileSync, writeFileSync } from 'fs'

const CLIENT_ID     = '635153220979-3v37tnm2imvn51k6me3bjkttss99cifg.apps.googleusercontent.com'
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI  = 'http://localhost:3333/auth/callback'
const SCOPE         = 'https://www.googleapis.com/auth/spreadsheets'

if (!CLIENT_SECRET) {
  console.error('❌ Falta GOOGLE_CLIENT_SECRET')
  process.exit(1)
}

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
  `client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\n📊 Copia esta URL y pégala en el navegador:\n')
console.log('─'.repeat(60))
console.log(authUrl)
console.log('─'.repeat(60))
console.log('\nGoogle pedirá permiso para EDITAR hojas de cálculo.\n')

const server = http.createServer(async (req, res) => {
  const url  = new URL(req.url, 'http://localhost:3333')
  const code = url.searchParams.get('code')
  if (!code) { res.end('Sin código.'); return }

  res.end('<h2>✅ Autorizado. Puedes cerrar esta ventana.</h2>')

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
    console.error('❌ No se obtuvo refresh_token:', JSON.stringify(tokens))
    server.close(); return
  }

  let env = ''
  try { env = readFileSync('.env.local', 'utf8') } catch {}

  if (env.includes('GOOGLE_SHEETS_REFRESH_TOKEN=')) {
    env = env.replace(/GOOGLE_SHEETS_REFRESH_TOKEN="[^"]*"/, `GOOGLE_SHEETS_REFRESH_TOKEN="${tokens.refresh_token}"`)
  } else {
    env += `\nGOOGLE_SHEETS_REFRESH_TOKEN="${tokens.refresh_token}"\n`
  }
  writeFileSync('.env.local', env)

  console.log('✅ GOOGLE_SHEETS_REFRESH_TOKEN guardado en .env.local')
  server.close()
})

server.listen(3333, () => console.log('⏳ Esperando en http://localhost:3333...\n'))
