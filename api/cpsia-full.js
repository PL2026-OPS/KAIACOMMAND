// api/cpsia-full.js — Lee proforma, analiza CPSIA, escribe pestaña Filtro
// GET  /api/cpsia-full?url=...&ccs=2025B-LCL&nombre=Libros+Q1
// POST /api/cpsia-full  body: { sheetId, ccs, nombre, products }  → escribe filtro

const CPSIA_RULES = [
  { id:'kit',        test:'Plomo · Ftalatos · ASTM F963',           art:'CPSIA §101, §108 · ASTM F963',      check: t => /\bkit\b|\bset\b|\bpack\b|bundle|juego|game|puzzle|memory|memorie|matching|rompecabezas|conjunto/i.test(t) },
  { id:'metal',      test:'Plomo sustrato + superficial · 16 CFR 1303', art:'CPSIA §101 · 16 CFR 1303',     check: t => /\bmetal\b|metálico|colgante|charm|zinc|alumin|hierro|iron|acero|steel|copper|cobre|brass|pewter/i.test(t) },
  { id:'pintura',    test:'Plomo en recubrimiento · 16 CFR 1303',    art:'CPSIA §101 · 16 CFR 1303',         check: t => /\bpaint\b|painted|pintura|pintado|coating|coated|barniz|lacquer|enamel|esmalte/i.test(t) },
  { id:'tinta',      test:'Plomo en tinta · 16 CFR 1303',            art:'CPSIA §101 · ASTM D-4236',         check: t => /\bink\b|tinta\b|impresión|printed|offset|serigrafia|silk.?screen/i.test(t) },
  { id:'stickers',   test:'Plomo adhesivo · Ftalatos PVC',           art:'CPSIA §101 · §108',                check: t => /sticker|vinilo|vinyl|adhesiv|peel|calcomanía|decal|label/i.test(t) },
  { id:'plastico',   test:'Ftalatos · Plomo en sustrato · ASTM F963',art:'CPSIA §108 · ASTM F963',           check: t => /\bplastic\b|plástico|pvc\b|polyvinyl|polipropileno|abs\b|nylon|rubber|goma/i.test(t) },
  { id:'crayones',   test:'ASTM D-4236 · Pigmentos no tóxicos',      art:'ASTM D-4236 · LHAMA Act',          check: t => /crayon|crayón|marker|plumón|marcador|pigment|acrylic|acrílico|chalk|tiza|tempera|watercolor|acuarela/i.test(t) },
  { id:'tela',       test:'ASTM F963 §4.1 · 16 CFR 1501',            art:'ASTM F963 · 16 CFR 1501',          check: t => /\bfabric\b|tela\b|stuffed|relleno|foam|espuma|plush|peluche|felt|fieltro|cotton|algodón|polyester/i.test(t) },
  { id:'partes',     test:'16 CFR 1501 (partes pequeñas) · ASTM F963 §4.14', art:'16 CFR 1501 · CPSIA §106', check: t => /small.part|parte.peq|magnet|magneto|bead|cuenta|marble|canica|button.*peq|tiny|miniatur/i.test(t) },
  { id:'actividad',  test:'ASTM F963 · ASTM D-4236',                 art:'CPSIA §101 · ASTM F963',           check: t => /activit|actividad|craft|manualidad|experiment|ciencia|slime|clay|arcilla|playdough/i.test(t) },
  // EXENTO — debe ir al final
  { id:'papel',      test:'EXENTO — 16 CFR 1501 (solo papel/cartón)', art:'16 CFR 1501 exemption', exempt:true,
    check: t => /\bbook\b|libro\b|cuento\b|lectura\b|coloring\b|colorear\b|workbook|sopa.letra|crucigrama/i.test(t)
             && !/metal|plastic|vinyl|sticker|crayon|paint|ink|tinta|magneto|foam|tela|fabric|clay|slime/i.test(t) },
]

function analyzeProduct(itemName, description) {
  const text = `${itemName} ${description}`.toLowerCase()
  const exento = CPSIA_RULES.find(r => r.exempt && r.check(text))
  if (exento) return { aplica: false, exento: true, test: exento.test, articulo: exento.art, regla: exento.id }
  for (const rule of CPSIA_RULES.filter(r => !r.exempt)) {
    if (rule.check(text)) return { aplica: true, exento: false, test: rule.test, articulo: rule.art, regla: rule.id }
  }
  // Cualquier producto infantil no identificado → revisar
  return { aplica: true, exento: false, test: 'Revisar manualmente — producto infantil', articulo: 'CPSIA §101 general', regla: 'manual' }
}

function parseCSVLine(line) {
  const cells = []; let cur = '', inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = '' }
    else cur += ch
  }
  cells.push(cur.trim())
  return cells.map(c => c.replace(/^"|"$/g, '').trim())
}

async function getAccessToken(refreshToken) {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  })
  const d = await r.json()
  return d.access_token || null
}

