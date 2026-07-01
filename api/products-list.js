// api/products-list.js — lee solo los títulos (BOOK TITLE) de un Google Sheet
// GET /api/products-list?url=https://docs.google.com/spreadsheets/d/...

const PREVIEW_RE = /^https:\/\/[a-z0-9-]+-kaiacommand-s-projects\.vercel\.app$/
const ALLOWED    = ['https://kaia.sicoben.com', 'https://kaiacommand-s-projects.vercel.app']

function parseCSVFull(text) {
  const records = []
  let field = '', inQ = false, row = []
  const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (ch === '"') {
      if (inQ && t[i+1] === '"') { field += '"'; i++ }
      else inQ = !inQ
    } else if (ch === ',' && !inQ) {
      row.push(field.trim()); field = ''
    } else if (ch === '\n' && !inQ) {
      row.push(field.trim()); field = ''
      if (row.some(c => c)) records.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field || row.length) { row.push(field.trim()); if (row.some(c=>c)) records.push(row) }
  return records
}

export default async function handler(req, res) {
  const origin  = req.headers.origin || ''
  const allowed = ALLOWED.includes(origin) || PREVIEW_RE.test(origin)
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : ALLOWED[0])
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const { url: sheetUrl } = req.query
  if (!sheetUrl) return res.status(400).json({ error: 'Parámetro url requerido' })

  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) return res.status(400).json({ error: 'URL de Google Sheets inválida' })

  const sheetId = match[1]
  const csvUrl  = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`

  let csvText
  try {
    const r = await fetch(csvUrl, { headers: { 'User-Agent': 'KAIA-Command/1.0' }, redirect: 'follow' })
    if (!r.ok || (await r.clone().text()).trim().startsWith('<!'))
      return res.status(403).json({ error: 'Sheet no accesible. Compártelo como "Cualquiera con el enlace puede ver".' })
    csvText = await r.text()
  } catch (e) {
    return res.status(500).json({ error: 'Error al leer el sheet: ' + e.message })
  }

  const records = parseCSVFull(csvText)
  if (records.length < 2) return res.status(200).json({ products: [] })

  // Encontrar fila de headers
  const KEY_COLS = ['BOOK TITLE', 'ITEM NAME', 'TITULO', 'TITLE', 'NOMBRE']
  let headerIdx = 0
  for (let i = 0; i < Math.min(5, records.length); i++) {
    if (KEY_COLS.some(k => records[i].join(' ').toUpperCase().includes(k))) { headerIdx = i; break }
  }

  const headers = records[headerIdx].map(h => h.toUpperCase())
  const findCol = (...kw) => { for (const k of kw) { const i = headers.findIndex(h => h.includes(k)); if (i !== -1) return i } return -1 }
  const colName = findCol('BOOK TITLE', 'ITEM NAME', 'TITLE', 'NOMBRE', 'NAME')

  if (colName < 0) return res.status(200).json({ products: [] })

  // Extraer solo los títulos únicos, ignorar filas vacías o que sean solo specs
  const seen = new Set()
  const products = []

  for (const row of records.slice(headerIdx + 1)) {
    const name = (row[colName] || '').trim()
    if (!name || /^\d+$/.test(name) || seen.has(name)) continue
    seen.add(name)
    products.push(name)
  }

  return res.status(200).json({ products, total: products.length })
}
