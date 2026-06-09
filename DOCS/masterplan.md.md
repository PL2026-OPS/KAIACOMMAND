# PRD — KAIA Command Central
**Sistema Interno de Control de Producción para Sicoben Ediciones / KADI International**

**Versión:** 3.0
**Fecha:** Junio 2026
**Estado:** Listo para desarrollo
**Plataforma destino:** Aplicación Web (mobile + desktop)
**Naturaleza:** Sistema interno corporativo — uso exclusivo del equipo de Sicoben

---

## 1. Visión del Producto

KAIA Command Central es una **aplicación web interna** de Sicoben Ediciones que actúa como el sistema nervioso central de su operación de producción de libros infantiles. No es un producto comercial ni se vende a terceros — es una herramienta diseñada a la medida de los procesos, equipo y proveedores de Sicoben/KADI International.

El sistema conecta Monday.com, Gmail y WhatsApp en un único dashboard de trazabilidad visual, eliminando el principal problema operativo: la información de cada carga dispersa en tres herramientas que no se comunican entre sí. Opera como copiloto de Paulet, clasifica correos de proveedores, alimenta Monday automáticamente, envía alertas en tiempo real y garantiza que ninguna carga avance sin cumplir los requisitos de cada etapa.

KAIA Command tiene **dos capas** con accesos diferenciados:

- **Capa Admin** (`kaia.sicoben.com/admin`) — Centro de operaciones con control total. Acceso para Paulet, Sr. Daniel y Jenny.
- **Capa Portal Colaboradores** (`kaia.sicoben.com/portal`) — Vista filtrada solo lectura para Yonaida, Ruth, María, Aixa y Orlando.

---

## 2. Problema a Resolver

