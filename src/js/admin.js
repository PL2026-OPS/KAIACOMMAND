/* ═══════════════════════════════════════
   KAIA Admin — mock data + render logic
   ═══════════════════════════════════════ */
import { initPasswordModal } from '/src/js/auth.js'
import { supabase } from '/src/js/supabase.js'

initPasswordModal()

// Populate sidebar with session user
const _u = JSON.parse(sessionStorage.getItem('kaia_user') || '{}')
if (_u.name) {
  const avatarEl = document.getElementById('sidebarAvatar')
  const nameEl   = document.getElementById('sidebarName')
  if (avatarEl) avatarEl.textContent = _u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (nameEl)   nameEl.textContent   = _u.name
}

const ETAPAS = [
  { id: 'E1', nombre: 'Origen',        color: '#3BB8E8' },
  { id: 'E2', nombre: 'Cotizaciones',  color: '#7B4CA8' },
  { id: 'E3', nombre: 'Proforma',      color: '#F5A623' },
  { id: 'E4', nombre: 'Diseño',        color: '#E8357A' },
  { id: 'E5', nombre: 'Comercial',     color: '#F06B35' },
  { id: 'E6', nombre: 'Fabricación',   color: '#8DC63F' },
  { id: 'E7', nombre: 'Tráfico',       color: '#2ABDA8' },
]

let MOCK_CARGAS = [
  {
    ccs: '2025C-FCL',
    nombre: 'Colección Navidad 2025',
    proveedor: 'Ningbo Jumbo Co. Ltd.',
    origen: '🇨🇳 China',
    tipo_embarque: 'FCL',
    etapa_idx: 5,
    dias_en_etapa: 21,
    eta: '15 Feb 2026',
    semaforo: 'rojo',
    ultimo_evento: 'Sin respuesta — reintento automático #2 enviado',
    correos_pendientes: 2,
    cpsia_pendiente: false,
  },
  {
    ccs: '2025B-LCL',
    nombre: 'Libros Educativos Q1 2026',
    proveedor: 'Mumbai Book Printers Pvt.',
    origen: '🇮🇳 India',
    tipo_embarque: 'LCL',
    etapa_idx: 2,
    dias_en_etapa: 3,
    eta: 'Mar 2026',
    semaforo: 'amarillo',
    ultimo_evento: 'Proforma recibida — análisis CPSIA pendiente',
    correos_pendientes: 1,
    cpsia_pendiente: true,
  },
]

// Carencias requeridas por etapa (F-07)
const CARENCIAS = {
  0: ['Proveedor confirmado', 'Código CCS asignado'],
  1: ['Cotización recibida', 'Proveedor seleccionado', 'Precio aprobado'],
  2: ['Proforma firmada', 'Anticipo confirmado', 'Fecha de producción', 'Análisis CPSIA'],
  3: ['Artes aprobados', 'PPS aprobado', 'Instrucciones enviadas al proveedor'],
  4: ['Notificación a ventas enviada', 'Listado de títulos confirmado'],
  5: ['Reporte de avance semanal', 'Fecha estimada de finalización'],
  6: ['BL/AWB registrado', 'ETA confirmada', 'Documentos aduanales completos'],
}

// Estado de campos por carga (mock: true = completo, false = faltante)
const MOCK_CAMPOS = {
  '2025C-FCL': { 0: true, 1: true, 2: true, 3: true, 4: true, 5: [true, false] },
  '2025B-LCL': { 0: true, 1: true, 2: [true, false, true, false] },
}

let MOCK_HISTORIAL = {
  '2025C-FCL': [
    {
      tipo: 'alerta',
      fecha: '8 dic · 14:32',
      icono: '🔴',
      texto: 'Reintento automático #2 enviado a Ningbo Jumbo — 96h sin respuesta.',
    },
    {
      tipo: 'correo_enviado',
      fecha: '8 dic · 09:15',
      icono: '📤',
      texto: '[Follow-up] Proforma Request — Colección Navidad 2025',
      detalle: 'Reenvío automático del sistema con prefijo [Follow-up] en el asunto.',
    },
    {
      tipo: 'alerta',
      fecha: '6 dic · 09:00',
      icono: '🔔',
      texto: 'Reintento automático #1 disparado — 48h sin respuesta del proveedor.',
    },
    {
      tipo: 'correo_enviado',
      fecha: '4 dic · 11:20',
      icono: '📤',
      texto: 'Proforma Request — Colección Navidad 2025',
      detalle: 'Correo enviado por Paulet desde KAIA. Contador de 48h iniciado.',
    },
    {
      tipo: 'monday',
      fecha: '28 nov · 16:45',
      icono: '📌',
      texto: 'Update publicado en Monday · E6 Fabricación',
      detalle: '📧 Correo de proveedor — 28 nov 15:10\nDe: johnson@ninbojumbo.com\nResumen: Proveedor confirma inicio de producción el 25 nov. Fecha estimada de envío: 10 ene.',
    },
    {
      tipo: 'confirmacion',
      fecha: '28 nov · 15:45',
      icono: '✅',
      texto: 'Paulet confirmó la asociación del correo → 2025C-FCL',
    },
    {
      tipo: 'correo_recibido',
      fecha: '28 nov · 15:10',
      icono: '📥',
      texto: 'Production start confirmed — Ningbo Jumbo Co.',
      detalle: 'Hello Paulet,\n\nWe confirm production started on November 25th. Expected completion date is January 10th, 2026.\n\nBest regards,\nJohnson Li',
      adjunto: 'production_schedule_nov25.pdf',
    },
  ],
  '2025B-LCL': [
    {
      tipo: 'alerta',
      fecha: '8 dic · 10:00',
      icono: '⚠️',
      texto: 'CPSIA: Análisis pendiente — proforma recibida pero no procesada.',
    },
    {
      tipo: 'monday',
      fecha: '7 dic · 19:00',
      icono: '📌',
      texto: 'Update publicado en Monday · E3 Proforma',
      detalle: '📧 Correo de proveedor — 7 dic 18:22\nDe: orders@mumbaibookprinters.in\nResumen: Proforma invoice adjunta con precios finales. Total USD 18,400. Solicitan confirmación de anticipo del 30%.',
    },
    {
      tipo: 'confirmacion',
      fecha: '7 dic · 18:55',
      icono: '✅',
      texto: 'Paulet confirmó la asociación del correo → 2025B-LCL',
    },
    {
      tipo: 'correo_recibido',
      fecha: '7 dic · 18:22',
      icono: '📥',
      texto: 'Proforma Invoice — Q1 2026 Books · Mumbai Book Printers',
      detalle: 'Dear Paulet,\n\nPlease find attached our proforma invoice for the Q1 2026 books order.\n\nTotal: USD 18,400 | 30% advance required.\n\nKind regards,\nRajesh Kumar',
      adjunto: 'proforma_q1_2026_final.pdf',
    },
    {
      tipo: 'correo_enviado',
      fecha: '5 dic · 09:00',
      icono: '📤',
      texto: 'Proforma Request — Libros Educativos Q1 2026',
      detalle: 'Correo enviado por Paulet desde KAIA. Contador de 48h iniciado.',
    },
  ],
}

/* ═══════════════════════════════
   RENDER: Cards panel (Panel 1)
   ═══════════════════════════════ */

const SEMAFORO = {
  rojo:     { icon: '🔴', cls: 'badge--rojo',    label: 'Alerta' },
  amarillo: { icon: '🟡', cls: 'badge--amarillo', label: 'Atención' },
  verde:    { icon: '🟢', cls: 'badge--verde',    label: 'OK' },
}

