/* ═══════════════════════════════════════
   KAIA Portal — welcome screen + render
   ═══════════════════════════════════════ */
import { initPasswordModal } from '/src/js/auth.js'
import { supabase }          from '/src/js/supabase.js'

initPasswordModal()

const WELCOME_MS = 6500
const FADE_MS    = 1000

const welcomeScreen = document.getElementById('welcomeScreen')
const portalApp     = document.getElementById('portalApp')
const progressFill  = document.getElementById('progressFill')
const portalTs      = document.getElementById('portalTimestamp')

const startTime = performance.now()

;(function tick(now) {
  const pct = Math.min(((now - startTime) / WELCOME_MS) * 100, 100)
  progressFill.style.width = pct + '%'
  pct < 100 ? requestAnimationFrame(tick) : endWelcome()
})(startTime)

function endWelcome() {
  welcomeScreen.classList.add('fade-out')
  setTimeout(() => {
    welcomeScreen.hidden = true
    portalApp.hidden = false
    setTimestamp()
    initPortal()
  }, FADE_MS)
}

function setTimestamp() {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  portalTs.textContent = new Date().toLocaleDateString('es-PA', opts)
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

/* ── Portal data (no supplier, no costs, no BL) ── */
const ETAPAS = [
  { id: 'E1', nombre: 'Origen',        color: '#3BB8E8' },
  { id: 'E2', nombre: 'Cotizaciones',  color: '#7B4CA8' },
  { id: 'E3', nombre: 'Proforma',      color: '#F5A623' },
  { id: 'E4', nombre: 'Diseño',        color: '#E8357A' },
  { id: 'E5', nombre: 'Comercial',     color: '#F06B35' },
  { id: 'E6', nombre: 'Fabricación',   color: '#8DC63F' },
  { id: 'E7', nombre: 'Tráfico',       color: '#2ABDA8' },
]

let PORTAL_CARGAS = [
  { ccs: '2025C-FCL', nombre: 'Colección Navidad 2025',    origen: '🇨🇳 China', tipo: 'FCL', etapa_idx: 5, eta: '15 Feb 2026', dias_eta: 68,  responsable: 'Yonaida', sheet_url: null },
  { ccs: '2025B-LCL', nombre: 'Libros Educativos Q1 2026', origen: '🇮🇳 India', tipo: 'LCL', etapa_idx: 2, eta: 'Mar 2026',    dias_eta: 115, responsable: 'Ruth',    sheet_url: null },
]

// Cache de productos por CCS
const productosCache = {}

/* ── Init: carga datos reales de Supabase ── */
async function initPortal() {
  if (supabase) {
    try {
      // Cargar cargas reales
      const { data: cargas } = await supabase
        .from('cargas')
        .select('ccs, nombre, origen, tipo_embarque, etapa_idx, eta, activa')
        .eq('activa', true)
        .order('semaforo')

      if (cargas?.length) {
        PORTAL_CARGAS = cargas.map(c => ({
          ccs:          c.ccs,
          nombre:       c.nombre,
          origen:       c.origen || '🌍',
          tipo:         c.tipo_embarque || 'FCL',
          etapa_idx:    c.etapa_idx,
          eta:          c.eta || 'Por confirmar',
          dias_eta:     90,
          responsable:  'Yonaida',
          sheet_url:    null,
        }))
      }

      // Cargar sheet_url de análisis CPSIA guardados
      const { data: analisis } = await supabase
        .from('cpsia_analisis')
        .select('ccs, sheet_url, productos')
        .not('sheet_url', 'is', null)

      if (analisis?.length) {
        const sheetMap = {}
        const prodMap  = {}
        analisis.forEach(a => {
          sheetMap[a.ccs] = a.sheet_url
          if (a.productos?.length) {
            prodMap[a.ccs] = a.productos.map(p => p.itemName).filter(Boolean)
          }
        })
        PORTAL_CARGAS.forEach(c => {
          if (sheetMap[c.ccs]) c.sheet_url = sheetMap[c.ccs]
          if (prodMap[c.ccs])  productosCache[c.ccs] = prodMap[c.ccs]
        })
      }
    } catch (e) {
      console.warn('[KAIA Portal] Supabase load error:', e.message)
    }
  }

  renderPortal()
  initChat()
}

/* ── Tracker ── */
function renderTracker(etapa_idx) {
  return `<div class="trkr-wrap">
    <div class="load-tracker">
      ${ETAPAS.map((e, i) => {
        const state = i < etapa_idx ? 'done' : i === etapa_idx ? 'active' : 'pending'
        const line  = i < ETAPAS.length - 1
          ? `<div class="trkr-line trkr-line--${i < etapa_idx ? 'done' : 'pending'}" style="--c:${e.color}"></div>`
          : ''
        return `
          <div class="trkr-step trkr-step--${state}" style="--c:${e.color}">
            <div class="trkr-dot">${state === 'done' ? '✓' : ''}</div>
            <span class="trkr-eid">${e.id}</span>
            <span class="trkr-name">${e.nombre}</span>
          </div>
          ${line}`
      }).join('')}
    </div>
  </div>`
}

function etaLabel(dias) {
  if (dias <= 7)  return { text: 'Esta semana',  cls: 'eta-pill--urgent' }
  if (dias <= 30) return { text: 'Este mes',      cls: 'eta-pill--soon'   }
  if (dias <= 60) return { text: `en ${dias} días`, cls: 'eta-pill--normal' }
  return { text: `en ${dias} días`, cls: 'eta-pill--far' }
}

/* ── Tarjeta de carga ── */
function renderLoadCard(c) {
  const etapa      = ETAPAS[c.etapa_idx]
  const eta        = etaLabel(c.dias_eta)
  const hasSheet   = c.etapa_idx >= 2 && c.sheet_url
  const hasCached  = !!productosCache[c.ccs]

  return `
    <div class="load-card" data-ccs="${c.ccs}">

      <div class="load-card-header">
        <span class="load-ccs">${c.ccs}</span>
        <div class="load-header-chips">
          <span class="load-tipo-chip">${c.tipo}</span>
          <span class="load-etapa-chip" style="--c:${etapa.color}">${etapa.id} · ${etapa.nombre}</span>
        </div>
      </div>

      <h3 class="load-nombre">${c.nombre}</h3>

      <div class="load-meta">
        <span class="load-origen">${c.origen}</span>
        <span class="load-responsable">
          <span class="load-resp-avatar">${c.responsable.charAt(0)}</span>
          ${c.responsable}
        </span>
      </div>

      <div class="load-pills">
        <span class="load-pill ${eta.cls}">
          ⏱ ${eta.text} · ETA ${c.eta}
        </span>
      </div>

      ${renderTracker(c.etapa_idx)}

      ${hasSheet || hasCached ? `
        <div class="load-productos-section">
          <button class="load-productos-toggle" data-ccs="${c.ccs}"
                  data-sheet="${c.sheet_url || ''}">
            <span class="load-productos-arrow">▸</span>
            <span class="load-productos-label">
              ${hasCached ? `Ver productos (${productosCache[c.ccs].length})` : 'Ver productos'}
            </span>
          </button>
          <div class="load-productos-list" id="prod-${c.ccs}" hidden>
            ${hasCached ? renderProductList(productosCache[c.ccs]) : '<p class="load-prod-loading">Cargando...</p>'}
          </div>
        </div>
      ` : ''}
    </div>
  `
}

function renderProductList(titles) {
  if (!titles?.length) return '<p class="load-prod-empty">Sin títulos registrados.</p>'
  return `<ol class="load-prod-ol">
    ${titles.map(t => `<li class="load-prod-item">${esc(t)}</li>`).join('')}
  </ol>`
}

/* ── Portal render ── */
function renderPortal() {
  const grid = document.getElementById('portalGrid')
  if (!grid) return

  const activas    = PORTAL_CARGAS.length
  const transito   = PORTAL_CARGAS.filter(c => c.etapa_idx === 6).length
  const produccion = PORTAL_CARGAS.filter(c => c.etapa_idx >= 5).length

  document.getElementById('statActivas').textContent    = activas
  document.getElementById('statTransito').textContent   = transito
  document.getElementById('statProduccion').textContent = produccion

  grid.innerHTML = PORTAL_CARGAS.map(renderLoadCard).join('')

  // Bind toggles de productos
  grid.querySelectorAll('.load-productos-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleProductos(btn))
  })
}

