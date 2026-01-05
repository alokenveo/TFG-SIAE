import uvicorn
from fastapi import FastAPI, BackgroundTasks
from scripts.batch_job import ejecutar_batch


# ===============================
# CONFIGURACIÓN FASTAPI
# ===============================
app = FastAPI(
    title="SIAE - Orquestador Batch",
    description="API de control: Solo sirve para disparar el re-entrenamiento y predicción masiva.",
    version="3.0.0",
)


# ==========================================
# ENDPOINT TRIGGER (EL BOTÓN ROJO)
# ==========================================
@app.post("/admin/run-batch")
def trigger_batch_process(background_tasks: BackgroundTasks):
    """
    Lanza el proceso de predicción en segundo plano.
    Responde rápido al Backend Java para no bloquear, 
    mientras Python trabaja en background.
    """
    # BackgroundTasks es clave: permite responder "OK" a Java
    # y seguir trabajando en la predicción sin dejar al usuario esperando.
    background_tasks.add_task(ejecutar_batch)
    return {"message": "Proceso batch iniciado en segundo plano. Los datos se actualizarán pronto."}

# ===============================
# ENDPOINT DE STATUS
# ===============================
@app.get("/")
def health_check():
    return {"status": "online", "mode": "batch_orchestrator"}


# ===============================
# EJECUCIÓN LOCAL
# ===============================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
