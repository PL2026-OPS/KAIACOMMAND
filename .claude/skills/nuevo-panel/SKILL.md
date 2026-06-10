---
name: nuevo-panel
description: Agrega un nuevo panel al dashboard admin siguiendo el patrón del proyecto. Activar cuando el usuario diga "agrega un panel", "nuevo panel", "crea la sección X", "añade X al admin", "nuevo módulo en el dashboard".
---

# Agregar panel al admin

## Arquitectura del admin

El admin (`src/js/admin.js`) usa un registro de renderers lazy. Cada panel:
1. Tiene un ID string (ej: `"correos"`)
2. Está registrado en `PANEL_RENDERERS`
3. Tiene un link en el sidebar HTML con `data-panel="id"`
4. Se renderiza una sola vez gracias a `dataset.rendered`

## Pasos obligatorios (en este orden)

### 1. Agregar el link en el sidebar (`admin.html`)

```html
<!-- Dentro del grupo correcto: PRINCIPAL / COMUNICACIÓN / OPERACIÓN / SISTEMA -->
<a class="nav-link" data-panel="mi-panel">Mi Panel</a>
```

### 2. Agregar el contenedor del panel (`admin.html`)

```html
<section class="panel" id="panel-mi-panel" hidden></section>
```

### 3. Registrar el renderer (`src/js/admin.js`)

Al final del objeto `PANEL_RENDERERS`:
```js
const PANEL_RENDERERS = {
  // ... paneles existentes ...
  'mi-panel': renderMiPanel,
}
```

### 4. Escribir la función render

```js
function renderMiPanel() {
  const panel = document.getElementById('panel-mi-panel')
  if (panel.dataset.rendered) return   // lazy — solo renderiza una vez
  panel.dataset.rendered = '1'

  panel.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Nombre del Panel</h2>
      <p class="panel-subtitle">Descripción corta</p>
    </div>
    <!-- contenido -->
  `
  // wirear eventos después de inyectar el HTML
  wireMiPanelEvents(panel)
}
```

### 5. CSS en `src/css/admin.css`

Usar siempre las variables del design system:
```css
/* Colores de etapa */
var(--e1) through var(--e7)

/* Neutros */
--bg: #FAF7F0    /* fondo general */
--card: #FFFFFF  /* tarjetas */
--sidebar: #13141A

/* Tipografía */
font-family: var(--font-title)  /* Fraunces */
font-family: var(--font-body)   /* Inter */
font-family: var(--font-mono)   /* JetBrains Mono — para CCS codes */
```

## Patrones de layout frecuentes

**Dos columnas (lista + detalle):** Usado en Correos, Plantillas, CPSIA
```html
<div class="two-col">
  <aside class="two-col-list"><!-- lista items --></aside>
  <main class="two-col-detail"><!-- detalle --></main>
</div>
```

**Grid de tarjetas:** Usado en Cargas, Alertas
```html
<div class="cards-grid"><!-- tarjetas --></div>
```

## Checklist antes de entregar

- [ ] Link en sidebar con `data-panel` correcto
- [ ] Sección `<section class="panel" id="panel-X" hidden>` en admin.html
- [ ] Entrada en `PANEL_RENDERERS`
- [ ] Guard `if (panel.dataset.rendered) return`
- [ ] CSS usa variables, no hex literals
- [ ] Datos mock para que el panel no aparezca vacío