function renderMiniTracker(etapa_idx) {
  return `
    <div class="stage-tracker">
      ${ETAPAS.map((e, i) => {
        let cls = 'pip'
        if (i < etapa_idx)  cls += ' pip--done'
        if (i === etapa_idx) cls += ' pip--active'
        if (i > etapa_idx)  cls += ' pip--pending'
        return `
          <div class="${cls}" style="--c:${e.color}" title="${e.id} ${e.nombre}">
            ${i < etapa_idx ? '<svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1.5,4 3,5.5 6.5,2" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
          </div>
          ${i < 6 ? '<div class="pip-connector"></div>' : ''}
        `
      }).join('')}
    </div>
    <div class="stage-labels">
      ${ETAPAS.map((e, i) => `<span class="stage-lbl ${i === etapa_idx ? 'stage-lbl--active' : ''}" style="${i === etapa_idx ? `--c:${e.color}` : ''}">${e.id}</span>`).join('')}
    </div>
  `
}

function renderCard(c) {
  const etapa = ETAPAS[c.etapa_idx]
  const s = SEMAFORO[c.semaforo]
  return `
    <article class="carga-card carga-card--${c.semaforo}" data-ccs="${c.ccs}">
      <div class="card-top">
        <div class="card-top-left">
          <span class="ccs-code">${c.ccs}</span>
          <span class="badge-tipo">${c.tipo_embarque}</span>
        </div>
        <div class="card-top-right">
          ${c.cpsia_pendiente ? `<span class="badge-cpsia">⚠ CPSIA</span>` : ''}
          ${c.correos_pendientes > 0 ? `<span class="badge-correos">${c.correos_pendientes} correo${c.correos_pendientes > 1 ? 's' : ''}</span>` : ''}
          <span class="badge-semaforo">${s.icon}</span>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-nombre">${c.nombre}</h3>
        <p class="card-proveedor">${c.proveedor} <span class="card-origen">${c.origen}</span></p>
      </div>
      <div class="card-tracker">${renderMiniTracker(c.etapa_idx)}</div>
      <div class="card-footer">
        <div class="card-meta">
          <span class="card-etapa-chip" style="--c:${etapa.color}">${etapa.id} ${etapa.nombre}</span>
          <span class="card-dias">${c.dias_en_etapa} día${c.dias_en_etapa !== 1 ? 's' : ''}</span>
        </div>
        <p class="card-evento">${c.ultimo_evento}</p>
        <div class="card-actions">
          <span class="card-eta">ETA: ${c.eta}</span>
          <button class="btn-detalle">Ver detalle →</button>
        </div>
      </div>
    </article>
  `
}

function renderKPIs(cargas) {
  const rojas   = cargas.filter(c => c.semaforo === 'rojo').length
  const correos = cargas.reduce((s, c) => s + c.correos_pendientes, 0)
  const transito = cargas.filter(c => c.etapa_idx === 6).length
  return `
    <div class="kpi-row">
      <div class="kpi"><span class="kpi-value">${cargas.length}</span><span class="kpi-label">Cargas activas</span></div>
      <div class="kpi kpi--rojo"><span class="kpi-value">${rojas}</span><span class="kpi-label">🔴 Con alerta</span></div>
      <div class="kpi kpi--teal"><span class="kpi-value">${transito}</span><span class="kpi-label">En tránsito</span></div>
      <div class="kpi kpi--amber"><span class="kpi-value">${correos}</span><span class="kpi-label">Correos pendientes</span></div>
    </div>
  `
}

function renderFilters() {
  return `
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Etapa</label>
        <select class="filter-select" id="filterEtapa">
          <option value="">Todas</option>
          ${ETAPAS.map((e, i) => `<option value="${i}">${e.id} ${e.nombre}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Embarque</label>
        <select class="filter-select" id="filterTipo">
          <option value="">Todos</option>
          <option>FCL</option><option>LCL</option><option>AIR</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Estado</label>
        <select class="filter-select" id="filterSemaforo">
          <option value="">Todos</option>
          <option value="rojo">🔴 Alerta</option>
          <option value="amarillo">🟡 Atención</option>
          <option value="verde">🟢 OK</option>
        </select>
      </div>
      <button class="btn-clear-filters" id="btnClearFilters">Limpiar</button>
    </div>
  `
}

const URGENCIA = { rojo: 0, amarillo: 1, verde: 2 }
function sortCargas(c) { return [...c].sort((a,b) => URGENCIA[a.semaforo]-URGENCIA[b.semaforo] || b.dias_en_etapa-a.dias_en_etapa) }

function drawGrid(cargas) {
  const grid = document.getElementById('cargasGrid')
  if (!grid) return
  const sorted = sortCargas(cargas)
  grid.innerHTML = sorted.length
    ? sorted.map(renderCard).join('')
    : `<p class="empty-state">No hay cargas que coincidan con los filtros.</p>`
}

function bindFilters() {
  const selEtapa = document.getElementById('filterEtapa')
  const selTipo  = document.getElementById('filterTipo')
  const selSem   = document.getElementById('filterSemaforo')
  const btnClear = document.getElementById('btnClearFilters')
  function apply() {
    let f = MOCK_CARGAS
    if (selEtapa.value !== '') f = f.filter(c => c.etapa_idx === +selEtapa.value)
    if (selTipo.value  !== '') f = f.filter(c => c.tipo_embarque === selTipo.value)
    if (selSem.value   !== '') f = f.filter(c => c.semaforo === selSem.value)
    drawGrid(f)
  }
  selEtapa.addEventListener('change', apply)
  selTipo.addEventListener('change', apply)
  selSem.addEventListener('change', apply)
  btnClear.addEventListener('click', () => { selEtapa.value = selTipo.value = selSem.value = ''; drawGrid(MOCK_CARGAS) })
}

function renderCargasPanel() {
  const panel = document.getElementById('panel-cargas')
  if (!panel) return
  panel.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Cargas</h2>
      <div class="live-badge"><span class="live-dot"></span> Datos en vivo</div>
    </div>
    ${renderKPIs(MOCK_CARGAS)}
    ${renderFilters()}
    <div class="cargas-grid" id="cargasGrid"></div>
  `
  drawGrid(MOCK_CARGAS)
  bindFilters()

  // Click en card → ir a detalle
  panel.addEventListener('click', e => {
    const card = e.target.closest('.carga-card')
    if (!card) return
    showDetalle(card.dataset.ccs)
  })
}

/* ═══════════════════════════════
   RENDER: Detalle panel (Panel 2)
   ═══════════════════════════════ */

function renderStageStepper(etapa_idx) {
  const steps = ETAPAS.map((e, i) => {
    let cls = 'step'
    if (i < etapa_idx)  cls += ' step--done'
    if (i === etapa_idx) cls += ' step--active'
    if (i > etapa_idx)  cls += ' step--pending'
    const circle = i < etapa_idx
      ? `<svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2.5,7 5.5,10 11.5,4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<span class="step-num">${i + 1}</span>`
    return `
      <div class="${cls}" style="--c:${e.color}">
        <div class="step-circle">${circle}</div>
        <div class="step-label">
          <span class="step-id">${e.id}</span>
          <span class="step-name">${e.nombre}</span>
        </div>
      </div>
      ${i < 6 ? `<div class="step-conn ${i < etapa_idx ? 'step-conn--done' : ''}"></div>` : ''}
    `
  }).join('')
  return `<div class="stage-stepper">${steps}</div>`
}

function renderCarencias(ccs, etapa_idx) {
  const campos = CARENCIAS[etapa_idx] || []
  const estado = (MOCK_CAMPOS[ccs] || {})[etapa_idx]
  const getStatus = (i) => {
    if (!estado) return false
    if (Array.isArray(estado)) return estado[i] === true
    return estado === true
  }
  const faltantes = campos.filter((_, i) => !getStatus(i))
  if (!faltantes.length) return ''

  return `
    <div class="carencias-card">
      <div class="carencias-header">
        <span class="carencias-icon">⚠</span>
        <span class="carencias-title">Carencias en ${ETAPAS[etapa_idx].id} ${ETAPAS[etapa_idx].nombre}</span>
      </div>
      <ul class="carencias-list">
        ${campos.map((campo, i) => `
          <li class="carencia-item ${getStatus(i) ? 'carencia-item--ok' : 'carencia-item--missing'}">
            <span class="carencia-check">${getStatus(i) ? '✓' : '○'}</span>
            <span>${campo}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `
}

const TIPO_CONFIG = {
  correo_recibido: { color: '#3BB8E8', label: 'Correo recibido' },
  correo_enviado:  { color: '#7B4CA8', label: 'Correo enviado'  },
  monday:          { color: '#2ABDA8', label: 'Monday'          },
  alerta:          { color: '#E8357A', label: 'Alerta'          },
  confirmacion:    { color: '#8DC63F', label: 'Confirmación'    },
  reintento:       { color: '#F5A623', label: 'Reintento'       },
}

function renderTimelineItem(ev, idx) {
  const cfg = TIPO_CONFIG[ev.tipo] || { color: '#aaa', label: ev.tipo }
  const expandId = `ev-${idx}`
  return `
    <div class="tl-item">
      <div class="tl-dot" style="background:${cfg.color}"></div>
      <div class="tl-body">
        <div class="tl-meta">
          <span class="tl-fecha">${ev.fecha}</span>
          <span class="tl-badge" style="--c:${cfg.color}">${cfg.label}</span>
        </div>
        <p class="tl-texto">${ev.icono} ${ev.texto}</p>
        ${ev.detalle ? `
          <button class="tl-expand-btn" onclick="toggleExpand('${expandId}')">Ver contenido ↓</button>
          <div class="tl-expand" id="${expandId}" hidden>
            <pre class="tl-detalle-pre">${ev.detalle}</pre>
          </div>
        ` : ''}
        ${ev.adjunto ? `<a class="tl-adjunto" href="#" onclick="return false">📎 ${ev.adjunto}</a>` : ''}
      </div>
    </div>
  `
}

window.toggleExpand = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  const btn = el.previousElementSibling
  el.hidden = !el.hidden
  btn.textContent = el.hidden ? 'Ver contenido ↓' : 'Ocultar ↑'
}

function renderTimeline(ccs, filtro = 'todos') {
  const eventos = MOCK_HISTORIAL[ccs] || []
  const filtered = filtro === 'todos' ? eventos : eventos.filter(e => e.tipo === filtro || (filtro === 'correos' && (e.tipo === 'correo_recibido' || e.tipo === 'correo_enviado')))

  const tabs = [
    { key: 'todos',     label: 'Todos' },
    { key: 'correos',   label: '📨 Correos' },
    { key: 'monday',    label: '📌 Monday' },
    { key: 'alerta',    label: '🔔 Alertas' },
    { key: 'confirmacion', label: '✅ Acciones' },
  ]

  return `
    <div class="timeline-section">
      <div class="tl-tabs">
        ${tabs.map(t => `
          <button class="tl-tab ${filtro === t.key ? 'tl-tab--active' : ''}" data-filtro="${t.key}">${t.label}</button>
        `).join('')}
      </div>
      <div class="tl-list" id="tlList">
        ${filtered.length
          ? filtered.map((ev, i) => renderTimelineItem(ev, i)).join('')
          : `<p class="tl-empty">No hay eventos de este tipo.</p>`
        }
      </div>
    </div>
  `
}

function renderDetalle(ccs) {
  const c = MOCK_CARGAS.find(x => x.ccs === ccs)
  if (!c) return
  const etapa = ETAPAS[c.etapa_idx]
  const s = SEMAFORO[c.semaforo]
  const panel = document.getElementById('panel-detalle')

  panel.innerHTML = `
    <div class="detalle-back">
      <button class="btn-back" id="btnBack">← Volver a Cargas</button>
    </div>

    <!-- Load header -->
    <div class="detalle-header carga-card--${c.semaforo}">
      <div class="detalle-header-top">
        <div class="detalle-ids">
          <span class="ccs-code lg">${c.ccs}</span>
          <span class="badge-tipo">${c.tipo_embarque}</span>
          ${c.cpsia_pendiente ? `<span class="badge-cpsia">⚠ CPSIA</span>` : ''}
        </div>
        <span class="badge-semaforo xl">${s.icon} ${s.label}</span>
      </div>
      <h2 class="detalle-nombre">${c.nombre}</h2>
      <div class="detalle-meta-row">
        <span class="detalle-meta-item">🏭 ${c.proveedor}</span>
        <span class="detalle-meta-sep">·</span>
        <span class="detalle-meta-item">${c.origen}</span>
        <span class="detalle-meta-sep">·</span>
        <span class="detalle-meta-item">📦 ETA ${c.eta}</span>
        <span class="detalle-meta-sep">·</span>
        <span class="detalle-meta-item" style="color:${etapa.color}">${etapa.id} ${etapa.nombre} · ${c.dias_en_etapa} días</span>
      </div>
    </div>

    <!-- Stage stepper -->
    <div class="detalle-card">
      <p class="detalle-card-label">Progreso de la carga</p>
      ${renderStageStepper(c.etapa_idx)}
    </div>

    <!-- Carencias -->
    ${renderCarencias(c.ccs, c.etapa_idx)}

    <!-- Timeline -->
    <div class="detalle-card" id="timelineContainer">
      <p class="detalle-card-label">Historial de eventos</p>
      ${renderTimeline(c.ccs, 'todos')}
    </div>
  `

  // Back button
  document.getElementById('btnBack').addEventListener('click', () => {
    navigate('cargas')
  })

  // Timeline filter tabs
  panel.querySelectorAll('.tl-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const filtro = tab.dataset.filtro
      const container = document.getElementById('timelineContainer')
      container.querySelector('.timeline-section').outerHTML = renderTimeline(c.ccs, filtro)
      // re-bind after innerHTML change
      container.querySelectorAll('.tl-tab').forEach(t => {
        t.classList.toggle('tl-tab--active', t.dataset.filtro === filtro)
      })
    })
  })
}

/* ═══════════════════════════════
   NAVIGATION
   ═══════════════════════════════ */

const navItems = document.querySelectorAll('.nav-item')
const panels   = document.querySelectorAll('.panel')

function navigate(panelId) {
  panels.forEach(p => { p.style.display = p.id === `panel-${panelId}` ? 'flex' : 'none' })
  navItems.forEach(n => { n.classList.toggle('active', n.dataset.panel === panelId) })
  // Lazy render on first visit
  const panel = document.getElementById(`panel-${panelId}`)
  if (panel && !panel.dataset.rendered && PANEL_RENDERERS[panelId]) {
    PANEL_RENDERERS[panelId]()
    panel.dataset.rendered = 'true'
  }
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault()
    navigate(item.dataset.panel)
  })
})

function showDetalle(ccs) {
  renderDetalle(ccs)
  navigate('detalle')
}

/* ═══════════════════════════════
   MASIVO PANEL (Panel 3 — F-12)
   ═══════════════════════════════ */

const DESTINATARIOS = [
  { id: 'aixa',    nombre: 'Aixa',    rol: 'Ventas',       canales: ['wa', 'email'] },
  { id: 'orlando', nombre: 'Orlando', rol: 'Prospecting',  canales: ['wa', 'email'] },
  { id: 'ruth',    nombre: 'Ruth',    rol: 'Marcas',       canales: ['email'] },
  { id: 'maria',   nombre: 'María',   rol: 'Diseño',       canales: ['email'] },
]

// Mock: carga que acaba de entrar a E5
const MASIVO_TRIGGER = {
  ccs:       '2025E-FCL',
  nombre:    'Serie Animales del Mundo',
  etapa_idx: 4,
  eta:       'Feb 2026',
  hace:      '2 días',
}

// Masivo: solo WhatsApp (el correo 1-a-1 vive en la pestaña Correos)
let masivoCanal = 'wa'
let masivoContainer = null

function masivoIncluye(canal) {
  return masivoCanal === 'ambos' || masivoCanal === canal
}

function getCheckedDests() {
  return DESTINATARIOS.filter(d =>
    document.getElementById(`dest-${d.id}`)?.checked
  )
}

function calcResumen(dests) {
  const wa    = masivoIncluye('wa')    ? dests.filter(d => d.canales.includes('wa')).length    : 0
  const email = masivoIncluye('email') ? dests.filter(d => d.canales.includes('email')).length : 0
  const total = dests.length
  if (!total) return 'Ningún destinatario seleccionado'
  const parts = []
  if (wa)    parts.push(`${wa} WhatsApp`)
  if (email) parts.push(`${email} correo${email > 1 ? 's' : ''}`)
  return `${total} destinatario${total > 1 ? 's' : ''} · ${parts.join(' + ') || 'sin canal disponible'}`
}

function bindMasivoInteractions() {
  const waEditor   = document.getElementById('waEditor')
  const waCounter  = document.getElementById('waCounter')
  const sendBtn    = document.getElementById('btnSend')
  const sendSummary = document.getElementById('sendSummary')
  const confirmCard = document.getElementById('confirmCard')
  const sentState   = document.getElementById('sentState')
  const sendBar     = document.getElementById('sendBar')

  // Canal segmented (Correo / WhatsApp / Ambos)
  document.querySelectorAll('.canal-seg-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      masivoCanal = btn.dataset.canal
      renderMasivoInto(masivoContainer)
    })
  )

  // Char counter
  if (waEditor) waEditor.addEventListener('input', () => {
    const len = waEditor.value.length
    waCounter.textContent = `${len}/400`
    waCounter.classList.toggle('char-counter--warn', len > 360)
  })

  // Update summary on checkbox change
  function updateSummary() {
    const dests = getCheckedDests()
    sendSummary.textContent = calcResumen(dests)
    sendBtn.disabled = dests.length === 0
  }

  document.querySelectorAll('.recipient-check').forEach(cb =>
    cb.addEventListener('change', updateSummary)
  )
  updateSummary()

  // Send → show confirm card
  sendBtn.addEventListener('click', () => {
    const dests = getCheckedDests()
    if (!dests.length) return
    document.getElementById('confirmDesc').textContent =
      `Esto enviará mensajes a: ${dests.map(d => d.nombre).join(', ')}.`
    confirmCard.hidden = false
    confirmCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  // Cancel confirm
  document.getElementById('btnConfirmCancel').addEventListener('click', () => {
    confirmCard.hidden = true
  })

  // Confirm send → show sent state
  document.getElementById('btnConfirmSend').addEventListener('click', () => {
    const dests = getCheckedDests()
    confirmCard.hidden = true
    sendBar.hidden = true

    document.getElementById('sentDesc').textContent = calcResumen(dests)
    document.getElementById('sentLog').innerHTML = dests.map(d => `
      <div class="sent-log-row">
        <span class="sent-log-avatar">${d.nombre.charAt(0)}</span>
        <span class="sent-log-nombre">${d.nombre}</span>
        <span class="sent-log-rol">${d.rol}</span>
        <div class="sent-log-canales">
          ${masivoIncluye('wa')    && d.canales.includes('wa')    ? `<span class="sent-log-badge sent-log-wa">📱 Enviado</span>` : ''}
          ${masivoIncluye('email') && d.canales.includes('email') ? `<span class="sent-log-badge sent-log-email">📧 Enviado</span>` : ''}
        </div>
      </div>
    `).join('')

    sentState.hidden = false
    sentState.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  // Reset
  document.getElementById('btnNueva').addEventListener('click', () => {
    renderMasivoInto(masivoContainer)
  })
}

function renderMasivoInto(container) {
  if (!container) return
  masivoContainer = container

  const etapa    = ETAPAS[MASIVO_TRIGGER.etapa_idx]
  const waText   = `📦 Nueva carga en ${etapa.nombre}\n\n*${MASIVO_TRIGGER.nombre}* (${MASIVO_TRIGGER.ccs}) avanzó a ${etapa.id} ${etapa.nombre}.\nETA estimada: ${MASIVO_TRIGGER.eta}.\n\nConsulta el detalle en el portal:\n→ kaia.sicoben.com/portal`
  const subjText = `📦 Cargas en proceso de fabricación — Semana del 8 dic 2025`
  const bodyText = `Hola equipo de Ventas,\n\nATENCIÓN: Las siguientes cargas están en proceso de fabricación esta semana.\n\n• ${MASIVO_TRIGGER.ccs} — ${MASIVO_TRIGGER.nombre} (${etapa.id} ${etapa.nombre} · ETA ${MASIVO_TRIGGER.eta})\n• 2025C-FCL — Colección Navidad 2025 (E6 Fabricación · ETA 15 Feb 2026)\n\nPara conocer el detalle de cada carga, ingresen al portal:\n→ kaia.sicoben.com/portal\n\nCualquier duda sobre algún título específico me avisan.\n\nSaludos,\nPaulet`

  // Destinatarios visibles según el canal elegido
  const destVisibles = DESTINATARIOS.filter(d =>
    masivoCanal === 'ambos' ? true : d.canales.includes(masivoCanal)
  )

  container.innerHTML = `
    <!-- Trigger banner -->
    <div class="trigger-banner" style="--tc:${etapa.color}">
      <div class="trigger-left">
        <span class="trigger-bolt">⚡</span>
        <div>
          <p class="trigger-title">Trigger detectado — hace ${MASIVO_TRIGGER.hace}</p>
          <p class="trigger-desc">
            <strong>${MASIVO_TRIGGER.nombre}</strong> (${MASIVO_TRIGGER.ccs})
            entró a <span class="trigger-etapa" style="color:${etapa.color}">${etapa.id} ${etapa.nombre}</span>.
          </p>
        </div>
      </div>
      <span class="trigger-chip" style="--c:${etapa.color}">${etapa.id} ${etapa.nombre}</span>
    </div>

    <!-- Destinatarios -->
    <div class="masivo-card">
      <p class="masivo-card-label">Destinatarios · con WhatsApp</p>
      <div class="recipients-list">
        ${destVisibles.map(d => `
          <label class="recipient-row" for="dest-${d.id}">
            <input class="recipient-check" type="checkbox" id="dest-${d.id}" data-id="${d.id}" checked />
            <span class="recipient-avatar">${d.nombre.charAt(0)}</span>
            <div class="recipient-info">
              <span class="recipient-nombre">${d.nombre}</span>
              <span class="recipient-rol">${d.rol}</span>
            </div>
            <div class="recipient-canales">
              ${masivoIncluye('wa')    && d.canales.includes('wa')    ? `<span class="canal-badge canal-wa">📱 WA</span>` : ''}
              ${masivoIncluye('email') && d.canales.includes('email') ? `<span class="canal-badge canal-email">📧 Email</span>` : ''}
            </div>
          </label>
        `).join('')}
      </div>
    </div>

    <!-- Editors -->
    <div class="editors-row">

      ${masivoIncluye('wa') ? `
      <div class="editor-panel editor-panel--wa">
        <div class="editor-header">
          <span class="editor-icon">📱</span>
          <div>
            <p class="editor-title">WhatsApp</p>
            <p class="editor-hint">Mensaje corto · Wassenger</p>
          </div>
        </div>
        <textarea class="editor-textarea" id="waEditor" rows="8" maxlength="400">${waText}</textarea>
        <div class="editor-footer">
          <span class="char-counter" id="waCounter">${waText.length}/400</span>
        </div>
      </div>` : ''}

    </div>

    <!-- Send bar -->
    <div class="send-bar" id="sendBar">
      <p class="send-summary" id="sendSummary"></p>
      <button class="btn-send" id="btnSend">Enviar a seleccionados →</button>
    </div>

    <!-- Inline confirm -->
    <div class="confirm-card" id="confirmCard" hidden>
      <div class="confirm-inner">
        <span class="confirm-icon">📨</span>
        <div>
          <p class="confirm-title">¿Confirmar envío?</p>
          <p class="confirm-desc" id="confirmDesc"></p>
        </div>
      </div>
      <div class="confirm-actions">
        <button class="btn-cancel" id="btnConfirmCancel">Cancelar</button>
        <button class="btn-confirm" id="btnConfirmSend">Confirmar envío</button>
      </div>
    </div>

    <!-- Sent state -->
    <div class="sent-state" id="sentState" hidden>
      <span class="sent-check">✅</span>
      <h3 class="sent-title">Notificación enviada</h3>
      <p class="sent-subtitle" id="sentDesc"></p>
      <div class="sent-log" id="sentLog"></div>
      <button class="btn-nueva" id="btnNueva">+ Nueva notificación</button>
    </div>
  `

  bindMasivoInteractions()
}

/* ═══════════════════════════════
   PLANTILLAS PANEL (Panel 4 — F-08)
   ═══════════════════════════════ */

let MOCK_PLANTILLAS = [
  {
    id: 'e2-cotizacion',
    nombre: 'Solicitud de Cotización',
    etapa_idx: 1,
    trigger: 'Carga entra a E2 · Manual',
    destino: 'Proveedor',
    canal: 'email',
    activa: true,
    asunto: 'Quote Request — {{nombre_carga}} | Sicoben Ediciones',
    cuerpo: `Hello {{proveedor}},\n\nHope you are doing well.\n\nWe would like to request a quote for our upcoming shipment "{{nombre_carga}}".\nPlease find the list of titles below:\n\n{{lista_titulos}}\n\nKindly fill the attached form by {{fecha_limite}}:\n→ {{link_formulario}}\n\nBest regards,\nPaulet Bermúdez\nSicoben Ediciones / KADI International`,
  },
  {
    id: 'e3-proforma',
    nombre: 'Solicitud de Proforma',
    etapa_idx: 2,
    trigger: 'Carga entra a E3',
    destino: 'Proveedor',
    canal: 'email',
    activa: true,
    asunto: 'Proforma Request — {{nombre_carga}} | Sicoben Ediciones',
    cuerpo: `Hello {{proveedor}},\n\nThank you for your quote. We are happy to move forward with "{{nombre_carga}}".\n\nPlease prepare your proforma invoice:\n→ {{link_proforma}}\n\nPayment terms: {{condiciones_pago}}\nDeadline: {{fecha_limite}}\n\nBest regards,\nPaulet Bermúdez\nSicoben Ediciones / KADI International`,
  },
  {
    id: 'e3-cpsia-wa',
    nombre: 'Aviso CPSIA → Yonaida',
    etapa_idx: 2,
    trigger: 'Detección CPSIA automática',
    destino: 'Yonaida',
    canal: 'wa',
    activa: true,
    asunto: '',
    cuerpo: `🚨 *CPSIA detectado — Carga {{nombre_carga}}*\nTítulos que requieren prueba: {{lista_titulos_cpsia}}.\n\nYa solicité cotización al proveedor.\nPor favor coordina la documentación.\n\nVer pestaña CPSIA Filtro: {{link_pestaña_filtro}}\nVer carga en dashboard: {{link_dashboard}}`,
  },
  {
    id: 'e4-pps',
    nombre: 'Solicitud de PPS',
    etapa_idx: 3,
    trigger: 'Manual desde la tarjeta',
    destino: 'Proveedor',
    canal: 'email',
    activa: true,
    asunto: 'PPS Request — {{nombre_carga}}',
    cuerpo: `Hello {{proveedor}},\n\nWe have completed the design phase for "{{nombre_carga}}".\nPlease find attached the final art files for production.\n\nCould you please send us a PPS (Pre-Production Sample)?\n\nSpecifications: {{especificaciones}}\nDeadline for PPS: {{fecha_limite_pps}}\n\nBest regards,\nPaulet Bermúdez\nSicoben Ediciones / KADI International`,
  },
  {
    id: 'reintento',
    nombre: 'Seguimiento sin respuesta',
    etapa_idx: null,
    trigger: '48h sin respuesta del proveedor',
    destino: 'Proveedor',
    canal: 'email',
    activa: true,
    asunto: '[Follow-up] {{asunto_original}}',
    cuerpo: `Hello {{proveedor}},\n\nFollowing up on my previous email below. We have not received your response and we are working against a deadline.\n\nCould you please confirm by today end of day?\n\nLooking forward to hearing back from you soon.\n\nBest regards,\nPaulet Bermúdez\n\n────── Original message below ──────\n\n{{cuerpo_correo_original}}`,
  },
]

const TEMPLATE_VARS = [
  { key: '{{nombre_carga}}',     label: 'Nombre carga',     preview: 'Serie Animales del Mundo' },
  { key: '{{ccs}}',              label: 'Código CCS',       preview: '2025E-FCL' },
  { key: '{{proveedor}}',        label: 'Proveedor',        preview: 'Ningbo Jumbo Co. Ltd.' },
  { key: '{{eta}}',              label: 'ETA',              preview: 'Feb 2026' },
  { key: '{{fecha_limite}}',     label: 'Fecha límite',     preview: '20 Jun 2026' },
  { key: '{{condiciones_pago}}', label: 'Pago',             preview: '30% anticipo, 70% B/L' },
  { key: '{{lista_titulos}}',    label: 'Lista títulos',    preview: '• Título A   • Título B' },
  { key: '{{link_proforma}}',    label: 'Link proforma',    preview: 'https://docs.google.com/…' },
  { key: '{{link_dashboard}}',   label: 'Link dashboard',   preview: 'https://kaia.sicoben.com/…' },
  { key: '{{especificaciones}}', label: 'Especificaciones', preview: 'Ver archivo adjunto' },
]

let currentTplId = MOCK_PLANTILLAS[0].id

function makeTplPreview(text) {
  let r = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  TEMPLATE_VARS.forEach(v => {
    r = r.replaceAll(v.key, `<mark class="tpl-var-resolved">${v.preview}</mark>`)
  })
  return r.replace(/\n/g, '<br>')
}

function renderTplList(container) {
  container.innerHTML = MOCK_PLANTILLAS.map(t => {
    const etapa = t.etapa_idx !== null ? ETAPAS[t.etapa_idx] : null
    return `
      <div class="plist-item ${t.id === currentTplId ? 'plist-item--active' : ''}"
           data-tpl-id="${t.id}" role="button" tabindex="0">
        <div class="plist-item-top">
          <span class="plist-nombre">${t.nombre}</span>
          <span class="plist-canal-icon">${t.canal === 'wa' ? '💬' : '✉️'}</span>
        </div>
        <div class="plist-item-meta">
          <span class="plist-stage-chip" style="--c:${etapa ? etapa.color : '#888'}">
            ${etapa ? etapa.id : '∀'}
          </span>
          <span class="plist-dest">${t.destino}</span>
        </div>
      </div>
    `
  }).join('')
}

function renderTplEditor(container) {
  const t = MOCK_PLANTILLAS.find(p => p.id === currentTplId)
  if (!t) return

  const etapa      = t.etapa_idx !== null ? ETAPAS[t.etapa_idx] : null
  const etapaLabel = etapa ? `${etapa.id} · ${etapa.nombre}` : 'Todas las etapas'
  const etapaColor = etapa ? etapa.color : '#888'

  const subjectRow = t.canal === 'email' ? `
    <div class="tpl-subject-row">
      <span class="tpl-field-label">Asunto</span>
      <input class="tpl-subject-input" id="tplSubject" value="${t.asunto.replace(/"/g, '&quot;')}" />
    </div>` : ''

  container.innerHTML = `
    <div class="tpl-editor">
      <div class="tpl-editor-topbar">
        <div class="tpl-editing-name-wrap">
          <span class="tpl-editing-label">Editando plantilla</span>
          <input class="tpl-editing-name-input" id="tplName" value="${t.nombre.replace(/"/g, '&quot;')}" placeholder="Nombre de la plantilla" />
        </div>
        <label class="tpl-active-toggle" title="Activar / desactivar">
          <input type="checkbox" ${t.activa ? 'checked' : ''} />
          <span class="tpl-toggle-track"><span class="tpl-toggle-thumb"></span></span>
          <span class="tpl-toggle-text">${t.activa ? 'Activa' : 'Inactiva'}</span>
        </label>
      </div>

      <div class="tpl-meta-grid">
        <div class="tpl-meta-cell">
          <span class="tpl-field-label">Trigger</span>
          <span class="tpl-field-value">${t.trigger}</span>
        </div>
        <div class="tpl-meta-cell">
          <span class="tpl-field-label">Destino</span>
          <span class="tpl-field-value">${t.destino}</span>
        </div>
        <div class="tpl-meta-cell">
          <span class="tpl-field-label">Etapa</span>
          <span class="plist-stage-chip" style="--c:${etapaColor}">${etapaLabel}</span>
        </div>
        <div class="tpl-meta-cell">
          <span class="tpl-field-label">Canal</span>
          <div class="tpl-canal-switch">
            <button class="tpl-canal-opt ${t.canal === 'email' ? 'tpl-canal-opt--active' : ''}" data-canal="email">✉️ Email</button>
            <button class="tpl-canal-opt ${t.canal === 'wa' ? 'tpl-canal-opt--active' : ''}" data-canal="wa">💬 WhatsApp</button>
          </div>
        </div>
      </div>

      ${subjectRow}

      <div class="tpl-vars-section">
        <span class="tpl-field-label">Variables — clic para insertar</span>
        <div class="tpl-vars-bar">
          ${TEMPLATE_VARS.map(v =>
            `<button class="tpl-var-chip" data-key="${v.key}" title="Ejemplo: ${v.preview}">${v.label}</button>`
          ).join('')}
        </div>
      </div>

      <textarea class="tpl-body" id="tplBody" spellcheck="false">${t.cuerpo}</textarea>

      <div class="tpl-preview-wrap">
        <span class="tpl-field-label">Vista previa con datos de ejemplo</span>
        <div class="tpl-preview-content" id="tplPreview">${makeTplPreview(t.cuerpo)}</div>
      </div>

      <div class="tpl-save-bar">
        <button class="btn-tpl-upload" id="btnUploadDocx">⬆ Subir desde Word (.docx)</button>
        <div class="tpl-save-right">
          <button class="btn-tpl-discard" id="btnTplDiscard">Descartar</button>
          <button class="btn-tpl-save" id="btnTplSave">Guardar cambios</button>
        </div>
      </div>
    </div>
  `

  const bodyTA    = document.getElementById('tplBody')
  const previewEl = document.getElementById('tplPreview')

  bodyTA.addEventListener('input', () => {
    previewEl.innerHTML = makeTplPreview(bodyTA.value)
  })

  container.querySelectorAll('.tpl-var-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const key   = chip.dataset.key
      const start = bodyTA.selectionStart
      const end   = bodyTA.selectionEnd
      bodyTA.value = bodyTA.value.slice(0, start) + key + bodyTA.value.slice(end)
      bodyTA.focus()
      bodyTA.setSelectionRange(start + key.length, start + key.length)
      previewEl.innerHTML = makeTplPreview(bodyTA.value)
    })
  })

  // Canal switch (Email / WhatsApp)
  container.querySelectorAll('.tpl-canal-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      t.canal = opt.dataset.canal
      t.cuerpo = bodyTA.value   // keep current body text
      renderTplEditor(container)
    })
  })

  document.getElementById('btnTplSave').addEventListener('click', () => {
    // Persist edits back to the template object
    t.nombre = (document.getElementById('tplName').value.trim()) || 'Sin título'
    t.cuerpo = bodyTA.value
    const subjEl = document.getElementById('tplSubject')
    if (subjEl) t.asunto = subjEl.value
    t.activa = container.querySelector('.tpl-active-toggle input').checked

    // Refresh the template grid if we're inside the Comunicación panel
    const grid = document.getElementById('commTplGrid')
    if (grid) renderTplGrid(grid)

    const btn = document.getElementById('btnTplSave')
    btn.textContent = '✓ Guardado'
    btn.classList.add('btn-tpl-save--done')
    setTimeout(() => {
      btn.textContent = 'Guardar cambios'
      btn.classList.remove('btn-tpl-save--done')
    }, 2000)
  })

  document.getElementById('btnTplDiscard').addEventListener('click', () => {
    renderTplEditor(container)
  })

  container.querySelector('.tpl-active-toggle input').addEventListener('change', e => {
    container.querySelector('.tpl-toggle-text').textContent = e.target.checked ? 'Activa' : 'Inactiva'
  })
}

function renderPlantillasPanel() {
  const panel = document.getElementById('panel-plantillas')

  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Plantillas</h2>
      <p class="panel-subtitle">Correos y mensajes automáticos con variables dinámicas</p>
    </div>
    <div class="plantillas-layout">
      <aside class="plist-sidebar">
        <p class="plist-count">${MOCK_PLANTILLAS.length} plantillas</p>
        <div class="plist-items" id="plistItems"></div>
      </aside>
      <div class="plantillas-editor" id="plantillasEditor"></div>
    </div>
  `

  const plistItems = document.getElementById('plistItems')
  const editorDiv  = document.getElementById('plantillasEditor')

  renderTplList(plistItems)
  renderTplEditor(editorDiv)

  plistItems.addEventListener('click', e => {
    const item = e.target.closest('[data-tpl-id]')
    if (!item) return
    currentTplId = item.dataset.tplId
    renderTplList(plistItems)
    renderTplEditor(editorDiv)
  })
}