async function toggleProductos(btn) {
  const ccs      = btn.dataset.ccs
  const sheetUrl = btn.dataset.sheet
  const listEl   = document.getElementById(`prod-${ccs}`)
  const arrow    = btn.querySelector('.load-productos-arrow')
  const label    = btn.querySelector('.load-productos-label')
  if (!listEl) return

  const isOpen = !listEl.hidden
  if (isOpen) {
    listEl.hidden = true
    arrow.textContent = '▸'
    return
  }

  listEl.hidden = false
  arrow.textContent = '▾'

  // Si ya está en caché, mostrar directo
  if (productosCache[ccs]) {
    listEl.innerHTML = renderProductList(productosCache[ccs])
    label.textContent = `Ver productos (${productosCache[ccs].length})`
    return
  }

  // Fetch del sheet
  if (!sheetUrl) {
    listEl.innerHTML = '<p class="load-prod-empty">Sin link de proforma disponible.</p>'
    return
  }

  listEl.innerHTML = '<p class="load-prod-loading">⏳ Cargando títulos...</p>'
  try {
    const res  = await fetch(`/api/products-list?url=${encodeURIComponent(sheetUrl)}`)
    const data = await res.json()
    if (res.ok && data.products?.length) {
      productosCache[ccs] = data.products
      listEl.innerHTML = renderProductList(data.products)
      label.textContent = `Ver productos (${data.products.length})`
    } else {
      listEl.innerHTML = '<p class="load-prod-empty">No se encontraron títulos.</p>'
    }
  } catch {
    listEl.innerHTML = '<p class="load-prod-empty">Error al cargar.</p>'
  }
}