async function writeCPSIAFiltro(sheetId, ccs, nombre, products, accessToken) {
  const flagged = products.filter(p => p.aplica)

  // 1. Crear la pestaña "CPSIA Filtro" (si ya existe, la borra y recrea)
  const ssRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const ss = await ssRes.json()
  const sheets = ss.sheets || []
  const existing = sheets.find(s => s.properties.title === 'CPSIA Filtro')

  const requests = []
  if (existing) {
    requests.push({ deleteSheet: { sheetId: existing.properties.sheetId } })
  }
  requests.push({ addSheet: { properties: { title: 'CPSIA Filtro' } } })

  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    }
  )
  const batchData = await batchRes.json()
  const newSheetId = batchData.replies?.find(r => r.addSheet)?.addSheet?.properties?.sheetId

  // 2. Escribir datos en la nueva pestaña
  const headers = ['#', 'ITEM NAME', 'DESCRIPTION', 'APLICA CPSIA', 'TEST REQUERIDO', 'ARTÍCULO / NORMA', 'REGLA']
  const rows = [
    [`CPSIA Filtro — ${nombre || ccs} — Generado por KAIA Command`],
    [],
    headers,
    ...products.map((p, i) => [
      i + 1,
      p.itemName,
      p.description,
      p.aplica ? 'SÍ — REQUIERE PRUEBA' : (p.exento ? 'EXENTO' : 'NO'),
      p.test,
      p.articulo,
      p.regla,
    ]),
    [],
    [`Total analizados: ${products.length}`, '', `Requieren prueba: ${flagged.length}`, '', `Exentos: ${products.filter(p=>p.exento).length}`],
  ]

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/CPSIA Filtro!A1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    }
  )

  return newSheetId
}

const ALLOWED_ORIGINS = ['https://kaia.sicoben.com', 'https://kaiacommand-s-projects.vercel.app']
const KAIA_SECRET = process.env.KAIA_API_SECRET

const PREVIEW_RE = /^https:\/\/[a-z0-9-]+-kaiacommand-s-projects\.vercel\.app$/

function setCORS(req, res) {
  const origin = req.headers.origin || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) || PREVIEW_RE.test(origin)
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : ALLOWED_ORIGINS[0])
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-kaia-secret')
}

function checkAuth(req, res) {
  if (!KAIA_SECRET) return true // no configurado → modo dev, permitir
  return req.headers['x-kaia-secret'] === KAIA_SECRET
}

export default async function handler(req, res) {
  setCORS(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  // ── GET: leer sheet y analizar (sin auth — sheet es público) ─────────────
  if (req.method === 'GET') {
    const { url: sheetUrl, ccs = '', nombre = '' } = req.query
    if (!sheetUrl) return res.status(400).json({ error: 'Parámetro url requerido' })

    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) return res.status(400).json({ error: 'URL de Google Sheets inválida' })
    const sheetId = match[1]

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
    let csvText
    try {
      const r = await fetch(csvUrl, { headers: { 'User-Agent': 'KAIA-Command/1.0' }, redirect: 'follow' })
      if (!r.ok) return res.status(403).json({ error: 'Sheet no accesible. Compártelo como "Cualquiera con el enlace puede ver".' })
      csvText = await r.text()
      if (csvText.trim().startsWith('<!')) return res.status(403).json({ error: 'Sheet requiere autenticación. Compártelo como "Cualquiera con el enlace puede ver".' })
    } catch (e) {
      return res.status(500).json({ error: 'Error al leer el sheet: ' + e.message })
    }

    const lines = csvText.split('\n').filter(l => l.trim())
    if (lines.length < 2) return res.status(422).json({ error: 'Sheet vacío o sin datos.' })

    const headers  = parseCSVLine(lines[0]).map(h => h.toUpperCase())
    const findCol  = (...kw) => { for (const k of kw) { const i = headers.findIndex(h => h.includes(k.toUpperCase())); if (i !== -1) return i } return -1 }

    const colName  = findCol('ITEM NAME', 'PRODUCT', 'TITULO', 'TITLE', 'NOMBRE', 'NAME')
    const colDesc  = findCol('DESCRIPTION', 'DESCRIPCION', 'DETAIL', 'DETALLE', 'SPEC', 'CONTENT')
    const colQty   = findCol('QTY TOTAL', 'QTY PER TITLE', 'QTY', 'QUANTITY', 'CANTIDAD')

    const products = lines.slice(1)
      .map((line, i) => {
        const row  = parseCSVLine(line)
        const name = colName >= 0 ? row[colName] : row.find(c => c && !/^\d+$/.test(c)) || ''
        const desc = colDesc >= 0 ? row[colDesc] : ''
        if (!name) return null
        const analysis = analyzeProduct(name, desc)
        return { num: i+1, itemName: name, description: desc, qty: parseInt(row[colQty] || '0') || 0, ...analysis }
      })
      .filter(Boolean)

    if (!products.length) return res.status(422).json({ error: 'No se encontraron productos. Verifica que la primera fila tenga encabezados.' })

    const flagged = products.filter(p => p.aplica)
    return res.status(200).json({ sheetId, ccs, nombre, total: products.length, flagged: flagged.length, exentos: products.filter(p=>p.exento).length, products })
  }

  // ── POST: escribir pestaña CPSIA Filtro (requiere auth) ──────────────────
  if (req.method === 'POST') {
    if (!checkAuth(req, res)) return res.status(401).json({ error: 'No autorizado' })
    let body
    try { body = JSON.parse(req.body || '{}') } catch { return res.status(400).json({ error: 'Body inválido' }) }

    const { sheetId, ccs, nombre, products } = body
    if (!sheetId || !products?.length) return res.status(400).json({ error: 'sheetId y products requeridos' })

    const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN
    if (!refreshToken) return res.status(500).json({ error: 'GOOGLE_SHEETS_REFRESH_TOKEN no configurado.' })

    const accessToken = await getAccessToken(refreshToken)
    if (!accessToken) return res.status(500).json({ error: 'No se pudo obtener acceso a Google Sheets.' })

    try {
      await writeCPSIAFiltro(sheetId, ccs, nombre, products, accessToken)
      return res.status(200).json({ ok: true, message: `Pestaña "CPSIA Filtro" creada en el sheet.` })
    } catch (e) {
      return res.status(500).json({ error: 'Error al escribir en el sheet: ' + e.message })
    }
  }

  return res.status(405).end()
}
