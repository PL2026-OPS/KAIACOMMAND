-- ═══════════════════════════════════════════════════════════════
--  KAIA Command Central — Datos de prueba (seed)
--  Ejecutar DESPUÉS de schema.sql
--  Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Usuarios ─────────────────────────────────────────────────────
INSERT INTO usuarios (email, nombre, rol) VALUES
  ('asistente.direccion@sicobenediciones.com', 'Paulet',     'admin'),
  ('daniel.benarroch@sicobenediciones.com',    'Sr. Daniel', 'admin'),
  ('jennibenarroch@sicobenediciones.com',      'Jenny',      'admin'),
  ('logistica@sicobenediciones.com',           'Yonaida',    'portal'),
  ('arte@sicobenediciones.com',                'María',      'portal'),
  ('asistenteventas@sicobenediciones.com',     'Aixa',       'portal'),
  ('adm.kadi@sicobenediciones.com',            'Ruth',       'portal'),
  ('asesoreducativo@sicobenediciones.com',     'Orlando',    'portal')
ON CONFLICT (email) DO NOTHING;

-- ── Cargas activas ───────────────────────────────────────────────
INSERT INTO cargas (ccs, nombre, proveedor, origen, tipo_embarque, etapa_idx, dias_en_etapa, eta, semaforo, ultimo_evento, correos_pendientes, cpsia_pendiente) VALUES
  (
    '2025C-FCL',
    'Colección Navidad 2025',
    'Ningbo Jumbo Co. Ltd.',
    '🇨🇳 China',
    'FCL',
    5,
    21,
    '15 Feb 2026',
    'rojo',
    'Sin respuesta — reintento automático #2 enviado',
    2,
    false
  ),
  (
    '2025B-LCL',
    'Libros Educativos Q1 2026',
    'Mumbai Book Printers Pvt.',
    '🇮🇳 India',
    'LCL',
    2,
    3,
    'Mar 2026',
    'amarillo',
    'Proforma recibida — análisis CPSIA pendiente',
    1,
    true
  ),
  (
    '2025D-AIR',
    'Urgente Diciembre KADI',
    'Shenzhen Print Express Co.',
    '🇨🇳 China',
    'AIR',
    6,
    6,
    '28 Dic 2025',
    'amarillo',
    'En tránsito — sin actualización en Monday',
    0,
    false
  ),
  (
    '2025E-FCL',
    'Serie Animales del Mundo',
    'Guangzhou Kids Books Ltd.',
    '🇨🇳 China',
    'FCL',
    4,
    2,
    'Feb 2026',
    'verde',
    'Carga avanzó a E5 Comercial — notificación masiva disparada',
    0,
    false
  )
ON CONFLICT (ccs) DO NOTHING;

-- ── Historial de eventos — 2025C-FCL ────────────────────────────
INSERT INTO historial_eventos (ccs, tipo, icono, texto, detalle, adjunto, fecha_evento) VALUES
  (
    '2025C-FCL', 'alerta', '🔴',
    'Reintento automático #2 enviado a Ningbo Jumbo — 96h sin respuesta.',
    NULL, NULL,
    '2025-12-08 14:32:00+00'
  ),
  (
    '2025C-FCL', 'correo_enviado', '📤',
    '[Follow-up] Proforma Request — Colección Navidad 2025',
    'Reenvío automático del sistema con prefijo [Follow-up] en el asunto.',
    NULL,
    '2025-12-08 09:15:00+00'
  ),
  (
    '2025C-FCL', 'alerta', '🔔',
    'Reintento automático #1 disparado — 48h sin respuesta del proveedor.',
    NULL, NULL,
    '2025-12-06 09:00:00+00'
  ),
  (
    '2025C-FCL', 'correo_enviado', '📤',
    'Proforma Request — Colección Navidad 2025',
    'Correo enviado por Paulet desde KAIA. Contador de 48h iniciado.',
    NULL,
    '2025-12-04 11:20:00+00'
  ),
  (
    '2025C-FCL', 'monday', '📌',
    'Update publicado en Monday · E6 Fabricación',
    '📧 Correo de proveedor — 28 nov 15:10\nDe: johnson@ninbojumbo.com\nResumen: Proveedor confirma inicio de producción el 25 nov. Fecha estimada de envío: 10 ene.',
    NULL,
    '2025-11-28 16:45:00+00'
  ),
  (
    '2025C-FCL', 'confirmacion', '✅',
    'Paulet confirmó la asociación del correo → 2025C-FCL',
    NULL, NULL,
    '2025-11-28 15:45:00+00'
  ),
  (
    '2025C-FCL', 'correo_recibido', '📥',
    'Production start confirmed — Ningbo Jumbo Co.',
    'Hello Paulet,\n\nWe confirm production started on November 25th. Expected completion date is January 10th, 2026.\n\nBest regards,\nJohnson Li',
    'production_schedule_nov25.pdf',
    '2025-11-28 15:10:00+00'
  );

