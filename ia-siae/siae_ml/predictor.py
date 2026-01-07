import numpy as np
import pandas as pd
from sklearn.exceptions import ConvergenceWarning
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=ConvergenceWarning)


# ----------------------------
# PREDICCIÓN POR ALUMNO / ASIGNATURAS
# ----------------------------
def predecir_por_alumno_asignaturas(
    models, encoders, alumno_id, df, proximo_anio_academico=None
):
    # Tomar último registro del alumno para obtener contexto
    alumno_df = df[df["alumno_id"] == alumno_id].sort_values(
        ["anio_academico", "evaluacion"]
    )
    if alumno_df.empty:
        return None

    ultimo = alumno_df.iloc[-1]
    proximo_anio = (
        proximo_anio_academico
        if proximo_anio_academico is not None
        else ultimo["anio_academico"] + 1
    )

    # Lista de asignaturas que el alumno cursó (o podría cursar)
    asignaturas = alumno_df["asignatura_id"].unique()

    results = []
    for asig in asignaturas:
        # construir fila de características para la asignatura en el próximo periodo
        # tomar nota_previa como la última nota en esa asignatura (si existe)
        df_asig_hist = alumno_df[alumno_df["asignatura_id"] == asig]
        nota_previa = (
            df_asig_hist["calificacion"].iloc[-1] if not df_asig_hist.empty else np.nan
        )

        nombre_asig = (
            df_asig_hist["asignatura_nombre"].iloc[-1]
            if "asignatura_nombre" in df_asig_hist.columns
            else str(asig)
        )

        # features consistentes con los usados en entrenamiento
        feat = {
            "edad": ultimo["edad"] + 1,  # próximo año
            "retraso": max(0, ultimo["retraso"] + (1 if ultimo["retraso"] > 0 else 0)),
            "nota_previa": nota_previa,
            "curso_orden": ultimo["curso_orden"] + 1,
            "nivel_id": ultimo["nivel_id"],
            "sexo_enc": (
                encoders["sexo"].transform([ultimo["sexo"]])[0]
                if ultimo["sexo"] in encoders["sexo"].classes_
                else encoders["sexo"].transform(["UNK"])[0]
            ),
            "ratio_alumno_personal": ultimo.get("ratio_alumno_personal", 1.0),
            "provincia_enc": (
                encoders["provincia"].transform([ultimo.get("provincia", "UNK")])[0]
                if ultimo.get("provincia", "UNK") in encoders["provincia"].classes_
                else encoders["provincia"].transform(["UNK"])[0]
            ),
            "asignatura_id": int(asig),
            "num_suspensos_ult_anio": int(
                alumno_df[alumno_df["anio_academico"] == ultimo["anio_academico"]][
                    "suspenso"
                ].sum()
            ),
            "suspensos_acumulados": int(alumno_df["suspenso"].sum()),
        }
        X_row = pd.DataFrame([feat])

        # Predecir prob suspenso y nota
        prob_susp = (
            models["susp_asig"].predict_proba(X_row)[0][1]
            if models.get("susp_asig")
            else 0.0
        )
        nota_pred = (
            models["nota_asig"].predict(X_row)[0]
            if models.get("nota_asig")
            else float(nota_previa or 0)
        )

        # Agregar recomendaciones por asignatura
        recs = []
        if prob_susp > 0.6:
            recs.append(f"Reforzar {asig}: riesgo {prob_susp:.2f}")
        if nota_pred < 5:
            recs.append(f"Objetivo: subir nota en {asig} (pred: {nota_pred:.1f})")

        results.append(
            {
                "asignatura_id": int(asig),
                "asignatura_nombre": nombre_asig,
                "prob_suspender": round(float(prob_susp), 3),
                "nota_esperada": round(float(nota_pred), 2),
                "recomendaciones": recs,
            }
        )

    # Predicción de repetir (a nivel alumno-año)
    # construimos features parecidos a los usados en model_rep
    # usar la media y sumas del último año
    ultimo_anio = ultimo["anio_academico"]
    agreg = alumno_df[alumno_df["anio_academico"] == ultimo_anio].agg(
        {
            "calificacion": "mean",
            "suspenso": "sum",
            "retraso": "mean",
            "edad": "mean",
            "suspensos_acumulados": "max",
            "ratio_alumno_personal": "mean",
            "provincia": lambda x: x.iloc[0] if len(x) > 0 else None,
            "sexo": lambda x: x.iloc[0] if len(x) > 0 else None,
            "nivel_id": lambda x: x.iloc[0] if len(x) > 0 else None,
        }
    )

    feat_rep = pd.DataFrame(
        [
            {
                "calificacion": agreg["calificacion"],
                "suspenso": agreg["suspenso"],
                "retraso": agreg["retraso"],
                "edad": agreg["edad"],
                "suspensos_acumulados": agreg["suspensos_acumulados"],
                "ratio_alumno_personal": agreg["ratio_alumno_personal"],
                "provincia_enc": (
                    encoders["provincia"].transform([agreg["provincia"]])[0]
                    if agreg["provincia"] in encoders["provincia"].classes_
                    else encoders["provincia"].transform(["UNK"])[0]
                ),
                "sexo_enc": (
                    encoders["sexo"].transform([agreg["sexo"]])[0]
                    if agreg["sexo"] in encoders["sexo"].classes_
                    else encoders["sexo"].transform(["UNK"])[0]
                ),
                "nivel_id": agreg["nivel_id"],
            }
        ]
    )

    prob_rep = models["rep"].predict_proba(feat_rep)[0][1] if models.get("rep") else 0.0

    # Abandono (solo si bachillerato)
    prob_ab = 0.0
    if ultimo["nivel_id"] == 4 and models.get("ab") is not None:
        feat_ab = pd.DataFrame(
            [
                {
                    "edad": agreg["edad"],
                    "retraso": agreg["retraso"],
                    "ratio_alumno_personal": agreg["ratio_alumno_personal"],
                    "provincia_enc": (
                        encoders["provincia"].transform([agreg["provincia"]])[0]
                        if agreg["provincia"] in encoders["provincia"].classes_
                        else encoders["provincia"].transform(["UNK"])[0]
                    ),
                    "sexo_enc": (
                        encoders["sexo"].transform([agreg["sexo"]])[0]
                        if agreg["sexo"] in encoders["sexo"].classes_
                        else encoders["sexo"].transform(["UNK"])[0]
                    ),
                    "suspensos_acumulados": agreg["suspensos_acumulados"],
                }
            ]
        )
        prob_ab = models["ab"].predict_proba(feat_ab)[0][1]

    # recomendaciones globales
    recomendaciones_global = []
    if prob_rep > 0.5:
        recomendaciones_global.append("Alto riesgo de repetir: plan de apoyo académico")
    if prob_ab > 0.4:
        recomendaciones_global.append("Riesgo de abandono: intervención socioeducativa")

    return {
        "alumno_id": alumno_id,
        "anio_analisis": proximo_anio,
        "asignaturas": results,
        "prob_repetir": round(float(prob_rep), 3),
        "prob_abandono": round(float(prob_ab), 3),
        "recomendaciones_globales": recomendaciones_global,
    }