/* ══════════════════════════════════════════
   CHAT FLOTANTE — Agente KAIA Portal
   ══════════════════════════════════════════ */

const CHAT_RULES = [
  // Sin datos sensibles
  /precio|costo|valor|factura|pago|proveedor|supplier|bl\b|bill.of|contenedor|container|agente.*adua|customs/i,
]

function isSensitive(text) {
  return CHAT_RULES.some(r => r.test(text))
}

const ETAPA_LABELS = ETAPAS.map(e => `${e.id} ${e.nombre}`)

function responderPregunta(pregunta) {
  const q    = pregunta.toLowerCase()
  const ccs  = (pregunta.match(/\b(20\d{2}[A-Z]-[A-Z]{2,5})\b/i) || [])[1]
  const carga = ccs
    ? PORTAL_CARGAS.find(c => c.ccs.toUpperCase() === ccs.toUpperCase())
    : null

  if (isSensitive(q)) {
    return '⚠️ Esa información es confidencial y no está disponible en el portal. Para consultas sobre precios, documentos o proveedores, contacta a Paulet directamente.'
  }

  // Pregunta sobre ETA / cuándo llega
  if (/cuando|llega|eta|fecha|arriba|arrive/i.test(q)) {
    if (carga) return `📦 **${carga.nombre}** (${carga.ccs}) tiene ETA estimada: **${carga.eta}**. Etapa actual: ${ETAPAS[carga.etapa_idx].id} ${ETAPAS[carga.etapa_idx].nombre}.`
    const enTransito = PORTAL_CARGAS.filter(c => c.etapa_idx >= 5)
    if (!enTransito.length) return 'No hay cargas en tránsito en este momento.'
    return '📦 Cargas próximas a llegar:\n' + enTransito.map(c => `• **${c.nombre}** — ETA ${c.eta}`).join('\n')
  }

  // Pregunta sobre etapa
  if (/etapa|estado|fase|stage|donde|dónde|proceso/i.test(q)) {
    if (carga) return `📋 **${carga.nombre}** está en **${ETAPAS[carga.etapa_idx].id} — ${ETAPAS[carga.etapa_idx].nombre}**.`
    return '📋 Estado actual de cargas:\n' + PORTAL_CARGAS.map(c => `• **${c.nombre}** → ${ETAPAS[c.etapa_idx].id} ${ETAPAS[c.etapa_idx].nombre}`).join('\n')
  }

  // Pregunta sobre productos / qué viene
  if (/producto|titulo|título|libro|viene|contiene|incluye/i.test(q)) {
    if (carga) {
      const cache = productosCache[carga.ccs]
      if (cache?.length) return `📚 **${carga.nombre}** incluye ${cache.length} título${cache.length !== 1 ? 's' : ''}:\n` + cache.slice(0, 8).map(t => `• ${t}`).join('\n') + (cache.length > 8 ? `\n... y ${cache.length - 8} más` : '')
      return `📚 Los títulos de **${carga.nombre}** estarán disponibles cuando el análisis de proforma esté completado.`
    }
    const conProductos = PORTAL_CARGAS.filter(c => productosCache[c.ccs])
    if (!conProductos.length) return 'Aún no hay listas de productos disponibles. Se generan cuando la proforma es analizada.'
    return '📚 Cargas con lista de productos:\n' + conProductos.map(c => `• **${c.nombre}** — ${productosCache[c.ccs].length} títulos`).join('\n')
  }

  // Cargas en tránsito
  if (/tránsito|transito|embarcado|ship|sailing|navegando/i.test(q)) {
    const t = PORTAL_CARGAS.filter(c => c.etapa_idx === 6)
    if (!t.length) return 'No hay cargas en tránsito actualmente.'
    return '🚢 En tránsito:\n' + t.map(c => `• **${c.nombre}** — ETA ${c.eta}`).join('\n')
  }

  // Cargas de diseño
  if (/diseño|arte|artwork|design/i.test(q)) {
    const d = PORTAL_CARGAS.filter(c => c.etapa_idx === 3)
    if (!d.length) return 'No hay cargas en etapa de diseño actualmente.'
    return '🎨 Cargas en diseño:\n' + d.map(c => `• **${c.nombre}** (${c.ccs})`).join('\n')
  }

  // Cargas activas general
  if (/activ|carg|lista|todas/i.test(q)) {
    return `📦 Hay **${PORTAL_CARGAS.length}** carga${PORTAL_CARGAS.length !== 1 ? 's' : ''} activa${PORTAL_CARGAS.length !== 1 ? 's' : ''}:\n` +
      PORTAL_CARGAS.map(c => `• **${c.nombre}** — ${ETAPAS[c.etapa_idx].id} ${ETAPAS[c.etapa_idx].nombre} · ETA ${c.eta}`).join('\n')
  }

  return `Puedo ayudarte con: estado de cargas, ETA, lista de productos, cargas en diseño o en tránsito. ¿Sobre qué carga necesitas información?`
}

