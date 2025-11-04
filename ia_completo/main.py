import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date
from typing import List
from dateutil.relativedelta import relativedelta  # Para calcular edad

app = FastAPI(
    title="SIAE - Servicio de IA",
    description="Microservicio para predicción de riesgo académico.",
    version="1.1.0"
)

# --- Modelos de Datos (DTOs en Python) ---

class AlumnoInput(BaseModel):
    """Datos de entrada para un solo alumno"""
    alumno_id: int
    fecha_nacimiento: date
    curso_orden: int
    nivel_id: int
    notas_evaluacion: List[float]

class PredictionRequest(BaseModel):
    """Petición de predicción individual o por centro (GESTOR)"""
    alumnos_data: List[AlumnoInput]

class AlumnoEnRiesgoResponse(BaseModel):
    """Respuesta para predicción de riesgo"""
    alumno_id: int
    probabilidad_riesgo: float
    motivo_principal: str


# --- NUEVOS MODELOS PARA ADMIN ---
class AlumnoInputAgregado(AlumnoInput):
    """Extiende AlumnoInput con información de provincia"""
    provincia: str

class AggregationRequest(BaseModel):
    """Petición de agregación de ADMIN"""
    alumnos_data: List[AlumnoInputAgregado]

class RiesgoProvinciaResponse(BaseModel):
    """Respuesta agregada por provincia (para mapa de calor)"""
    provincia: str
    porcentaje_riesgo: float
    total_alumnos: int
    total_en_riesgo: int


# --- Función Modularizada ---
def calcular_riesgo_heuristico(alumno: AlumnoInput):
    """
    Lógica heurística centralizada.
    Devuelve (probabilidad, motivo).
    """
    if not alumno.notas_evaluacion:
        return 0.0, "Sin notas"

    probabilidad = 0.0
    motivo = "Rendimiento estable"

    # Feature 1: Nota media
    nota_media_ev = sum(alumno.notas_evaluacion) / len(alumno.notas_evaluacion)
    if nota_media_ev < 5.0:
        probabilidad += 0.4
        motivo = f"Nota media baja ({nota_media_ev:.1f})"
    elif nota_media_ev < 6.0:
        probabilidad += 0.2
        motivo = f"Nota media ajustada ({nota_media_ev:.1f})"

    # Feature 2: Edad vs Curso
    edad_esperada = (alumno.curso_orden - 1) + 6
    if alumno.nivel_id == 3:  # ESO
        edad_esperada += 6
    elif alumno.nivel_id == 4:  # Bachillerato
        edad_esperada += 10

    edad_alumno = relativedelta(date.today(), alumno.fecha_nacimiento).years
    if edad_alumno >= edad_esperada + 2:
        probabilidad += 0.4
        motivo += " | Edad > 2 años de la esperada"
    elif edad_alumno == edad_esperada + 1:
        probabilidad += 0.2

    # Límite superior
    if probabilidad > 0.95:
        probabilidad = 0.95

    return probabilidad, motivo


# --- Endpoint de Predicción (para GESTOR) ---
@app.post("/predict", response_model=List[AlumnoEnRiesgoResponse])
def predecir_riesgo_alumnos(request: PredictionRequest):
    """
    Recibe una lista de alumnos de un centro y devuelve los que están en riesgo.
    """
    alumnos_en_riesgo = []
    for alumno in request.alumnos_data:
        probabilidad, motivo = calcular_riesgo_heuristico(alumno)
        if probabilidad >= 0.5:
            alumnos_en_riesgo.append(
                AlumnoEnRiesgoResponse(
                    alumno_id=alumno.alumno_id,
                    probabilidad_riesgo=probabilidad,
                    motivo_principal=motivo
                )
            )

    alumnos_en_riesgo.sort(key=lambda x: x.probabilidad_riesgo, reverse=True)
    return alumnos_en_riesgo


# --- NUEVO: Endpoint de Agregación (para ADMIN) ---
@app.post("/predict/aggregation", response_model=List[RiesgoProvinciaResponse])
def predecir_riesgo_agregado(request: AggregationRequest):
    """
    Recibe una lista de TODOS los alumnos (con provincia) y devuelve
    el riesgo agregado por provincia.
    """
    predicciones = {}  # { "Provincia": {"total": 0, "en_riesgo": 0, "suma_prob": 0.0} }

    for alumno in request.alumnos_data:
        provincia = alumno.provincia
        if provincia not in predicciones:
            predicciones[provincia] = {"total": 0, "en_riesgo": 0, "suma_prob": 0.0}

        predicciones[provincia]["total"] += 1

        probabilidad, _ = calcular_riesgo_heuristico(alumno)
        if probabilidad >= 0.5:
            predicciones[provincia]["en_riesgo"] += 1
            predicciones[provincia]["suma_prob"] += probabilidad

    # Preparar respuesta
    response = []
    for provincia, data in predicciones.items():
        if data["total"] > 0:
            media_riesgo = (data["suma_prob"] / data["en_riesgo"]) if data["en_riesgo"] > 0 else 0.0
            response.append(
                RiesgoProvinciaResponse(
                    provincia=provincia,
                    porcentaje_riesgo=media_riesgo,
                    total_alumnos=data["total"],
                    total_en_riesgo=data["en_riesgo"]
                )
            )

    return response


@app.get("/")
def read_root():
    return {"servicio": "ia-siae", "status": "online"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
