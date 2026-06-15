// Sync real Gmail emails → Supabase
// Ejecutar: $env:GOOGLE_CLIENT_SECRET="..."; node scripts/sync-gmail.mjs

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Leer .env.local ───────────────────────────────────────────────────────
function loadEnv() {
  const env = {}
  try {
    readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^=]+)=["']?([^"'\n]*)["']?$/)
      if (m) env[m[1].trim()] = m[2].trim()
    })
  } catch {}
  return env
}

const env       = loadEnv()
const CLIENT_ID = '635153220979-3v37tnm2imvn51k6me3bjkttss99cifg.apps.googleusercontent.com'
const CLIENT_SECRET   = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN   = env.GMAIL_REFRESH_TOKEN
const SUPABASE_URL    = env.VITE_SUPABASE_URL
const SUPABASE_KEY    = env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!CLIENT_SECRET) { console.error('❌ Falta GOOGLE_CLIENT_SECRET'); process.exit(1) }
if (!REFRESH_TOKEN)  { console.error('❌ Falta GMAIL_REFRESH_TOKEN en .env.local'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Obtener access token ──────────────────────────────────────────────────
async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: REFRESH_TOKEN,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('No se obtuvo access_token: ' + JSON.stringify(data))
  return data.access_token
}

// ── Decodificar base64url ─────────────────────────────────────────────────
function decodeBase64(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

// ── Extraer cuerpo del email ──────────────────────────────────────────────
function extractBody(payload) {
  if (payload.body?.data) return decodeBase64(payload.body.data)
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data)
        return decodeBase64(part.body.data)
    }
    for (const part of payload.parts) {
      const b = extractBody(part)
      if (b) return b
    }
  }
  return ''
}

// ── Buscar código CCS en texto (ej: 2025C-FCL) ───────────────────────────
function extractCCS(text) {
  const match = text.match(/\b(20\d{2}[A-Z]-[A-Z]{2,5})\b/)
  return match ? match[1] : null
}

// ── Main ──────────────────────────────────────────────────────────────────
console.log('\n📧 Leyendo correos de Gmail...\n')

const token = await getAccessToken()
console.log('✅ Conectado a Gmail')

// Listar últimos 15 correos del inbox
const listRes = await fetch(
  'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=3&q=in:inbox',
  { headers: { Authorization: `Bearer ${token}` } }
)
const { messages = [] } = await listRes.json()
console.log(`📬 ${messages.length} correos encontrados\n`)

// Obtener cargas existentes para matching
const { data: cargas } = await supabase.from('cargas').select('ccs, nombre, proveedor, etapa_idx')

let insertados = 0

for (const { id } of messages) {
  const msg = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(r => r.json())

  const headers  = msg.payload?.headers || []
  const get      = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  const asunto   = get('Subject')
  const de       = get('From')
  const fecha    = new Date(parseInt(msg.internalDate)).toISOString()
  const cuerpo   = extractBody(msg.payload).slice(0, 2000)

  // Extraer nombre y email del remitente
  const emailMatch = de.match(/<(.+)>/)
  const deEmail    = emailMatch ? emailMatch[1] : de
  const deNombre   = de.replace(/<.+>/, '').replace(/"/g, '').trim() || deEmail

  // Obtener o crear hilo INBOX (para correos sin carga asignada)
  let hiloId = null
  const { data: hiloInbox } = await supabase
    .from('correos_hilo')
    .select('id')
    .eq('ccs', 'INBOX')
    .maybeSingle()

  if (hiloInbox?.id) {
    hiloId = hiloInbox.id
  } else {
    const { data: nuevoHilo } = await supabase
      .from('correos_hilo')
      .insert({ ccs: 'INBOX', etapa_idx: null })
      .select('id')
      .single()
    hiloId = nuevoHilo?.id
  }

  // Insertar mensaje (upsert ignora duplicados por id)
  const { error } = await supabase.from('mensajes_correo').upsert({
    id:            id,
    hilo_id:       hiloId,
    ccs:           'INBOX',
    de_nombre:     deNombre,
    de_email:      deEmail,
    asunto:        asunto,
    cuerpo:        cuerpo,
    resumen:       null,
    tipo:          'recibido',
    confianza:     null,
    confirmado:    false,
    adjuntos:      '[]',
    fecha_mensaje: fecha,
  })

  if (!error) {
    insertados++
    console.log(`  ✅ ${asunto.slice(0, 55)}`)
  } else {
    console.log(`  ❌ ${error.message}`)
  }
}

console.log(`\n✅ Listo: ${insertados} correos sincronizados`)
console.log('Recarga el panel de Comunicación en KAIA para verlos.\n')
