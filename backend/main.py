from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="KAIA Command Central",
    version="1.0.0",
    description="Sistema interno de control de producción — Sicoben Ediciones",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (uncomment as each module is built)
# from backend.routers import auth, monday, gmail, sheets, whatsapp, clasificador
# app.include_router(auth.router,         prefix="/auth",         tags=["auth"])
# app.include_router(monday.router,       prefix="/monday",       tags=["monday"])
# app.include_router(gmail.router,        prefix="/gmail",        tags=["gmail"])
# app.include_router(sheets.router,       prefix="/sheets",       tags=["sheets"])
# app.include_router(whatsapp.router,     prefix="/whatsapp",     tags=["whatsapp"])
# app.include_router(clasificador.router, prefix="/clasificador", tags=["clasificador"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "KAIA Command Central", "version": "1.0.0"}