# --------------------------------------------
# PREDICCIONES AGREGADAS POR CENTRO / PROVINCIA
# --------------------------------------------
def predicciones_agregadas(df, models, nivel="centro_educativo_id"):
    # Validar columna
    if nivel not in df.columns:
        raise ValueError(f"Columna '{nivel}' no encontrada en df")

    # 1️⃣ Predicción de % suspensos esperados (usando modelo de suspensos)
    # Promedio de riesgo por fila, luego agregamos
    features = [
        "edad",
        "retraso",
        "nota_previa",
        "curso_orden",
        "nivel_id",
        "sexo_enc",
        "ratio_alumno_personal",
        "provincia_enc",
        "asignatura_id",
        "num_suspensos_ult_anio",
        "suspensos_acumulados",
    ]

    df_pred = df.dropna(subset=features).copy()
    if models.get("susp_asig") is not None:
        probs = models["susp_asig"].predict_proba(df_pred[features])[:, 1]
        df_pred["prob_suspenso"] = probs
    else:
        df_pred["prob_suspenso"] = (df_pred["calificacion"] < 5).astype(float)

    # % suspensos esperados por centro/provincia
    agregados = (
        df_pred.groupby(nivel)
        .agg(
            {
                "prob_suspenso": "mean",
                "calificacion": "mean",
                "ratio_alumno_personal": "mean",
                "num_personal_centro": (
                    "first" if "num_personal_centro" in df_pred.columns else "mean"
                ),
                "alumno_id": "nunique",
            }
        )
        .reset_index()
    )

    agregados.rename(
        columns={
            "prob_suspenso": "tasa_suspensos_predicha",
            "calificacion": "nota_media",
            "alumno_id": "num_alumnos",
        },
        inplace=True,
    )

    agregados["tasa_suspensos_predicha"] = (
        agregados["tasa_suspensos_predicha"] * 100
    ).round(2)

    # 2️⃣ Ranking de centros/provincias en riesgo
    agregados["ranking_riesgo"] = (
        agregados["tasa_suspensos_predicha"].rank(ascending=False).astype(int)
    )

    # 3️⃣ Impacto del ratio alumno/personal (análisis “¿qué pasaría si?”)
    # Entrenamos una regresión simple: ratio → tasa_suspensos_predicha
    if "ratio_alumno_personal" in agregados.columns:
        X = agregados[["ratio_alumno_personal"]]
        y = agregados["tasa_suspensos_predicha"]
        model_ratio = LinearRegression().fit(X, y)
        pendiente = model_ratio.coef_[0]
        agregados["impacto_ratio"] = pendiente  # cuanto cambia la tasa si varía ratio

        # Simulación: si agregamos +10 docentes (↓ ratio)
        agregados["tasa_si_10_docentes_mas"] = (
            agregados["tasa_suspensos_predicha"]
            - (10 * pendiente / agregados["num_alumnos"])
        ).round(2)
    else:
        model_ratio = None

    # 4️⃣ Tendencias temporales: forecasting de suspensos por año
    tendencias = []
    for entidad, grupo in df_pred.groupby(nivel):
        serie = grupo.groupby('anio_academico')['suspenso'].mean().reset_index()
        if len(serie) >= 2:
            X = serie[['anio_academico']]
            y = serie['suspenso']
            model = LinearRegression().fit(X, y)
            pred = model.predict([[serie['anio_academico'].max() + 1]])[0] * 100
            tendencias.append((entidad, serie['anio_academico'].max() + 1, pred))

    tendencias_df = pd.DataFrame(
        tendencias, columns=[nivel, "anio_pred", "tasa_suspensos_forecast"]
    )

    # 5️⃣ Análisis de disparidades (por sexo o provincia)
    disparidades = (
        df_pred.groupby(["provincia", "sexo"])
        .agg({"prob_suspenso": "mean", "calificacion": "mean"})
        .reset_index()
    )
    disparidades["tasa_suspenso_%"] = (disparidades["prob_suspenso"] * 100).round(2)
    disparidades["gap_vs_media"] = disparidades.groupby("provincia")[
        "tasa_suspenso_%"
    ].transform(lambda x: x - x.mean())

    return {
        "agregados": agregados,
        "tendencias": tendencias_df,
        "disparidades": disparidades,
        "modelo_ratio": model_ratio,
    }


