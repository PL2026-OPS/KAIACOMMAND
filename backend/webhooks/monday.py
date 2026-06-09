from fastapi import APIRouter, Request

router = APIRouter()

# Monday.com sends a challenge on webhook registration — must echo it back
@router.post("/monday/webhooks")
async def monday_webhook(request: Request):
    payload = await request.json()

    # Challenge handshake
    if "challenge" in payload:
        return {"challenge": payload["challenge"]}

    # TODO: route event to appropriate service
    # event_type = payload.get("event", {}).get("type")
    return {"status": "received"}
