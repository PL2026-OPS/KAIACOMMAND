from fastapi import APIRouter

router = APIRouter()

# TODO (Semana 1): Monday.com GraphQL API v2
# GET  /monday/cargas          → fetch all active loads across 7 boards, unified by CCS
# GET  /monday/cargas/{ccs}    → single load detail
# POST /monday/updates         → post a confirmed email update to a Monday item
# POST /monday/webhooks        → receive Monday.com webhook events

BOARD_IDS = {
    "E1": 18398325293,
    "E2": 18398330011,
    "E3": 18398330342,
    "E4": 18398331388,
    "E5": 18398347387,
    "E6": 18398348560,
    "E7": 18398349721,
}

WORKSPACE_ID = 14162882
