// Vercel serverless function — lee Google Sheet y analiza CPSIA
// GET /api/analyze-cpsia?url=...&ccs=2025B-LCL&nombre=Libros+Q1

// ── Reglas CPSIA (aplica a productos para niños menores de 12 años) ──────────
// Fuente: CPSIA 2008, ASTM F963, 16 CFR 1501, 1303, 1500.18
const CPSIA_RULES = [
  // 1. KIT / Pack / Set con múltiples materiales
  {
    id: 'kit',
    check: (row) => /\bkit\b|\bset\b|conjunto|\bpack\b|bundle|juego|game|puzzle|rompecabezas|memory|memo|matching/i.test(row),
    test: 'Plomo · Ftalatos · ASTM F963 (juguetes)',
    articulo: 'CPSIA §101, §108 · ASTM F963',
    prioridad: 'alta',
  },
  // 2. Metal / partes metálicas / colgantes
  {
    id: 'metal',
    check: (row) => /\bmetal\b|metálico|colgante|charm|zinc|alumin|hierro|iron|acero|steel|copper|cobre|brass|latón|pewter|cadmium|cadmio/i.test(row),
    test: 'Plomo en sustrato + superficial · 16 CFR 1303',
    articulo: 'CPSIA §101 · 16 CFR 1303',
    prioridad: 'alta',
  },
  // 3. Pintura / tinta / acabados de superficie
  {
    id: 'pintura',
    check: (row) => /\bpaint\b|painted|pintura|pintado|coating|coated|barniz|lacquer|enamel|esmalte|tinta|ink\b|impreso|printed|offset|serigraf/i.test(row),
    test: 'Plomo en recubrimiento superficial · 16 CFR 1303',
    articulo: 'CPSIA §101 · 16 CFR 1303',
    prioridad: 'alta',
  },
  // 4. Stickers / vinilo / adhesivo
  {
    id: 'stickers',
    check: (row) => /sticker|vinilo|vinyl|adhesiv|peel|despegable|calcomanía|decal/i.test(row),
    test: 'Plomo en adhesivo · Ftalatos en vinilo',
    articulo: 'CPSIA §101 · ASTM F963',
    prioridad: 'alta',
  },
  // 5. Plástico / PVC / materiales sintéticos
  {
    id: 'plastico',
    check: (row) => /\bplastic\b|plástico|pvc\b|polyvinyl|polipropileno|polietileno|polyethylene|polypropylene|abs\b|nylon|rubber|goma|silicone|silicona/i.test(row),
    test: 'Ftalatos · Plomo en sustrato · ASTM F963',
    articulo: 'CPSIA §108 · ASTM F963',
    prioridad: 'media',
  },
  // 6. Crayones / pigmentos / materiales para colorear
  {
    id: 'pigmentos',
    check: (row) => /crayon|crayón|crayon|marker|plumón|marcador|pigment|pigmento|acrylic|acrílico|chalk|tiza|pastel|tempera|watercolor|acuarela|color.*set|set.*color/i.test(row),
    test: 'ASTM D-4236 · Pigmentos no tóxicos',
    articulo: 'ASTM D-4236 · LHAMA Act',
    prioridad: 'alta',
  },
  // 7. Relleno / tela / peluche / foam
  {
    id: 'tela_relleno',
    check: (row) => /\bfabric\b|tela|stuffed|relleno|foam|espuma|plush|peluche|fleece|velvet|velour|felt|fieltro|cotton|algodón|polyester|poliéster/i.test(row),
    test: 'ASTM F963 (partes pequeñas) · Ftalatos si hay componentes PVC',
    articulo: 'ASTM F963 §4.1 · 16 CFR 1501',
    prioridad: 'media',
  },
  // 8. Piezas pequeñas / magnetos
  {
    id: 'partes_pequenas',
    check: (row) => /small.*part|parte.*peq|magnet|magneto|bead|cuenta|marble|canica|button|botón.*peq|coin|moneda|tiny|miniatur/i.test(row),
    test: '16 CFR 1501 (partes pequeñas < 3 años) · ASTM F963 §4.14',
    articulo: '16 CFR 1501 · CPSIA §106',
    prioridad: 'alta',
  },
  // 9. Actividad / manualidad / experimento
  {
    id: 'actividad',
    check: (row) => /activit|actividad|craft|manualidad|experiment|experimento|science|ciencia|slime|clay|arcilla|playdough|modeling/i.test(row),
    test: 'ASTM F963 · ASTM D-4236 · Plomo en componentes',
    articulo: 'CPSIA §101 · ASTM F963',
    prioridad: 'alta',
  },
  // 10. Libros solo papel — EXENTO
  {
    id: 'papel_exento',
    check: (row) =>
      /\bbook\b|libro\b|cuento\b|lectura\b|colorear\b|coloring\b|puzzle.*paper|paper.*puzzle|sopa.*letra|crucigrama|workbook/i.test(row) &&
      !/metal|plastic|vinyl|sticker|crayon|paint|ink|tinta|magneto|foam|tela|fabric|clay|slime/i.test(row),
    test: 'EXENTO — 16 CFR 1501 (solo papel/cartón sin partes)',
    articulo: '16 CFR 1501 exemption',
    prioridad: 'exento',
    exempt: true,
  },
]

function rowText(cells) {
  return cells.join(' ').toLowerCase()
}

