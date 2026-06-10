---
name: conectar-servicio
description: Integra un servicio externo nuevo (SDK, API, cliente) siguiendo el patrón del proyecto. Activar cuando el usuario diga "quiero conectar X", "instala el SDK de Y", "agrega la integración con Z", "necesito usar la API de X".
---

# Conectar un servicio externo

## Patrón estándar del proyecto

Cada servicio externo sigue exactamente este flujo. No improvisar.

## Pasos (en orden)

### 1. Instalar el SDK

```bash
npm install nombre-del-sdk
```

### 2. Crear el cliente en `lib/`

Archivo: `lib/nombre-servicio.ts`

Reglas del cliente:
- Usar `process.env.NOMBRE_VARIABLE` (nunca hardcodear credenciales)
- Exportar una instancia singleton reutilizable
- Exportar helpers tipados para las operaciones más comunes
- Variables prefijadas con `VITE_` solo si el cliente se usa en el **browser**
- Variables sin prefijo para clientes **server-only** (nunca exponer al browser)

```ts
// Ejemplo de estructura
import { ClienteSDK } from 'nombre-sdk'

export const cliente = new ClienteSDK(process.env.NOMBRE_API_KEY)

export async function operacionHelper(params) {
  const { data, error } = await cliente.operacion(params)
  if (error) throw new Error(`Error servicio: ${error.message}`)
  return data
}
```

### 3. Agregar la variable al `.env.local`

Leer el archivo primero, luego agregar al final:
```
NOMBRE_VARIABLE="valor_real_aquí"
```

Verificar que `.env.local` está en `.gitignore` (ya está configurado como `.env*`).

### 4. Sincronizar con Vercel

Después de que el usuario agregue la variable en Vercel (Settings → Environment Variables):
```bash
vercel env pull .env.local
```

### 5. Decirle al usuario exactamente qué crear en Vercel

Formato de entrega:
| Variable | Descripción | Entornos |
|---|---|---|
| `NOMBRE_VAR` | Para qué sirve | Production, Preview, Development |

### 6. Commit a staging

```bash
git add lib/nombre-servicio.ts package.json package-lock.json
git commit -m "feat: add NombreServicio client and helpers"
git push
```

## Variables browser vs server

| Prefijo | Dónde funciona | Cuándo usar |
|---|---|---|
| `VITE_NOMBRE` | Browser + server | Claves públicas (publishable, anon) |
| `NOMBRE` sin prefijo | Solo server/Node.js | Claves secretas (secret, service_role) |

## Servicios ya integrados

| Servicio | Archivo | Variables |
|---|---|---|
| Supabase (browser) | `lib/supabase.ts` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Supabase (admin) | `lib/supabase.ts` | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` |
| Resend (email) | `lib/resend.ts` | `RESEND_API_KEY` |
