from funciones.data_loader import extraer_datos
from funciones.features import prepare_features
from funciones.predictor import predecir_por_alumno_asignaturas, predicciones_agregadas, predecir_rendimiento_por_asignatura
from funciones.model_trainer import load_models


if __name__ == "__main__":
    print("🚀 Iniciando predicción en ML_SIAE...")

    # 1️⃣ Cargar modelos y datos
    modelos, encoders = load_models()
    df = extraer_datos()
    df, _ = prepare_features(df)

    # 2️⃣ Menú principal
    print("\n=== MENÚ DE PREDICCIONES ===")
    print("1. Predicción por alumno y asignaturas")
    print("2. Predicciones agregadas (centro/provincia)")
    print("3. Rendimiento medio por curso y asignatura")
    eleccion = input("👉 Escoge una opción (1, 2 o 3): ")

    # 3️⃣ Predicción por alumno individual
    if eleccion == '1':
        alumno_id = input("Introduce el ID del alumno: ")
        try:
            alumno_id = int(alumno_id)
            resultado = predecir_por_alumno_asignaturas(modelos, encoders, alumno_id=alumno_id, df=df)
            print("\n📊 Resultado de predicción individual:\n")
            print(resultado)
        except ValueError:
            print("⚠️ ID de alumno no válido.")

    # 4️⃣ Predicciones agregadas
    elif eleccion == '2':
        print("\n📍 ¿Qué nivel quieres analizar?")
        print("1. Centros educativos")
        print("2. Provincias")
        subop = input("👉 Escoge una opción (1 o 2): ")
        
        if subop == '1':
            print("\n📊 Calculando predicciones agregadas por centro...")
            preds = predicciones_agregadas(df, modelos, nivel='centro_educativo_id')

            print("\n🏫 Tasa de suspensos por centro:")
            print(preds['agregados'][['centro_educativo_id', 'tasa_suspensos_predicha', 'ranking_riesgo']])

            if 'impacto_ratio' in preds['agregados'].columns:
                print("\n👩‍🏫 Impacto del ratio alumno/docente:")
                print(preds['agregados'][['centro_educativo_id', 'ratio_alumno_personal', 'impacto_ratio', 'tasa_suspensos_predicha', 'tasa_si_10_docentes_mas']])

            if not preds['tendencias'].empty:
                print("\n📈 Tendencias de suspensos previstas:")
                print(preds['tendencias'])
            else:
                print("\n📈 No hay datos suficientes para generar tendencias.")

            print("\n⚖️ Disparidades por sexo y provincia:")
            print(preds['disparidades'])

        elif subop == '2':
            print("\n📊 Calculando predicciones agregadas por provincia...")
            preds = predicciones_agregadas(df, modelos, nivel='provincia')

            print("\n📍 Tasa de suspensos por provincia:")
            print(preds['agregados'][['provincia', 'tasa_suspensos_predicha', 'ranking_riesgo']])

            if 'impacto_ratio' in preds['agregados'].columns:
                print("\n👩‍🏫 Impacto del ratio alumno/docente:")
                print(preds['agregados'][['provincia', 'ratio_alumno_personal', 'impacto_ratio', 'tasa_suspensos_predicha', 'tasa_si_10_docentes_mas']])

            if not preds['tendencias'].empty:
                print("\n📈 Tendencias de suspensos previstas:")
                print(preds['tendencias'])
            else:
                print("\n📈 No hay datos suficientes para generar tendencias.")

            print("\n⚖️ Disparidades por sexo y provincia:")
            print(preds['disparidades'])
        else:
            print("⚠️ Opción no válida.")

    # 5️⃣ Rendimiento medio por asignatura
    elif eleccion == '3':
        print("\n📘 Calculando rendimiento promedio por asignatura y curso...")
        if 'susp_asig' in modelos:
            df_pred_rend = predecir_rendimiento_por_asignatura(df, modelos['susp_asig'])
            print("\n📊 Tasa media de suspensos por asignatura:")
            print(df_pred_rend.head(15))
        else:
            print("⚠️ El modelo de suspensos no está disponible.")

    else:
        print("⚠️ Opción no válida.")
    
    print("✅ Predicciones completadas.")