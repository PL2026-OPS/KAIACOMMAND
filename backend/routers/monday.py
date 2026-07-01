from fastapi import APIRouter

router = APIRouter()

# TODO (Semana 1): Monday.com GraphQL API v2
# GET  /monday/cargas          → fetch all active loads across 7 boards, unified by CCS
# GET  /monday/cargas/{ccs}    → single load detail
# POST /monday/updates         → post a confirmed email update to a Monday item
# POST /monday/webhooks        → receive Monday.com webhook events

# Tablero real de producción Sicoben — actualizado Jun 2026
BOARD_ID = 18419071056

# IDs anteriores (referencia histórica — ya no en uso)
# BOARD_IDS = { "E1": 18398325293, "E2": 18398330011, ... }

WORKSPACE_ID = 14162882
