-- ═══════════════════════════════════════════════════════════════
--  KAIA Command Central — Database Schema
--  Ejecutar en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Usuarios del sistema ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  nombre      text NOT NULL,
  rol         text NOT NULL CHECK (rol IN ('admin', 'portal')),
  activo      boolean DEFAULT true,
  creado_en   timestamptz DEFAULT now()
);

-- ── Cargas (unidad central — llave: código CCS) ──────────────────
CREATE TABLE IF NOT EXISTS cargas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ccs                 text UNIQUE NOT NULL,          -- ej: 2025C-FCL
  nombre              text NOT NULL,
  proveedor           text,
  origen              text,
  tipo_embarque       text CHECK (tipo_embarque IN ('FCL', 'LCL', 'AIR')),
  etapa_idx           integer NOT NULL CHECK (etapa_idx BETWEEN 0 AND 6),
  dias_en_etapa       integer DEFAULT 0,
  eta                 text,
  semaforo            text DEFAULT 'verde' CHECK (semaforo IN ('verde', 'amarillo', 'rojo')),
  ultimo_evento       text,
  correos_pendientes  integer DEFAULT 0,
  cpsia_pendiente     boolean DEFAULT false,
  monday_item_id      text,
  activa              boolean DEFAULT true,
  creado_en           timestamptz DEFAULT now(),
  actualizado_en      timestamptz DEFAULT now()
);

-- ── Historial de eventos por carga (timeline) ────────────────────
CREATE TABLE IF NOT EXISTS historial_eventos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ccs           text NOT NULL REFERENCES cargas(ccs) ON DELETE CASCADE,
  tipo          text NOT NULL CHECK (tipo IN (
                  'correo_recibido', 'correo_enviado',
                  'monday', 'alerta', 'confirmacion', 'reintento')),
  icono         text,
  texto         text NOT NULL,
  detalle       text,
  adjunto       text,
  fecha_evento  timestamptz DEFAULT now(),
  creado_en     timestamptz DEFAULT now()
);

-- ── Estado de campos requeridos por carga y etapa ───────────────
CREATE TABLE IF NOT EXISTS campos_etapa (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ccs           text NOT NULL REFERENCES cargas(ccs) ON DELETE CASCADE,
  etapa_idx     integer NOT NULL,
  campo_nombre  text NOT NULL,
  completado    boolean DEFAULT false,
  creado_en     timestamptz DEFAULT now(),
  UNIQUE (ccs, etapa_idx, campo_nombre)
);

-- ── Plantillas de correo y WhatsApp ─────────────────────────────
CREATE TABLE IF NOT EXISTS plantillas (
  id              text PRIMARY KEY,
  nombre          text NOT NULL,
  etapa_idx       integer,
  trigger_desc    text,
  destino         text,
  canal           text NOT NULL CHECK (canal IN ('email', 'wa')),
  activa          boolean DEFAULT true,
  asunto          text,
  cuerpo          text NOT NULL,
  creado_en       timestamptz DEFAULT now(),
  actualizado_en  timestamptz DEFAULT now()
);

-- ── Hilos de correo agrupados por CCS ───────────────────────────
CREATE TABLE IF NOT EXISTS correos_hilo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ccs         text NOT NULL REFERENCES cargas(ccs) ON DELETE CASCADE,
  etapa_idx   integer,
  creado_en   timestamptz DEFAULT now()
);

-- ── Mensajes individuales dentro de un hilo ─────────────────────
CREATE TABLE IF NOT EXISTS mensajes_correo (
  id              text PRIMARY KEY,
  hilo_id         uuid NOT NULL REFERENCES correos_hilo(id) ON DELETE CASCADE,
  ccs             text NOT NULL,
  de_nombre       text NOT NULL,
  de_email        text NOT NULL,
  asunto          text NOT NULL,
  cuerpo          text,
  resumen         text,
  tipo            text NOT NULL CHECK (tipo IN ('recibido', 'enviado')),
  confianza       integer CHECK (confianza BETWEEN 0 AND 100),
  confirmado      boolean DEFAULT false,
  adjuntos        jsonb DEFAULT '[]',
  fecha_mensaje   timestamptz DEFAULT now(),
  creado_en       timestamptz DEFAULT now()
);

-- ── Alertas del sistema ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas (
  id          text PRIMARY KEY,
  ccs         text NOT NULL REFERENCES cargas(ccs) ON DELETE CASCADE,
  semaforo    text NOT NULL CHECK (semaforo IN ('rojo', 'amarillo', 'verde')),
  icono       text,
  tipo        text NOT NULL,
  mensaje     text NOT NULL,
  resuelta    boolean DEFAULT false,
  creado_en   timestamptz DEFAULT now()
);

-- ── Destinatarios para notificaciones masivas ────────────────────
CREATE TABLE IF NOT EXISTS destinatarios_masivo (
  id        text PRIMARY KEY,
  nombre    text NOT NULL,
  rol       text,
  telefono  text,
  email     text,
  canales   jsonb DEFAULT '[]',
  activo    boolean DEFAULT true
);

-- ── Índices para consultas frecuentes ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_historial_ccs         ON historial_eventos(ccs);
CREATE INDEX IF NOT EXISTS idx_historial_tipo        ON historial_eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_historial_fecha       ON historial_eventos(fecha_evento DESC);
CREATE INDEX IF NOT EXISTS idx_campos_ccs            ON campos_etapa(ccs);
CREATE INDEX IF NOT EXISTS idx_mensajes_hilo         ON mensajes_correo(hilo_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_ccs          ON mensajes_correo(ccs);
CREATE INDEX IF NOT EXISTS idx_alertas_ccs           ON alertas(ccs);
CREATE INDEX IF NOT EXISTS idx_alertas_semaforo      ON alertas(semaforo);
CREATE INDEX IF NOT EXISTS idx_cargas_semaforo       ON cargas(semaforo);
CREATE INDEX IF NOT EXISTS idx_cargas_etapa          ON cargas(etapa_idx);
