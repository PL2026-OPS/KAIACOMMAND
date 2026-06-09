from fastapi import APIRouter

router = APIRouter()

# TODO (Semana 3): AI email classifier (Claude API)
# POST /clasificador/analizar       → classify an email → returns CCS suggestion + confidence
# POST /clasificador/confirmar      → Paulet confirms the suggestion → triggers Monday write
# Rule: NEVER write to Monday without explicit confirmation (confidence irrelevant)
