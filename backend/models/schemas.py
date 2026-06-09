from pydantic import BaseModel
from typing import Optional
from enum import Enum


class Etapa(str, Enum):
    E1 = "E1"
    E2 = "E2"
    E3 = "E3"
    E4 = "E4"
    E5 = "E5"
    E6 = "E6"
    E7 = "E7"


class EstadoSemaforo(str, Enum):
    verde    = "verde"
    amarillo = "amarillo"
    rojo     = "rojo"
    gris     = "gris"


class Carga(BaseModel):
    ccs: str                          # e.g. "2025C-FCL" — master key
    nombre: str
    etapa_actual: Etapa
    proveedor: Optional[str] = None   # hidden from portal by default
    semaforo: EstadoSemaforo = EstadoSemaforo.gris
    dias_en_etapa: int = 0
    eta: Optional[str] = None
    alerta: bool = False


class CorreoClasificado(BaseModel):
    email_id: str
    ccs_sugerido: str
    confianza: float                  # 0.0–1.0
    justificacion: str


class ConfirmacionClasificacion(BaseModel):
    email_id: str
    ccs_confirmado: str
    usuario_id: str