Paulet, Executive Assistant del CEO, coordina la producción de libros infantiles con proveedores en China e India. Cada pedido (\"carga\") pasa por 7 etapas en Monday.com, pero la información vive fragmentada:

- **Monday.com:** estado oficial de la carga, actualizado solo manualmente.
- **Gmail:** correos de proveedores que no saben a qué carga pertenecen. Los proveedores escriben con nombres inconsistentes, en hilos distintos, desde direcciones diferentes.
- **WhatsApp:** coordinación informal sin trazabilidad.

**Impacto real del problema:**
- 2–3 horas diarias perdidas en seguimiento manual entre herramientas
- Correos de proveedores sin respuesta por falta de seguimiento
- Cargas que avanzan de etapa sin completar campos requeridos
- El CEO depende de Paulet para saber el estado de la operación en lugar de tener visibilidad directa
- Los colaboradores operativos (Yonaida, Ruth, María, Aixa) no tienen forma simple de consultar el estado de las cargas que les corresponden sin interrumpir a Paulet

---

## 3. Usuarios Objetivo

### 3.1 Capa Admin — Acceso Total

**Paulet — Executive Assistant to CEO** *(usuario primario)*

- **Herramientas diarias:** Monday.com, Gmail, WhatsApp, Google Sheets
- **Dispositivos:** MacBook + iPhone — usa ambos durante la jornada
- **Frustración principal:** "Paso horas siendo el puente entre Gmail, Monday y WhatsApp. Necesito que el sistema haga ese trabajo y me avise solo cuando necesite mi decisión."
- **Éxito para ella:** Coordinar toda la producción desde un solo lugar, con alertas inteligentes y cero correos perdidos.
- **Tolerancia al error:** 0% — el sistema debe sugerir, no actuar solo.

**Sr. Daniel Benarroch — CEO**
- Visibilidad ejecutiva en vivo del estado de todas las cargas sin necesidad de preguntarle a Paulet.
- Alertas WhatsApp + email sobre cargas en Etapa 7 (Tráfico) cada lunes.

**Jenny — Diseño / Coordinación**
- Acceso completo a configuración y plantillas para mantener el sistema actualizado.

### 3.2 Capa Portal — Acceso Filtrado (Solo Lectura)

| Colaborador | Rol | Qué ve | Qué NO ve |
|-------------|-----|--------|-----------|
| **Yonaida** | Tráfico / Logística | Cargas asignadas, etapa actual, ETA, alertas genéricas | Nombre del proveedor, BL, agente aduanal, costos |
| **Ruth** | Marcas de carton | Cargas en E3-E4, especificaciones de empaque | Datos comerciales, proveedor |
| **María** | Diseño | Cargas en E4, especificaciones, fechas de entrega de artes | Datos comerciales |
| **Aixa** | Ventas | Cargas en E5-E7, ETA, listado de títulos | Costos, proveedor, documentos |
| **Orlando** | Prospecting | Visibilidad general de cargas activas | Detalles operativos sensibles |

### 3.3 Resumen de Roles

| Rol | Usuarios | Acceso |
|-----|----------|--------|
| **Administrador** | Paulet, Sr. Daniel, Jenny | Centro de operaciones admin: dashboard, configuración, plantillas, historial, acciones, todos los 10 paneles |
| **Operativo (Portal)** | Yonaida, Ruth, María, Aixa, Orlando | Portal de colaboradores: solo lectura, datos filtrados según configuración de visibilidad |

---

## 4. Objetivos del Producto (MVP)

| # | Objetivo | Métrica de Éxito |
|---|----------|-----------------|
| 1 | Eliminar la búsqueda manual de correos de proveedores | 0% de correos sin clasificar después de 15 minutos de llegada |
| 2 | Reducir tiempo de seguimiento operativo diario de Paulet | De 2-3 horas → menos de 30 minutos por día |
| 3 | Garantizar que ninguna carga avance sin campos completos | > 90% de cargas con checklist completo al avanzar de etapa |
| 4 | Detectar 100% de productos con requerimiento CPSIA | 0 falsos negativos en alertas CPSIA |
| 5 | Adopción activa del sistema por Paulet desde el día 1 | Uso diario sostenido desde la primera semana post-lanzamiento |
| 6 | Reducir interrupciones a Paulet por consultas operativas | Yonaida, Ruth, María y Aixa consultan estado en el Portal sin preguntarle a Paulet |

---

## 5. Alcance del MVP (8 semanas)

### ✅ Incluido en MVP

#### 5.1 Dashboard de Trazabilidad Visual (Admin)
- Panel principal con una tarjeta por carga activa, ordenada por urgencia (🔴 primero).
- Semáforo visual de las 7 etapas por carga con colores Sicoben.
- Filtros por etapa, proveedor, tipo de embarque, estado de alerta.
- Indicador de correos pendientes de clasificar.
- Responsive: funciona en iPhone y MacBook.

#### 5.2 Portal de Colaboradores (Solo Lectura)
- Pantalla de bienvenida animada con saludo personalizado por nombre.
- Vista filtrada de cargas según el rol del colaborador.
- 3 stat cards: Cargas activas, En tránsito, Atención.
- Tarjetas de carga con código CCS, nombre, etapa, país de origen, ETA y tracker visual.
- Detalle de carga al hacer clic con botón "Solicitar por WhatsApp" para escalar a Paulet.
- Configuración granular de visibilidad por campo (etapa visible, país visible, proveedor oculto, ETA visible, etc.).

#### 5.3 Conexión en Tiempo Real con Monday.com
- Lectura de los 7 Boards de producción vía GraphQL API (workspace 14162882).
- Sincronización cada 15 minutos + webhooks para cambios críticos.
- Unificación de cargas a través de los 7 tableros usando el **código CCS** como llave maestra (ej: 2025C-FCL).
- Escritura en Monday: publicación de updates/comentarios desde el sistema.

#### 5.4 Lectura Automática de Gmail
- Escaneo periódico de la bandeja de Paulet cada 15 minutos.
- Identificación de correos de proveedores conocidos.
- Sin modificación de correos en Gmail — solo lectura y clasificación.

#### 5.5 Clasificador Inteligente de Correos
- Asociación de cada correo a su carga correspondiente aunque el proveedor no use el código correcto.
- Sugerencia con nivel de confianza — ninguna asociación se publica en Monday sin confirmación de Paulet.
- **Agrupación por carga (no por proveedor)** usando el código CCS. Un mismo proveedor que escribe sobre 3 cargas distintas genera 3 hilos separados.
- Confirmación vía dashboard o respuesta al WhatsApp de alerta.

#### 5.6 Alimentación Automática de Monday
- Publicación de update en el item de Monday tras confirmación, con resumen del correo generado por IA.

#### 5.7 Alertas por WhatsApp
- Alertas automáticas al +507 6405-6552 (Paulet) para correos nuevos, carencias, reintentos y alertas CPSIA.

#### 5.8 Respuesta al Proveedor desde el Sistema
- Redacción y envío de correos al proveedor desde el dashboard, saliendo por el Gmail real de Paulet.

#### 5.9 Historial de Correos por Carga
- Línea de tiempo completa: correos recibidos, enviados, updates Monday, alertas y confirmaciones.
- Persiste al migrar de Board entre etapas.

#### 5.10 Detección de Carencias por Etapa
- Verificación de campos requeridos al cambiar de etapa. Alerta si hay carencias.

#### 5.11 Plantillas Automáticas por Etapa
- Plantillas con variables dinámicas activadas automáticamente o manualmente por etapa.
- Editor visual con chips de variables clicables.
- Importación desde archivos .docx (Word).

#### 5.12 Detección Inteligente CPSIA *(módulo clave)*
- Lectura automática del Google Sheet de la proforma cuando una carga entra a E3.
- Análisis producto por producto contra reglas CPSIA configurables.
- Creación de pestaña **"CPSIA Filtro"** dentro del mismo Google Sheet (no archivo separado).
- Aviso automático a Yonaida por WhatsApp con lista de productos + imágenes + cantidades + tests requeridos.

#### 5.13 Sistema de Reintento Automático
- Reenvío automático si el proveedor no responde en 48 horas. Máximo 2 reintentos.

#### 5.14 Notificación Masiva a Vendedores
- Banner trigger automático cuando una carga entra a E5 (Comercial) o E7 (Tráfico).
- Lista de destinatarios con checkboxes.
- Panel WhatsApp + panel correo editables antes de envío.

### ❌ Fuera de Alcance del MVP (Fase 2+)

- Agente WhatsApp conversacional por voz (Fase 2)
- Integración con Odoo (Fase 3)
- Módulo financiero / costos de carga
- Portal de acceso para proveedores externos
- Generación automática de documentos aduanales
- Aplicación móvil nativa
- Multi-empresa / multi-workspace

---

## 6. Funcionalidades Detalladas

### F-01: Dashboard de Trazabilidad Visual (Admin)

**Descripción:** Pantalla principal del centro de operaciones admin. Una tarjeta por carga activa con semáforo de 7 etapas y estado de alertas.

**Flujo:**
1. Paulet entra a `kaia.sicoben.com/admin` y se autentica con Google OAuth.
2. Ve grid de tarjetas ordenadas: 🔴 al tope, luego 🟡, luego 🟢.
3. Cada tarjeta muestra: código CCS, proveedor, tipo, embarque, semáforo de etapas, días en etapa actual, último evento, indicadores de alerta.
4. Puede filtrar por etapa, proveedor, tipo de embarque o estado.
5. Toca una tarjeta para ir al detalle completo de la carga.

**Criterios de aceptación:**
- El dashboard carga en menos de 3 segundos con hasta 30 cargas activas.
- Las tarjetas 🔴 siempre aparecen primero, ordenadas por días sin actualización.
- El semáforo refleja el estado de Monday con máximo 15 minutos de retraso.
- Los filtros operan sin recargar la página completa.
- La vista funciona en pantalla de 375px de ancho mínimo (iPhone SE).

---

### F-02: Lectura Automática de Gmail + Clasificador Inteligente

**Descripción:** El sistema escanea la bandeja de Paulet, detecta correos de proveedores y los asocia a su carga correspondiente con IA, **agrupando por código CCS** (no por proveedor).

**Flujo:**
1. Gmail API escanea la bandeja cada 15 minutos.
2. El clasificador analiza remitente, asunto, cuerpo e historial.
3. Asigna confianza a la asociación sugerida (carga objetivo).
4. Si confianza > 90%: notifica a Paulet por WhatsApp con sugerencia + link de confirmación.
5. Si confianza < 90%: presenta 2-3 opciones en el panel de correos pendientes.
6. Paulet confirma o elige manualmente.
7. Solo tras confirmación: el sistema publica el update en Monday.

**Lógica de agrupación:** Si Johnson (Ningbo Jumbo) escribe sobre 3 cargas distintas, el sistema crea 3 hilos separados en el panel de correos, uno por cada código CCS. Esto evita que la información de cargas distintas se mezcle.

**Criterios de aceptación:**
- Ningún correo se asocia a Monday sin confirmación explícita de Paulet. Sin excepciones.
- El nivel de confianza y su justificación se muestran siempre al usuario.
- La clasificación de un correo toma menos de 10 segundos.
- Si el proveedor usa una dirección desconocida, esa dirección queda registrada para detecciones futuras.
- El sistema nunca modifica, mueve ni elimina correos en Gmail.

---

### F-03: Alimentación Automática de Monday

**Descripción:** Publicación automática de update en el item de Monday tras confirmación de la asociación del correo.

**Formato del update:**
```
📧 Correo de proveedor — [FECHA Y HORA]
De: [nombre] <correo@proveedor.com>
Asunto: [asunto original]
Resumen: [generado por IA en español, 2-3 líneas]
[Adjuntos] | [Link al correo en Gmail]
```

**Criterios de aceptación:**
- El update se publica en menos de 30 segundos tras la confirmación.
- Si el write a Monday falla, el sistema reintenta 3 veces y genera alerta al Admin si persiste.
- El update siempre incluye remitente, fecha/hora, resumen en español y link al correo original.

---

### F-04: Alertas por WhatsApp

**Descripción:** Notificaciones automáticas al número de Paulet (+507 6405-6552) para eventos que requieren su atención.

**Tipos de alerta:**

| Trigger | Mensaje enviado |
|---------|----------------|
| Correo nuevo de proveedor | `🔔 Nuevo mensaje de [PROVEEDOR] sobre carga [CCS]. Confirmar → [link]` |
| Carga avanza con carencias | `⚠️ Carga [CCS] avanzó a Etapa [X] sin completar: [campo faltante]` |
| Reintento automático enviado | `📋 Reintento enviado a [PROVEEDOR] — carga [CCS] (48h sin respuesta)` |
| Alerta CPSIA | `🚨 CPSIA: El título [NOMBRE] puede requerir prueba. Yonaida notificada.` |
| Etapa 7 sin actualizar | `📦 Tráfico: carga [CCS] lleva [N] días sin actualizar.` |
| Escalada por falta de respuesta | `🚨 [PROVEEDOR] no respondió tras 2 reintentos — carga [CCS]. Acción manual requerida.` |

**Criterios de aceptación:**
- Las alertas llegan en menos de 1 minuto desde el evento disparador.
- El link en la alerta lleva directamente a la tarjeta de la carga en el dashboard.
- Máximo 10 alertas por día al mismo número (evitar saturación).
- Si WhatsApp falla, el sistema envía la alerta por email como fallback.

---

### F-05: Respuesta al Proveedor desde el Sistema

**Descripción:** Paulet redacta y envía correos al proveedor desde el dashboard, sin abrir Gmail.

**Flujo:**
1. Desde la tarjeta de la carga, Paulet toca "Responder al proveedor".
2. Se abre editor con opción de seleccionar plantilla o escribir desde cero.
3. Las variables dinámicas de la plantilla se auto-rellenan con datos de la carga.
4. Paulet revisa, edita si necesita, y presiona "Enviar".
5. El correo sale desde su Gmail real — el proveedor ve que escribe Paulet.
6. El sistema guarda copia en el historial de la carga.
7. Se activa contador de 48h para reintento automático.

**Criterios de aceptación:**
- El correo enviado aparece en el "Enviados" del Gmail real de Paulet.
- El proveedor ve el nombre y dirección de Paulet como remitente.
- El historial de la carga registra el correo enviado en menos de 5 segundos.
- Nada se envía sin que Paulet presione "Enviar" — cero envíos automáticos no confirmados.

---

### F-06: Historial de Carga (Trazabilidad Completa)

**Descripción:** Línea de tiempo de todos los eventos de cada carga a través de sus 7 etapas.

**Eventos registrados:**
- 📥 Correos recibidos del proveedor (con cuerpo y adjuntos descargables)
- 📤 Correos enviados desde el sistema
- 📌 Updates publicados en Monday
- 🔔 Alertas generadas
- ✅ Confirmaciones de Paulet
- 🔄 Reintentos automáticos

**Criterios de aceptación:**
- El historial muestra eventos en orden cronológico inverso (más reciente primero).
- Los adjuntos de correos entrantes están disponibles para descarga directa.
- El historial persiste aunque la carga migre de Board en Monday (gracias a la unificación por código CCS).
- Se puede filtrar el historial por tipo de evento.

---

### F-07: Detección de Carencias por Etapa

**Descripción:** El sistema verifica que los campos requeridos estén completos antes de que una carga avance de etapa.

**Flujo:**
1. Monday detecta cambio de etapa (webhook o polling).
2. Sistema verifica checklist de la etapa que se cierra.
3. Si hay campos vacíos: semáforo 🔴 + alerta WhatsApp especificando qué falta.
4. Si todo completo: semáforo 🟢 + plantilla automática de la nueva etapa se activa.

**Checklist base por etapa:**

| Etapa cerrada | Campos requeridos |
|--------------|-------------------|
| E1 Origen | Proveedor confirmado, código CCS asignado |
| E2 Cotizaciones | Cotización recibida, proveedor seleccionado, precio aprobado |
| E3 Proforma | Proforma firmada, anticipo confirmado, fecha de producción, análisis CPSIA |
| E4 Diseño | Artes aprobadas, PPS aprobado, instrucciones enviadas |
| E5 Comercial | Notificación a ventas enviada, listado títulos confirmado |
| E6 Fabricación | Reporte de avance semanal, fecha estimada de finalización |
| E7 Tráfico | BL/AWB registrado, ETA confirmada, documentos aduanales |

**Criterios de aceptación:**
- El sistema detecta el cambio de etapa en menos de 2 minutos.
- La alerta especifica exactamente qué campo falta, no solo "hay un problema".
- El semáforo se actualiza a 🔴 inmediatamente al detectar carencia.
- Cuando el campo se completa en Monday, el semáforo se actualiza en la próxima sincronización (< 15 min).
- Los campos requeridos son configurables por Administradores sin tocar código.
- Botón opcional "Bloquear avance" disponible en E3 → E4 hasta obtener certificados CPSIA.

---

### F-08: Plantillas Automáticas por Etapa

**Descripción:** Correos y notificaciones predefinidos con variables dinámicas, activados automáticamente al entrar a una etapa o manualmente desde la tarjeta.

| Etapa | Plantilla | Destino | Variables |
|-------|-----------|---------|-----------|
| E2 Cotizaciones | Solicitud de cotización | Gmail → Proveedor | `{{nombre_carga}}`, `{{proveedor}}`, `{{link_formulario}}`, `{{lista_titulos}}`, `{{fecha_limite}}` |
| E3 Proforma | Solicitud de Proforma + link edición | Gmail → Proveedor | `{{nombre_carga}}`, `{{link_proforma}}`, `{{fecha_limite}}`, `{{condiciones_pago}}` |
| E3 Proforma | Solicitud CPSIA *(auto)* | Gmail → Proveedor | `{{nombre_carga}}`, `{{lista_titulos_cpsia}}` |
| E3 Proforma | Aviso CPSIA *(auto)* | WhatsApp → Yonaida | `{{lista_productos_cpsia}}`, `{{imagenes}}`, `{{tests}}` |
| E4 Diseño | Seguimiento diseño equipo | Interna → Jenny/María | `{{nombre_carga}}`, `{{titulo}}`, `{{fecha_entrega_arte}}`, `{{proveedor}}` |
| E4 Diseño | PPS al proveedor | Gmail → Proveedor | `{{nombre_carga}}`, `{{especificaciones}}`, `{{fecha_limite_pps}}` |
| E5 Comercial | Notificación masiva ventas *(auto)* | Email + WhatsApp → Aixa, Orlando | `{{listado_cargas_activas}}`, `{{estado_por_carga}}`, `{{eta_por_carga}}` |
| E7 Tráfico | Alerta tráfico CEO | WhatsApp/Email → Sr. Daniel | `{{nombre_carga}}`, `{{estado_embarque}}`, `{{eta}}`, `{{documentos_pendientes}}` |
| E7 Tráfico | Alerta inactividad | WhatsApp → Yonaida | `{{nombre_carga}}`, `{{dias_sin_actualizar}}`, `{{ultima_actualizacion}}` |
| Reintento | Seguimiento sin respuesta | Gmail → Proveedor | Mismo cuerpo original + prefijo `[Seguimiento]` en asunto |

**Editor de plantillas:**
- Selector de trigger (etapa + acción).
- Chips de variables clicables: `[Nombre]` `[CARGA]` `[ETA]` `[ORIGEN]`.
- Textarea con preview de variables resueltas.
- Botón **"Subir desde Word (.docx)"** para importar plantillas existentes.

**Criterios de aceptación:**
- Las variables dinámicas se auto-rellenan con datos de la carga antes de mostrar la plantilla.
- El usuario puede editar el contenido antes de enviar — nada se envía sin revisión.
- El Admin puede crear, editar y desactivar plantillas desde la UI sin tocar código.
- Las plantillas cargan en menos de 2 segundos.
- La importación de archivos .docx preserva formato básico (negritas, listas, saltos de línea).

---

### F-09: Detección Inteligente CPSIA *(módulo clave)*

**Descripción:** Análisis automático de productos contra las reglas de la CPSIA para detectar cuáles requieren prueba de seguridad. El módulo lee la proforma en Google Sheets, analiza producto por producto y crea una pestaña filtrada dentro del mismo Sheet.

**Flujo:**
1. Una carga entra a E3 (Proforma) en Monday.
2. KAIA lee la columna **"Link de Edición"** del item en Monday.
3. Abre el Google Sheet de la proforma usando Google Sheets API.
4. Analiza producto por producto contra las reglas CPSIA configurables.
5. Crea una pestaña nueva llamada **"CPSIA Filtro"** *dentro del mismo Google Sheet* (NO archivo separado).
6. La pestaña original "Proforma" queda intacta.
7. La pestaña CPSIA Filtro contiene solo los productos que aplican.
8. KAIA notifica a Yonaida por WhatsApp con la lista + imágenes + cantidades + tests requeridos.
9. Botón opcional disponible en el admin: "Bloquear avance a E4" hasta obtener certificados.

**Columnas de la pestaña CPSIA Filtro:**

| # | Columna | Origen del dato |
|---|---------|-----------------|
| 1 | Número | Secuencial |
| 2 | Imagen de referencia | Thumbnail leído de la columna IMAGE de la proforma |
| 3 | Producto | Nombre del producto |
| 4 | Código | Código interno |
| 5 | Format / Group | De la columna correspondiente |
| 6 | Materiales | De SPECS |
| 7 | Aplica CPSIA | Sí / No |
| 8 | Test requerido | Generado por la regla aplicada |
| 9 | Cantidad | Qty de la proforma |

**Reglas CPSIA configurables (aplicar indistinto del destino USA/PR/Panamá):**

| Regla | Condición | Test requerido |
|-------|-----------|----------------|
| KIT | FORMAT/GROUP contiene "KIT" | Plomo, Ftalatos, ASTM F963 |
| Metal | FORMAT = "COLGANTE" o SPECS menciona metal | Plomo sustrato + superficial |
| Stickers/Vinilo | FORMAT contiene "STICKERS" o SPECS menciona vinilo | Plomo en adhesivo |
| Pigmentos | SPECS menciona pigmentos/pinturas/crayones | ASTM D-4236 |
| Papel solo | FORMAT = LECTURA/COLOREAR/SOPAS/CRUCIGRAMAS + solo papel | EXENTO (16 CFR 1501) |

**Criterios de aceptación:**
- Cero falsos negativos — es preferible un falso positivo a dejar pasar un producto sin prueba.
- La pestaña "CPSIA Filtro" se crea sin alterar ni eliminar la pestaña original "Proforma".
- La alerta a Yonaida incluye: título del producto, materiales que generaron la alerta, artículo de la ley aplicable, imagen de referencia, cantidad y test requerido.
- El Admin puede cargar y actualizar las reglas CPSIA desde la interfaz de configuración sin tocar código.
- La detección ocurre en menos de 60 segundos tras la entrada a E3.
- Los thumbnails de imagen se leen correctamente desde la columna IMAGE de Google Sheets.

---

### F-10: Sistema de Reintento Automático

**Descripción:** Si el proveedor no responde en 48 horas, el sistema reenvía automáticamente el correo y alerta a Paulet.

**Flujo:**
1. Paulet envía correo al proveedor desde el sistema.
2. Contador de 48h inicia.
3. Si el proveedor responde antes de 48h: contador se cancela.
4. Si no responde: se reenvía el mismo correo con asunto `[Seguimiento] [asunto original]`.
5. Alerta WhatsApp a Paulet: "Reintento enviado a [PROVEEDOR] — carga [CCS]".
6. Si tras el segundo reintento no hay respuesta: alerta de escalada a Paulet.

**Criterios de aceptación:**
- El contador inicia exactamente cuando el correo es enviado.
- El reintento tiene exactamente el mismo cuerpo del original.
- Máximo 2 reintentos automáticos por correo enviado.
- El sistema no envía el reintento si el proveedor ya respondió, aunque sea en un hilo diferente.
- El tiempo de 48h es configurable por etapa.

---

### F-11: Portal de Colaboradores (Capa Solo Lectura)

**Descripción:** Vista filtrada del estado de cargas para los colaboradores operativos (Yonaida, Ruth, María, Aixa, Orlando). Acceso en `kaia.sicoben.com/portal`.

**Pantalla de bienvenida** *(al iniciar sesión, antes de mostrar el portal)*:
- Overlay full-screen, fondo radial oscuro #1A1F2E → #08090D.
- Mega watermark "KAIA" en Fraunces 900 al fondo (opacidad 0.025).
- 4 orbes difuminados (blur 50px) en colores Sicoben flotando lentamente.
- Partículas blancas pequeñas con animación flotante.
- Topbar: logo "sicoben" colorido (izquierda) + "Centro de Producción · 2025" (derecha).
- Centro: "Bienvenida al sistema" *(mono, letterspacing)* → línea divisora → "Hola," *(Fraunces italic 42px)* → **NOMBRE DEL COLABORADOR** *(Fraunces 700, 120px, efecto reveal blur-to-sharp + scale)* → línea de degradado Sicoben que se expande debajo → "KAIA · COMMAND" → subtítulo.
- Pie: "Preparando tu vista" + 4 dots animados + barra de carga con degradado Sicoben (5s) + "v1.0 · Production".
- Duración total: 6.5 segundos, luego fade out de 1s y revela el portal.
- El nombre del colaborador es dinámico (viene de la sesión Google OAuth).

**Portal (después de la bienvenida):**
- Topbar: logo sicoben + divisor + "KAIA / Producción" + badge "Datos en vivo" (dot teal pulsante) + pill de usuario con avatar de iniciales.
- Hero: "Buenos días, [Nombre]" + subtítulo con timestamp.
- 3 stat cards: Cargas activas (azul), En tránsito (teal), Atención (rosa).
- Lista de cargas: cada tarjeta muestra código CCS (mono), nombre (Fraunces), chip de etapa con color, país + bandera *(SIN proveedor)*, ETA o "Por confirmar", responsable, tracker visual de 7 etapas (puntos con check en completadas, punto activo con glow, grises pendientes).
- Al hacer clic en una carga: despliega detalle (etapa, origen, ETA, responsable, botón WhatsApp verde "Solicitar por WhatsApp").
- Cargas con alerta: borde izquierdo rosa + mensaje genérico (sin detalle operativo sensible).
- Footer: logo sicoben + "KAIA Command · © 2025 Sicoben Ediciones".

**Lo que NUNCA se muestra en el portal:**
- ❌ Nombre del proveedor
- ❌ Número de BL
- ❌ Número de contenedor
- ❌ Agente aduanal
- ❌ Costos
- ❌ Documentos adjuntos sensibles

**Criterios de aceptación:**
- La pantalla de bienvenida dura exactamente 6.5 segundos + 1 segundo de fade out.
- El nombre del colaborador se obtiene de la sesión Google OAuth.
- La visibilidad de cada campo es configurable desde el panel admin de Configuración.
- El portal carga en menos de 3 segundos.
- Funciona en iPhone (375px) y MacBook.

---

### F-12: Notificación Masiva a Vendedores

**Descripción:** Cuando una carga entra a E5 (Comercial) o E7 (Tráfico), el sistema dispara un banner con la propuesta de notificación masiva al equipo de ventas.

**Flujo:**
1. Una carga cambia a E5 o E7 en Monday.
2. KAIA detecta el trigger y muestra banner en el panel admin "Masivo Vendedores".
3. Se presenta una lista de destinatarios (Aixa, Orlando, etc.) con checkboxes.
4. Dos paneles editables:
   - **WhatsApp:** mensaje corto con código CCS, ETA y link al portal.
   - **Correo:** mensaje completo con listado de títulos.
5. Paulet revisa, edita si necesita y presiona "Enviar a seleccionados".
6. El sistema envía por ambos canales (WhatsApp + email) a los destinatarios marcados.

**Criterios de aceptación:**
- El banner aparece automáticamente al detectar el cambio de etapa.
- La lista de destinatarios se gestiona desde Configuración.
- Cero envíos sin confirmación explícita de Paulet.
- El envío masivo registra confirmación de entrega por cada destinatario.

---

## 7. Arquitectura Técnica

### Stack Recomendado

| Componente | Tecnología |
|------------|-----------|
| Frontend | HTML/CSS/JS vanilla (sin frameworks pesados) |
| Backend / API | Python + FastAPI |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Google OAuth 2.0 |
| IA / LLM | Anthropic Claude API |
| Monday.com | GraphQL API v2 + Webhooks |
| Gmail | Gmail API (Google Workspace) |
| Google Sheets | Google Sheets API (lectura proforma + creación pestaña CPSIA Filtro) |
| WhatsApp | Wassenger API |
| Hosting | Railway o Render |
| Webhooks (dev) | ngrok |

### Estructura de Carpetas

```
kaia-command/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── monday.py       # Integración Monday GraphQL + webhooks
│   │   ├── gmail.py        # Integración Gmail API
│   │   ├── sheets.py       # Integración Google Sheets API
│   │   ├── whatsapp.py     # Integración Wassenger
│   │   ├── clasificador.py # Módulo IA con Claude
│   │   └── auth.py         # Google OAuth 2.0
│   ├── services/
│   │   ├── clasificador.py # Lógica de clasificación por CCS
│   │   ├── cpsia.py        # Detección CPSIA + creación pestaña filtro
│   │   ├── reintentos.py   # Sistema de reintento automático
│   │   ├── plantillas.py   # Gestión y envío de plantillas
│   │   └── ccs_sync.py     # Motor de sincronización de comentarios por CCS
│   ├── webhooks/
│   │   └── monday.py       # Recepción de eventos Monday
│   └── models/
│       └── schemas.py
├── frontend/
│   ├── portal.html          # Capa Portal con bienvenida animada
│   ├── admin.html           # Capa Admin con los 10 paneles
│   ├── static/
│   │   ├── styles.css       # Variables CSS con la paleta Sicoben
│   │   ├── app.js           # Lógica JS vanilla
│   │   └── assets/
│   └── components/
│       └── (HTML parciales)
└── README.md
```

### Estructura del Centro de Operaciones Admin

El centro admin tiene un sidebar oscuro #13141A con scroll propio que navega entre 10 paneles:

```
Sidebar Admin
├── [Logo sicoben colorido] + "KAIA / Centro de control"
├── [Pill usuario: avatar + "Paulet L. / Administradora" + badge Admin]
│
├── PRINCIPAL
│   ├── 1. Cargas             (KPIs + tabla pipeline)
│   └── 2. Detalle             (vista por carga con E1-E7)
│
├── COMUNICACIÓN
│   ├── 3. Masivo              (notificación masiva vendedores)
│   ├── 4. Plantillas          (editor + chips de variables)
│   ├── 5. Correos             (agrupados por CCS, con respuesta IA)
│   └── 6. CPSIA               (módulo clave, F-09)
│
├── OPERACIÓN
│   ├── 7. Alertas             (semáforo de alertas activas)
│   └── 8. Monday sync         (estado de los 7 tableros)
│
└── SISTEMA
    ├── 9. Agentes IA          (gestión de agentes WhatsApp/portal)
    └── 10. Configuración       (usuarios, permisos, visibilidad portal, CPSIA)

[Footer: "KAIA v1.0 · 2025"]
```

### Flujo de Datos Principal

```
Gmail (correo nuevo entrante)
        ↓
   Gmail API (polling 15 min)
        ↓
   Clasificador IA (Claude API)
        ↓
   ¿Identifica código CCS en el contenido?
        ↓
¿Confianza > 90%?
    ├── Sí → WhatsApp alerta a Paulet → Paulet confirma → Monday update
    └── No → Panel correos pendientes → Paulet elige → Monday update
        ↓
   Agrupación por CCS (no por proveedor)
        ↓
   Historial de carga actualizado
        ↓
   Dashboard refleja nuevo estado
```

### Conexión con Monday.com

**Workspace:** 14162882

**Boards conectados (7 etapas):**

| Etapa | Nombre | Board ID |
|-------|--------|----------|
| E1 | ORIGEN | 18398325293 |
| E2 | COTIZACIONES | 18398330011 |
| E3 | PROFORMA | 18398330342 |
| E4 | DISEÑO | 18398331388 |
| E5 | COMERCIAL | 18398347387 |
| E6 | FABRICACIÓN | 18398348560 |
| E7 | TRÁFICO | 18398349721 |

**Llave maestra:** Código **CCS** (ej: `2025C-FCL`) — unifica la misma carga a través de los 7 tableros y evita duplicados. El sincronizador de comentarios existente en Claude Code se mantiene como motor interno que propaga comentarios entre tableros usando el CCS.

**Detección automática de nuevos tableros:** El sistema detecta tableros nuevos con formato "ETAPA X:" en el workspace y los muestra en el panel "Monday sync" con un botón "Activar" para incorporarlos al pipeline.

---

## 8. Requisitos No Funcionales

| Categoría | Requisito |
|-----------|-----------|
| **Rendimiento** | Dashboard carga en < 3 segundos. Clasificación de correo en < 10 segundos. Alertas WhatsApp en < 1 minuto. |
| **Seguridad** | Tokens OAuth almacenados cifrados. Comunicación HTTPS únicamente. Sin almacenamiento de contraseñas. |
| **Privacidad** | Los datos de correos y cargas no se usan para entrenar modelos externos. |
| **Disponibilidad** | 99% uptime en horario laboral Panamá (7am–8pm). Modo caché si Monday o Gmail no responden. |
| **Compatibilidad** | Chrome y Safari en iOS 16+ y macOS. Responsive desde 375px de ancho. |
| **Auditoría** | Toda acción del sistema (envío, publicación, alerta) queda registrada con usuario, fecha y hora. |
| **Retención de datos** | Historial de cargas conservado por mínimo 3 años. |
| **Naturaleza interna** | Sistema de uso exclusivo Sicoben. No se ofrece a clientes externos. No requiere onboarding multi-tenant ni gestión comercial de cuentas. |

---

## 9. Diseño UX / Identidad Visual

### 9.1 Aesthetic direction

**Editorial cálido + precisión operativa.** La herramienta se inspira en catálogos editoriales infantiles — papel envejecido, tinta profunda, acentos cromáticos solo para estado funcional. El resultado es una interfaz sobria y profesional que se siente humana sin sacrificar densidad de información.

### 9.2 Paleta Sicoben

Colores corporativos (usar como **acentos**, no saturar la interfaz):

| Token | Hex | Uso |
|-------|-----|-----|
| Rosa Sicoben | `#E8357A` | Alertas urgentes, etapa E4 Diseño, logo letra "s" |
| Púrpura Sicoben | `#7B4CA8` | Etapa E2 Cotizaciones, logo letra "i" |
| Azul Sicoben | `#3BB8E8` | Etapa E1 Origen, logo letra "c" |
| Teal Sicoben | `#2ABDA8` | Etapa E7 Tráfico, badges "datos en vivo", logo letra "o" |
| Ámbar Sicoben | `#F5A623` | Etapa E3 Proforma, pendientes, logo letra "b" |
| Naranja Sicoben | `#F06B35` | Etapa E5 Comercial, logo letra "e" |
| Verde Sicoben | `#8DC63F` | Etapa E6 Fabricación, confirmaciones, logo letra "n" |

### 9.3 Colores por Etapa de Producción

Cada una de las 7 etapas del pipeline tiene su color asociado:

| Etapa | Color | Hex |
|-------|-------|-----|
| E1 Origen | Azul | `#3BB8E8` |
| E2 Cotizaciones | Púrpura | `#7B4CA8` |
| E3 Proforma | Ámbar | `#F5A623` |
| E4 Diseño | Rosa | `#E8357A` |
| E5 Comercial | Naranja | `#F06B35` |
| E6 Fabricación | Verde | `#8DC63F` |
| E7 Tráfico | Teal | `#2ABDA8` |

### 9.4 Colores Neutros

| Token | Hex | Uso |
|-------|-----|-----|
| Fondo crema | `#FAF7F0` | Fondo general del portal y admin (excepto sidebar) |
| Blanco tarjeta | `#FFFFFF` | Fondo de tarjetas, paneles, modales |
| Borde sutil | `rgba(0, 0, 0, 0.06)` | Bordes de tarjetas, separadores |
| Sidebar oscuro | `#13141A` | Fondo del sidebar admin |
| Bienvenida oscura | `#1A1F2E` → `#08090D` | Gradiente radial de la pantalla de bienvenida del portal |

### 9.5 Tipografía (Google Fonts)

| Familia | Uso | Peso | Letter-spacing |
|---------|-----|------|----------------|
| **Fraunces** *(serif)* | Títulos, nombres de carga, logo KAIA | 500-900 | -0.025em |
| **Inter** *(sans)* | Cuerpo de texto, datos, descripciones | 400-600 | 0 |
| **JetBrains Mono** *(monospace)* | Códigos CCS, IDs, datos técnicos | 400-500 | 0.05em |
| **Comfortaa 700** | Logo "sicoben" — cada letra en un color de la paleta | 700 | normal |

**Logo "sicoben" — letra por letra:**

| Letra | Color |
|-------|-------|
| **s** | Rosa `#E8357A` |
| **i** | Púrpura `#7B4CA8` |
| **c** | Azul `#3BB8E8` |
| **o** | Teal `#2ABDA8` |
| **b** | Ámbar `#F5A623` |
| **e** | Naranja `#F06B35` |
| **n** | Verde `#8DC63F` |

### 9.6 Componentes Visuales

- **Border-radius:** 14px en tarjetas, 8px en botones, 6px en chips.
- **Sin gradientes agresivos** — usar gradientes solo en pantalla de bienvenida y barras de carga.
- **Mucho espacio en blanco** — densidad de información alta pero respirable.
- **Pulse animation** solo en cargas críticas 🔴 y badges "datos en vivo".
- **Reveal animations** en pantalla de bienvenida (blur-to-sharp + scale).

### 9.7 Principios de Interacción

- **Confirmación antes de acción:** El sistema sugiere — Paulet decide. Nada toca Monday o Gmail sin aprobación.
- **Urgencia visible de un vistazo:** Las cargas en 🔴 siempre van primero. El estado se entiende en 2 segundos.
- **Mobile-first real:** Paulet revisa y confirma correos desde el iPhone — la UI funciona igual que en desktop.
- **Alertas que llevan a la acción:** El link del WhatsApp lleva directo al punto exacto donde actuar, no al home.
- **Menos clics posibles:** Confirmar una asociación = 1 tap. Enviar una plantilla = 2 taps.

### 9.8 Pantallas del MVP

**Capa Admin (10 paneles):**
1. **Cargas** — Grid principal de tarjetas con stats, filtros y semáforo.
2. **Detalle** — Vista por carga con E1-E7 y log de eventos.
3. **Masivo** — Notificación masiva a vendedores con banner trigger.
4. **Plantillas** — Editor con chips de variables clicables.
5. **Correos** — Agrupados por CCS con panel de respuesta pre-cargada.
6. **CPSIA** — Módulo de análisis automático y creación de pestaña filtro.
7. **Alertas** — Alertas activas con semáforo de urgencia.
8. **Monday sync** — Estado de los 7 tableros + detección de nuevos.
9. **Agentes IA** — Gestión de agentes (WhatsApp Paulet, portal colaboradores).
10. **Configuración** — Usuarios, permisos, visibilidad portal, reglas CPSIA.

**Capa Portal:**
1. **Pantalla de bienvenida** — Animación 6.5s con nombre dinámico.
2. **Portal home** — Hero, 3 stat cards, lista de cargas con tracker visual.
3. **Detalle de carga** — Información filtrada según rol + botón WhatsApp.

### 9.9 Referencias Visuales

Las referencias visuales completas del producto están disponibles en el archivo HTML adjunto:

📎 **`KAIA_Mockups_Visuales.html`** — Documento visual con todas las pantallas, paleta de color completa, tipografía y vista móvil.

---

## 10. Plan de Lanzamiento MVP

### Semana 1-2: Fundación
- Setup del proyecto (FastAPI + HTML/CSS/JS + Supabase).
- Google OAuth — autenticación de usuarios y roles (admin vs operativo).
- Integración con Monday.com GraphQL API — lectura de los 7 Boards.
- Identificación y lectura del código CCS por carga.
- Dashboard admin estático con tarjetas reales de Monday (sin IA).
- Estructura de base de datos: cargas, correos, historial, usuarios, plantillas, reglas CPSIA.

### Semana 3-4: Gmail + Clasificador IA + Portal Colaboradores
- Integración Gmail API — lectura de bandeja.
- Módulo clasificador con Claude API — agrupación por CCS.
- Panel de correos pendientes con sugerencias y confirmación.
- Escritura en Monday: publicación de updates tras confirmación de Paulet.
- Construcción de la Capa Portal con pantalla de bienvenida animada.
- Configuración de visibilidad granular por campo en el portal.

### Semana 5-6: WhatsApp + Plantillas + Respuesta al Proveedor
- Integración Wassenger API para alertas WhatsApp.
- CRUD de plantillas en panel de configuración + importación .docx.
- Editor visual con chips de variables clicables.
- Envío de correos al proveedor desde el dashboard (Gmail API Send).
- Detección de carencias al cambiar de etapa en Monday.
- Notificación masiva a vendedores con triggers automáticos en E5 y E7.

### Semana 7-8: CPSIA + Reintentos + QA + Deploy
- Módulo detección CPSIA con reglas configurables.
- Creación automática de pestaña "CPSIA Filtro" en Google Sheets.
- Sistema de reintento automático (contador 48h + reenvío).
- Historial completo por carga (línea de tiempo).
- Testing con Paulet — corrección de bugs críticos.
- Deploy en producción (Railway o Render) bajo `kaia.sicoben.com`.

---

## 11. Criterios de Éxito del MVP

Al finalizar el MVP, el producto se considera exitoso si:

- Paulet usa el sistema como herramienta principal de seguimiento **desde el día 1** post-lanzamiento.
- El **100% de correos de proveedores** son detectados y clasificados dentro de los 15 minutos de llegada.
- **0 correos son asociados a Monday** sin confirmación explícita de Paulet.
- El tiempo diario de seguimiento operativo de Paulet baja de **2-3 horas a menos de 30 minutos**.
- **100% de productos** procesados en E3 son revisados contra CPSIA y la pestaña filtro se crea automáticamente.
- **Yonaida, Ruth, María, Aixa y Orlando** consultan el portal sin necesidad de preguntarle a Paulet por estado de cargas.
- Paulet califica el sistema con **8 o más sobre 10** en la primera semana de uso real.

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Clasificador asocia correo a carga incorrecta | Media | Alto | Regla inviolable: nada toca Monday sin confirmación de Paulet |
| Monday API cambia o tiene downtime | Baja | Alto | Caché local + modo lectura offline con indicador de estado |
| Gmail API revoca acceso o token expira | Baja | Alto | Alerta proactiva cuando el token está por vencer. Re-auth con 1 clic. |
| WhatsApp bloquea el número de alertas | Baja | Medio | Fallback automático a email si WhatsApp falla |
| Proveedor usa dirección desconocida y no se clasifica | Alta | Medio | Clasificado como "no identificado" — Paulet asigna manual. Dirección queda registrada para el futuro. |
| Plantillas no están listas al inicio del desarrollo | Media | Medio | El sistema funciona sin plantillas en MVP. Se cargan en Semana 5-6. |
| Reglas CPSIA desactualizadas | Baja | Alto | Reglas configurables desde admin. Revisión trimestral obligatoria. |
| Pestaña "CPSIA Filtro" sobrescribe contenido en Google Sheets | Baja | Alto | El módulo CPSIA solo crea pestaña nueva — nunca modifica la pestaña Proforma original. |
| Mismo proveedor escribe sobre múltiples cargas y se confunden | Alta | Alto | Agrupación por código CCS (no por proveedor) — un mismo proveedor genera tantos hilos como cargas activas tenga. |
| Colaboradores ven información sensible que no deberían | Media | Alto | Capa Portal tiene visibilidad configurable por campo. Por defecto: proveedor, BL, contenedor, costos ocultos. |
| El equipo no adopta el sistema | Media | Alto | Onboarding presencial con cada usuario. Manual de uso por rol. |

---

## 13. Plantillas Completas de Correo

A continuación el contenido textual completo de cada plantilla. Los proveedores en China e India reciben correo en **inglés**. Las plantillas internas para el equipo de Sicoben se envían en **español**.

---

### 13.1 — Etapa 2: Solicitud de Cotización *(al proveedor, en inglés)*

**Destinatario:** Proveedor seleccionado
**Trigger:** Carga entra a Etapa 2 (Cotizaciones) en Monday
**Subject:** `Quote Request — {{nombre_carga}} | Sicoben Ediciones`

```
Hello {{proveedor}},

Hope you are doing well.

We would like to request a quote for our upcoming shipment "{{nombre_carga}}".
Please find below the list of titles we want to include in this load:

{{lista_titulos}}

Kindly fill the attached quotation form with your pricing, lead times
and minimum order quantities per title:

→ {{link_formulario}}

We would appreciate receiving your quote by {{fecha_limite}}.
If you have any questions, please feel free to reach out.

Best regards,
Paulet Bermúdez
Executive Assistant to CEO — Sicoben Ediciones / KADI International
paulet@sicoben.com
```

---

### 13.2 — Etapa 3: Solicitud de Proforma *(al proveedor, en inglés)*

**Destinatario:** Proveedor seleccionado tras cotización aprobada
**Trigger:** Carga entra a Etapa 3 (Proforma)
**Subject:** `Proforma Request — {{nombre_carga}} | Sicoben Ediciones`

```
Hello {{proveedor}},

Thank you for your quote. We are happy to move forward with you on
the "{{nombre_carga}}" load.

Please prepare your proforma invoice including the following titles
and quantities:

→ {{link_proforma}}

Payment terms: {{condiciones_pago}}
Expected production start: upon proforma confirmation and advance payment.

We need to receive the proforma by {{fecha_limite}} to keep the timeline.

Looking forward to working with you on this project.

Best regards,
Paulet Bermúdez
Executive Assistant to CEO — Sicoben Ediciones / KADI International
```

**Trigger adicional:** Tras enviar esta plantilla, el sistema lee el `{{link_proforma}}` y ejecuta automáticamente la regla CPSIA descrita en F-09. Si detecta títulos que aplican, **dispara la plantilla 13.3 al mismo proveedor**.

---

### 13.3 — Etapa 3: Solicitud de Cotización CPSIA *(automática, al proveedor, en inglés)*

**Destinatario:** Proveedor — automático tras detección CPSIA
**Trigger:** El sistema detectó productos que requieren prueba CPSIA en la proforma
**Subject:** `CPSIA Testing Quote — {{nombre_carga}}`

```
Hello {{proveedor}},

Following our proforma request, our system has identified that the
following titles may require CPSIA testing for the U.S. market:

{{lista_titulos_cpsia}}

Could you please provide a separate quote for the CPSIA lab testing
for these titles? We need:

• Lead content testing
• Phthalates testing
• Small parts (if applicable per age)
• Any other applicable test per CPSIA Section 101 / 108

Please confirm:
1. Estimated cost per title
2. Lead time for testing
3. Lab name and accreditation (CPSC-accepted)

Yonaida from our team has been notified and will coordinate the
required documentation.

Best regards,
Paulet Bermúdez
Sicoben Ediciones / KADI International
```

**Notificación simultánea a Yonaida** *(WhatsApp + email, español)*:

> 🚨 **CPSIA detectado — Carga {{nombre_carga}}**
> El sistema identificó que estos títulos requieren prueba CPSIA: {{lista_titulos_cpsia}}.
> Ya solicité cotización de pruebas al proveedor.
> Por favor coordina la documentación de tu lado.
> Ver pestaña CPSIA Filtro: {{link_pestaña_filtro}}
> Ver carga: {{link_dashboard}}

---

### 13.4 — Etapa 4: Notificación a Equipo de Diseño *(interna, español)*

**Destinatario:** Jenny y María (Diseño)
**Trigger:** Carga entra a Etapa 4 (Diseño)
**Subject:** `🎨 Carga {{nombre_carga}} entró en fase de Diseño`

```
Hola equipo,

La carga "{{nombre_carga}}" ha entrado en fase de Diseño en Monday.

Detalles:
• Proveedor: {{proveedor}}
• Título(s): {{titulo}}
• Fecha estimada de entrega de artes: {{fecha_entrega_arte}}

Por favor revisen que todo esté completo y comiencen el proceso de
diseño según los lineamientos del proveedor.

Cualquier duda me dicen.

Gracias,
Paulet
```

---

### 13.5 — Etapa 4: Seguimiento de Diseño *(interna, español, automática)*

**Destinatario:** Jenny y María (Diseño)
**Trigger:** 7 días sin actualización en Etapa 4
**Subject:** `Seguimiento — Cómo van con la proforma {{nombre_carga}}?`

```
Hola equipo,

¿Podrían darme feedback de cómo van con el diseño de la proforma
"{{nombre_carga}}"?

El proveedor está esperando los artes finales para arrancar producción.

Cualquier bloqueo me avisan para destrabarlo.

Gracias,
Paulet
```

---

### 13.6 — Etapa 4: Solicitud de PPS *(al proveedor, en inglés)*

**Destinatario:** Proveedor
**Trigger:** Manual desde el dashboard una vez los artes están listos
**Subject:** `PPS Request — {{nombre_carga}}`

```
Hello {{proveedor}},

We have completed the design phase for "{{nombre_carga}}". Please find
attached the final art files for production.

Could you please send us PPS (Pre-Production Sample) of the product?
This is required for final approval before bulk production.

Specifications: {{especificaciones}}
Deadline for PPS: {{fecha_limite_pps}}

Also, please confirm:
• Production start date
• Expected completion date
• Expected ship date

We need these dates to organize our incoming logistics on our side.

Best regards,
Paulet Bermúdez
Sicoben Ediciones / KADI International
```

---

### 13.7 — Etapa 5: Notificación Masiva a Ventas *(interna, español, automática semanal)*

**Destinatario:** Aixa, Orlando, equipo comercial
**Trigger:** Lunes 9:00 AM cada semana, o cuando una carga entra a Etapa 5
**Subject:** `📦 Cargas en proceso de fabricación — Semana del {{fecha}}`

```
Hola equipo de Ventas,

ATENCIÓN: Las siguientes cargas están en proceso de fabricación esta semana.

{{listado_cargas_activas}}

Para cada carga:
{{estado_por_carga}}
ETA aproximada: {{eta_por_carga}}

Por favor ingresen a nuestro PORTAL DE CARGAS para conocer todos los
productos que vienen:

→ {{link_portal}}

Cualquier duda sobre algún título específico me avisan.

Saludos,
Paulet
```

---

### 13.8 — Etapa 7: Alerta de Tráfico al CEO *(WhatsApp + email, español)*

**Destinatario:** Sr. Daniel Benarroch (CEO)
**Trigger:** Cada lunes 7:00 AM + cuando hay cambio de estado de embarque
**Subject:** `📦 Estado de cargas en tránsito — {{fecha}}`

```
Buenos días Sr. Daniel,

Resumen de las cargas en tránsito esta semana:

{{nombre_carga}}
• Estado de embarque: {{estado_embarque}}
• ETA: {{eta}}
• Documentos pendientes: {{documentos_pendientes}}

(se repite por cada carga activa en Etapa 7)

Cualquier carga que necesite atención inmediata está marcada con 🔴
en el dashboard:

→ {{link_dashboard}}

Saludos,
Paulet
```

---

### 13.9 — Etapa 7: Alerta a Yonaida por inactividad *(WhatsApp + email, español)*

**Destinatario:** Yonaida (Tráfico)
**Trigger:** Carga en Etapa 7 con más de 5 días sin actualización
**Subject:** `⚠️ Carga {{nombre_carga}} sin actualizar`

```
Hola Yonaida,

La carga "{{nombre_carga}}" lleva {{dias_sin_actualizar}} días sin
actualización en Monday.

Última actualización registrada: {{ultima_actualizacion}}

¿Tienes información nueva del proveedor o agente de carga?
El Sr. Daniel está pidiendo actualización del estado.

Por favor actualiza el tablero para que el dashboard refleje el estado
correcto.

Gracias,
Paulet
```

---

### 13.10 — Reintento Automático *(al proveedor, en inglés)*

**Destinatario:** Proveedor que no respondió en 48h
**Trigger:** Automático tras 48h sin respuesta. Máximo 2 reintentos.
**Subject:** `[Follow-up] {{subject_original}}`

```
Hello {{proveedor}},

Following up on my previous email below. We have not received your
response and we are working against a deadline.

Could you please confirm by today end of day?

Looking forward to hearing back from you soon.

Best regards,
Paulet Bermúdez

────── Original message below ──────

{{cuerpo_correo_original}}
```

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| **Carga** | Unidad de producción: un pedido de libros a un proveedor con tipo de embarque definido. |
| **CCS** | Código Sicoben de Carga — identificador único: `[AÑO][LETRA]-[PROVEEDOR]-[TIPO]-[EMBARQUE]` (ej: 2025C-FCL). Llave maestra que unifica una carga a través de los 7 tableros de Monday. |
| **Etapa** | Una de las 7 fases del ciclo de producción, cada una en un Board separado de Monday.com. |
| **E1 - E7** | Las 7 etapas: E1 Origen, E2 Cotizaciones, E3 Proforma, E4 Diseño, E5 Comercial, E6 Fabricación, E7 Tráfico. |
| **Semáforo** | Indicador visual por etapa: 🟢 completada / 🟡 en curso / 🔴 alerta / ⚫ no iniciada. |
| **Clasificador** | Módulo de IA que asocia correos de proveedores a su carga correspondiente usando el código CCS. |
| **Carencia** | Campo requerido por una etapa que está vacío al momento de avanzar. |
| **Plantilla** | Correo predefinido con variables dinámicas listo para enviar al proveedor o al equipo. |
| **CPSIA** | Consumer Product Safety Improvement Act — ley estadounidense de seguridad de productos infantiles. |
| **CPSIA Filtro** | Pestaña automática creada por KAIA dentro del Google Sheet de la proforma, con solo los productos que requieren prueba CPSIA. |
| **PPS** | Pre-Production Sample — muestra de pre-producción para aprobación antes de fabricar. |
| **Update** | Comentario publicado en un item de Monday.com. |
| **Reintento** | Correo automático reenviado si el proveedor no responde en 48 horas. |
| **Capa Admin** | Centro de operaciones con control total. Para Paulet, Sr. Daniel y Jenny. |
| **Capa Portal** | Vista filtrada de solo lectura. Para Yonaida, Ruth, María, Aixa y Orlando. |

---

*Documento preparado para desarrollo con Claude Code.*
*PRD v3.0 — KAIA Command Central — Sistema interno de Sicoben Ediciones / KADI International — Junio 2026*
