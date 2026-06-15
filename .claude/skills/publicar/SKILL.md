---
name: publicar
description: Merge staging → main y despliega a producción en Vercel. Activar cuando el usuario diga "publica", "sube a producción", "mergea a main", "que los usuarios vean esto", "la web", "publicar", "subir a producción", "prod", "online".
---

# Publicar a producción

## Antes de hacer nada

1. Confirma con el usuario qué cambios van a producción — nunca asumas que TODO staging está listo.
2. Verifica que estás en `staging`:
   ```bash
   git branch --show-current
   git status
   ```
3. Si hay cambios sin commitear, párate y pregunta si los incluye o no.

## Reglas críticas

- **NUNCA** hagas `git push --force` a `main`.
- **NUNCA** mergees si hay conflictos sin resolverlos primero.
- Si el usuario dice "solo el último cambio" — haz cherry-pick, no merge completo.
- Pide confirmación explícita antes del merge. Una vez en main, Vercel despliega automáticamente.

## Gate de seguridad (pre-push hook)

Existe un hook `.githooks/pre-push` que **bloquea cualquier push a `main`** salvo
que esté confirmado. Cuando publicas desde aquí (sesión no interactiva), DEBES:

1. Mostrar al usuario, EN LENGUAJE CLARO, qué archivos cambian y un resumen de cada cambio:
   ```bash
   git log --oneline origin/main..staging
   git diff --stat origin/main..staging
   ```
2. Pedir confirmación explícita "sí/no". Si dice "no" → **no publiques**.
3. Solo tras el "sí", haz el push a main con el override que el hook exige:
   ```bash
   KAIA_ALLOW_MAIN_PUSH=1 git push origin main
   ```
   Sin esa variable el hook frena el push (fail-closed). **Nunca** la setees
   antes de tener el "sí" del usuario.

## Flujo estándar

```bash
# 1. Asegurarse de que staging está al día
git checkout staging
git pull origin staging

# 2. Cambiar a main y mergear
git checkout main
git pull origin main
git merge staging --no-ff -m "chore: merge staging → main [fecha]"

# 3. Push a main — requiere confirmación del usuario (ver "Gate de seguridad").
#    Solo tras su "sí". Esto dispara el deploy en Vercel automáticamente.
KAIA_ALLOW_MAIN_PUSH=1 git push origin main

# 4. Volver a staging para seguir trabajando
git checkout staging
```

## Verificar el deploy

```bash
# Ver estado del último deployment
vercel ls --prod 2>/dev/null | head -5
```

O dile al usuario que abra: **https://kaiacommand.vercel.app**

## Después del merge

- Confirma al usuario la URL de producción: `https://kaiacommand.vercel.app`
- Menciona que staging sigue apuntando al preview de Vercel
- NO elimines la rama staging — es permanente en este proyecto