-- ── Historial de eventos — 2025B-LCL ────────────────────────────
INSERT INTO historial_eventos (ccs, tipo, icono, texto, detalle, adjunto, fecha_evento) VALUES
  (
    '2025B-LCL', 'alerta', '⚠️',
    'CPSIA: Análisis pendiente — proforma recibida pero no procesada.',
    NULL, NULL,
    '2025-12-08 10:00:00+00'
  ),
  (
    '2025B-LCL', 'monday', '📌',
    'Update publicado en Monday · E3 Proforma',
    '📧 Correo de proveedor — 7 dic 18:22\nDe: orders@mumbaibookprinters.in\nResumen: Proforma invoice adjunta con precios finales. Total USD 18,400. Solicitan confirmación de anticipo del 30%.',
    NULL,
    '2025-12-07 19:00:00+00'
  ),
  (
    '2025B-LCL', 'confirmacion', '✅',
    'Paulet confirmó la asociación del correo → 2025B-LCL',
    NULL, NULL,
    '2025-12-07 18:55:00+00'
  ),
  (
    '2025B-LCL', 'correo_recibido', '📥',
    'Proforma Invoice — Q1 2026 Books · Mumbai Book Printers',
    'Dear Paulet,\n\nPlease find attached our proforma invoice for the Q1 2026 books order.\n\nTotal: USD 18,400 | 30% advance required.\n\nKind regards,\nRajesh Kumar',
    'proforma_q1_2026_final.pdf',
    '2025-12-07 18:22:00+00'
  ),
  (
    '2025B-LCL', 'correo_enviado', '📤',
    'Proforma Request — Libros Educativos Q1 2026',
    'Correo enviado por Paulet desde KAIA. Contador de 48h iniciado.',
    NULL,
    '2025-12-05 09:00:00+00'
  );

-- ── Campos por etapa — 2025C-FCL ────────────────────────────────
INSERT INTO campos_etapa (ccs, etapa_idx, campo_nombre, completado) VALUES
  -- E1 Origen: completo
  ('2025C-FCL', 0, 'Proveedor confirmado',         true),
  ('2025C-FCL', 0, 'Código CCS asignado',          true),
  -- E2 Cotizaciones: completo
  ('2025C-FCL', 1, 'Cotización recibida',          true),
  ('2025C-FCL', 1, 'Proveedor seleccionado',       true),
  ('2025C-FCL', 1, 'Precio aprobado',              true),
  -- E3 Proforma: completo
  ('2025C-FCL', 2, 'Proforma firmada',             true),
  ('2025C-FCL', 2, 'Anticipo confirmado',          true),
  ('2025C-FCL', 2, 'Fecha de producción',          true),
  ('2025C-FCL', 2, 'Análisis CPSIA',               true),
  -- E4 Diseño: completo
  ('2025C-FCL', 3, 'Artes aprobados',              true),
  ('2025C-FCL', 3, 'PPS aprobado',                 true),
  ('2025C-FCL', 3, 'Instrucciones enviadas al proveedor', true),
  -- E5 Comercial: completo
  ('2025C-FCL', 4, 'Notificación a ventas enviada', true),
  ('2025C-FCL', 4, 'Listado de títulos confirmado', true),
  -- E6 Fabricación: incompleto (carencia)
  ('2025C-FCL', 5, 'Reporte de avance semanal',    true),
  ('2025C-FCL', 5, 'Fecha estimada de finalización', false)
ON CONFLICT (ccs, etapa_idx, campo_nombre) DO NOTHING;

