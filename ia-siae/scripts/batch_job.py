from multiprocessing.pool import Pool
import sys
import os
import json
import time
from turtle import pd
import mysql.connector

# Ajustar path para importar desde siae_ml (subimos un nivel)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from siae_ml.data_loader import extraer_datos
from siae_ml.features import prepare_features
from siae_ml.model_trainer import load_models
from siae_ml.predictor import (
    predecir_por_alumno_asignaturas,
    predicciones_agregadas,
    predecir_rendimiento_por_asignatura,
)

# Configuración de conexión
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "almiokob",
    "database": "siae_db",
}

ANIO_ACTUAL = 2026

# ----------------------------
# FUNCIONES AUXILIARES
# ----------------------------
def conectar_db():
    return mysql.connector.connect(**DB_CONFIG)


def procesar_alumno(args):
        alumno_id, modelos, encoders, df = args
        
        respuesta_raw = predecir_por_alumno_asignaturas(
            modelos, encoders, alumno_id, df, proximo_anio_academico=ANIO_ACTUAL
        )

        if respuesta_raw is None or (isinstance(respuesta_raw, dict) and "error" in respuesta_raw):
            return None

        lista_asignaturas = respuesta_raw.get("asignaturas", [])

        # Calcular n_suspensos
        n_suspensos = sum(
            1 for p in lista_asignaturas if p.get("prob_suspender", 0.0) > 0.5
        )

        prob_repetir = respuesta_raw.get("prob_repetir", 0.0)
        prob_abandono = respuesta_raw.get("prob_abandono", 0.0)

        # Si no venía el riesgo global en el dict padre, lo calculamos como media
        if prob_repetir == 0.0 and lista_asignaturas:
            probs = [p.get("prob_suspender", 0.0) for p in lista_asignaturas]
            prob_repetir = sum(probs) / len(probs) if probs else 0.0

        # Limpieza para JSON
        detalle_limpio = []
        for p in lista_asignaturas:
            detalle_limpio.append(
                {
                    "asignatura_id": p.get("asignatura_id"),
                    "asignatura_nombre": p.get("asignatura_nombre", "Desconocida"),
                    "prob_suspender": float(round(p.get("prob_suspender", 0.0), 2)),
                    "nota_esperada": (
                        float(round(p.get("nota_esperada", 0.0), 2))
                        if p.get("nota_esperada") is not None
                        else None
                    ),
                    "recomendaciones": p.get("recomendaciones", []),
                }
            )

        detalle_json_str = json.dumps(detalle_limpio)

        return (int(alumno_id), ANIO_ACTUAL, float(prob_repetir), int(n_suspensos), detalle_json_str, float(prob_abandono))


def guardar_predicciones_alumnos(cursor, df, modelos, encoders):
    print("👤 Procesando predicciones por ALUMNO...")

    max_historical = df['anio_academico'].max()
    ultimos = df.groupby('alumno_id').agg(
        max_anio=('anio_academico', 'max'),
        max_abandono=('abandono', 'max'),
        max_nivel_id=('nivel_id', 'max'),
        max_curso_orden=('curso_orden', 'max')
    ).reset_index()

    activos = ultimos[
        (ultimos['max_anio'] == max_historical) &
        (ultimos['max_abandono'] == 0) &
        ~((ultimos['max_nivel_id'] == 4) & (ultimos['max_curso_orden'] >= 2))
    ]
    alumnos_ids = activos['alumno_id'].unique()
    print(f"   ➤ {len(alumnos_ids)} alumnos activos encontrados para predicciones en {ANIO_ACTUAL}")

    total = len(alumnos_ids)

    query = """
        INSERT INTO prediccion_alumno 
        (alumno_id, anio_academico, prob_repetir, n_suspensos_predichos, detalle_json, prob_abandono, fecha_prediccion)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        prob_repetir = VALUES(prob_repetir),
        n_suspensos_predichos = VALUES(n_suspensos_predichos),
        detalle_json = VALUES(detalle_json),
        prob_abandono = VALUES(prob_abandono),
        fecha_prediccion = NOW()
    """
    
    batch_data = []
    procesados = 0

    with Pool(processes=2) as pool:
        args = [(alumno_id, modelos, encoders, df) for alumno_id in alumnos_ids]

        for res in pool.imap_unordered(procesar_alumno, args):
            procesados += 1

            if res is not None:
                batch_data.append(res)

            if procesados % 50 == 0 or procesados == total:
                print(f"   ⏳ Progreso: {procesados}/{total} alumnos procesados")

    if batch_data:
        cursor.executemany(query, batch_data)
    print()
    print(f"✅ {total} alumnos procesados.")


def guardar_agregadas_centro(cursor, modelos, encoders, df):
    print("🏢 Procesando predicciones por CENTRO...")

    try:
        resultados = predicciones_agregadas(df, modelos, "centro_educativo_id")
    except Exception as e:
        print(f"Error en agregadas centro: {e}")
        return

    df_agregado = resultados["agregados"]

    datos = []
    for _, row in df_agregado.iterrows():
        datos.append(
            (
                int(row["centro_educativo_id"]),
                ANIO_ACTUAL,
                float(row["tasa_suspensos_predicha"]),
                float(row.get("nota_media", 0.0)),
                int(row.get("num_alumnos", 0)),
                int(row["ranking_riesgo"]),
                float(row.get("impacto_ratio", 0.0)),
                float(row.get("tasa_si_10_docentes_mas", 0.0)),
                json.dumps(resultados["tendencias"].to_dict(orient="records")),
                json.dumps(resultados["disparidades"].to_dict(orient="records")),
            )
        )

    query = """
        INSERT INTO prediccion_centro 
        (centro_id, anio_academico, tasa_suspensos_predicha, nota_media, num_alumnos, ranking_riesgo, impacto_ratio, tasa_si_10_docentes_mas, json_tendencias, json_disparidades, fecha_prediccion)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        tasa_suspensos_predicha = VALUES(tasa_suspensos_predicha),
        nota_media = VALUES(nota_media),
        num_alumnos = VALUES(num_alumnos),
        ranking_riesgo = VALUES(ranking_riesgo),
        impacto_ratio = VALUES(impacto_ratio),
        tasa_si_10_docentes_mas = VALUES(tasa_si_10_docentes_mas),
        json_tendencias = VALUES(json_tendencias),
        json_disparidades = VALUES(json_disparidades),
        fecha_prediccion = NOW()
    """

    if datos:
        cursor.executemany(query, datos)
    print(f"✅ {len(datos)} centros guardados.")