/* ═══════════════════════════════
   COMUNICACIÓN PANEL (Correos + Plantillas, F-02/F-05/F-08)
   ═══════════════════════════════ */

let customTplCount = 0

function createBlankTemplate() {
  customTplCount++
  const tpl = {
    id: 'custom-' + customTplCount,
    nombre: 'Nueva plantilla',
    etapa_idx: null,
    trigger: 'Manual desde la tarjeta',
    destino: 'Proveedor',
    canal: 'email',
    activa: true,
    asunto: '',
    cuerpo: '',
  }
  MOCK_PLANTILLAS.push(tpl)
  return tpl
}

function renderTplGrid(container) {
  container.innerHTML = MOCK_PLANTILLAS.map(t => {
    const etapa = t.etapa_idx !== null ? ETAPAS[t.etapa_idx] : null
    return `
      <div class="comm-tpl-card ${t.id === currentTplId ? 'comm-tpl-card--active' : ''} ${t.activa ? '' : 'comm-tpl-card--off'}"
           data-tpl-id="${t.id}" role="button" tabindex="0">
        <div class="comm-tpl-card-top">
          <span class="comm-tpl-canal">${t.canal === 'wa' ? '💬' : '✉️'}</span>
          <span class="plist-stage-chip" style="--c:${etapa ? etapa.color : '#888'}">${etapa ? etapa.id : '∀'}</span>
          ${t.activa ? '' : '<span class="comm-tpl-off-tag">Inactiva</span>'}
        </div>
        <span class="comm-tpl-nombre">${t.nombre}</span>
        <span class="comm-tpl-dest">→ ${t.destino}</span>
      </div>
    `
  }).join('')
}

// Pestaña activa dentro del panel Comunicación
let commTab = 'conversaciones'

function renderComunicacionPanel() {
  const panel = document.getElementById('panel-comunicacion')
  if (!panel) return

  const tabs = [
    { id: 'conversaciones', icon: '✉️', label: 'Correos' },
    { id: 'masivo',         icon: '💬', label: 'WhatsApp' },
    { id: 'plantillas',     icon: '📝', label: 'Plantillas' },
  ]

  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Comunicación</h2>
      <p class="panel-subtitle">Conversaciones por carga · envíos masivos · plantillas</p>
    </div>

    <div class="comm-tabs">
      ${tabs.map(t => `
        <button class="comm-tab ${commTab === t.id ? 'comm-tab--active' : ''}" data-comm-tab="${t.id}">
          <span>${t.icon}</span> ${t.label}
        </button>`).join('')}
    </div>

    <div class="comm-tab-body" id="commTabBody"></div>
  `

  panel.querySelectorAll('.comm-tab').forEach(btn =>
    btn.addEventListener('click', () => {
      commTab = btn.dataset.commTab
      renderComunicacionPanel()
    })
  )

  const body = document.getElementById('commTabBody')
  if (commTab === 'conversaciones') renderCommConversaciones(body)
  if (commTab === 'masivo')         renderCommWhatsapp(body)
  if (commTab === 'plantillas')     renderCommPlantillas(body)
}

/* TAB 1 — Conversaciones */
function renderCommConversaciones(body) {
  const total     = MOCK_CORREOS.length
  const pendientes = MOCK_CORREOS.reduce((n, t) =>
    n + t.mensajes.filter(m => m.tipo === 'recibido' && !m.confirmado && !confirmedMsgs.has(m.id)).length, 0)

  body.innerHTML = `
    <div class="correos-layout">
      <aside class="plist-sidebar" style="width:280px;flex-shrink:0">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:13px;font-weight:700;color:#1a1a1a">${total} conversaciones</span>
          ${pendientes ? `<span style="background:var(--e4);color:#fff;border-radius:10px;font-size:11px;font-weight:700;padding:2px 8px">${pendientes} pendientes</span>` : ''}
        </div>
        <div class="clist-items" id="clistItems"></div>
      </aside>
      <div class="correos-thread" id="correosThread" style="flex:1;overflow-y:auto;display:flex;flex-direction:column"></div>
    </div>
  `
  const clistItems = document.getElementById('clistItems')
  const threadDiv  = document.getElementById('correosThread')
  renderClist(clistItems)
  renderThread(threadDiv)
  clistItems.addEventListener('click', e => {
    const item = e.target.closest('[data-ccs]')
    if (!item) return
    currentCcs = item.dataset.ccs
    renderClist(clistItems)
    renderThread(threadDiv)
  })
}

/* TAB 2 — WhatsApp (chats del equipo, identificados por carga) */
const MOCK_WA_CHATS = [
  {
    id: 'wa1', contacto: 'Yonaida', rol: 'Tráfico / Logística', telefono: '+507 6111-2233',
    ccs: '2025C-FCL', nombre_carga: 'Colección Navidad 2025', confianza: 96, unread: 2,
    mensajes: [
      { de: 'out', tag: '🔔 Alerta KAIA', hora: 'ayer 9:00',
        texto: '📦 Tráfico: carga 2025C-FCL lleva 6 días sin actualizar en Monday. Última actualización: 2 jun.' },
      { de: 'in', hora: 'ayer 9:14',
        texto: 'Hola Paulet! Ya hablé con el forwarder, el booking está confirmado para el 18 de junio 🚢' },
      { de: 'in', hora: 'hoy 8:45',
        texto: 'Te paso el BL apenas me lo manden, hoy en la tarde a más tardar 🙏' },
    ],
  },
  {
    id: 'wa2', contacto: 'Aixa', rol: 'Ventas', telefono: '+507 6222-4455',
    ccs: '2025E-FCL', nombre_carga: 'Serie Animales del Mundo', confianza: 91, unread: 1,
    mensajes: [
      { de: 'out', tag: '📢 Masivo', hora: 'lun 10:02',
        texto: '📦 Nueva carga en Comercial\n\n*Serie Animales del Mundo* (2025E-FCL) avanzó a E5 Comercial.\nETA estimada: Feb 2026.\n\nConsulta el detalle en el portal:\n→ kaia.sicoben.com/portal' },
      { de: 'in', hora: 'lun 10:30',
        texto: 'Gracias Paulet! ¿Esta carga trae los títulos nuevos de dinosaurios? Tengo un cliente preguntando 🦕' },
      { de: 'in', hora: 'hoy 9:12',
        texto: '¿La ETA sigue firme para febrero?' },
    ],
  },
  {
    id: 'wa3', contacto: 'Sr. Daniel', rol: 'CEO', telefono: '+507 6300-7788',
    ccs: '2025C-FCL', nombre_carga: 'Colección Navidad 2025', confianza: 88, unread: 1,
    mensajes: [
      { de: 'out', tag: '🔔 Alerta KAIA', hora: 'lun 7:00',
        texto: 'Buenos días Sr. Daniel,\n\nResumen de cargas en tránsito esta semana:\n\n• 2025C-FCL — Colección Navidad 2025\nEstado: Fabricación 85%\nETA: 15 Feb 2026\n\n→ kaia.sicoben.com/admin' },
      { de: 'in', hora: 'lun 7:35',
        texto: 'Gracias. ¿Qué pasó con el BL de la carga de Navidad? Necesito ese dato para la reunión del jueves.' },
    ],
  },
]

let currentWaChat = MOCK_WA_CHATS[0].id
let waView = 'chats'   // 'chats' | 'masivo'

function waNow() {
  const d = new Date()
  return `hoy ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function renderCommWhatsapp(body) {
  if (waView === 'masivo') {
    body.innerHTML = `
      <div class="comm-section-hdr">
        <span class="comm-section-icon">📢</span>
        <div class="comm-section-titles">
          <h3 class="comm-section-title">Masivo por WhatsApp</h3>
          <span class="comm-section-hint">Notificación al equipo · vía Wassenger</span>
        </div>
        <button class="btn-comm-new-tpl" id="btnWaBack">← Volver a chats</button>
      </div>
      <div id="waMasivoMount"></div>
    `
    document.getElementById('btnWaBack').addEventListener('click', () => {
      waView = 'chats'
      renderComunicacionPanel()
    })
    renderMasivoInto(document.getElementById('waMasivoMount'))
    return
  }

  body.innerHTML = `
    <div class="comm-section-hdr">
      <span class="comm-section-icon">💬</span>
      <div class="comm-section-titles">
        <h3 class="comm-section-title">WhatsApp</h3>
        <span class="comm-section-hint">Conversaciones del equipo · la IA identifica de qué carga te hablan</span>
      </div>
      <button class="btn-comm-new-tpl" id="btnWaMasivo">📢 Nuevo masivo</button>
    </div>
    <div class="wa-layout">
      <aside class="plist-sidebar">
        <p class="plist-count">${MOCK_WA_CHATS.length} chats</p>
        <div class="clist-items" id="waChatList"></div>
      </aside>
      <div class="wa-thread" id="waThread"></div>
    </div>
  `

  document.getElementById('btnWaMasivo').addEventListener('click', () => {
    waView = 'masivo'
    renderComunicacionPanel()
  })

  const listEl   = document.getElementById('waChatList')
  const threadEl = document.getElementById('waThread')
  renderWaChatList(listEl)
  renderWaThread(threadEl)

  listEl.addEventListener('click', e => {
    const item = e.target.closest('[data-wa-id]')
    if (!item) return
    currentWaChat = item.dataset.waId
    const chat = MOCK_WA_CHATS.find(c => c.id === currentWaChat)
    if (chat) chat.unread = 0
    renderWaChatList(listEl)
    renderWaThread(threadEl)
  })
}

function renderWaChatList(container) {
  container.innerHTML = MOCK_WA_CHATS.map(c => {
    const ultimo = c.mensajes[c.mensajes.length - 1]
    return `
      <div class="clist-item ${c.id === currentWaChat ? 'clist-item--active' : ''}"
           data-wa-id="${c.id}" role="button" tabindex="0">
        <div class="clist-top">
          <span class="wa-list-contact">${c.contacto}</span>
          ${c.unread ? `<span class="clist-badge-pendiente">${c.unread}</span>` : ''}
        </div>
        <span class="ccs-code">${c.ccs}</span>
        <span class="clist-preview">${ultimo.texto.split('\n')[0]}</span>
      </div>
    `
  }).join('')
}

function renderWaThread(container) {
  const chat = MOCK_WA_CHATS.find(c => c.id === currentWaChat)
  if (!chat) return

  container.innerHTML = `
    <div class="wa-thread-header">
      <span class="wa-avatar">${chat.contacto.charAt(0)}</span>
      <div class="wa-thread-info">
        <span class="wa-contact-name">${chat.contacto}</span>
        <span class="wa-contact-meta">${chat.rol} · ${chat.telefono}</span>
      </div>
      <div class="wa-ia-tag" title="La IA detectó de qué carga trata esta conversación">
        🤖 Hablando de <span class="ccs-code">${chat.ccs}</span> — ${chat.nombre_carga} · ${chat.confianza}%
      </div>
    </div>
    <div class="wa-msgs" id="waMsgs">
      ${chat.mensajes.map(m => `
        <div class="wa-bubble-row wa-bubble-row--${m.de}">
          <div class="wa-bubble wa-bubble--${m.de}">
            ${m.tag ? `<span class="wa-msg-tag">${m.tag}</span>` : ''}
            <p class="wa-msg-text">${m.texto.replace(/\n/g, '<br>')}</p>
            <span class="wa-msg-hora">${m.hora}${m.de === 'out' ? ' ✓✓' : ''}</span>
          </div>
        </div>`).join('')}
    </div>
    <div class="wa-composer">
      <input class="wa-input" id="waInput" type="text" placeholder="Escribe un mensaje..." />
      <button class="wa-send-btn" id="waSendBtn" title="Enviar">➤</button>
    </div>
  `

  const msgsEl = document.getElementById('waMsgs')
  msgsEl.scrollTop = msgsEl.scrollHeight

  const input = document.getElementById('waInput')
  function sendWa() {
    const texto = input.value.trim()
    if (!texto) return
    chat.mensajes.push({ de: 'out', texto, hora: waNow() })
    renderWaChatList(document.getElementById('waChatList'))
    renderWaThread(container)
    document.getElementById('waInput').focus()
  }
  document.getElementById('waSendBtn').addEventListener('click', sendWa)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendWa() })
}

