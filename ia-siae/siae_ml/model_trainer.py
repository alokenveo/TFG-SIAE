import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score, classification_report
from sklearn.calibration import CalibratedClassifierCV
import joblib

# ----------------------------

# ----------------------------
# ENTRENAR MODELOS EXTENDIDOS
# ----------------------------
def train_models_extended(df, encoders):
    # FILTRO filas con valores necesarios
    df_model = df.dropna(subset=["nota_previa", "calificacion", "sexo_enc"])

    # FEATURES por asignatura (para suspenso y nota)
    features_asig = [
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

    X_asig = df_model[features_asig]
    y_susp_asig = df_model["suspenso"]  # clasificación por asignatura
    y_nota_asig = df_model["calificacion"]  # regresión por asignatura

    # Split (misma semilla para reproducibilidad)
    X_train_a, X_test_a, y_s_train, y_s_test, y_n_train, y_n_test = train_test_split(
        X_asig, y_susp_asig, y_nota_asig, test_size=0.2, random_state=42
    )

    # entrenar
    base_model = RandomForestClassifier(n_estimators=150, random_state=42)
    model_susp_asig = CalibratedClassifierCV(base_model, method='isotonic', cv=5)
    model_susp_asig.fit(X_train_a, y_s_train)

    model_nota_asig = RandomForestRegressor(n_estimators=150, random_state=42)
    model_nota_asig.fit(X_train_a, y_n_train)
    
    print("RMSE nota:", np.sqrt(mean_squared_error(y_n_test, model_nota_asig.predict(X_test_a))))
    print("Acc suspenso:", accuracy_score(y_s_test, model_susp_asig.predict(X_test_a)))
    # print(classification_report(y_s_test, model_susp_asig.predict(X_test_a)))


    # MODELO repetir (nivel alumno-año): agregamos features por alumno-año
    agg = (
        df_model.groupby(["alumno_id", "anio_academico"])
        .agg(
            {
                "calificacion": "mean",
                "suspenso": "sum",
                "retraso": "mean",
                "edad": "mean",
                "suspensos_acumulados": "max",
                "ratio_alumno_personal": "mean",
                "provincia_enc": "first",
                "sexo_enc": "first",
                "nivel_id": "first",
            }
        )
        .reset_index()
    )

    # crear target 'repite' si media < 5 (como definiste antes)
    agg["repite"] = (agg["calificacion"] < 5).astype(int)

    feat_rep = [
        "calificacion",
        "suspenso",
        "retraso",
        "edad",
        "suspensos_acumulados",
        "ratio_alumno_personal",
        "provincia_enc",
        "sexo_enc",
        "nivel_id",
    ]
    X_rep = agg[feat_rep]
    y_rep = agg["repite"]

    Xr_train, Xr_test, yr_train, yr_test = train_test_split(
        X_rep, y_rep, test_size=0.2, random_state=42
    )
    model_rep = RandomForestClassifier(n_estimators=150, random_state=42)
    model_rep.fit(Xr_train, yr_train)

    # MODELO abandono (solo bachillerato)
    df_bach = df_model[df_model["nivel_id"] == 4].copy()
    if len(df_bach) > 0:
        # agregación por alumno, tomando último año observado
        bach_agg = (
            df_bach.groupby("alumno_id")
            .agg(
                {
                    "abandono": "max",
                    "edad": "last",
                    "retraso": "last",
                    "ratio_alumno_personal": "last",
                    "provincia_enc": "first",
                    "sexo_enc": "first",
                    "suspensos_acumulados": "last",
                }
            )
            .reset_index()
        )

        X_ab = bach_agg[
            [
                "edad",
                "retraso",
                "ratio_alumno_personal",
                "provincia_enc",
                "sexo_enc",
                "suspensos_acumulados",
            ]
        ]
        y_ab = bach_agg["abandono"]
        if len(y_ab.unique()) > 1:
            Xab_train, Xab_test, yab_train, yab_test = train_test_split(
                X_ab, y_ab, test_size=0.2, random_state=42
            )
            model_ab = RandomForestClassifier(n_estimators=150, random_state=42)
            model_ab.fit(Xab_train, yab_train)
        else:
            model_ab = None  # no hay suficiente variabilidad
    else:
        model_ab = None

    models = {
        "susp_asig": model_susp_asig,
        "nota_asig": model_nota_asig,
        "rep": model_rep,
        "ab": model_ab,
    }
    return models


def save_models(modelos, encoders):
    joblib.dump(modelos, "models/modelos.pkl", compress=3)
    joblib.dump(encoders, "models/encoders.pkl", compress=3)

def load_models():
    modelos = joblib.load("models/modelos.pkl")
    encoders = joblib.load("models/encoders.pkl")
    return modelos, encoders