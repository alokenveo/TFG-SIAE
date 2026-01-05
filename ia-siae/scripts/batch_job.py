import sys
import os
import json
import mysql.connector
import pandas as pd
from datetime import datetime

# Ajustar path para importar desde siae_ml (subimos un nivel)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from siae_ml.data_loader import extraer_datos
from siae_ml.features import prepare_features
from siae_ml.model_trainer import load_models
from siae_ml.predictor import (
    predecir_por_alumno_asignaturas,
    predicciones_agregadas,
    predecir_rendimiento_por_asignatura
)

# Configuración de conexión
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "almiokob", 
    "database": "siae_db"
}

# Año académico actual para las predicciones (esto podría venir por argumento)
ANIO_ACTUAL = 2025 

def conectar_db():
    return mysql.connector.connect(**DB_CONFIG)

def guardar_predicciones_alumnos(cursor, df, modelos, encoders):
    print("👤 Procesando predicciones por ALUMNO...")
    
    alumnos_ids = df['alumno_id'].unique()
    total = len(alumnos_ids)
    batch_data = []
    
    # Query con ON DUPLICATE KEY UPDATE para permitir recalcular sin errores
    query = """
        INSERT INTO prediccion_alumno 
        (alumno_id, anio_academico, riesgo_global, n_suspensos_predichos, detalle_json, fecha_prediccion)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        riesgo_global = VALUES(riesgo_global),
        n_suspensos_predichos = VALUES(n_suspensos_predichos),
        detalle_json = VALUES(detalle_json),
        fecha_prediccion = NOW()
    """
    
    for idx, alumno_id in enumerate(alumnos_ids):
        # 1. Obtenemos predicción cruda
        preds = predecir_por_alumno_asignaturas(modelos, encoders, alumno_id, df, proximo_anio_academico=ANIO_ACTUAL)
        
        if not preds:
            continue
            
        # 2. Calculamos métricas resumen para las columnas SQL
        if isinstance(preds, dict):
            # Si devuelve un diccionario (ej: {"resultados": [...]}), extraemos la lista
            if 'resultados' in preds:
                preds = preds['resultados']
            elif 'predicciones' in preds:
                preds = preds['predicciones']
            else:
                # Si no sabemos qué es, imprimimos y saltamos para no romper el script
                print(f"⚠️ Estructura desconocida para alumno {alumno_id}: {type(preds)} - Keys: {preds.keys()}")
                continue
        
        if isinstance(preds, str):
             print(f"⚠️ Error devuelto para alumno {alumno_id}: {preds}")
             continue
            
        # Calcular métricas globales
        try:
            n_suspensos = sum(1 for p in preds if p['riesgo_alto'])
        except TypeError as e:
            print(f"❌ Error al procesar alumno {alumno_id}. Preds: {preds}")
            raise e
        
        probs = [p['prob_suspenso'] for p in preds]
        riesgo_global = sum(probs) / len(probs) if probs else 0.0
        
        # 3. Preparamos el JSON (detalle_json)
        # Convertimos numpy types a nativos para que JSON no falle
        detalle_limpio = []
        for p in preds:
            detalle_limpio.append({
                "asignatura": p["asignatura_nombre"],
                "probabilidad": float(round(p["prob_suspenso"], 2)),
                "riesgo_alto": bool(p["riesgo_alto"]),
                "nota_estimada": float(round(p["nota_estimada"], 2)) if p["nota_estimada"] is not None else None
            })
        
        detalle_json_str = json.dumps(detalle_limpio)
        
        batch_data.append((
            int(alumno_id), 
            ANIO_ACTUAL, 
            float(riesgo_global), 
            int(n_suspensos), 
            detalle_json_str
        ))
        
        if len(batch_data) >= 50:
            cursor.executemany(query, batch_data)
            batch_data = []
            
    if batch_data:
        cursor.executemany(query, batch_data)
    print(f"✅ {total} alumnos procesados.")