/* TAB 3 — Plantillas (grid + crear + editor, intacto) */
function renderCommPlantillas(body) {
  body.innerHTML = `
    <div class="comm-section-hdr">
      <span class="comm-section-icon">📝</span>
      <div class="comm-section-titles">
        <h3 class="comm-section-title">Plantillas</h3>
        <span class="comm-section-hint">Correos y mensajes con variables dinámicas · clic para editar · disponibles con "/" en las respuestas</span>
      </div>
      <button class="btn-comm-new-tpl" id="btnNewTpl">+ Crear plantilla</button>
    </div>
    <div class="comm-tpl-grid" id="commTplGrid"></div>
    <div class="comm-tpl-editor-wrap" id="commTplEditor" hidden></div>
  `

  const grid     = document.getElementById('commTplGrid')
  const editorEl = document.getElementById('commTplEditor')
  renderTplGrid(grid)

  function openEditor() {
    renderTplGrid(grid)
    editorEl.hidden = false
    renderTplEditor(editorEl)
    editorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-tpl-id]')
    if (!card) return
    currentTplId = card.dataset.tplId
    openEditor()
  })

  document.getElementById('btnNewTpl').addEventListener('click', () => {
    const tpl = createBlankTemplate()
    currentTplId = tpl.id
    openEditor()
    const nameInput = document.getElementById('tplName')
    if (nameInput) { nameInput.focus(); nameInput.select() }
  })
}

/* ═══════════════════════════════
   PANEL REGISTRY — lazy render
   ═══════════════════════════════ */

/* ═══════════════════════════════
   CORREOS PANEL (Panel 5 — F-02/F-05)
   ═══════════════════════════════ */

let MOCK_CORREOS = [
  {
    ccs: '2025C-FCL',
    nombre: 'Colección Navidad 2025',
    etapa_idx: 5,
    mensajes: [
      {
        id: 'c1b',
        de: 'Paulet Bermúdez', email: 'paulet@sicoben.com',
        asunto: 'Production Update — Christmas Collection',
        fecha: '7 Jun 2026, 15:22',
        cuerpo: `Hello Johnson,\n\nCould you please send me an update on the production status of the Christmas Collection?\n\nWe'd also appreciate some photos of the current batch and the latest QC report.\n\nThank you,\nPaulet`,
        resumen: null, adjuntos: [],
        tipo: 'enviado', confianza: null, confirmado: true,
      },
      {
        id: 'c1a',
        de: 'Johnson Li', email: 'johnson@ninjobumbo.com',
        asunto: 'RE: Production Update — Christmas Collection',
        fecha: '8 Jun 2026, 9:14',
        cuerpo: `Hi Paulet,\n\nGood news — production is now at 85% completion. We expect to finish the full batch by June 20th.\n\nI'm attaching the latest QC report and photos of batch #2 for your review. The color quality on the hardcover titles looks great.\n\nPlease confirm if everything looks good on your side.\n\nBest regards,\nJohnson Li\nNingbo Jumbo Co. Ltd.`,
        resumen: 'Confirma producción al 85%. Adjunta reporte QC y fotos del lote 2.',
        adjuntos: [
          { name: 'cover_sample.jpg', type: 'image', url: 'https://picsum.photos/seed/kaiacover/520/380' },
          { name: 'batch2_photo.jpg', type: 'image', url: 'https://picsum.photos/seed/kaiabatch/520/380' },
          { name: 'voice_note.mp3',   type: 'audio', url: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3' },
          { name: 'line_check.mp4',   type: 'video', url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' },
          { name: 'QC_Report_Jun8.pdf', type: 'file' },
        ],
        tipo: 'recibido', confianza: 94, confirmado: false,
      },
    ],
  },
  {
    ccs: '2025B-LCL',
    nombre: 'Libros Educativos Q1 2026',
    etapa_idx: 2,
    mensajes: [
      {
        id: 'c2a',
        de: 'Priya Sharma', email: 'priya@mumbaibookprint.in',
        asunto: 'Proforma Invoice — Educational Books Q1',
        fecha: '7 Jun 2026, 11:40',
        cuerpo: `Dear Paulet,\n\nPlease find attached the proforma invoice for the Educational Books Q1 order.\n\nSummary:\n• 18 titles\n• Total amount: USD 42,300\n• 30% advance to confirm the order\n• Production start: July 20th\n\nKindly review and confirm so we can block the production slot.\n\nWarm regards,\nPriya Sharma\nMumbai Book Printers Pvt.`,
        resumen: 'Proforma por $42,300 USD. 18 títulos, inicio de producción 20 Jul.',
        adjuntos: ['Proforma_MBP_2025B.pdf'],
        tipo: 'recibido', confianza: 88, confirmado: false,
      },
    ],
  },
]

const confirmedMsgs = new Set()
let currentCcs = MOCK_CORREOS[0].ccs

const _esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

function renderClist(container) {
  container.innerHTML = MOCK_CORREOS.map(t => {
    const pendientes = t.mensajes.filter(m => m.tipo === 'recibido' && !m.confirmado && !confirmedMsgs.has(m.id)).length
    const ultimo     = t.mensajes[t.mensajes.length - 1]
    const etapa      = ETAPAS[t.etapa_idx]
    const isInbox    = t.ccs === 'INBOX'
    const iniciales  = _esc(ultimo.de).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const fechaCorta = (ultimo.fecha || '').split(',')[0]

    return `
      <div class="crm-thread-item ${t.ccs === currentCcs ? 'crm-thread-item--active' : ''} ${pendientes ? 'crm-thread-item--unread' : ''}"
           data-ccs="${_esc(t.ccs)}" role="button" tabindex="0">
        <div class="crm-thread-avatar">${iniciales}</div>
        <div class="crm-thread-content">
          <div class="crm-thread-row1">
            <span class="crm-thread-sender">${_esc(ultimo.de)}</span>
            <span class="crm-thread-time">${_esc(fechaCorta)}</span>
          </div>
          <div class="crm-thread-row2">
            <span class="crm-thread-subject">${_esc(ultimo.asunto)}</span>
            ${pendientes ? `<span class="crm-thread-badge">${pendientes}</span>` : ''}
          </div>
          <div class="crm-thread-row3">
            ${isInbox
              ? `<span class="crm-tag crm-tag--inbox">📥 Sin clasificar</span>`
              : `<span class="crm-tag" style="--tc:${etapa?.color || '#888'}">${_esc(t.ccs)}</span>`}
          </div>
        </div>
      </div>
    `
  }).join('')
}

/* ── Adjuntos enriquecidos (imagen / audio / video / archivo) ── */
function attType(name) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext)) return 'image'
  if (['mp3','wav','ogg','m4a','aac'].includes(ext))               return 'audio'
  if (['mp4','webm','mov','avi','mkv'].includes(ext))              return 'video'
  return 'file'
}

function renderAdjunto(a) {
  const name = typeof a === 'string' ? a : a.name
  const url  = typeof a === 'object' ? (a.url || '') : ''
  const type = (typeof a === 'object' && a.type) ? a.type : attType(name)

  if (type === 'image' && url) {
    return `
      <a class="msg-media msg-media--img" href="${url}" data-lightbox="${url}" title="${name}">
        <img src="${url}" alt="${name}" loading="lazy" />
        <span class="msg-media-cap">🖼 ${name}</span>
      </a>`
  }
  if (type === 'audio' && url) {
    return `
      <div class="msg-media msg-media--audio">
        <span class="msg-media-cap">🎵 ${name}</span>
        <audio controls preload="none" src="${url}"></audio>
      </div>`
  }
  if (type === 'video' && url) {
    return `
      <div class="msg-media msg-media--video">
        <video controls preload="none" src="${url}"></video>
        <span class="msg-media-cap">🎬 ${name}</span>
      </div>`
  }
  return `<span class="msg-adjunto-chip">📎 ${name}</span>`
}

function openLightbox(url) {
  let ov = document.getElementById('kaiaLightbox')
  if (!ov) {
    ov = document.createElement('div')
    ov.id = 'kaiaLightbox'
    ov.className = 'lightbox-overlay'
    ov.innerHTML = `<button class="lightbox-close" aria-label="Cerrar">×</button><img class="lightbox-img" alt="" />`
    document.body.appendChild(ov)
    ov.addEventListener('click', () => { ov.hidden = true })
  }
  ov.querySelector('.lightbox-img').src = url
  ov.hidden = false
}

/* ── Rellena las variables de una plantilla con los datos de la carga ── */
function resolveTemplate(text, ccs) {
  const c = MOCK_CARGAS.find(x => x.ccs === ccs) || {}
  const map = {
    '{{nombre_carga}}': c.nombre,
    '{{ccs}}':          c.ccs || ccs,
    '{{proveedor}}':    c.proveedor,
    '{{eta}}':          c.eta,
    '{{origen}}':       c.origen,
  }
  let r = text
  Object.entries(map).forEach(([k, v]) => { if (v) r = r.replaceAll(k, v) })
  return r
}

function renderThread(container) {
  const thread = MOCK_CORREOS.find(t => t.ccs === currentCcs)
  if (!thread) return
  const etapa = ETAPAS[thread.etapa_idx]

  const msgsHtml = thread.mensajes.map((m, idx) => {
    const isConfirmed = m.confirmado || confirmedMsgs.has(m.id)
    const pendiente   = m.tipo === 'recibido' && !isConfirmed
    const enviado     = m.tipo === 'enviado'
    const iniciales   = _esc(m.de).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const confColor   = (m.confianza || 0) >= 90 ? 'var(--e6)' : 'var(--e3)'
    const adjuntosHtml = (m.adjuntos?.length)
      ? `<div class="crm-msg-attachments">${m.adjuntos.map(renderAdjunto).join('')}</div>` : ''

    const cuerpoHtml = (m.cuerpo || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')

    return `
      <div class="crm-msg ${enviado ? 'crm-msg--sent' : 'crm-msg--recv'} ${pendiente ? 'crm-msg--pending' : ''}">
        <div class="crm-msg-avatar crm-msg-avatar--${enviado ? 'sent' : 'recv'}">${iniciales}</div>
        <div class="crm-msg-card">
          <div class="crm-msg-header">
            <div class="crm-msg-sender-info">
              <span class="crm-msg-sender">${_esc(m.de)}</span>
              ${enviado
                ? `<span class="crm-msg-you">Tú</span>`
                : `<span class="crm-msg-email">&lt;${_esc(m.email || '')}&gt;</span>`}
            </div>
            <span class="crm-msg-time">${_esc(m.fecha || '')}</span>
          </div>
          <p class="crm-msg-subject">${_esc(m.asunto || '')}</p>
          ${cuerpoHtml ? `<div class="crm-msg-body">${cuerpoHtml}</div>` : ''}
          ${adjuntosHtml}
          ${m.tipo === 'recibido' ? `
            <div class="crm-msg-footer">
              ${pendiente ? `
                <div class="crm-ia-row">
                  <span class="crm-ia-dot" style="background:${confColor}"></span>
                  <span class="crm-ia-label">IA sugiere <strong>${_esc(thread.ccs)}</strong>${m.confianza ? ` · ${m.confianza}%` : ''}</span>
                </div>
                <div class="crm-msg-actions">
                  <button class="btn-crm-reply btn-msg-reply" data-reply-id="${_esc(m.id)}">↩ Responder</button>
                  <button class="btn-crm-confirm btn-ia-confirmar" data-msg-id="${_esc(m.id)}">📌 Publicar en Monday</button>
                </div>
              ` : `
                <span class="crm-confirmed">✓ Publicado en Monday</span>
                <button class="btn-crm-reply btn-msg-reply" data-reply-id="${_esc(m.id)}">↩ Responder</button>
              `}
            </div>
            <div class="msg-reply-slot" id="reply-slot-${_esc(m.id)}"></div>
          ` : ''}
        </div>
      </div>`
  }).join('')

  container.innerHTML = `
    <div class="crm-thread-header">
      <div class="crm-thread-header-left">
        <h2 class="crm-thread-title">${_esc(thread.nombre)}</h2>
        <div class="crm-thread-meta">
          <span class="crm-ccs-code">${_esc(thread.ccs)}</span>
          ${etapa
            ? `<span class="crm-etapa-chip" style="--c:${etapa.color}">${etapa.id} · ${etapa.nombre}</span>`
            : `<span class="crm-etapa-chip crm-etapa-chip--inbox">📥 Pendiente de clasificar</span>`}
          <span class="crm-msg-count">${thread.mensajes.length} mensaje${thread.mensajes.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
    <div class="crm-messages">${msgsHtml}</div>
  `

  container.querySelectorAll('.btn-ia-confirmar').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmedMsgs.add(btn.dataset.msgId)
      renderClist(document.getElementById('clistItems'))
      renderThread(container)
    })
  })

  // Abrir imágenes en lightbox
  container.querySelectorAll('[data-lightbox]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); openLightbox(a.dataset.lightbox) })
  })

  // Responder por mensaje — la caja aparece bajo el correo del proveedor
  container.querySelectorAll('.btn-msg-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = document.getElementById('reply-slot-' + btn.dataset.replyId)
      if (!slot) return

      // Cerrar cualquier otra respuesta abierta
      container.querySelectorAll('.msg-reply-slot').forEach(s => { if (s !== slot) s.innerHTML = '' })
      container.querySelectorAll('.btn-msg-reply').forEach(b => { if (b !== btn) b.textContent = '↩ Responder' })

      // Toggle
      if (slot.innerHTML.trim()) {
        slot.innerHTML = ''
        btn.textContent = '↩ Responder'
        return
      }

      const msg = thread.mensajes.find(x => x.id === btn.dataset.replyId)
      slot.innerHTML = composeHTML(msg)
      btn.textContent = '✕ Cerrar'
      const ta = slot.querySelector('.reply-textarea')
      ta.focus()
      wireCompose(slot, thread.ccs)

      slot.querySelector('.btn-reply-cancel').addEventListener('click', () => {
        slot.innerHTML = ''
        btn.textContent = '↩ Responder'
      })

      slot.querySelector('.btn-reply-send').addEventListener('click', () => {
        const sendBtn = slot.querySelector('.btn-reply-send')
        const texto   = ta.value.trim()
        if (!texto) return

        const asunto   = slot.querySelector('.reply-subject-input')?.value || ''
        const adjuntos = Array.from(slot.querySelectorAll('.reply-attach-chip'))
          .map(c => c.textContent.replace('×', '').trim())

        sendBtn.textContent = '✓ Enviado'
        sendBtn.classList.add('btn-tpl-save--done')

        setTimeout(() => {
          // Agrega el correo enviado al final del hilo (orden cronológico)
          thread.mensajes.push({
            id: 'sent-' + thread.mensajes.length + '-' + texto.length,
            de: 'Paulet Bermúdez', email: 'paulet@sicoben.com',
            asunto,
            fecha: nowStamp(),
            cuerpo: texto,
            resumen: null, adjuntos,
            tipo: 'enviado', confianza: null, confirmado: true,
          })
          renderClist(document.getElementById('clistItems'))
          renderThread(container)
          // Scroll al final para ver el correo recién enviado
          const wrap = container.closest('.correos-thread') || container
          wrap.scrollTop = wrap.scrollHeight
        }, 1200)
      })
    })
  })
}