function analyzeCPSIA(products) {
  return products.map(p => {
    // Construir texto completo del producto para análisis
    const fullText = [p.producto, p.codigo, p.formato, p.materiales, p.descripcion, p.grupo]
      .filter(Boolean).join(' ')

    let matchedRule = null

    // Primero chequear exento (papel solo)
    const exentoRule = CPSIA_RULES.find(r => r.exempt && r.check(fullText))
    if (exentoRule) {
      matchedRule = exentoRule
    } else {
      // Luego buscar reglas de alta prioridad
      for (const rule of CPSIA_RULES.filter(r => !r.exempt)) {
        if (rule.check(fullText)) {
          matchedRule = rule
          break
        }
      }
    }

    // Si es libro/cuento pero tiene algo sospechoso → no exento
    const esLibro = /libro|book|cuento|lectura|coloring|colorear/i.test(fullText)
    const tieneMateriales = /metal|plastic|vinyl|sticker|crayon|paint|ink|tinta|magneto|foam/i.test(fullText)

    const aplica = matchedRule ? !matchedRule.exempt : (!esLibro || tieneMateriales)

    return {
      ...p,
      aplica,
      exento:   matchedRule?.exempt || false,
      test:     matchedRule?.test    || 'Revisar manualmente — producto infantil',
      articulo: matchedRule?.articulo || 'CPSIA §101 general',
      regla:    matchedRule?.id      || 'manual',
      prioridad: matchedRule?.prioridad || 'media',
    }
  })
}

// ── CSV parser más robusto (maneja comillas y comas dentro de celdas) ────────
function parseCSVLine(line) {
  const cells = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQ = !inQ }
    else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = '' }
    else cur += ch
  }
  cells.push(cur.trim())
  return cells
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const rawHeaders = parseCSVLine(lines[0]).map(h => h.replace(/"/g,'').trim())
  const headers = rawHeaders.map(h => h.toUpperCase())

  // Detectar columnas por keywords múltiples
  const findCol = (...kw) => {
    for (const k of kw) {
      const i = headers.findIndex(h => h.includes(k.toUpperCase()))
      if (i !== -1) return i
    }
    return -1
  }

  const colProducto    = findCol('ITEM NAME', 'PRODUCT', 'TITULO', 'TITLE', 'NOMBRE', 'NAME', 'ITEM', 'DESCRIPCION')
  const colCodigo      = findCol('INTERNAL CODE', 'CODE', 'CODIGO', 'CÓDIGO', 'SKU', 'REF', 'PART', 'BARCODE')
  const colFormato     = findCol('FORMAT', 'FORMATO', 'GROUP', 'GRUPO', 'TYPE', 'TIPO', 'CATEGORY', 'CATEGOR')
  const colMateriales  = findCol('MATERIAL', 'SPEC', 'CONTENT', 'CONTENIDO', 'COMPOSI')
  const colDescripcion = findCol('DESCRIPTION', 'DESCRIPCION', 'DETAIL', 'DETALLE', 'NOTES', 'NOTA')
  const colQty         = findCol('QTY TOTAL', 'QTY PER TITLE', 'QTY', 'QUANTITY', 'CANTIDAD', 'UNITS', 'UNIDADES', 'PCS')
  const colImg         = findCol('IMAGE', 'IMAGEN', 'IMG', 'PHOTO', 'FOTO', 'PIC')

  const get = (row, idx) => idx >= 0 && row[idx] ? row[idx].replace(/"/g,'').trim() : ''

  return lines.slice(1)
    .map((line, i) => {
      const row = parseCSVLine(line)
      if (row.every(c => !c.trim())) return null // fila vacía

      // Si no pudimos detectar columna de producto, usar la primera celda con contenido
      const producto = get(row, colProducto) || row.find(c => c.trim() && !/^\d+$/.test(c.trim())) || `Producto ${i+1}`

      return {
        num:          i + 1,
        producto:     producto,
        codigo:       get(row, colCodigo),
        formato:      get(row, colFormato),
        materiales:   get(row, colMateriales),
        descripcion:  get(row, colDescripcion),
        grupo:        '',
        qty:          parseInt(get(row, colQty)) || 0,
        img:          get(row, colImg),
        // También guardar todo el texto de la fila para análisis más profundo
        _rawText:     row.join(' '),
      }
    })
    .filter(Boolean)
    .filter(r => r.producto && r.producto !== `Producto ${r.num}`)
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

  // Exportar primera pestaña (sin gid para máxima compatibilidad)
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`

  let csvText
  try {
    const r = await fetch(csvUrl, {
      headers: { 'User-Agent': 'KAIA-Command/1.0' },
      redirect: 'follow',
    })
    if (!r.ok) {
      return res.status(403).json({
        error: 'El Google Sheet no es accesible. Compártelo como "Cualquiera con el enlace puede ver" e intenta de nuevo.',
      })
    }
    csvText = await r.text()
  } catch (e) {
    return res.status(500).json({ error: 'Error al leer el Google Sheet: ' + e.message })
  }

  const products = parseCSV(csvText)
  if (!products.length) {
    return res.status(422).json({ error: 'No se encontraron productos en el sheet. Verifica que la primera fila tenga encabezados.' })
  }

  const analyzed = analyzeCPSIA(products)
  const flagged  = analyzed.filter(p => p.aplica)
  const exentos  = analyzed.filter(p => p.exento)

  return res.status(200).json({
    total:    analyzed.length,
    flagged:  flagged.length,
    exentos:  exentos.length,
    sheetId,
    products: analyzed,
  })
}
