# Cómo configurar la base de datos

## Paso 1 — Crear las tablas

1. Abre [supabase.com](https://supabase.com) → inicia sesión
2. Entra al proyecto **KAIA Command** (ubhgvnwtavkxsanljnel)
3. En el menú izquierdo ve a **SQL Editor**
4. Clic en **New query**
5. Copia y pega el contenido de `schema.sql`
6. Clic en **Run** (o Ctrl+Enter)

Deberías ver: `Success. No rows returned`

## Paso 2 — Insertar datos de prueba

1. En el mismo **SQL Editor** → **New query**
2. Copia y pega el contenido de `seed.sql`
3. Clic en **Run**

Deberías ver: `Success. N rows affected`

## Paso 3 — Verificar

Ve a **Table Editor** en el menú. Deberías ver 8 tablas:
- `usuarios` — 8 filas
- `cargas` — 4 filas
- `historial_eventos` — 12 filas
- `campos_etapa` — 25 filas
- `plantillas` — 5 filas
- `correos_hilo` — 2 filas
- `mensajes_correo` — 3 filas
- `alertas` — 5 filas
- `destinatarios_masivo` — 4 filas

## Paso 4 — El frontend ya está conectado

El archivo `src/js/admin.js` ya carga datos de Supabase automáticamente.
Las credenciales están en `.env.local` (ya configurado por Vercel).

Para probar localmente:
```
npm run dev
```

El dashboard cargará primero con datos mock (instantáneo) y luego
reemplazará con los datos reales de Supabase en segundo plano.