function nowStamp() {
  const d = new Date()
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}, ${d.getHours()}:${mm}`
}

function composeHTML(msg) {
  const to      = msg?.email || ''
  const subject = msg ? 'RE: ' + msg.asunto.replace(/^RE:\s*/i, '') : ''
  return `
    <div class="reply-compose">
      <div class="reply-fields">
        <div class="reply-field-row">
          <span class="reply-field-label">Para</span>
          <input class="reply-field-input" type="text" value="${to}" />
          <div class="reply-cc-toggles">
            <button class="reply-cc-btn" data-cc="cc" type="button">CC</button>
            <button class="reply-cc-btn" data-cc="cco" type="button">CCO</button>
          </div>
        </div>
        <div class="reply-field-row reply-cc-field" data-cc-field="cc" hidden>
          <span class="reply-field-label">CC</span>
          <input class="reply-field-input" type="text" placeholder="correo@ejemplo.com" />
        </div>
        <div class="reply-field-row reply-cc-field" data-cc-field="cco" hidden>
          <span class="reply-field-label">CCO</span>
          <input class="reply-field-input" type="text" placeholder="correo@ejemplo.com" />
        </div>
        <div class="reply-field-row">
          <span class="reply-field-label">Asunto</span>
          <input class="reply-field-input reply-subject-input" type="text" value="${subject.replace(/"/g, '&quot;')}" />
        </div>
      </div>
      <textarea class="reply-textarea" placeholder="Escribe tu respuesta… o escribe / para insertar una plantilla"></textarea>
      <div class="reply-attach-list" hidden></div>
      <input type="file" class="reply-file-input" multiple hidden />
      <div class="reply-send-bar">
        <div class="reply-toolbar">
          <button class="btn-reply-attach" type="button">📎 Adjuntar</button>
          <span class="reply-hint">Sale de paulet@sicoben.com · reintento en 48h</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-tpl-discard btn-reply-cancel" type="button">Cancelar</button>
          <button class="btn-tpl-save btn-reply-send" type="button">Enviar</button>
        </div>
      </div>
    </div>`
}

function wireCompose(slot, ccs) {
  // CC / CCO toggles
  slot.querySelectorAll('.reply-cc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = slot.querySelector(`.reply-cc-field[data-cc-field="${btn.dataset.cc}"]`)
      const show = field.hidden
      field.hidden = !show
      btn.classList.toggle('reply-cc-btn--active', show)
      if (show) field.querySelector('input').focus()
    })
  })

  // Adjuntar archivos
  const fileInput = slot.querySelector('.reply-file-input')
  const attachList = slot.querySelector('.reply-attach-list')
  slot.querySelector('.btn-reply-attach').addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files)
    if (!files.length) return
    attachList.hidden = false
    attachList.innerHTML = files.map(f =>
      `<span class="reply-attach-chip">📎 ${f.name} <button class="reply-attach-x" type="button">×</button></span>`
    ).join('')
    attachList.querySelectorAll('.reply-attach-x').forEach((x) => {
      x.addEventListener('click', () => {
        x.closest('.reply-attach-chip').remove()
        if (!attachList.querySelector('.reply-attach-chip')) attachList.hidden = true
      })
    })
  })

  // ── Comando "/" para insertar plantillas ──
  wireSlashCommand(slot, ccs)
}

function wireSlashCommand(slot, ccs) {
  const ta      = slot.querySelector('.reply-textarea')
  const compose = slot.querySelector('.reply-compose')
  compose.style.position = 'relative'

  const menu = document.createElement('div')
  menu.className = 'slash-menu'
  menu.hidden = true
  compose.appendChild(menu)

  let activeIdx = 0

  function getCtx() {
    const pos = ta.selectionStart
    const before = ta.value.slice(0, pos)
    const slashIdx = before.lastIndexOf('/')
    if (slashIdx === -1) return null
    const charBefore = slashIdx === 0 ? '' : before[slashIdx - 1]
    if (charBefore && !/\s/.test(charBefore)) return null   // solo al inicio o tras espacio
    const query = before.slice(slashIdx + 1)
    if (query.includes('\n')) return null
    return { slashIdx, query }
  }

  function matches(query) {
    const q = query.toLowerCase().trim()
    return MOCK_PLANTILLAS.filter(t => !q || t.nombre.toLowerCase().includes(q))
  }

  function showMenu(query) {
    const list = matches(query)
    if (!list.length) { menu.hidden = true; return }
    activeIdx = Math.min(activeIdx, list.length - 1)
    menu.innerHTML = `
      <div class="slash-menu-hint">Plantillas — datos de <strong>${(MOCK_CARGAS.find(c=>c.ccs===ccs)||{}).proveedor || ccs}</strong></div>
      ${list.map((t, i) => {
        const etapa = t.etapa_idx !== null ? ETAPAS[t.etapa_idx] : null
        return `
          <div class="slash-item ${i === activeIdx ? 'slash-item--active' : ''}" data-tpl-id="${t.id}">
            <span class="slash-item-icon">${t.canal === 'wa' ? '💬' : '✉️'}</span>
            <span class="slash-item-name">${t.nombre}</span>
            <span class="slash-item-meta">${etapa ? etapa.id : '∀'} · ${t.destino}</span>
          </div>`
      }).join('')}
    `
    menu.querySelectorAll('.slash-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault()
        pick(item.dataset.tplId)
      })
    })
    // posición: bajo el inicio del textarea
    menu.style.left = ta.offsetLeft + 'px'
    menu.style.top  = (ta.offsetTop + 34) + 'px'
    menu.hidden = false
  }

  function pick(tplId) {
    const tpl = MOCK_PLANTILLAS.find(t => t.id === tplId)
    const ctx = getCtx()
    if (!tpl || !ctx) { menu.hidden = true; return }
    const pos    = ta.selectionStart
    const before = ta.value.slice(0, ctx.slashIdx)
    const after  = ta.value.slice(pos)
    const body   = resolveTemplate(tpl.cuerpo, ccs)
    ta.value = before + body + after
    const newPos = (before + body).length
    ta.focus()
    ta.setSelectionRange(newPos, newPos)
    menu.hidden = true

    // Si la plantilla trae asunto, lo pone en el campo Asunto
    const subjInput = slot.querySelector('.reply-subject-input')
    if (subjInput && tpl.asunto) subjInput.value = resolveTemplate(tpl.asunto, ccs)
  }

  ta.addEventListener('input', () => {
    const ctx = getCtx()
    if (!ctx) { menu.hidden = true; return }
    activeIdx = 0
    showMenu(ctx.query)
  })

  ta.addEventListener('keydown', e => {
    if (menu.hidden) return
    const items = [...menu.querySelectorAll('.slash-item')]
    if (!items.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % items.length; refreshActive(items) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = (activeIdx - 1 + items.length) % items.length; refreshActive(items) }
    else if (e.key === 'Enter')  { e.preventDefault(); pick(items[activeIdx].dataset.tplId) }
    else if (e.key === 'Escape') { e.preventDefault(); menu.hidden = true }
  })

  function refreshActive(items) {
    items.forEach((it, i) => it.classList.toggle('slash-item--active', i === activeIdx))
  }

  ta.addEventListener('blur', () => setTimeout(() => { menu.hidden = true }, 150))
}

function renderCorreosPanel() {
  const panel = document.getElementById('panel-correos')
  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Correos</h2>
      <p class="panel-subtitle">Hilos clasificados por carga · Requiere confirmación antes de publicar en Monday</p>
    </div>
    <div class="correos-layout">
      <aside class="plist-sidebar">
        <p class="plist-count">${MOCK_CORREOS.length} hilos activos</p>
        <div class="clist-items" id="clistItems"></div>
      </aside>
      <div class="correos-thread" id="correosThread"></div>
    </div>
  `

  const clistItems  = document.getElementById('clistItems')
  const threadDiv   = document.getElementById('correosThread')

  renderClist(clistItems)
  renderThread(threadDiv)

  clistItems.addEventListener('click', e => {
    const item = e.target.closest('[data-ccs]')
    if (!item) return
    currentCcs = item.dataset.ccs
    renderClist(clistItems)
    renderThread(threadDiv)
  })
}

/* ═══════════════════════════════
   CPSIA PANEL (Panel 6 — F-09)
   ═══════════════════════════════ */

const MOCK_CPSIA_LOADS = [
  {
    ccs: '2025B-LCL', nombre: 'Libros Educativos Q1 2026', etapa_idx: 2,
    analizado: '7 Jun 2026, 11:58',
    notif_yonaida_wa: true, notif_yonaida_email: true, notif_proveedor: true,
    productos: [
      { num:1, img:'https://placehold.co/52x52/FFF3E0/F06B35?text=ACT',
        producto:'Libro de Actividades con Crayones', codigo:'EDU-ACT-001',
        formato:'COLOREAR', materiales:'Papel, crayones de cera, tapa cartón',
        aplica:true,  test:'ASTM D-4236 (pigmentos)', qty:2500 },
      { num:2, img:'https://placehold.co/52x52/E8F5E9/8DC63F?text=STK',
        producto:'Stickers Animales del Bosque',      codigo:'EDU-STK-004',
        formato:'STICKERS', materiales:'Vinilo adhesivo, impresión offset',
        aplica:true,  test:'Plomo en adhesivo',        qty:5000 },
      { num:3, img:'https://placehold.co/52x52/E3F2FD/3BB8E8?text=CUE',
        producto:'Cuentos Ilustrados Vol. 3',         codigo:'EDU-CUE-012',
        formato:'LECTURA', materiales:'Papel bond 90g, tapa dura cartón',
        aplica:false, test:'EXENTO — 16 CFR 1501',     qty:1800 },
      { num:4, img:'https://placehold.co/52x52/FCE4EC/E8357A?text=KIT',
        producto:'Kit Manualidades Creativas',        codigo:'EDU-KIT-007',
        formato:'KIT', materiales:'Plástico ABS, metal, tela, pegamento',
        aplica:true,  test:'Plomo · Ftalatos · ASTM F963', qty:1200 },
    ],
  },
  {
    ccs: '2025A-FCL', nombre: 'Colección Fantasía Vol. 3', etapa_idx: 2,
    analizado: '5 Jun 2026, 14:22',
    notif_yonaida_wa: true, notif_yonaida_email: false, notif_proveedor: false,
    productos: [
      { num:1, img:'https://placehold.co/52x52/F3E5F5/7B4CA8?text=COL',
        producto:'Colgante Unicornio',               codigo:'FAN-COL-003',
        formato:'COLGANTE', materiales:'Metal, pintura esmalte',
        aplica:true,  test:'Plomo sustrato + superficial', qty:3000 },
      { num:2, img:'https://placehold.co/52x52/E0F7FA/2ABDA8?text=LEC',
        producto:'Libro de Lectura Fantasía',        codigo:'FAN-LEC-011',
        formato:'LECTURA', materiales:'Papel couché, tapa blanda',
        aplica:false, test:'EXENTO — 16 CFR 1501',         qty:2200 },
    ],
  },
]

const cpsiaBlockedMap = {}
const cpsiaNotifState = {}   // keyed by ccs: { wa: bool, email: bool }
let currentCpsiaLoad = MOCK_CPSIA_LOADS[0].ccs

function getCpsiaNotif(ccs) {
  if (!cpsiaNotifState[ccs]) {
    const load = MOCK_CPSIA_LOADS.find(l => l.ccs === ccs)
    cpsiaNotifState[ccs] = { wa: load.notif_yonaida_wa, email: load.notif_yonaida_email }
  }
  return cpsiaNotifState[ccs]
}

function renderCpsiaList(container) {
  container.innerHTML = MOCK_CPSIA_LOADS.map(load => {
    const flagged = load.productos.filter(p => p.aplica).length
    const active  = load.ccs === currentCpsiaLoad
    const notif   = getCpsiaNotif(load.ccs)
    const notifPending = !notif.wa || !notif.email
    return `
      <div class="clist-item ${active ? 'clist-item--active' : ''}"
           data-cpsia-ccs="${load.ccs}" role="button" tabindex="0">
        <div class="clist-top">
          <span class="ccs-code">${load.ccs}</span>
          ${notifPending ? `<span class="clist-badge-pendiente">notif</span>` :
            flagged ? `<span class="clist-badge-pendiente">${flagged}</span>` : ''}
        </div>
        <span class="clist-nombre">${load.nombre}</span>
        <span class="clist-preview">${load.analizado} · ${load.productos.length} productos</span>
      </div>
    `
  }).join('')
}

