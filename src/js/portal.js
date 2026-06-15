/* ═══════════════════════════════════════
   KAIA Portal — welcome screen + render
   ═══════════════════════════════════════ */
import { initPasswordModal } from '/src/js/auth.js'
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
    renderPortal()
  }, FADE_MS)
}

function setTimestamp() {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  portalTs.textContent = new Date().toLocaleDateString('es-PA', opts)
}

/* ── Portal mock data (no supplier, no costs, no BL) ── */
const ETAPAS = [
  { id: 'E1', nombre: 'Origen',        color: '#3BB8E8' },
  { id: 'E2', nombre: 'Cotizaciones',  color: '#7B4CA8' },
  { id: 'E3', nombre: 'Proforma',      color: '#F5A623' },
  { id: 'E4', nombre: 'Diseño',        color: '#E8357A' },
  { id: 'E5', nombre: 'Comercial',     color: '#F06B35' },
  { id: 'E6', nombre: 'Fabricación',   color: '#8DC63F' },
  { id: 'E7', nombre: 'Tráfico',       color: '#2ABDA8' },
]

const PORTAL_CARGAS = [
  { ccs: '2025C-FCL', nombre: 'Colección Navidad 2025',    origen: '🇨🇳 China', tipo: 'FCL', etapa_idx: 5, eta: '15 Feb 2026', dias_eta: 68,  responsable: 'Yonaida' },
  { ccs: '2025B-LCL', nombre: 'Libros Educativos Q1 2026', origen: '🇮🇳 India', tipo: 'LCL', etapa_idx: 2, eta: 'Mar 2026',    dias_eta: 115, responsable: 'Ruth'    },
]

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

function renderLoadCard(c) {
  const etapa = ETAPAS[c.etapa_idx]
  const eta   = etaLabel(c.dias_eta)
  return `
    <div class="load-card">

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
    </div>
  `
}

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
}
