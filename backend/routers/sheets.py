from fastapi import APIRouter

router = APIRouter()

# TODO (Semana 7): Google Sheets API — CPSIA module
# POST /sheets/cpsia/analizar       → read proforma sheet, analyze products vs CPSIA rules
# POST /sheets/cpsia/crear-filtro   → create "CPSIA Filtro" tab in same sheet (never modifies original)