function renderCpsiaDetail(container) {
  const load = MOCK_CPSIA_LOADS.find(l => l.ccs === currentCpsiaLoad)
  if (!load) return

  const etapa   = ETAPAS[load.etapa_idx]
  const flagged = load.productos.filter(p => p.aplica).length
  const total   = load.productos.length
  const blocked = !!cpsiaBlockedMap[load.ccs]
  const notif   = getCpsiaNotif(load.ccs)
  const flaggedList = load.productos.filter(p => p.aplica).map(p => `• ${p.producto}`).join('\n')

  function channelBtn(ch, sent) {
    const icon  = ch === 'wa' ? '💬' : '✉️'
    const label = ch === 'wa' ? 'WhatsApp' : 'Email'
    if (sent) return `
      <div class="cpsia-channel-row">
        <span class="cpsia-notif-badge cpsia-notif-badge--ok">${icon} ${label} enviado ✓</span>
        <button class="btn-cpsia-resend" data-ch="${ch}">Re-enviar</button>
      </div>`
    return `
      <div class="cpsia-channel-row">
        <span class="cpsia-notif-badge cpsia-notif-badge--pend">${icon} ${label} pendiente</span>
        <button class="btn-cpsia-send" data-ch="${ch}">Enviar ${label}</button>
      </div>`
  }

  container.innerHTML = `
    <div class="cpsia-detail">
      <div class="cpsia-trigger-card">
        <div class="cpsia-trigger-top">
          <div>
            <span class="tpl-editing-label">Carga analizada</span>
            <h3 class="cpsia-load-name">${load.nombre}</h3>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span class="plist-stage-chip" style="--c:${etapa.color}">${etapa.id} · ${etapa.nombre}</span>
            <span class="ccs-code">${load.ccs}</span>
          </div>
        </div>
        <div class="cpsia-trigger-meta">
          <span class="cpsia-meta-item">🕐 Analizado el ${load.analizado}</span>
          <span class="cpsia-meta-item">📊 <a href="#" class="cpsia-sheet-link">Ver pestaña CPSIA Filtro →</a></span>
          <span class="cpsia-notif-badge cpsia-notif-badge--${load.notif_proveedor ? 'ok' : 'pend'}">
            ${load.notif_proveedor ? '✓ Proveedor notificado' : '⏳ Proveedor pendiente'}
          </span>
        </div>

        <div class="cpsia-notif-box">
          <div class="cpsia-notif-box-header">
            <span class="tpl-field-label">Notificación a Yonaida</span>
            ${(!notif.wa || !notif.email) ? `
              <button class="btn-cpsia-send-all">Enviar WA + Email</button>` : ''}
          </div>
          <div class="cpsia-notif-preview">
            🚨 CPSIA detectado — ${load.ccs}<br>
            Productos flagged: ${flagged}<br>
            <span class="cpsia-preview-list">${flaggedList.replace(/\n/g, '<br>')}</span>
          </div>
          <div class="cpsia-notif-channels" id="cpsiaChannels">
            ${channelBtn('wa',    notif.wa)}
            ${channelBtn('email', notif.email)}
          </div>
        </div>
      </div>

      <div class="cpsia-summary-bar">
        <div class="cpsia-summary-stat">
          <span class="cpsia-summary-num">${total}</span>
          <span class="cpsia-summary-label">Analizados</span>
        </div>
        <div class="cpsia-summary-div"></div>
        <div class="cpsia-summary-stat">
          <span class="cpsia-summary-num cpsia-summary-num--alert">${flagged}</span>
          <span class="cpsia-summary-label">Requieren prueba</span>
        </div>
        <div class="cpsia-summary-div"></div>
        <div class="cpsia-summary-stat">
          <span class="cpsia-summary-num cpsia-summary-num--ok">${total - flagged}</span>
          <span class="cpsia-summary-label">Exentos</span>
        </div>
        <div class="cpsia-block-toggle">
          <span class="cpsia-block-label" id="cpsiaBlockLabel">
            ${blocked ? '⛔ Avance a E4 bloqueado' : '🟢 Avance a E4 permitido'}
          </span>
          <button class="cpsia-block-btn ${blocked ? 'cpsia-block-btn--active' : ''}" id="btnCpsiaBlock">
            ${blocked ? 'Desbloquear' : 'Bloquear avance'}
          </button>
        </div>
      </div>

      <div class="cpsia-table-wrap">
        <table class="cpsia-table">
          <thead>
            <tr>
              <th class="cpsia-th cpsia-th--num">#</th>
              <th class="cpsia-th">Imagen</th>
              <th class="cpsia-th">Producto</th>
              <th class="cpsia-th">Formato</th>
              <th class="cpsia-th">Materiales</th>
              <th class="cpsia-th">CPSIA</th>
              <th class="cpsia-th">Test requerido</th>
              <th class="cpsia-th cpsia-th--num">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${load.productos.map(p => `
              <tr class="cpsia-tr ${p.aplica ? 'cpsia-tr--flagged' : ''}">
                <td class="cpsia-td cpsia-td--num">${p.num}</td>
                <td class="cpsia-td cpsia-td--img">
                  ${p.img
                    ? `<img class="cpsia-img-thumb" src="${p.img}" alt="${p.producto}" loading="lazy" />`
                    : `<div class="cpsia-img-placeholder">IMG</div>`}
                </td>
                <td class="cpsia-td">
                  <span class="cpsia-prod-nombre">${p.producto}</span>
                  <span class="cpsia-prod-codigo">${p.codigo}</span>
                </td>
                <td class="cpsia-td"><span class="cpsia-formato-chip">${p.formato}</span></td>
                <td class="cpsia-td cpsia-td--materials">${p.materiales}</td>
                <td class="cpsia-td">
                  <span class="cpsia-aplica-badge cpsia-aplica-badge--${p.aplica ? 'si' : 'no'}">
                    ${p.aplica ? 'Sí' : 'No'}
                  </span>
                </td>
                <td class="cpsia-td">
                  <span class="cpsia-test-chip cpsia-test-chip--${p.aplica ? 'alert' : 'exempt'}">
                    ${p.test}
                  </span>
                </td>
                <td class="cpsia-td cpsia-td--num">${p.qty.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `

  document.getElementById('btnCpsiaBlock').addEventListener('click', () => {
    cpsiaBlockedMap[load.ccs] = !cpsiaBlockedMap[load.ccs]
    renderCpsiaDetail(container)
  })

  function sendChannel(ch) {
    cpsiaNotifState[load.ccs][ch] = true
    renderCpsiaDetail(container)
    renderCpsiaList(document.getElementById('cpsiaList'))
  }

  container.querySelectorAll('.btn-cpsia-send, .btn-cpsia-resend').forEach(btn => {
    btn.addEventListener('click', () => sendChannel(btn.dataset.ch))
  })

  const btnAll = container.querySelector('.btn-cpsia-send-all')
  if (btnAll) btnAll.addEventListener('click', () => {
    cpsiaNotifState[load.ccs].wa    = true
    cpsiaNotifState[load.ccs].email = true
    renderCpsiaDetail(container)
    renderCpsiaList(document.getElementById('cpsiaList'))
  })
}

function downloadCSV(filename, products) {
  const headers = ['#','ITEM NAME','DESCRIPTION','APLICA CPSIA','TEST REQUERIDO','ARTÍCULO / NORMA']
  const rows = products.map(p => [
    p.num,
    `"${(p.itemName||'').replace(/"/g,'""')}"`,
    `"${(p.description||'').replace(/"/g,'""')}"`,
    p.aplica ? 'SÍ — REQUIERE PRUEBA' : (p.exento ? 'EXENTO' : 'NO'),
    `"${(p.test||'').replace(/"/g,'""')}"`,
    `"${(p.articulo||'').replace(/"/g,'""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

function renderCpsiaAnalyzer(container) {
  container.innerHTML = `
    <div class="cpsia-analyzer-card">
      <div class="cpsia-analyzer-header">
        <span class="cpsia-analyzer-icon">📊</span>
        <div>
          <p class="cpsia-analyzer-title">Analizar Google Sheet de Proforma</p>
          <p class="cpsia-analyzer-hint">Comparte el sheet como "Cualquiera con el enlace puede ver" · Lee columnas ITEM NAME y DESCRIPTION</p>
        </div>
      </div>
      <div class="cpsia-analyzer-input-row">
        <input class="cpsia-sheet-input" id="cpsiaSheetUrl" type="url" style="flex:3"
          placeholder="https://docs.google.com/spreadsheets/d/..." />
        <input class="cpsia-sheet-input" id="cpsiaCcsInput" type="text" style="flex:1;max-width:160px"
          placeholder="CCS (ej: 2025B-LCL)" />
        <input class="cpsia-sheet-input" id="cpsiaNombreInput" type="text" style="flex:1;max-width:200px"
          placeholder="Nombre de la carga" />
        <button class="btn-cpsia-analyze" id="btnAnalyzeSheet">🔍 Analizar</button>
      </div>
      <div id="cpsiaAnalyzeResult"></div>
    </div>
  `

  document.getElementById('btnAnalyzeSheet').addEventListener('click', async () => {
    const sheetUrl = document.getElementById('cpsiaSheetUrl').value.trim()
    const ccs      = document.getElementById('cpsiaCcsInput').value.trim()
    const nombre   = document.getElementById('cpsiaNombreInput').value.trim() || ccs
    const resultEl = document.getElementById('cpsiaAnalyzeResult')
    const btn      = document.getElementById('btnAnalyzeSheet')

    if (!sheetUrl) { resultEl.innerHTML = `<p class="cpsia-analyzer-error">Pega una URL de Google Sheets.</p>`; return }

    btn.textContent = '⏳ Analizando...'; btn.disabled = true
    resultEl.innerHTML = '<p style="color:#888;margin-top:12px">Leyendo sheet y aplicando reglas CPSIA...</p>'

    try {
      const apiUrl = `/api/cpsia-full?url=${encodeURIComponent(sheetUrl)}&ccs=${encodeURIComponent(ccs)}&nombre=${encodeURIComponent(nombre)}`
      const r    = await fetch(apiUrl)
      const data = await r.json()

      if (!r.ok) {
        resultEl.innerHTML = `<p class="cpsia-analyzer-error">❌ ${_esc(data.error)}</p>`
        btn.textContent = '🔍 Analizar'; btn.disabled = false
        return
      }

      const flagged     = data.products.filter(p => p.aplica)
      const exentos     = data.products.filter(p => p.exento)
      const flaggedList = flagged.map(p => `• ${_esc(p.itemName)} → ${_esc(p.test)}`).join('\n')
      const filename    = `CPSIA_${(nombre||ccs||'carga').replace(/[^a-zA-Z0-9]/g,'_')}.csv`

      resultEl.innerHTML = `
        <div class="cpsia-result-summary">
          <span class="cpsia-result-stat cpsia-result-stat--total">${data.total} productos analizados</span>
          <span class="cpsia-result-stat cpsia-result-stat--alert">⚠️ ${flagged.length} requieren prueba</span>
          <span class="cpsia-result-stat cpsia-result-stat--ok">✓ ${exentos.length} exentos</span>
          <button class="btn-cpsia-download" id="btnDownloadCSV">⬇ Descargar CSV</button>
          <button class="btn-cpsia-write" id="btnWriteSheet">📝 Guardar en Google Sheet</button>
        </div>

        <div class="cpsia-table-wrap" style="margin-top:16px">
          <table class="cpsia-table">
            <thead>
              <tr>
                <th class="cpsia-th cpsia-th--num">#</th>
                <th class="cpsia-th">ITEM NAME</th>
                <th class="cpsia-th">DESCRIPTION</th>
                <th class="cpsia-th">CPSIA</th>
                <th class="cpsia-th">Test requerido</th>
                <th class="cpsia-th">Norma</th>
              </tr>
            </thead>
            <tbody>
              ${data.products.map(p => `
                <tr class="cpsia-tr ${p.aplica ? 'cpsia-tr--flagged' : p.exento ? 'cpsia-tr--exento' : ''}">
                  <td class="cpsia-td cpsia-td--num">${p.num}</td>
                  <td class="cpsia-td"><span class="cpsia-prod-nombre">${_esc(p.itemName)}</span></td>
                  <td class="cpsia-td cpsia-td--materials" style="font-size:11px">${_esc(p.description||'—')}</td>
                  <td class="cpsia-td">
                    <span class="cpsia-aplica-badge cpsia-aplica-badge--${p.aplica ? 'si' : 'no'}">
                      ${p.aplica ? '⚠️ Sí' : p.exento ? '✓ Exento' : '—'}
                    </span>
                  </td>
                  <td class="cpsia-td"><span class="cpsia-test-chip cpsia-test-chip--${p.aplica ? 'alert' : 'exempt'}">${_esc(p.test)}</span></td>
                  <td class="cpsia-td" style="font-size:11px;color:#888">${_esc(p.articulo||'')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="cpsia-yonaida-box" style="margin-top:20px">
          <div class="cpsia-yonaida-preview">
            <p class="cpsia-yonaida-preview-title">📋 Resumen para Yonaida — ${_esc(nombre||ccs)}</p>
            <pre class="cpsia-yonaida-text" id="cpsiaPreviewText"></pre>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn-cpsia-yonaida" id="btnEmailYonaida">
              ✉️ Enviar a Yonaida por Correo
            </button>
            <button class="btn-cpsia-yonaida" id="btnWaYonaida" style="background:var(--e7)">
              💬 Enviar a Yonaida por WhatsApp
            </button>
          </div>
          <div id="cpsiaNotifStatus" style="margin-top:8px;font-size:12px;color:#888"></div>
        </div>
      `

      // Asignar texto preview con textContent (no innerHTML) — evita XSS
      const previewEl = document.getElementById('cpsiaPreviewText')
      if (previewEl) previewEl.textContent =
        `🚨 CPSIA Filtro — ${nombre||ccs}\n` +
        `Analizados: ${data.total} · Requieren prueba: ${flagged.length} · Exentos: ${exentos.length}\n\n` +
        (flagged.length ? flagged.map(p => `• ${p.itemName} → ${p.test}`).join('\n') : '✅ Ningún producto requiere prueba CPSIA.') +
        '\n\nGenerado por KAIA Command'

      // Guardar historial en Supabase
      const ccsForHistory = ccs || 'INBOX'
      if (supabase) {
        supabase.from('historial_eventos').insert({
          ccs:         ccsForHistory,
          tipo:        'alerta',
          icono:       flagged.length ? '⚠️' : '✅',
          texto:       flagged.length
            ? `CPSIA: ${flagged.length} productos requieren prueba — ${flagged.slice(0,3).map(p=>p.itemName).join(', ')}${flagged.length>3?'...':''}`
            : 'CPSIA: Todos los productos exentos',
          detalle:     `Analizados: ${data.total} · Con prueba: ${flagged.length} · Exentos: ${exentos.length}`,
          fecha_evento: new Date().toISOString(),
        })
      }

      // Descargar CSV
      document.getElementById('btnDownloadCSV').addEventListener('click', () => {
        downloadCSV(filename, data.products)
      })

      // Escribir en Google Sheet
      document.getElementById('btnWriteSheet').addEventListener('click', async () => {
        const wBtn = document.getElementById('btnWriteSheet')
        wBtn.textContent = '⏳ Guardando...'; wBtn.disabled = true
        const wr = await fetch('/api/cpsia-full', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sheetId: data.sheetId, ccs, nombre, products: data.products }),
        })
        const wd = await wr.json()
        if (wr.ok) {
          wBtn.textContent = '✅ Pestaña "CPSIA Filtro" creada'
          wBtn.style.background = 'var(--e6)'
        } else {
          wBtn.textContent = '❌ ' + (wd.error || 'Error'); wBtn.disabled = false
        }
      })

      // Email a Yonaida
      document.getElementById('btnEmailYonaida').addEventListener('click', async () => {
        const eBtn = document.getElementById('btnEmailYonaida')
        const status = document.getElementById('cpsiaNotifStatus')
        eBtn.textContent = '⏳ Enviando correo...'; eBtn.disabled = true
        const er = await fetch('/api/send-yonaida', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ccs, nombre, products: data.products, sheetUrl }),
        })
        const ed = await er.json()
        if (er.ok) {
          eBtn.textContent = '✅ Correo enviado a Yonaida'
          eBtn.style.background = 'var(--e6)'
          status.textContent = 'Enviado a logistica@sicobenediciones.com'
        } else {
          eBtn.textContent = '❌ Error al enviar'; eBtn.disabled = false
          status.textContent = ed.error || 'Error desconocido'
        }
      })

      // WhatsApp a Yonaida
      document.getElementById('btnWaYonaida').addEventListener('click', () => {
        const msg = encodeURIComponent(
          `🚨 *CPSIA Filtro — ${nombre||ccs}*\n` +
          `${flagged.length} producto${flagged.length!==1?'s':''} requiere${flagged.length!==1?'n':''} prueba:\n\n` +
          flaggedList + '\n\nVer detalle en KAIA: kaia.sicoben.com/admin'
        )
        window.open(`https://wa.me/+50761112233?text=${msg}`, '_blank')
      })

    } catch (err) {
      resultEl.innerHTML = `<p class="cpsia-analyzer-error">❌ Error de conexión: ${_esc(err.message)}</p>`
    }

    btn.textContent = '🔍 Analizar'; btn.disabled = false
  })
}

