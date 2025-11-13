import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
import time
from siae_ml.data_loader import extraer_datos
from siae_ml.features import prepare_features
from siae_ml.model_trainer import load_models
from siae_ml.predictor import (
    predecir_por_alumno_asignaturas,
    predicciones_agregadas,
    predecir_rendimiento_por_asignatura,
)
from typing import List, Literal
from joblib import Memory
from concurrent.futures import ThreadPoolExecutor

# ===============================
# CONFIGURACIÓN FASTAPI
# ===============================
app = FastAPI(
    title="SIAE - Microservicio de IA",
    description="Servicio central de predicciones ML (individuales, agregadas y por asignatura).",
    version="2.0.0",
)


# ===============================
# FUNCIONES AUXILIARES
# ===============================
def limpiar_numpy(data):
    """Convierte recursivamente cualquier valor numpy a tipo Python nativo."""
    if isinstance(data, dict):
        return {k: limpiar_numpy(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [limpiar_numpy(v) for v in data]
    elif isinstance(data, np.integer):
        return int(data)
    elif isinstance(data, np.floating):
        return float(data)
    elif isinstance(data, np.ndarray):
        return data.tolist()
    else:
        return data


memory = Memory(location="cache", verbose=0)

@memory.cache
def predecir_cacheado(ids_tuple):
    ids = list(ids_tuple)

    # Vectorización: procesar todos los alumnos en un único batch
    df_filtrado = df[df["alumno_id"].isin(ids)]
    if df_filtrado.empty:
        return []

    resultados = []

    # Paralelización: si hay varios modelos, ejecutarlos en paralelo
    def procesar(alumno_id):
        try:
            pred = predecir_por_alumno_asignaturas(
                modelos, encoders, alumno_id, df_filtrado
            )
            return pred
        except Exception as e:
            return {"alumno_id": alumno_id, "error": str(e)}

    with ThreadPoolExecutor(max_workers=8) as executor:
        resultados = list(executor.map(procesar, ids))

    return resultados

@memory.cache
def predicciones_agregadas_cacheadas(nivel: str):
    print(f"🔁 Calculando predicciones agregadas para nivel: {nivel}")
    preds = predicciones_agregadas(df, modelos, nivel=nivel)
    return {
        "nivel": nivel,
        "agregados": preds["agregados"].to_dict(orient="records"),
        "tendencias": preds["tendencias"].to_dict(orient="records"),
        "disparidades": preds["disparidades"].to_dict(orient="records"),
    }

@memory.cache
def rendimiento_cacheado():
    print("🔁 Calculando predicción de rendimiento por asignatura...")
    df_pred_rend = predecir_rendimiento_por_asignatura(df, modelos["susp_asig"])
    return {"resultados": df_pred_rend.to_dict(orient="records")}



# ===============================
# CARGA DE MODELOS Y DATOS
# ===============================
print("🔄 Cargando modelos y datos de SIAE ML...")
modelos, encoders = load_models()
df = extraer_datos()
df, _ = prepare_features(df)
print("✅ Modelos y datos listos.")


# ===============================
# SCHEMAS DE ENTRADA/SALIDA
# ===============================
class AlumnoRequest(BaseModel):
    alumno_ids: List[int]


class AgregacionRequest(BaseModel):
    nivel: Literal["centro_educativo_id", "provincia"]


# ===============================
# ENDPOINT 1: Predicción individual / por alumnos
# ===============================
@app.post("/predict/alumnos")
def predict_por_alumnos(request: AlumnoRequest):
    alumno_ids = request.alumno_ids
    print(f"🔄 Procesando predicciones para alumnos: {len(alumno_ids)}")
    tiempo_inicio = time.perf_counter()

    resultados = predecir_cacheado(tuple(alumno_ids))
    resultados_limpios = limpiar_numpy(resultados)

    # Añadir el tiempo que se ha tardado en minutos
    tiempo_total = time.perf_counter() - tiempo_inicio
    print(
        f"✅ Predicciones listas para {len(alumno_ids)} alumnos en {tiempo_total / 60:.2f} minutos."
    )
    return {"resultados": resultados_limpios}


# ===============================
# ENDPOINT 2: Predicciones agregadas
# ===============================
@app.post("/predict/agregadas")
def predict_agregadas(request: AgregacionRequest):
    try:
        return predicciones_agregadas_cacheadas(request.nivel)
    except Exception as e:
        return {"error": str(e)}


# ===============================
# ENDPOINT 3: Rendimiento por asignatura
# ===============================
@app.get("/predict/rendimiento")
def predict_rendimiento():
    if "susp_asig" not in modelos:
        return {"error": "Modelo de suspensos no disponible."}
    try:
        return rendimiento_cacheado()
    except Exception as e:
        return {"error": str(e)}



# ===============================
# ENDPOINT DE STATUS
# ===============================
@app.get("/")
def root():
    return {"servicio": "SIAE-IA", "status": "online"}


# ===============================
# EJECUCIÓN LOCAL
# ===============================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