def guardar_agregadas_provincia(cursor, modelos, encoders, df):
    print("🌍 Procesando predicciones por PROVINCIA...")

    try:
        resultados = predicciones_agregadas(df, modelos, "provincia")
    except Exception as e:
        print(f"Error en agregadas provincia: {e}")
        return

    df_agregado = resultados["agregados"]

    datos = []
    for _, row in df_agregado.iterrows():
        datos.append((
            row["provincia"],
            ANIO_ACTUAL,
            float(row["tasa_suspensos_predicha"]),
            float(row.get("nota_media", 0.0)),
            int(row.get("num_alumnos", 0)),
            float(row.get("impacto_ratio", 0.0)),
            float(row.get("tasa_si_10_docentes_mas", 0.0)),
            json.dumps(resultados["tendencias"].to_dict(orient="records")),
            json.dumps(resultados["disparidades"].to_dict(orient="records"))
        ))
    
    query = """
        INSERT INTO prediccion_provincia 
        (provincia, anio_academico, tasa_suspensos_predicha, nota_media, num_alumnos, impacto_ratio, tasa_si_10_docentes_mas, json_tendencias, json_disparidades, fecha_prediccion)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        tasa_suspensos_predicha = VALUES(tasa_suspensos_predicha),
        nota_media = VALUES(nota_media),
        num_alumnos = VALUES(num_alumnos),
        impacto_ratio = VALUES(impacto_ratio),
        tasa_si_10_docentes_mas = VALUES(tasa_si_10_docentes_mas),
        json_tendencias = VALUES(json_tendencias),
        json_disparidades = VALUES(json_disparidades),
        fecha_prediccion = NOW()
    """

    if datos:
        cursor.executemany(query, datos)
    print(f"✅ {len(datos)} provincias guardadas.")


def guardar_rendimiento_asignaturas(cursor, df, modelo_susp):
    print("📚 Procesando rendimiento por ASIGNATURA...")

    df_rend = predecir_rendimiento_por_asignatura(df, modelo_susp)

    datos = []
    for _, row in df_rend.iterrows():
        tasa = float(row["tasa_suspensos_predicha"])
        dificultad = "BAJA"
        if tasa > 0.3:
            dificultad = "MEDIA"
        if tasa > 0.6:
            dificultad = "ALTA"
        if tasa > 0.8:
            dificultad = "MUY ALTA"

        datos.append(
            (
                int(row["asignatura_id"]),
                ANIO_ACTUAL,
                tasa,
                dificultad,
                int(row.get("nivel_id", 0)),
                int(row.get("curso_orden", 0)),
                int(row.get("n_alumnos", 0)),
            )
        )
    
    query = """
        INSERT INTO prediccion_asignatura 
        (asignatura_id, anio_academico, tasa_suspensos_predicha, dificultad_percibida, nivel_id, curso_orden, n_alumnos, fecha_prediccion)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        tasa_suspensos_predicha = VALUES(tasa_suspensos_predicha),
        dificultad_percibida = VALUES(dificultad_percibida),
        nivel_id = VALUES(nivel_id),
        curso_orden = VALUES(curso_orden),
        n_alumnos = VALUES(n_alumnos),
        fecha_prediccion = NOW()
    """

    if datos:
        cursor.executemany(query, datos)
    print(f"✅ {len(datos)} asignaturas guardadas.")


def ejecutar_batch():
    start_time = time.perf_counter()
    print(f"🚀 INICIANDO BATCH JOB (Año Académico: {ANIO_ACTUAL})")
    conn = None
    cursor = None
    try:
        print("📥 Cargando modelos y datos...")
        modelos, encoders = load_models()
        df_raw = extraer_datos()
        df, _ = prepare_features(df_raw)

        conn = conectar_db()
        cursor = conn.cursor()

        print("\n[1/4] Predicciones por alumno")
        guardar_predicciones_alumnos(cursor, df, modelos, encoders)

        print("\n[2/4] Agregados por centro")
        guardar_agregadas_centro(cursor, modelos, encoders, df)

        print("\n[3/4] Agregados por provincia")
        guardar_agregadas_provincia(cursor, modelos, encoders, df)

        if "susp_asig" in modelos:
            print("\n[4/4] Rendimiento por asignatura")
            guardar_rendimiento_asignaturas(cursor, df, modelos["susp_asig"])

        conn.commit()
        print("\n🏁 PROCESO COMPLETADO EXITOSAMENTE.")

    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
        print(f"\n❌ ERROR CRÍTICO: {e}")
        import traceback

        traceback.print_exc()
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

    tiempo = time.perf_counter() - start_time
    minutos = int(tiempo // 60)
    segundos = int(tiempo % 60)
    print(f"\n⏱️ Tiempo total de ejecución: {minutos} min {segundos} s")


if __name__ == "__main__":
    ejecutar_batch()