function renderCpsiaPanel() {
  const panel = document.getElementById('panel-cpsia')
  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">CPSIA</h2>
      <p class="panel-subtitle">Detección automática de productos que requieren prueba de seguridad infantil</p>
    </div>
    <div id="cpsiaAnalyzerMount"></div>
    <div class="correos-layout" style="margin-top:16px">
      <aside class="plist-sidebar">
        <p class="plist-count">${MOCK_CPSIA_LOADS.length} cargas analizadas</p>
        <div class="clist-items" id="cpsiaList"></div>
      </aside>
      <div class="correos-thread" id="cpsiaDetail"></div>
    </div>
  `

  renderCpsiaAnalyzer(document.getElementById('cpsiaAnalyzerMount'))

  const listEl   = document.getElementById('cpsiaList')
  const detailEl = document.getElementById('cpsiaDetail')

  renderCpsiaList(listEl)
  renderCpsiaDetail(detailEl)

  listEl.addEventListener('click', e => {
    const item = e.target.closest('[data-cpsia-ccs]')
    if (!item) return
    currentCpsiaLoad = item.dataset.cpsiaCcs
    renderCpsiaList(listEl)
    renderCpsiaDetail(detailEl)
  })
}

/* ═══════════════════════════════
   ALERTAS PANEL (Panel 7 — F-04/F-07)
   ═══════════════════════════════ */

let MOCK_ALERTAS = [
  { id:'al1', semaforo:'rojo',     icon:'🚨', tipo:'Escalada',
    ccs:'2025C-FCL', nombre:'Colección Navidad 2025', hace:'hace 1h',
    msg:'Ningbo Jumbo no respondió tras 2 reintentos — acción manual requerida' },
  { id:'al2', semaforo:'rojo',     icon:'⚠️', tipo:'Carencia',
    ccs:'2025C-FCL', nombre:'Colección Navidad 2025', hace:'hace 3h',
    msg:'Avanzó a E6 Fabricación sin completar: Reporte de avance semanal' },
  { id:'al3', semaforo:'amarillo', icon:'📦', tipo:'Inactividad',
    ccs:'2025D-AIR', nombre:'Urgente Diciembre KADI',  hace:'hace 6h',
    msg:'E7 Tráfico lleva 6 días sin actualización en Monday' },
  { id:'al4', semaforo:'amarillo', icon:'📋', tipo:'Reintento',
    ccs:'2025B-LCL', nombre:'Libros Educativos Q1 2026', hace:'hace 8h',
    msg:'Reintento #1 enviado a Mumbai Book Printers — sin respuesta en 48h' },
  { id:'al5', semaforo:'verde',    icon:'🔔', tipo:'Correo nuevo',
    ccs:'2025B-LCL', nombre:'Libros Educativos Q1 2026', hace:'hace 12h',
    msg:'Nuevo correo de Priya Sharma · Proforma Invoice — pendiente de confirmar en Monday' },
]

const resolvedAlerts = new Set()
let alertFilter = 'todos'

function renderAlertasPanel() {
  const panel = document.getElementById('panel-alertas')

  const counts = {
    rojo:     MOCK_ALERTAS.filter(a => a.semaforo === 'rojo'     && !resolvedAlerts.has(a.id)).length,
    amarillo: MOCK_ALERTAS.filter(a => a.semaforo === 'amarillo' && !resolvedAlerts.has(a.id)).length,
    verde:    MOCK_ALERTAS.filter(a => a.semaforo === 'verde'    && !resolvedAlerts.has(a.id)).length,
  }

  const visible = alertFilter === 'todos'
    ? MOCK_ALERTAS
    : MOCK_ALERTAS.filter(a => a.semaforo === alertFilter)

  const SCOLOR = { rojo: 'var(--e4)', amarillo: 'var(--e3)', verde: 'var(--e6)' }

  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Alertas</h2>
      <p class="panel-subtitle">Semáforo de eventos activos · ${counts.rojo + counts.amarillo + counts.verde} sin resolver</p>
    </div>

    <div class="alertas-stats">
      <button class="alerta-filter-chip ${alertFilter==='todos'?'alerta-filter-chip--active':''}"
              data-filter="todos">Todas · ${MOCK_ALERTAS.length}</button>
      <button class="alerta-filter-chip alerta-filter-chip--rojo ${alertFilter==='rojo'?'alerta-filter-chip--active':''}"
              data-filter="rojo">🔴 Críticas · ${counts.rojo}</button>
      <button class="alerta-filter-chip alerta-filter-chip--amarillo ${alertFilter==='amarillo'?'alerta-filter-chip--active':''}"
              data-filter="amarillo">🟡 Atención · ${counts.amarillo}</button>
      <button class="alerta-filter-chip alerta-filter-chip--verde ${alertFilter==='verde'?'alerta-filter-chip--active':''}"
              data-filter="verde">🟢 Info · ${counts.verde}</button>
    </div>

    <div class="alertas-list">
      ${visible.map(a => {
        const resuelta = resolvedAlerts.has(a.id)
        return `
          <div class="alerta-card alerta-card--${a.semaforo} ${resuelta ? 'alerta-card--resuelta' : ''}">
            <span class="alerta-dot" style="--ac:${SCOLOR[a.semaforo]}"></span>
            <span class="alerta-icon">${a.icon}</span>
            <div class="alerta-body">
              <p class="alerta-msg">${a.msg}</p>
              <div class="alerta-meta">
                <span class="ccs-code">${a.ccs}</span>
                <span class="alerta-nombre">${a.nombre}</span>
                <span class="alerta-tipo">${a.tipo}</span>
                <span class="alerta-hace">${a.hace}</span>
              </div>
            </div>
            <div class="alerta-actions">
              <button class="btn-alerta-ver" data-ccs="${a.ccs}">Ver carga</button>
              <button class="btn-alerta-resolve ${resuelta ? 'btn-alerta-resolve--done' : ''}"
                      data-id="${a.id}">
                ${resuelta ? '✓ Resuelta' : 'Resolver'}
              </button>
            </div>
          </div>`
      }).join('')}
    </div>
  `

  panel.querySelectorAll('[data-filter]').forEach(btn =>
    btn.addEventListener('click', () => { alertFilter = btn.dataset.filter; renderAlertasPanel() })
  )

  panel.querySelectorAll('.btn-alerta-resolve').forEach(btn =>
    btn.addEventListener('click', () => {
      resolvedAlerts.has(btn.dataset.id) ? resolvedAlerts.delete(btn.dataset.id) : resolvedAlerts.add(btn.dataset.id)
      renderAlertasPanel()
    })
  )

  panel.querySelectorAll('.btn-alerta-ver').forEach(btn =>
    btn.addEventListener('click', () => showDetalle(btn.dataset.ccs))
  )
}

/* ═══════════════════════════════════════
   PANEL 8 — MONDAY SYNC
   ═══════════════════════════════════════ */

const MOCK_MONDAY_BOARDS = [
  { etapa_idx:0, board_id:'18398325293', items:8,  ultima_sync:'09 Jun, 14:32', estado:'ok' },
  { etapa_idx:1, board_id:'18398330011', items:5,  ultima_sync:'09 Jun, 14:32', estado:'ok' },
  { etapa_idx:2, board_id:'18398330342', items:3,  ultima_sync:'09 Jun, 14:31', estado:'ok' },
  { etapa_idx:3, board_id:'18398331388', items:4,  ultima_sync:'09 Jun, 14:32', estado:'ok' },
  { etapa_idx:4, board_id:'18398347387', items:2,  ultima_sync:'09 Jun, 14:30', estado:'ok' },
  { etapa_idx:5, board_id:'18398348560', items:6,  ultima_sync:'09 Jun, 14:32', estado:'ok' },
  { etapa_idx:6, board_id:'18398349721', items:3,  ultima_sync:'09 Jun, 13:55', estado:'error' },
]

const MOCK_DETECTED_BOARDS = [
  { nombre: 'ETAPA 8: ARCHIVO', board_id: '18500009871' }
]

const detectedActivated = new Set()

function renderMondayPanel() {
  const panel = document.getElementById('panel-monday')

  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Monday sync</h2>
      <p class="panel-subtitle">Estado de los 7 tableros · Workspace 14162882</p>
    </div>

    <div class="msync-status-bar">
      <div class="msync-ws-left">
        <span class="live-badge"><span class="live-dot"></span> Conectado</span>
        <span class="msync-ws-id">Workspace · <span class="ccs-code">14162882</span></span>
      </div>
      <div class="msync-ws-right">
        <span class="msync-last-sync" id="msyncLastSync">Última sync: hoy 14:32</span>
        <button class="btn-msync-now" id="btnMsyncNow">↻ Sincronizar ahora</button>
      </div>
    </div>

    <div class="msync-section-hdr">Tableros conectados</div>

    <div class="msync-boards-list">
      ${MOCK_MONDAY_BOARDS.map(b => {
        const etapa = ETAPAS[b.etapa_idx]
        const isError = b.estado === 'error'
        return `
          <div class="msync-board-row ${isError ? 'msync-board-row--error' : ''}">
            <span class="plist-stage-chip" style="--c:${etapa.color}">${etapa.id}</span>
            <div class="msync-board-info">
              <span class="msync-board-name">${etapa.nombre.toUpperCase()}</span>
              <span class="msync-board-id ccs-code">${b.board_id}</span>
            </div>
            <span class="msync-board-items">${b.items} items</span>
            <span class="msync-board-sync">${b.ultima_sync}</span>
            <span class="msync-board-status ${isError ? 'msync-status--error' : 'msync-status--ok'}">
              ${isError ? '⚠ Error de sync' : '✓ OK'}
            </span>
          </div>`
      }).join('')}
    </div>

    <div class="msync-section-hdr msync-section-hdr--detected">
      🔍 Nuevos tableros detectados
      <span class="msync-detected-hint">Formato "ETAPA X:" encontrado en el workspace</span>
    </div>

    <div class="msync-detected-list">
      ${MOCK_DETECTED_BOARDS.map(b => {
        const activated = detectedActivated.has(b.board_id)
        return `
          <div class="msync-detected-card ${activated ? 'msync-detected-card--active' : ''}">
            <div class="msync-board-info">
              <span class="msync-board-name">${b.nombre}</span>
              <span class="msync-board-id ccs-code">${b.board_id}</span>
            </div>
            <button class="btn-msync-activate ${activated ? 'btn-msync-activate--done' : ''}"
                    data-board-id="${b.board_id}">
              ${activated ? '✓ Activado' : 'Activar'}
            </button>
          </div>`
      }).join('')}
    </div>
  `

  document.getElementById('btnMsyncNow').addEventListener('click', () => {
    const btn = document.getElementById('btnMsyncNow')
    const lbl = document.getElementById('msyncLastSync')
    if (btn.disabled) return
    btn.textContent = '↻ Sincronizando...'
    btn.disabled = true
    setTimeout(() => {
      btn.textContent = '↻ Sincronizar ahora'
      btn.disabled = false
      lbl.textContent = 'Última sync: ahora mismo'
    }, 2000)
  })

  panel.querySelectorAll('.btn-msync-activate').forEach(btn =>
    btn.addEventListener('click', () => {
      detectedActivated.add(btn.dataset.boardId)
      renderMondayPanel()
    })
  )
}

/* ═══════════════════════════════════════
   PANEL 9 — AGENTES IA
   ═══════════════════════════════════════ */

const AGENTES_CONFIG = [
  {
    id: 'admin',
    color: '#3BB8E8',
    icono: '🤖',
    nombre: 'KAIA · Asistente Admin',
    subtitulo: 'Dashboard admin',
    usuarios: ['Paulet', 'Sr. Daniel', 'Jenny'],
    capacidades: ['Preguntas sobre cargas', 'Redactar correos con IA', 'Buscar en historial'],
    instrucciones_default: 'Eres KAIA, asistente operativo de Sicoben Ediciones / KADI International. Tienes acceso al estado de todas las cargas, historial de correos y datos de Monday.com. Responde siempre en español, de forma concisa y profesional. Cuando te pidan redactar un correo, usa el tono corporativo de Paulet y propone solo el borrador — ella lo revisa antes de enviar.',
    stats_consultas: 12,
    stats_ultima: 'hace 15 min',
    preview: [
      { rol: 'user',  texto: '¿En qué etapa está 2025C-FCL?' },
      { rol: 'kaia',  texto: 'La carga 2025C-FCL — Colección Navidad 2025 — está en E6 Fabricación. Lleva 14 días en esta etapa. Tiene 1 alerta activa: Ningbo Jumbo no respondió tras 2 reintentos.' },
      { rol: 'user',  texto: 'Redacta un seguimiento para Ningbo Jumbo' },
      { rol: 'kaia',  texto: 'Borrador listo. Asunto: [Follow-up] Colección Navidad 2025 — PPS. Revísalo antes de enviar → Ver borrador' },
    ]
  },
  {
    id: 'portal',
    color: '#2ABDA8',
    icono: '🙋',
    nombre: 'KAIA · Portal',
    subtitulo: 'Portal colaboradores',
    usuarios: ['Yonaida', 'Ruth', 'María', 'Aixa', 'Orlando'],
    capacidades: ['Consultas de carga', 'Explicar estado en lenguaje simple', 'Escalar a Paulet por WhatsApp'],
    instrucciones_default: 'Eres KAIA, asistente de consulta para los colaboradores de Sicoben. Solo comparte información filtrada según el rol del usuario: etapa actual, ETA y estado general. NUNCA compartas: nombre del proveedor, número de BL, contenedor, agente aduanal ni costos. Si el usuario pregunta por información sensible o no puedes responder, ofrece escalar la consulta a Paulet por WhatsApp con un mensaje predefinido.',
    stats_consultas: 5,
    stats_ultima: 'hace 2h',
    preview: [
      { rol: 'user',  texto: '¿Cuándo llega la carga de Navidad?' },
      { rol: 'kaia',  texto: 'La carga Colección Navidad 2025 está en Fabricación. La ETA estimada es el 15 de febrero de 2026. ¿Quieres que le consulte algo específico a Paulet?' },
      { rol: 'user',  texto: '¿Con qué proveedor es?' },
      { rol: 'kaia',  texto: 'Esa información no está disponible en el portal. ¿Te ayudo a escalarle la pregunta a Paulet por WhatsApp?' },
    ]
  }
]

const agentEnabled      = new Set(AGENTES_CONFIG.map(a => a.id))
const agentInstructions = Object.fromEntries(AGENTES_CONFIG.map(a => [a.id, a.instrucciones_default]))
const agentSaved        = new Set()

function renderAgentesPanel() {
  const panel = document.getElementById('panel-agentes')

  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Agentes IA</h2>
      <p class="panel-subtitle">2 agentes conversacionales · Claude API</p>
    </div>

    <div class="agentes-grid">
      ${AGENTES_CONFIG.map(a => {
        const enabled = agentEnabled.has(a.id)
        const saved   = agentSaved.has(a.id)
        return `
          <div class="agente-card-v2 ${!enabled ? 'agente-card-v2--paused' : ''}" style="--ac:${a.color}">

            <div class="agente-v2-header">
              <span class="agente-v2-icono">${a.icono}</span>
              <div class="agente-v2-title">
                <span class="agente-v2-nombre">${a.nombre}</span>
                <span class="agente-v2-sub">${a.subtitulo} · ${a.usuarios.join(', ')}</span>
              </div>
              <div class="agente-v2-status">
                <span class="agente-estado-badge agente-estado-badge--${enabled ? 'activo' : 'pausado'}">
                  ${enabled ? '● Activo' : '○ Pausado'}
                </span>
                <label class="toggle-switch">
                  <input type="checkbox" class="toggle-input" data-agent-id="${a.id}" ${enabled ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>

            <div class="agente-v2-caps">
              ${a.capacidades.map(c => `<span class="agente-cap-chip">${c}</span>`).join('')}
            </div>

            <div class="agente-v2-stats">
              <span class="agente-stat-item">${a.stats_consultas} consultas hoy</span>
              <span class="agente-stat-sep">·</span>
              <span class="agente-stat-item">Última: ${a.stats_ultima}</span>
              <span class="agente-stat-sep">·</span>
              <span class="agente-stat-item">Modelo: claude-sonnet-4-6</span>
            </div>

            <div class="agente-v2-section">
              <label class="agente-v2-label">Instrucciones del sistema</label>
              <textarea class="agente-instructions-ta" data-agent-id="${a.id}" rows="4">${agentInstructions[a.id]}</textarea>
              <div class="agente-save-row">
                <span class="agente-save-hint">Los cambios afectan todas las conversaciones nuevas</span>
                <button class="btn-agente-save ${saved ? 'btn-agente-save--done' : ''}"
                        data-agent-id="${a.id}">
                  ${saved ? '✓ Guardado' : 'Guardar'}
                </button>
              </div>
            </div>

            <div class="agente-v2-section">
              <label class="agente-v2-label">Vista previa de conversación</label>
              <div class="agente-chat-preview">
                ${a.preview.map(m => `
                  <div class="agente-msg agente-msg--${m.rol}">
                    <span class="agente-msg-tag">${m.rol === 'user' ? 'Tú' : 'KAIA'}</span>
                    <span class="agente-msg-text">${m.texto}</span>
                  </div>`).join('')}
              </div>
              <p class="agente-chat-hint">El chat está disponible directamente en el ${a.id === 'admin' ? 'dashboard admin' : 'portal de colaboradores'}</p>
            </div>

          </div>`
      }).join('')}
    </div>
  `

  panel.querySelectorAll('.toggle-input').forEach(inp =>
    inp.addEventListener('change', () => {
      inp.checked ? agentEnabled.add(inp.dataset.agentId) : agentEnabled.delete(inp.dataset.agentId)
      renderAgentesPanel()
    })
  )

  panel.querySelectorAll('.btn-agente-save').forEach(btn =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.agentId
      const ta = panel.querySelector(`.agente-instructions-ta[data-agent-id="${id}"]`)
      agentInstructions[id] = ta.value
      agentSaved.add(id)
      renderAgentesPanel()
      setTimeout(() => { agentSaved.delete(id); renderAgentesPanel() }, 2000)
    })
  )
}

/* ═══════════════════════════════════════
   PANEL 10 — CONFIGURACIÓN
   ═══════════════════════════════════════ */

const CFG_ADMIN_USERS = [
  { nombre:'Paulet Bermúdez',      rol:'Administradora'  },
  { nombre:'Sr. Daniel Benarroch', rol:'CEO / Admin'     },
  { nombre:'Jenny',                rol:'Diseño / Admin'  },
]

const CFG_PORTAL_USERS = [
  { id:'yonaida', nombre:'Yonaida', rol:'Tráfico / Logística' },
  { id:'ruth',    nombre:'Ruth',    rol:'Marcas de cartón'    },
  { id:'maria',   nombre:'María',   rol:'Diseño'              },
  { id:'aixa',    nombre:'Aixa',    rol:'Ventas'              },
  { id:'orlando', nombre:'Orlando', rol:'Prospecting'         },
]

let showAddUser = false
let newUserCapa = 'portal'

const VIS_FIELDS = [
  { id:'etapa',       label:'Etapa',        sensible:false },
  { id:'pais',        label:'País origen',  sensible:false },
  { id:'eta',         label:'ETA',          sensible:false },
  { id:'responsable', label:'Responsable',  sensible:false },
  { id:'proveedor',   label:'Proveedor',    sensible:true  },
  { id:'bl',          label:'BL / AWB',     sensible:true  },
  { id:'contenedor',  label:'Contenedor',   sensible:true  },
  { id:'agente',      label:'Ag. Aduanal',  sensible:true  },
  { id:'costos',      label:'Costos',       sensible:true  },
]

const visibilidadState = {
  yonaida: { etapa:true, pais:true, eta:true,  responsable:true,  proveedor:false, bl:false, contenedor:false, agente:false, costos:false },
  ruth:    { etapa:true, pais:true, eta:true,  responsable:true,  proveedor:false, bl:false, contenedor:false, agente:false, costos:false },
  maria:   { etapa:true, pais:true, eta:true,  responsable:true,  proveedor:false, bl:false, contenedor:false, agente:false, costos:false },
  aixa:    { etapa:true, pais:true, eta:true,  responsable:true,  proveedor:false, bl:false, contenedor:false, agente:false, costos:false },
  orlando: { etapa:true, pais:true, eta:false, responsable:false, proveedor:false, bl:false, contenedor:false, agente:false, costos:false },
}

