from fastapi import APIRouter

router = APIRouter()

# TODO (Semana 5): Wassenger API — WhatsApp alerts
# POST /whatsapp/alerta        → send alert to Paulet (+507 6405-6552)
# Max 10 alerts/day per number; falls back to email if Wassenger fails
# Alert types: nuevo_correo | carencia | reintento | cpsia | inactividad | escalada
