# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @DOCS/masterplan.md.md for the full PRD — features, user flows, wireframe descriptions, and acceptance criteria.

## Project Status

**Planning phase** — PRD v3.0, June 2026. No code exists yet. Follow the conventions below from the first commit.

## Commands

```bash
# Frontend (Vite dev server — opens browser automatically)
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build

# Backend (FastAPI)
uvicorn backend.main:app --reload            # http://localhost:8000
pytest backend/tests/ -x                     # run tests, stop on first failure
pytest backend/tests/test_clasificador.py    # single test module
ruff check backend/                          # lint
ruff format backend/                         # format

# Webhooks (local dev — required for Monday.com events)
ngrok http 8000
```

Pages served by Vite: `/` (landing/login), `/admin.html`, `/portal.html`.

## Code Style

### Python
- `async def` for all route handlers and service functions
- Type-annotate every function signature; use Pydantic models for all request/response bodies
- Routers in `backend/routers/`, business logic in `backend/services/` — never mix them
- Load all credentials via `python-dotenv`; no hardcoded IDs or tokens anywhere in source

### JavaScript
- ES module syntax (`import`/`export`) only — no CommonJS `require()`
- Vanilla DOM only — no React, Vue, jQuery, or axios
- `fetch()` for all HTTP calls
- All colors and font sizes as CSS custom properties — no hex literals in JS

## Architecture

### Two Access Layers

- **Admin** (`/admin`) — Full operations center. Users: Paulet (primary), Sr. Daniel, Jenny.
- **Portal** (`/portal`) — Read-only, filtered by load stage and user role. Users: Yonaida, Ruth, María, Aixa, Orlando.

IMPORTANT: Portal field visibility (supplier name, BL number, container, customs agent, costs) is controlled by per-user configuration stored in the database (Panel 10 — Configuración). Never hardcode visibility rules in route logic or templates.

### CCS Code — Master Key

Every load has a CCS code (e.g., `2025C-FCL`). This is the only stable identifier across all 7 Monday.com boards — item IDs change when a load migrates between boards. ALWAYS key lookups, comment syncing, and history records by CCS code, never by Monday item ID.

### Monday.com Boards

Workspace: `14162882`. Use GraphQL API v2 for all operations.

| Stage | Name | Board ID |
|-------|------|----------|
| E1 | ORIGEN | `18398325293` |
| E2 | COTIZACIONES | `18398330011` |
| E3 | PROFORMA | `18398330342` |
| E4 | DISEÑO | `18398331388` |
| E5 | COMERCIAL | `18398347387` |
| E6 | FABRICACIÓN | `18398348560` |
| E7 | TRÁFICO | `18398349721` |

### External Service Constraints

| Service | Non-obvious constraint |
|---------|----------------------|
| Gmail API | 15-min polling; read and send as Paulet's account, not a service account |
| Google Sheets API | CPSIA analysis creates a new "CPSIA Filtro" tab — NEVER modifies the original sheet |
| Wassenger (WhatsApp) | Hard cap: 10 alerts/day to Paulet. Silently fall back to email if Wassenger fails |
| Anthropic Claude API | Returns classification suggestions with confidence scores only — never writes to Monday |
| Monday.com | No sandbox — all local dev tests run against the real workspace boards |

## Critical Rules

**YOU MUST: Require explicit human approval before every Monday.com write.** The AI email classifier suggests which load an email belongs to, with a confidence score. Paulet clicks Confirm — then and only then does the system post to Monday. Do not add auto-confirm shortcuts, even for high-confidence matches.

**YOU MUST: Zero false negatives in the CPSIA module.** When a load enters E3, every product in the proforma Google Sheet is analyzed against CPSIA rules. When in doubt, flag the product. A missed flag on a children's product is a safety failure — err toward over-flagging.

**YOU MUST: Cap email retries at 2.** After sending a supplier email, start a 48h timer. Auto-resend once with `[Follow-up]` in the subject if no response. After a second retry with no response, fire an escalation alert and stop. Never send a third automated email.

## Design System

**Fonts:** Fraunces (titles, KAIA logo), Inter (body), JetBrains Mono (CCS codes and all IDs), Comfortaa 700 (the "sicoben" wordmark — each letter uses a different stage color).

**Stage colors — define as CSS variables, reference by name everywhere:**
```css
--e1: #3BB8E8;  /* Origen      */
--e2: #7B4CA8;  /* Cotizaciones */
--e3: #F5A623;  /* Proforma    */
--e4: #E8357A;  /* Diseño      */
--e5: #F06B35;  /* Comercial   */
--e6: #8DC63F;  /* Fabricación */
--e7: #2ABDA8;  /* Tráfico     */
```

**Neutral palette:** Background `#FAF7F0` · Cards `#FFFFFF` · Sidebar `#13141A` · Welcome screen gradient `#1A1F2E → #08090D`.

## Environment Variables

Required in `.env` — never commit this file:

```
ANTHROPIC_API_KEY=
MONDAY_API_TOKEN=
MONDAY_WEBHOOK_TOKEN=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=
WASSENGER_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

## Workflow

- Branch prefixes: `feature/`, `fix/`, `chore/` — e.g., `feature/f02-email-classifier`
- Before committing backend changes: run `ruff check` and `pytest -x`
- Monday.com integration has no sandbox — test against real boards carefully and prefer read operations during development