const cpsiaRulesState = [
  { id:'kit',      nombre:'KIT',               condicion:'FORMAT/GROUP contiene "KIT"',                               test:'Plomo, Ftalatos, ASTM F963',   activa:true },
  { id:'metal',    nombre:'Metal',             condicion:'FORMAT = "COLGANTE" o SPECS menciona metal',               test:'Plomo sustrato + superficial',  activa:true },
  { id:'stickers', nombre:'Stickers / Vinilo', condicion:'FORMAT contiene "STICKERS" o SPECS menciona vinilo',       test:'Plomo en adhesivo',             activa:true },
  { id:'pigmentos',nombre:'Pigmentos',         condicion:'SPECS menciona pigmentos, pinturas o crayones',            test:'ASTM D-4236',                   activa:true },
  { id:'papel',    nombre:'Papel solo',        condicion:'FORMAT = LECTURA/COLOREAR/SOPAS/CRUCIGRAMAS + solo papel', test:'EXENTO (16 CFR 1501)',          activa:true },
]

const CFG_DESTINATARIOS = [
  { nombre:'Aixa',       rol:'Ventas',      wa:true, email:true, triggers:['E5','E7'] },
  { nombre:'Orlando',    rol:'Prospecting', wa:true, email:true, triggers:['E5','E7'] },
  { nombre:'Yonaida',    rol:'Tráfico',     wa:true, email:true, triggers:['E7']      },
  { nombre:'Sr. Daniel', rol:'CEO',         wa:true, email:true, triggers:['E7']      },
]

const TRIGGER_COLOR = { E5:'#F06B35', E7:'#2ABDA8' }

let configTab = 'usuarios'

function renderConfigPanel() {
  const panel = document.getElementById('panel-config')

  panel.innerHTML = `
    <div class="panel-hdr">
      <h2 class="panel-title">Configuración</h2>
      <p class="panel-subtitle">Usuarios · Visibilidad portal · Reglas CPSIA · Destinatarios</p>
    </div>

    <div class="config-tabs">
      ${[
        { id:'usuarios',      label:'Usuarios'          },
        { id:'visibilidad',   label:'Visibilidad portal' },
        { id:'cpsia',         label:'Reglas CPSIA'       },
        { id:'destinatarios', label:'Destinatarios'      },
      ].map(t => `
        <button class="config-tab ${configTab===t.id?'config-tab--active':''}" data-tab="${t.id}">
          ${t.label}
        </button>`).join('')}
    </div>

    <div class="config-body">
      ${configTab === 'usuarios'      ? renderCfgUsuarios()      : ''}
      ${configTab === 'visibilidad'   ? renderCfgVisibilidad()   : ''}
      ${configTab === 'cpsia'         ? renderCfgCpsia()         : ''}
      ${configTab === 'destinatarios' ? renderCfgDestinatarios() : ''}
    </div>
  `

  panel.querySelectorAll('.config-tab').forEach(btn =>
    btn.addEventListener('click', () => { configTab = btn.dataset.tab; renderConfigPanel() })
  )

  if (configTab === 'usuarios') wireUsuariosEvents(panel)

  if (configTab === 'visibilidad') {
    panel.querySelectorAll('.cfg-vis-check').forEach(cb =>
      cb.addEventListener('change', () => { visibilidadState[cb.dataset.user][cb.dataset.field] = cb.checked })
    )
    panel.querySelector('#btnSaveVis').addEventListener('click', () => savedFeedback(panel.querySelector('#btnSaveVis'), 'Guardar visibilidad'))
  }

  if (configTab === 'cpsia') {
    panel.querySelectorAll('.cfg-cpsia-toggle').forEach(inp =>
      inp.addEventListener('change', () => {
        const rule = cpsiaRulesState.find(r => r.id === inp.dataset.ruleId)
        if (rule) { rule.activa = inp.checked; inp.closest('.cfg-cpsia-card').classList.toggle('cfg-cpsia-card--off', !inp.checked) }
      })
    )
    panel.querySelector('#btnSaveCpsia').addEventListener('click', () => savedFeedback(panel.querySelector('#btnSaveCpsia'), 'Guardar reglas'))
  }
}

function savedFeedback(btn, label) {
  btn.textContent = '✓ Guardado'
  btn.classList.add('btn-cfg-save--done')
  setTimeout(() => { btn.textContent = label; btn.classList.remove('btn-cfg-save--done') }, 2000)
}

function renderCfgUsuarios() {
  const userRow = (u, tipo) => `
    <div class="cfg-user-row">
      <span class="cfg-user-avatar cfg-user-avatar--${tipo}">${u.nombre.charAt(0)}</span>
      <div class="cfg-user-info">
        <span class="cfg-user-nombre">${u.nombre}</span>
        <span class="cfg-user-rol">${u.rol}</span>
      </div>
      <span class="cfg-capa-chip cfg-capa-chip--${tipo}">${tipo === 'admin' ? 'Admin' : 'Portal'}</span>
      <span class="cfg-user-status">● Activo</span>
    </div>`

  const addForm = showAddUser ? `
    <div class="cfg-add-form">
      <div class="cfg-add-form-row">
        <input class="cfg-form-input" id="cfgNewNombre" placeholder="Nombre completo" autocomplete="off">
        <input class="cfg-form-input" id="cfgNewRol"    placeholder="Rol / posición"  autocomplete="off">
        <div class="cfg-capa-select">
          <button class="cfg-capa-opt ${newUserCapa==='portal'?'cfg-capa-opt--active':''}" data-capa="portal">Portal</button>
          <button class="cfg-capa-opt ${newUserCapa==='admin' ?'cfg-capa-opt--active':''}" data-capa="admin" >Admin</button>
        </div>
      </div>
      <div class="cfg-add-actions">
        <button class="btn-cfg-add-cancel" id="btnAddCancel">Cancelar</button>
        <button class="btn-cfg-add-confirm" id="btnAddConfirm">+ Agregar usuario</button>
      </div>
    </div>` : ''

  return `
    <div class="cfg-section">
      <div class="cfg-section-hdr">
        <span class="cfg-section-title">Administradores</span>
        <span class="cfg-section-badge">${CFG_ADMIN_USERS.length} usuarios</span>
      </div>
      <div class="cfg-users-list">${CFG_ADMIN_USERS.map(u => userRow(u,'admin')).join('')}</div>
    </div>
    <div class="cfg-section">
      <div class="cfg-section-hdr">
        <span class="cfg-section-title">Portal colaboradores</span>
        <span class="cfg-section-badge">${CFG_PORTAL_USERS.length} usuarios</span>
      </div>
      <div class="cfg-users-list">${CFG_PORTAL_USERS.map(u => userRow(u,'portal')).join('')}</div>
    </div>
    ${addForm}
    ${!showAddUser ? `<button class="btn-cfg-add-user" id="btnShowAdd">+ Agregar usuario</button>` : ''}
  `
}

function wireUsuariosEvents(panel) {
  panel.querySelector('#btnShowAdd')?.addEventListener('click', () => {
    showAddUser = true; renderConfigPanel()
  })

  panel.querySelector('#btnAddCancel')?.addEventListener('click', () => {
    showAddUser = false; renderConfigPanel()
  })

  panel.querySelectorAll('.cfg-capa-opt').forEach(btn =>
    btn.addEventListener('click', () => {
      newUserCapa = btn.dataset.capa
      panel.querySelectorAll('.cfg-capa-opt').forEach(b =>
        b.classList.toggle('cfg-capa-opt--active', b.dataset.capa === newUserCapa)
      )
    })
  )

  panel.querySelector('#btnAddConfirm')?.addEventListener('click', () => {
    const nombre = panel.querySelector('#cfgNewNombre').value.trim()
    const rol    = panel.querySelector('#cfgNewRol').value.trim()
    if (!nombre) { panel.querySelector('#cfgNewNombre').focus(); return }

    if (newUserCapa === 'admin') {
      CFG_ADMIN_USERS.push({ nombre, rol: rol || 'Administrador' })
    } else {
      const id = nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      CFG_PORTAL_USERS.push({ id, nombre, rol: rol || 'Colaborador' })
      visibilidadState[id] = { etapa:true, pais:true, eta:true, responsable:true, proveedor:false, bl:false, contenedor:false, agente:false, costos:false }
    }
    showAddUser = false
    renderConfigPanel()
  })
}

function renderCfgVisibilidad() {
  return `
    <div class="cfg-section">
      <div class="cfg-section-hdr">
        <span class="cfg-section-title">Campos visibles por colaborador</span>
        <span class="cfg-section-hint">Los campos sensibles están ocultos por defecto — marcar solo si es necesario</span>
      </div>
      <div class="cfg-vis-wrap">
        <table class="cfg-vis-table">
          <thead>
            <tr>
              <th class="cfg-vis-th--user"></th>
              ${VIS_FIELDS.map(f => `
                <th class="cfg-vis-th ${f.sensible?'cfg-vis-th--sensible':''}">${f.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${CFG_PORTAL_USERS.map(u => `
              <tr class="cfg-vis-row">
                <td class="cfg-vis-td-user">
                  <span class="cfg-vis-avatar">${u.nombre.charAt(0)}</span>
                  <span class="cfg-vis-nombre">${u.nombre}</span>
                </td>
                ${VIS_FIELDS.map(f => `
                  <td class="cfg-vis-td ${f.sensible?'cfg-vis-td--sensible':''}">
                    <input type="checkbox" class="cfg-vis-check"
                           data-user="${u.id}" data-field="${f.id}"
                           ${visibilidadState[u.id][f.id]?'checked':''}>
                  </td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="cfg-save-row">
        <span class="cfg-save-note">Los cambios se aplican en la próxima carga del portal</span>
        <button class="btn-cfg-save" id="btnSaveVis">Guardar visibilidad</button>
      </div>
    </div>`
}

function renderCfgCpsia() {
  return `
    <div class="cfg-section">
      <div class="cfg-section-hdr">
        <span class="cfg-section-title">Reglas de detección CPSIA</span>
        <span class="cfg-section-hint">Cero falsos negativos — ante la duda, marcar</span>
      </div>
      <div class="cfg-cpsia-list">
        ${cpsiaRulesState.map(r => `
          <div class="cfg-cpsia-card ${!r.activa?'cfg-cpsia-card--off':''}">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input cfg-cpsia-toggle"
                     data-rule-id="${r.id}" ${r.activa?'checked':''}>
              <span class="toggle-track"></span>
            </label>
            <div class="cfg-cpsia-info">
              <span class="cfg-cpsia-nombre">${r.nombre}</span>
              <span class="cfg-cpsia-cond">${r.condicion}</span>
            </div>
            <span class="cfg-cpsia-test">${r.test}</span>
          </div>`).join('')}
      </div>
      <div class="cfg-save-row">
        <span class="cfg-save-note">Las reglas activas se aplican a todas las cargas en E3</span>
        <button class="btn-cfg-save" id="btnSaveCpsia">Guardar reglas</button>
      </div>
    </div>`
}

function renderCfgDestinatarios() {
  return `
    <div class="cfg-section">
      <div class="cfg-section-hdr">
        <span class="cfg-section-title">Destinatarios de notificaciones masivas</span>
        <span class="cfg-section-hint">Reciben alertas cuando una carga entra a las etapas indicadas</span>
      </div>
      <div class="cfg-users-list">
        ${CFG_DESTINATARIOS.map(d => `
          <div class="cfg-user-row">
            <span class="cfg-user-avatar cfg-user-avatar--portal">${d.nombre.charAt(0)}</span>
            <div class="cfg-user-info">
              <span class="cfg-user-nombre">${d.nombre}</span>
              <span class="cfg-user-rol">${d.rol}</span>
            </div>
            <div class="cfg-dest-canales">
              <label class="cfg-dest-canal ${d.wa?'':'cfg-dest-canal--off'}">
                <input type="checkbox" ${d.wa?'checked':''} disabled> WhatsApp
              </label>
              <label class="cfg-dest-canal ${d.email?'':'cfg-dest-canal--off'}">
                <input type="checkbox" ${d.email?'checked':''} disabled> Email
              </label>
            </div>
            <div class="cfg-dest-triggers">
              ${d.triggers.map(t => `
                <span class="plist-stage-chip" style="--c:${TRIGGER_COLOR[t]}">${t}</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`
}

const PANEL_RENDERERS = {
  comunicacion: renderComunicacionPanel,
  cpsia:        renderCpsiaPanel,
  alertas:      renderAlertasPanel,
  monday:       renderMondayPanel,
  agentes:      renderAgentesPanel,
  config:       renderConfigPanel,
}

/* ── Init ── */
renderCargasPanel()

/* ═══════════════════════════════════════════════════════════════
   SUPABASE — carga datos reales y reemplaza los mocks
   Si Supabase no está disponible, el sistema sigue funcionando
   con los datos de demostración definidos arriba.
   ═══════════════════════════════════════════════════════════════ */

async function initFromSupabase() {
  if (!supabase) return   // env vars no configuradas → mock data

  try {
    // ── Cargas ──────────────────────────────────────────────────
    const { data: cargas, error: eCargas } = await supabase
      .from('cargas')
      .select('*')
      .eq('activa', true)
      .order('semaforo')        // rojo primero (r < v)
      .order('dias_en_etapa', { ascending: false })

    if (!eCargas && cargas?.length) {
      MOCK_CARGAS.splice(0, MOCK_CARGAS.length, ...cargas)
      renderCargasPanel()
    }

    // ── Historial de eventos ─────────────────────────────────────
    const { data: eventos, error: eHistorial } = await supabase
      .from('historial_eventos')
      .select('*')
      .order('fecha_evento', { ascending: false })

    if (!eHistorial && eventos?.length) {
      const histMap = {}
      eventos.forEach(ev => {
        if (!histMap[ev.ccs]) histMap[ev.ccs] = []
        histMap[ev.ccs].push({
          tipo:   ev.tipo,
          fecha:  new Date(ev.fecha_evento).toLocaleString('es-PA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          icono:  ev.icono,
          texto:  ev.texto,
          detalle: ev.detalle ?? undefined,
          adjunto: ev.adjunto ?? undefined,
        })
      })
      Object.assign(MOCK_HISTORIAL, histMap)
    }

    // ── Hilos de correo + mensajes ───────────────────────────────
    const { data: hilos, error: eHilos } = await supabase
      .from('correos_hilo')
      .select(`
        id,
        ccs,
        etapa_idx,
        cargas ( nombre ),
        mensajes_correo (
          id, de_nombre, de_email, asunto, cuerpo, resumen,
          tipo, confianza, confirmado, adjuntos, fecha_mensaje
        )
      `)
      .order('creado_en', { ascending: false })

    if (!eHilos && hilos?.length) {
      const correos = hilos.map(h => ({
        ccs:       h.ccs,
        nombre:    h.cargas?.nombre ?? h.ccs,
        etapa_idx: h.etapa_idx,
        mensajes:  (h.mensajes_correo || [])
          .sort((a, b) => new Date(a.fecha_mensaje) - new Date(b.fecha_mensaje))
          .map(m => ({
            id:         m.id,
            de:         m.de_nombre,
            email:      m.de_email,
            asunto:     m.asunto,
            fecha:      new Date(m.fecha_mensaje).toLocaleString('es-PA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            cuerpo:     m.cuerpo ?? '',
            resumen:    m.resumen ?? null,
            adjuntos:   Array.isArray(m.adjuntos) ? m.adjuntos : [],
            tipo:       m.tipo,
            confianza:  m.confianza ?? null,
            confirmado: m.confirmado,
          })),
      }))
      MOCK_CORREOS.splice(0, MOCK_CORREOS.length, ...correos)
    }

    // ── Alertas ──────────────────────────────────────────────────
    const { data: alertas, error: eAlertas } = await supabase
      .from('alertas')
      .select('*')
      .eq('resuelta', false)
      .order('creado_en', { ascending: false })

    if (!eAlertas && alertas?.length) {
      const mapped = alertas.map(a => ({
        id:      a.id,
        semaforo: a.semaforo,
        icon:    a.icono,
        tipo:    a.tipo,
        ccs:     a.ccs,
        nombre:  MOCK_CARGAS.find(c => c.ccs === a.ccs)?.nombre ?? a.ccs,
        hace:    (() => {
          const diff = Date.now() - new Date(a.creado_en)
          const h = Math.floor(diff / 3600000)
          return h < 1 ? 'hace menos de 1h' : `hace ${h}h`
        })(),
        msg:     a.mensaje,
      }))
      MOCK_ALERTAS.splice(0, MOCK_ALERTAS.length, ...mapped)
    }

    // ── Plantillas ───────────────────────────────────────────────
    const { data: plantillas, error: ePlantillas } = await supabase
      .from('plantillas')
      .select('*')
      .order('creado_en')

    if (!ePlantillas && plantillas?.length) {
      const mapped = plantillas.map(p => ({
        id:         p.id,
        nombre:     p.nombre,
        etapa_idx:  p.etapa_idx,
        trigger:    p.trigger_desc,
        destino:    p.destino,
        canal:      p.canal,
        activa:     p.activa,
        asunto:     p.asunto ?? '',
        cuerpo:     p.cuerpo,
      }))
      MOCK_PLANTILLAS.splice(0, MOCK_PLANTILLAS.length, ...mapped)
    }

  } catch (err) {
    console.warn('[KAIA] Supabase load failed — using mock data:', err.message)
  }
}

initFromSupabase()