def predecir_rendimiento_por_asignatura(df, model_susp):
    # Mismas features que en el entrenamiento
    features = [
        "edad",
        "retraso",
        "nota_previa",
        "curso_orden",
        "nivel_id",
        "sexo_enc",
        "ratio_alumno_personal",
        "provincia_enc",
        "asignatura_id",
        "num_suspensos_ult_anio",
        "suspensos_acumulados",
    ]

    # Asegurar que no haya NaN
    df_pred = df.dropna(subset=features).copy()

    # Aplicar modelo de suspenso
    X = df_pred[features]
    df_pred["prob_suspenso"] = model_susp.predict_proba(X)[:, 1]

    # Agrupar por curso y asignatura
    resumen = (
        df_pred.groupby(["curso_id", "asignatura_id"])
        .agg(
            prob_suspenso_media=("prob_suspenso", "mean"),
            n_alumnos=("alumno_id", "nunique"),
        )
        .reset_index()
    )

    # Añadir nombres y orden
    resumen = resumen.merge(
        df_pred[["curso_id", "curso_orden", "nivel_id"]].drop_duplicates(),
        on="curso_id",
    )
    resumen = resumen.merge(
        df_pred[["asignatura_id", "asignatura_nombre"]].drop_duplicates(),
        on="asignatura_id",
    )
    resumen = resumen.sort_values(
        ["nivel_id", "curso_orden", "prob_suspenso_media"],
        ascending=[True, True, False],
    )

    resumen["tasa_suspensos_predicha"] = (resumen["prob_suspenso_media"] * 100).round(1)
    return resumen[
        [
            "nivel_id",
            "curso_orden",
            "asignatura_id",
            "asignatura_nombre",
            "tasa_suspensos_predicha",
            "n_alumnos",
        ]
    ]
