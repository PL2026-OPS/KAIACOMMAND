from fastapi import APIRouter

router = APIRouter()

# TODO (Semana 1): Google OAuth 2.0 flow
# GET /auth/google        → redirect to Google consent screen
# GET /auth/callback      → exchange code for tokens, create session
# POST /auth/logout       → clear session