function formatChatText(text) {
  // Escape first, then restore intentional formatting markers
  const escaped = esc(text)
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function initChat() {
  const fab     = document.getElementById('chatFab')
  const drawer  = document.getElementById('chatDrawer')
  const closeBtn = document.getElementById('chatClose')
  const input   = document.getElementById('chatInput')
  const sendBtn = document.getElementById('chatSend')
  const msgs    = document.getElementById('chatMessages')
  if (!fab) return

  fab.addEventListener('click', () => {
    drawer.hidden = !drawer.hidden
    if (!drawer.hidden) input.focus()
  })
  closeBtn?.addEventListener('click', () => { drawer.hidden = true })

  function sendMsg() {
    const text = input.value.trim()
    if (!text) return

    // Render user message (escaped — viene de input del usuario)
    msgs.innerHTML += `<div class="chat-msg chat-msg--user"><span class="chat-bubble">${esc(text)}</span></div>`
    input.value = ''

    // Typing indicator
    const typingId = 'typing-' + Date.now()
    msgs.innerHTML += `<div class="chat-msg chat-msg--kaia" id="${typingId}"><span class="chat-bubble chat-typing">...</span></div>`
    msgs.scrollTop = msgs.scrollHeight

    setTimeout(() => {
      const reply    = responderPregunta(text)
      const typingEl = document.getElementById(typingId)
      if (typingEl) typingEl.remove()
      msgs.innerHTML += `<div class="chat-msg chat-msg--kaia"><span class="chat-bubble">${formatChatText(reply)}</span></div>`
      msgs.scrollTop = msgs.scrollHeight
    }, 600)
  }

  sendBtn?.addEventListener('click', sendMsg)
  input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } })

  // Sugerencias iniciales
  const sugerencias = [
    '¿Cuáles cargas están activas?',
    '¿Qué viene en la carga 2025B-LCL?',
    '¿Cuándo llega la siguiente carga?',
  ]
  msgs.innerHTML = `
    <div class="chat-msg chat-msg--kaia">
      <span class="chat-bubble">Hola 👋 Soy KAIA, tu asistente de producción. Puedo decirte el estado de las cargas, ETA y lista de productos. ¿En qué te ayudo?</span>
    </div>
    <div class="chat-suggestions">
      ${sugerencias.map(s => `<button class="chat-suggestion">${s}</button>`).join('')}
    </div>
  `
  msgs.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent
      sendMsg()
      btn.closest('.chat-suggestions')?.remove()
    })
  })
}
