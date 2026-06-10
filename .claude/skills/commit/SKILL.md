---
name: commit
description: Guarda cambios con git commit y push siguiendo las convenciones del proyecto. Activar cuando el usuario diga "guarda los cambios", "haz commit", "sube el código", "push", "guarda esto", "commitea".
---

# Commit y push a staging

## Regla principal

**Todos los commits van a `staging`.** Nunca a `main` directamente.
Si el usuario pide publicar a producción → usar la skill `publicar`.

## Verificación previa

```bash
git branch --show-current   # debe decir "staging"
git status                  # ver qué archivos cambiaron
git diff --stat             # resumen de cambios
```

Si la rama no es `staging`:
```bash
git checkout staging
```

## Backend: correr checks antes de commitear

Si los cambios incluyen archivos `.py`:
```bash
ruff check backend/
# Si hay errores, corregirlos antes de continuar
```

No hay suite de tests todavía — cuando exista: `pytest backend/tests/ -x`

## Nunca incluir en el commit

- `.env` / `.env.local` / `.env.*.local` — ya están en `.gitignore`
- `node_modules/`
- `dist/`
- `*.json` de credenciales (service_account.json, token.json)
- El archivo `scripts/screenshot.mjs` y sus `.png` generados

## Formato del mensaje de commit

Usar conventional commits:
```
feat: descripción corta en español o inglés
fix: descripción del bug corregido
chore: cambio de configuración, dependencias, docs
refactor: reorganización sin cambio de comportamiento
```

Primera línea: máximo 72 caracteres.
Si hace falta, segunda línea en blanco + descripción larga.

Siempre terminar con:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Comando completo

```bash
git add [archivos específicos]   # nunca "git add -A" sin revisar
git commit -m "$(cat <<'EOF'
tipo: descripción del cambio

Detalle adicional si es necesario.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin staging
```

## Después del push

Vercel genera automáticamente una URL de preview para staging.
Mencionar al usuario que puede ver el cambio en el preview de Vercel
antes de publicar a producción.
