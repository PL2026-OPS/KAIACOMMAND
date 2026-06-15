// Vercel serverless function — lee un Google Sheet y analiza productos CPSIA
// GET /api/analyze-cpsia?url=https://docs.google.com/spreadsheets/d/...

const CPSIA_RULES = [
  {
    id: 'kit',
    label: 'KIT',
    check: (formato, mats) => /KIT/i.test(formato),
    test: 'Plomo · Ftalatos · ASTM F963',
    exempt: false,
  },
  {
    id: 'metal',
    label: 'Metal / Colgante',
    check: (formato, mats) =>
      /COLGANTE/i.test(formato) ||
      /\bmetal\b|zinc|alumin|hierro|iron|acero|steel/i.test(mats),
    test: 'Plomo sustrato + superficial',
    exempt: false,
  },
  {
    id: 'stickers',
    label: 'Stickers / Vinilo',
    check: (formato, mats) =>
      /STICKER/i.test(formato) ||
      /vinilo|vinyl|adhesivo/i.test(mats),
    test: 'Plomo en adhesivo',
    exempt: false,
  },
  {
    id: 'pigmentos',
    label: 'Pigmentos / Crayones',
    check: (formato, mats) =>
      /pigmento|pintura|crayon|crayón|ink\b|tinta/i.test(mats),
    test: 'ASTM D-4236',
    exempt: false,
  },
  {
    id: 'papel',
    label: 'Solo papel',
    check: (formato, mats) =>
      /LECTURA|COLOREAR|SOPAS|CRUCIGRAMA|CUENTO/i.test(formato) &&
      !/metal|plástico|plastic|vinilo|crayon|pigmento|metal/i.test(mats),
    test: 'EXENTO — 16 CFR 1501',
    exempt: true,
  },
]

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toUpperCase())

  const findCol = (...candidates) => {
    for (const c of candidates) {
      const idx = headers.findIndex(h => h.includes(c))
      if (idx !== -1) return idx
    }
    return -1
  }

  const colProducto  = findCol('PRODUCT', 'PRODUCTO', 'TITULO', 'TITLE', 'NOMBRE', 'NAME')
  const colCodigo    = findCol('CODE', 'CODIGO', 'CÓDIGO', 'SKU', 'REF')
  const colFormato   = findCol('FORMAT', 'FORMATO', 'GROUP', 'GRUPO', 'TYPE', 'TIPO')
  const colMateriales = findCol('MATERIAL', 'SPEC', 'SPECS', 'DESCRIPCION', 'DESCRIPTION')
  const colQty       = findCol('QTY', 'QUANTITY', 'CANTIDAD', 'UNITS', 'UNIDADES')

  const get = (row, idx) => idx >= 0 ? (row[idx] || '').replace(/"/g, '').trim() : ''

  return lines.slice(1).map((line, i) => {
    const row = line.split(',')
    return {
      num:         i + 1,
      producto:    get(row, colProducto)  || `Producto ${i + 1}`,
      codigo:      get(row, colCodigo)    || '—',
      formato:     get(row, colFormato)   || '',
      materiales:  get(row, colMateriales) || '',
      qty:         parseInt(get(row, colQty)) || 0,
    }
  }).filter(r => r.producto && r.producto !== `Producto ${r.num}` || r.codigo !== '—')
}

function analyzeCPSIA(products) {
  return products.map(p => {
    const fmt  = p.formato.toUpperCase()
    const mats = p.materiales.toUpperCase()

    let rule = null
    for (const r of CPSIA_RULES) {
      if (r.check(fmt, mats)) { rule = r; break }
    }

    return {
      ...p,
      aplica:  rule ? !rule.exempt : false,
      exento:  rule?.exempt || false,
      test:    rule?.test || 'Revisar manualmente',
      regla:   rule?.label || 'No identificado',
    }
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
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
    const r = await fetch(csvUrl, {
      headers: { 'User-Agent': 'KAIA-Command/1.0' },
      redirect: 'follow',
    })
    if (!r.ok) {
      return res.status(403).json({
        error: 'El Google Sheet no es accesible. Asegúrate de compartirlo como "Cualquiera con el enlace puede ver".',
      })
    }
    csvText = await r.text()
  } catch (e) {
    return res.status(500).json({ error: 'Error al leer el Google Sheet: ' + e.message })
  }

  const products  = parseCSV(csvText)
  const analyzed  = analyzeCPSIA(products)
  const flagged   = analyzed.filter(p => p.aplica)
  const exentos   = analyzed.filter(p => p.exento)

  return res.status(200).json({
    total:    analyzed.length,
    flagged:  flagged.length,
    exentos:  exentos.length,
    products: analyzed,
  })
}