-- ── Campos por etapa — 2025B-LCL ────────────────────────────────
INSERT INTO campos_etapa (ccs, etapa_idx, campo_nombre, completado) VALUES
  -- E1 Origen: completo
  ('2025B-LCL', 0, 'Proveedor confirmado',         true),
  ('2025B-LCL', 0, 'Código CCS asignado',          true),
  -- E2 Cotizaciones: completo
  ('2025B-LCL', 1, 'Cotización recibida',          true),
  ('2025B-LCL', 1, 'Proveedor seleccionado',       true),
  ('2025B-LCL', 1, 'Precio aprobado',              true),
  -- E3 Proforma: incompleto (2 carencias)
  ('2025B-LCL', 2, 'Proforma firmada',             true),
  ('2025B-LCL', 2, 'Anticipo confirmado',          false),
  ('2025B-LCL', 2, 'Fecha de producción',          true),
  ('2025B-LCL', 2, 'Análisis CPSIA',               false)
ON CONFLICT (ccs, etapa_idx, campo_nombre) DO NOTHING;

-- ── Plantillas ───────────────────────────────────────────────────
INSERT INTO plantillas (id, nombre, etapa_idx, trigger_desc, destino, canal, activa, asunto, cuerpo) VALUES
  (
    'e2-cotizacion',
    'Solicitud de Cotización',
    1,
    'Carga entra a E2 · Manual',
    'Proveedor',
    'email',
    true,
    'Quote Request — {{nombre_carga}} | Sicoben Ediciones',
    'Hello {{proveedor}},

Hope you are doing well.

We would like to request a quote for our upcoming shipment "{{nombre_carga}}".
Please find the list of titles below:

{{lista_titulos}}

Kindly fill the attached form by {{fecha_limite}}:
→ {{link_formulario}}

Best regards,
Paulet Bermúdez
Sicoben Ediciones / KADI International'
  ),
  (
    'e3-proforma',
    'Solicitud de Proforma',
    2,
    'Carga entra a E3',
    'Proveedor',
    'email',
    true,
    'Proforma Request — {{nombre_carga}} | Sicoben Ediciones',
    'Hello {{proveedor}},

Thank you for your quote. We are happy to move forward with "{{nombre_carga}}".

Please prepare your proforma invoice:
→ {{link_proforma}}

Payment terms: {{condiciones_pago}}
Deadline: {{fecha_limite}}

Best regards,
Paulet Bermúdez
Sicoben Ediciones / KADI International'
  ),
  (
    'e3-cpsia-wa',
    'Aviso CPSIA → Yonaida',
    2,
    'Detección CPSIA automática',
    'Yonaida',
    'wa',
    true,
    '',
    '🚨 *CPSIA detectado — Carga {{nombre_carga}}*
Títulos que requieren prueba: {{lista_titulos_cpsia}}.

Ya solicité cotización al proveedor.
Por favor coordina la documentación.

Ver pestaña CPSIA Filtro: {{link_pestaña_filtro}}
Ver carga en dashboard: {{link_dashboard}}'
  ),
  (
    'e4-pps',
    'Solicitud de PPS',
    3,
    'Manual desde la tarjeta',
    'Proveedor',
    'email',
    true,
    'PPS Request — {{nombre_carga}}',
    'Hello {{proveedor}},

We have completed the design phase for "{{nombre_carga}}".
Please find attached the final art files for production.

Could you please send us a PPS (Pre-Production Sample)?

Specifications: {{especificaciones}}
Deadline for PPS: {{fecha_limite_pps}}

Best regards,
Paulet Bermúdez
Sicoben Ediciones / KADI International'
  ),
  (
    'reintento',
    'Seguimiento sin respuesta',
    NULL,
    '48h sin respuesta del proveedor',
    'Proveedor',
    'email',
    true,
    '[Follow-up] {{asunto_original}}',
    'Hello {{proveedor}},

Following up on my previous email below. We have not received your response and we are working against a deadline.

Could you please confirm by today end of day?

Looking forward to hearing back from you soon.

Best regards,
Paulet Bermúdez

────── Original message below ──────

{{cuerpo_correo_original}}'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Hilos de correo ──────────────────────────────────────────────
INSERT INTO correos_hilo (ccs, etapa_idx) VALUES ('2025C-FCL', 5);
INSERT INTO correos_hilo (ccs, etapa_idx) VALUES ('2025B-LCL', 2);

-- ── Mensajes — hilo 2025C-FCL ────────────────────────────────────
INSERT INTO mensajes_correo (id, hilo_id, ccs, de_nombre, de_email, asunto, cuerpo, resumen, tipo, confianza, confirmado, adjuntos, fecha_mensaje)
VALUES (
  'c1b',
  (SELECT id FROM correos_hilo WHERE ccs = '2025C-FCL' LIMIT 1),
  '2025C-FCL', 'Paulet Bermúdez', 'paulet@sicoben.com',
  'Production Update — Christmas Collection',
  'Hello Johnson, Could you please send me an update on the production status of the Christmas Collection? We would also appreciate some photos of the current batch and the latest QC report. Thank you, Paulet',
  NULL, 'enviado', NULL, true, '[]'::jsonb,
  '2026-06-07 15:22:00+00'::timestamptz
);

INSERT INTO mensajes_correo (id, hilo_id, ccs, de_nombre, de_email, asunto, cuerpo, resumen, tipo, confianza, confirmado, adjuntos, fecha_mensaje)
VALUES (
  'c1a',
  (SELECT id FROM correos_hilo WHERE ccs = '2025C-FCL' LIMIT 1),
  '2025C-FCL', 'Johnson Li', 'johnson@ninjobumbo.com',
  'RE: Production Update — Christmas Collection',
  'Hi Paulet, Good news — production is now at 85% completion. We expect to finish the full batch by June 20th. I am attaching the latest QC report and photos of batch #2 for your review. Best regards, Johnson Li, Ningbo Jumbo Co. Ltd.',
  'Confirma producción al 85%. Adjunta reporte QC y fotos del lote 2.',
  'recibido', 94, false,
  '[{"name":"cover_sample.jpg","type":"image"},{"name":"batch2_photo.jpg","type":"image"},{"name":"QC_Report_Jun8.pdf","type":"file"}]'::jsonb,
  '2026-06-08 09:14:00+00'::timestamptz
);

-- ── Mensajes — hilo 2025B-LCL ────────────────────────────────────
INSERT INTO mensajes_correo (id, hilo_id, ccs, de_nombre, de_email, asunto, cuerpo, resumen, tipo, confianza, confirmado, adjuntos, fecha_mensaje)
VALUES (
  'c2a',
  (SELECT id FROM correos_hilo WHERE ccs = '2025B-LCL' LIMIT 1),
  '2025B-LCL', 'Priya Sharma', 'priya@mumbaibookprint.in',
  'Proforma Invoice — Educational Books Q1',
  'Dear Paulet, Please find attached the proforma invoice for the Educational Books Q1 order. Summary: 18 titles, Total: USD 42,300, 30% advance required, Production start: July 20th. Warm regards, Priya Sharma, Mumbai Book Printers Pvt.',
  'Proforma por $42,300 USD. 18 títulos, inicio de producción 20 Jul.',
  'recibido', 88, false,
  '[{"name":"Proforma_MBP_2025B.pdf","type":"file"}]'::jsonb,
  '2026-06-07 11:40:00+00'::timestamptz
);

-- ── Alertas ──────────────────────────────────────────────────────
INSERT INTO alertas (id, ccs, semaforo, icono, tipo, mensaje) VALUES
  ('al1', '2025C-FCL', 'rojo',     '🚨', 'Escalada',    'Ningbo Jumbo no respondió tras 2 reintentos — acción manual requerida'),
  ('al2', '2025C-FCL', 'rojo',     '⚠️', 'Carencia',    'Avanzó a E6 Fabricación sin completar: Fecha estimada de finalización'),
  ('al3', '2025D-AIR', 'amarillo', '📦', 'Inactividad', 'E7 Tráfico lleva 6 días sin actualización en Monday'),
  ('al4', '2025B-LCL', 'amarillo', '📋', 'Reintento',   'Reintento #1 enviado a Mumbai Book Printers — sin respuesta en 48h'),
  ('al5', '2025B-LCL', 'verde',    '🔔', 'Correo nuevo','Nuevo correo de Priya Sharma · Proforma Invoice — pendiente de confirmar en Monday')
ON CONFLICT (id) DO NOTHING;

-- ── Destinatarios masivo ─────────────────────────────────────────
INSERT INTO destinatarios_masivo (id, nombre, rol, telefono, email, canales) VALUES
  ('aixa',    'Aixa',    'Ventas',      '+507 6222-4455', 'asistenteventas@sicobenediciones.com', '["wa","email"]'),
  ('orlando', 'Orlando', 'Prospecting', NULL,             'asesoreducativo@sicobenediciones.com', '["email"]'),
  ('ruth',    'Ruth',    'Marcas',      NULL,             'adm.kadi@sicobenediciones.com',        '["email"]'),
  ('maria',   'María',   'Diseño',      NULL,             'arte@sicobenediciones.com',             '["email"]')
ON CONFLICT (id) DO NOTHING;