def guardar_agregadas_centro(cursor):
    print("🏢 Procesando predicciones por CENTRO...")
    
    # Usamos tu función existente
    resultados = predicciones_agregadas('centro') 
    df_agregado = resultados['agregados']
    
    query = """
        INSERT INTO prediccion_centro 
        (centro_id, anio_academico, tasa_suspensos_media, alumnos_riesgo_alto, ranking_riesgo, fecha_prediccion)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        tasa_suspensos_media = VALUES(tasa_suspensos_media),
        alumnos_riesgo_alto = VALUES(alumnos_riesgo_alto),
        ranking_riesgo = VALUES(ranking_riesgo),
        fecha_prediccion = NOW()
    """
    
    datos = []
    for _, row in df_agregado.iterrows():
        datos.append((
            int(row['centro_educativo_id']), 
            ANIO_ACTUAL,
            float(row['tasa_suspensos_predicha']),
            int(row['alumnos_riesgo_alto']),
            int(row['ranking_riesgo'])
        ))
    
    if datos:
        cursor.executemany(query, datos)
    print(f"✅ {len(datos)} centros guardados.")

def guardar_agregadas_provincia(cursor):
    print("🌍 Procesando predicciones por PROVINCIA...")
    
    resultados = predicciones_agregadas('provincia')
    df_agregado = resultados['agregados']
    
    query = """
        INSERT INTO prediccion_provincia 
        (provincia, anio_academico, tasa_suspensos_media, fecha_prediccion)
        VALUES (%s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        tasa_suspensos_media = VALUES(tasa_suspensos_media),
        fecha_prediccion = NOW()
    """
    
    datos = []
    # Definir mapeo si los nombres en Python no coinciden exactamente con el ENUM de SQL
    # Si coinciden, no hace falta mapeo manual, pero aseguramos mayúsculas
    for _, row in df_agregado.iterrows():
        prov = row['provincia'].upper().replace(' ', '_') # Ajuste básico para ENUM
        datos.append((
            prov, 
            ANIO_ACTUAL,
            float(row['tasa_suspensos_predicha'])
        ))
        
    if datos:
        cursor.executemany(query, datos)
    print(f"✅ {len(datos)} provincias guardadas.")

def guardar_rendimiento_asignaturas(cursor, df, modelo_susp):
    print("📚 Procesando rendimiento por ASIGNATURA...")
    
    df_rend = predecir_rendimiento_por_asignatura(df, modelo_susp)
    
    query = """
        INSERT INTO prediccion_asignatura 
        (asignatura_id, anio_academico, tasa_suspensos_predicha, dificultad_percibida, fecha_prediccion)
        VALUES (%s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        tasa_suspensos_predicha = VALUES(tasa_suspensos_predicha),
        dificultad_percibida = VALUES(dificultad_percibida),
        fecha_prediccion = NOW()
    """
    
    datos = []
    for _, row in df_rend.iterrows():
        # Calculamos dificultad basada en tasa
        tasa = float(row['tasa_suspensos_media'])
        dificultad = "BAJA"
        if tasa > 0.3: dificultad = "MEDIA"
        if tasa > 0.6: dificultad = "ALTA"
        if tasa > 0.8: dificultad = "MUY ALTA"

        datos.append((
            int(row['asignatura_id']),
            ANIO_ACTUAL,
            tasa,
            dificultad
        ))
    
    if datos:
        cursor.executemany(query, datos)
    print(f"✅ {len(datos)} asignaturas guardadas.")

def ejecutar_batch():
    print(f"🚀 INICIANDO BATCH JOB (Año Académico: {ANIO_ACTUAL})")
    
    try:
        # 1. Cargar recursos
        print("📥 Cargando modelos y datos...")
        modelos, encoders = load_models()
        df_raw = extraer_datos()
        df, _ = prepare_features(df_raw)
        
        conn = conectar_db()
        cursor = conn.cursor()
        
        # 2. Ejecutar guardados
        # Nota: No hacemos TRUNCATE porque ahora usamos ON DUPLICATE KEY UPDATE
        # Esto permite mantener histórico de otros años si los hubiera.
        
        guardar_predicciones_alumnos(cursor, df, modelos, encoders)
        guardar_agregadas_centro(cursor)
        guardar_agregadas_provincia(cursor)
        
        if 'susp_asig' in modelos:
            guardar_rendimiento_asignaturas(cursor, df, modelos['susp_asig'])
            
        conn.commit()
        print("\n🏁 PROCESO COMPLETADO EXITOSAMENTE.")
        
    except Exception as e:
        if 'conn' in locals() and conn.is_connected():
            conn.rollback()
        print(f"\n❌ ERROR CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

if __name__ == "__main__":
    ejecutar_batch()