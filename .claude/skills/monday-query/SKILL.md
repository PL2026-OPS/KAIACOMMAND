---
name: monday-query
description: Construye o ejecuta operaciones con la API de Monday.com. Activar cuando el usuario mencione Monday, tableros, cargas de Monday, "lee las cargas", "publica un update", "conecta el board", o cualquier operación con los 7 tableros de producción.
---

# Trabajar con Monday.com

## Regla crítica — leer antes de cualquier acción

**NUNCA escribir en Monday sin confirmación explícita de Paulet.**
El clasificador de IA sugiere — Paulet confirma — solo entonces se publica.
No hay excepciones, ni siquiera para confianza del 99%.

## Credenciales y workspace

```
Workspace ID: 14162882
API: GraphQL v2 — https://api.monday.com/v2
Header: Authorization: Bearer ${MONDAY_API_TOKEN}
```

Variable de entorno: `MONDAY_API_TOKEN` (server-only, sin prefijo VITE_)

## Los 7 boards — IDs exactos

| Etapa | Nombre | Board ID |
|---|---|---|
| E1 | ORIGEN | `18398325293` |
| E2 | COTIZACIONES | `18398330011` |
| E3 | PROFORMA | `18398330342` |
| E4 | DISEÑO | `18398331388` |
| E5 | COMERCIAL | `18398347387` |
| E6 | FABRICACIÓN | `18398348560` |
| E7 | TRÁFICO | `18398349721` |

## La llave maestra: código CCS

- El CCS (ej: `2025C-FCL`) es el único identificador estable de una carga.
- Los item IDs de Monday cambian cuando una carga migra de board.
- **SIEMPRE** buscar, linkear e historializar por CCS, nunca por item ID.
- Un proveedor que escribe sobre 3 cargas → 3 hilos separados por CCS.

## Queries GraphQL frecuentes

### Leer items de un board
```graphql
query {
  boards(ids: [18398325293]) {
    items_page(limit: 50) {
      items {
        id
        name
        column_values {
          id
          text
          value
        }
      }
    }
  }
}
```

### Buscar item por nombre (CCS)
```graphql
query {
  items_by_column_values(
    board_id: 18398325293,
    column_id: "name",
    column_value: "2025C-FCL"
  ) {
    id
    name
  }
}
```

### Publicar update (solo tras confirmación de Paulet)
```graphql
mutation {
  create_update(
    item_id: ITEM_ID,
    body: "📧 Correo de proveedor — [FECHA]\nDe: ...\nResumen: ..."
  ) {
    id
  }
}
```

## Formato del update en Monday

```
📧 Correo de proveedor — [FECHA Y HORA]
De: [nombre] <correo@proveedor.com>
Asunto: [asunto original]
Resumen: [generado por IA en español, 2-3 líneas]
[Adjuntos] | [Link al correo en Gmail]
```

## Cliente HTTP para las queries

```ts
// backend/services/monday.py (Python) o lib/monday.ts (Node)
const MONDAY_API = 'https://api.monday.com/v2'

async function mondayQuery(query: string, variables = {}) {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query, variables }),
  })
  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0].message)
  return data
}
```

## Advertencias importantes

- **No hay sandbox** — todas las operaciones son contra los boards reales de Sicoben.
- Preferir lecturas en desarrollo; las escrituras requieren confirmación.
- Si el webhook token no coincide con `MONDAY_WEBHOOK_TOKEN`, rechazar la request.
- Los webhooks llegan a `POST /webhooks/monday` en el backend FastAPI.
