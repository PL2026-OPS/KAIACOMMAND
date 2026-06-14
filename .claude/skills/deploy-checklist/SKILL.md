---
name: deploy-checklist
description: Checklist obligatorio antes de subir a producción. Invocar SIEMPRE antes de un push o merge a la rama main (publicar, "subir a producción", "prod", "la web"). En este repo los commits van a staging; main = producción.
---

# Checklist pre-deploy — KAIA Command

**Contexto del proyecto:** lo que se publica a producción es el **frontend Vite** (HTML/CSS/JS) desplegado en **Vercel** (proyecto `kaiacommand`). El backend FastAPI (`backend/`) hoy está esqueletado y NO se despliega aún. La BD es **Supabase**. Los commits normales van a `staging`; subir a `main` = publicar (ver la skill `publicar`).

Antes de pushear/mergear a `main`, verifica en este orden. **Si algo falla, NO publicar — corregir primero y reportar.**

## 1. El build pasa limpio
```bash
npm run build        # Vite → dist/  · debe terminar sin errores ni warnings
```
- Si tocaste el backend Python, además: `ruff check backend/` (lint).
- Aún no hay suite de tests; cuando exista: `pytest backend/tests/ -x`.

## 2. Sin logs de debug en código que se publica
El frontend (`src/`) es lo que llega al usuario:
```bash
rg -n "console\.(log|debug|info)" src/
```
- Si tocaste backend: `rg -n "(^|\s)(print|breakpoint)\(" backend/`
- Borra los que sean de depuración. Un `console.error` legítimo para manejo de errores puede quedarse.

## 3. Sin credenciales hardcodeadas
Busca secretos reales en el código (NO en `.env*` ni `node_modules`):
```bash
rg -n "re_[A-Za-z0-9]{16,}|sk-ant-|eyJ[A-Za-z0-9_-]{20,}|postgres://|service_role|whsec_|pk_live|sk_live" src/ backend/
```
Patrones por servicio de este proyecto: `re_` (Resend), `sk-ant-` (Anthropic), `eyJ…` (JWT de Supabase/Monday), `service_role`/`SUPABASE_SECRET_KEY`, `postgres://`.
- **Confirma** que `.env` y `.env.local` están en `.gitignore` y no se commitearon: `git check-ignore .env.local`
- **Ítem conocido:** `src/js/auth.js` tiene un login mock con `DEFAULT_PASSWORD = 'kaia2025'`. Es aceptable solo mientras sea demo interna pre-lanzamiento. Antes de un lanzamiento real, migrar a Supabase Auth — no es un secreto filtrado, pero sí auth hardcodeada.

## 4. Variables de entorno dadas de alta en Vercel
Toda variable nueva en `.env.local` debe existir también en Vercel:
```bash
vercel env ls                        # comparar contra tu .env.local
vercel env add NOMBRE production     # dar de alta la que falte
```
- Variables actuales esperadas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`.
- Recuerda: las variables que el **frontend** necesita en build deben llevar prefijo `VITE_` (las demás no se exponen al bundle).

## 5. Cambios de schema aplicados en la BD de producción
- Si cambiaste tablas, columnas, políticas RLS o funciones en **Supabase**, verifica que estén aplicados en el **proyecto de Supabase de producción** (el cuyo `VITE_SUPABASE_URL` está en las env de Production de Vercel), no solo en local/dev.
- No hay migraciones versionadas en el repo: los cambios se hacen vía el dashboard de Supabase / MCP. Revísalo manualmente en ese proyecto.

## 6. Flujo principal probado en local
```bash
npm run dev          # http://localhost:5173
```
Recorre el camino de un usuario real de principio a fin:
- Abrir `/` → iniciar sesión (ej. `asistente.direccion@sicobenediciones.com` / `kaia2025`).
- Confirmar el redirect correcto: admin → `/admin.html`, portal → `/portal.html`, y que los paneles/datos cargan.
- Si tocaste páginas públicas (legales, cookies): verifica que renderizan y que el banner de cookies aparece/guarda preferencia.

---

**Regla final:** si cualquier punto falla, **NO hagas el push/merge a `main`**. Corrige, vuelve a verificar y reporta el resultado.
