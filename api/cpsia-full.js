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
  const exentos = products.filter(p => p.exento)
  const fecha   = new Date().toLocaleDateString('es-PA', { day:'2-digit', month:'short', year:'numeric' })

  // ── 1. Obtener sheets existentes ─────────────────────────────────────────
  const ssRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const ss     = await ssRes.json()
  const sheets = ss.sheets || []
  const existing = sheets.find(s => s.properties.title === 'CPSIA Filtro')

  // ── 2. Recrear la pestaña ────────────────────────────────────────────────
  const setupRequests = []
  if (existing) setupRequests.push({ deleteSheet: { sheetId: existing.properties.sheetId } })
  setupRequests.push({ addSheet: { properties: { title: 'CPSIA Filtro', tabColor: { red:0.957, green:0.263, blue:0.212 } } } })

  const setupRes  = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: setupRequests }),
  })
  const setupData = await setupRes.json()
  const newSid    = setupData.replies?.find(r => r.addSheet)?.addSheet?.properties?.sheetId

  // ── 3. Escribir datos ────────────────────────────────────────────────────
  // Fila 1: título principal
  // Fila 2: resumen stats
  // Fila 3: vacía
  // Fila 4: headers de tabla
  // Filas 5+: productos
  // Última: nota de pie
  const DATA_START_ROW = 4 // 0-indexed fila de headers (fila 5 en Sheets)

  const titleRow   = [`🔍 CPSIA Filtro — ${nombre || ccs}`, '', '', '', '', `Generado: ${fecha} · KAIA Command`]
  const summaryRow = [
    `📊 Total analizados: ${products.length}`,
    `⚠️ Requieren prueba: ${flagged.length}`,
    `✅ Exentos: ${exentos.length}`,
    '',
    flagged.length ? `⚠️ ACCIÓN REQUERIDA — ${flagged.length} producto${flagged.length>1?'s':''} necesita${flagged.length>1?'n':''} prueba CPSIA` : '✅ Sin acciones requeridas',
  ]
  const headerRow  = ['#', 'ITEM NAME', 'DESCRIPTION', 'APLICA CPSIA', 'TEST REQUERIDO', 'NORMA / ARTÍCULO']
  const dataRows   = products.map((p, i) => [
    i + 1,
    p.itemName   || '',
    p.description || '',
    p.aplica ? '⚠️ SÍ — REQUIERE PRUEBA' : (p.exento ? '✅ EXENTO' : '—'),
    p.test       || '',
    p.articulo   || '',
  ])
  const footerRow = ['', '', '', '', '', `kaia.sicoben.com · KAIA Command · Sicoben Ediciones`]

  const values = [titleRow, summaryRow, [], headerRow, ...dataRows, [], footerRow]

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'CPSIA Filtro'!A1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    }
  )

  // ── 4. Formatear la pestaña ──────────────────────────────────────────────
  const RED    = { red:0.957, green:0.263, blue:0.212 }  // #F44336
  const GREEN  = { red:0.298, green:0.686, blue:0.314 }  // #4CAF50
  const AMBER  = { red:0.961, green:0.651, blue:0.137 }  // #F5A623
  const DARK   = { red:0.075, green:0.078, blue:0.102 }  // #13141A
  const WHITE  = { red:1, green:1, blue:1 }
  const LIGHT_RED   = { red:1, green:0.922, blue:0.922 }
  const LIGHT_GREEN = { red:0.922, green:0.957, blue:0.922 }
  const LIGHT_GRAY  = { red:0.957, green:0.957, blue:0.957 }

  function cell(r, c) { return { sheetId: newSid, startRowIndex:r, endRowIndex:r+1, startColumnIndex:c, endColumnIndex:c+1 } }
  function row(r, c1=0, c2=6) { return { sheetId: newSid, startRowIndex:r, endRowIndex:r+1, startColumnIndex:c1, endColumnIndex:c2 } }
  function bgColor(range, color) {
    return { repeatCell: { range, cell: { userEnteredFormat: { backgroundColor: color } }, fields: 'userEnteredFormat.backgroundColor' } }
  }
  function textFormat(range, opts) {
    return { repeatCell: { range, cell: { userEnteredFormat: { textFormat: opts } }, fields: 'userEnteredFormat.textFormat' } }
  }
  function merge(r1, r2, c1, c2) {
    return { mergeCells: { range: { sheetId: newSid, startRowIndex:r1, endRowIndex:r2, startColumnIndex:c1, endColumnIndex:c2 }, mergeType: 'MERGE_ALL' } }
  }

  const formatRequests = [
    // Fila título — fondo oscuro, texto blanco, bold, grande
    bgColor(row(0), DARK),
    textFormat(row(0), { foregroundColor: WHITE, bold: true, fontSize: 13 }),
    merge(0, 1, 0, 5),

    // Fila resumen — fondo ámbar si hay flagged, verde si no
    bgColor(row(1), flagged.length ? { red:1, green:0.953, blue:0.835 } : LIGHT_GREEN),
    textFormat(row(1), { bold: true, fontSize: 10 }),

    // Fila headers (fila 4, index 3) — fondo gris oscuro, texto blanco, bold
    bgColor(row(3), { red:0.259, green:0.259, blue:0.259 }),
    textFormat(row(3), { foregroundColor: WHITE, bold: true }),

    // Columnas anchas
    { updateDimensionProperties: { range: { sheetId: newSid, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 220 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId: newSid, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 280 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId: newSid, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 260 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId: newSid, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 220 }, fields: 'pixelSize' } },

    // Freeze primera fila y header
    { updateSheetProperties: { properties: { sheetId: newSid, gridProperties: { frozenRowCount: 4 } }, fields: 'gridProperties.frozenRowCount' } },
  ]

  // Colorear filas de datos
  products.forEach((p, i) => {
    const rowIdx = DATA_START_ROW + 1 + i // +1 porque hay headerRow
    if (p.aplica) {
      formatRequests.push(bgColor(row(rowIdx), LIGHT_RED))
      formatRequests.push(textFormat({ sheetId: newSid, startRowIndex:rowIdx, endRowIndex:rowIdx+1, startColumnIndex:3, endColumnIndex:4 }, { foregroundColor: RED, bold: true }))
    } else if (p.exento) {
      formatRequests.push(bgColor(row(rowIdx), LIGHT_GREEN))
      formatRequests.push(textFormat({ sheetId: newSid, startRowIndex:rowIdx, endRowIndex:rowIdx+1, startColumnIndex:3, endColumnIndex:4 }, { foregroundColor: GREEN, bold: true }))
    } else if (i % 2 === 0) {
      formatRequests.push(bgColor(row(rowIdx), LIGHT_GRAY))
    }
  })

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: formatRequests }),
  })

  return newSid
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

    const allLines = csvText.split('\n').filter(l => l.trim())
    if (allLines.length < 2) return res.status(422).json({ error: 'Sheet vacío o sin datos.' })

    // Encontrar la fila de headers real — buscar la que contenga 'ITEM NAME' o 'DESCRIPTION'
    const KEY_COLS = ['ITEM NAME', 'DESCRIPTION', 'PRODUCT', 'TITULO', 'NOMBRE', 'ITEM']
    let headerIdx = 0
    for (let i = 0; i < Math.min(5, allLines.length); i++) {
      const upper = allLines[i].toUpperCase()
      if (KEY_COLS.some(k => upper.includes(k))) { headerIdx = i; break }
    }

    const lines   = allLines.slice(headerIdx)
    const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase())
    const findCol = (...kw) => { for (const k of kw) { const i = headers.findIndex(h => h.includes(k.toUpperCase())); if (i !== -1) return i } return -1 }

    const colName = findCol('ITEM NAME', 'PRODUCT', 'TITULO', 'TITLE', 'NOMBRE', 'NAME')
    const colDesc = findCol('DESCRIPTION', 'DESCRIPCION', 'DETAIL', 'DETALLE', 'SPEC', 'CONTENT')
    const colQty  = findCol('QTY TOTAL', 'QTY PER TITLE', 'QTY', 'QUANTITY', 'CANTIDAD')

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

  // ── POST: escribir pestaña CPSIA Filtro ──────────────────────────────────
  if (req.method === 'POST') {
    // Leer body del stream (Vercel no lo parsea automáticamente)
    let rawBody = ''
    if (typeof req.body === 'string') {
      rawBody = req.body
    } else if (req.body && typeof req.body === 'object') {
      rawBody = JSON.stringify(req.body) // ya parseado por Vercel en algunos casos
    } else {
      rawBody = await new Promise((resolve, reject) => {
        let data = ''
        req.on('data', chunk => { data += chunk })
        req.on('end', () => resolve(data))
        req.on('error', reject)
      })
    }
    let body
    try { body = typeof rawBody === 'object' ? rawBody : JSON.parse(rawBody || '{}') } catch { return res.status(400).json({ error: 'Body inválido' }) }

    const { sheetId, ccs, nombre, products } = body
    if (!sheetId || !products?.length) return res.status(400).json({ error: 'sheetId y products requeridos' })

    // Validaciones de tamaño para prevenir abuso
    if (products.length > 500) return res.status(400).json({ error: 'Máximo 500 productos por análisis' })
    const MAX = 500
    for (const p of products) {
      if ((p.itemName||'').length > MAX || (p.description||'').length > MAX)
        return res.status(400).json({ error: 'Texto de producto demasiado largo' })
    }
    // Validar sheetId solo contiene caracteres válidos de Google Sheets
    if (!/^[a-zA-Z0-9_-]+$/.test(sheetId)) return res.status(400).json({ error: 'sheetId inválido' })

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
