import numpy as np
import time
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    mean_squared_error,
    mean_absolute_error,
)
from sklearn.calibration import CalibratedClassifierCV


def train_models_extended(df, encoders):
    print("🧠 Entrenando modelos ML...")
    inicio = time.perf_counter()

    # -------------------------------------------------
    # LIMPIEZA BÁSICA
    # -------------------------------------------------
    df_model = df.dropna(subset=["nota_previa", "calificacion", "sexo_enc"])

    # -------------------------------------------------
    # MODELO 1: SUSPENSO POR ASIGNATURA (CLASIFICACIÓN)
    # -------------------------------------------------
    features_asig = [
        "edad",
        "retraso",
        "nota_previa",
        "curso_orden",
        "nivel_id",
        "sexo_enc",
        "provincia_enc",
        "asignatura_id",
        "ratio_alumno_personal",
        "num_suspensos_ult_anio",
        "suspensos_acumulados",
    ]

    X = df_model[features_asig]
    y_susp = df_model["suspenso"]
    y_nota = df_model["calificacion"]

    X_train, X_test, y_train, y_test, ynota_train, ynota_test = train_test_split(
        X, y_susp, y_nota, test_size=0.2, random_state=42, stratify=y_susp
    )

    # -----------------------------
    # GridSearch ligero (TFG-friendly)
    # -----------------------------
    param_grid = {
        "n_estimators": [100, 200],
        "max_depth": [None, 15],
        "min_samples_split": [2, 5],
    }

    grid = GridSearchCV(
        RandomForestClassifier(random_state=42),
        param_grid,
        cv=3,
        scoring="f1",
        n_jobs=-1,
    )
    grid.fit(X_train, y_train)

    best_rf = grid.best_estimator_
    print("✔ Mejores hiperparámetros (suspenso):", grid.best_params_)

    # Calibración de probabilidades
    model_susp_asig = CalibratedClassifierCV(
        best_rf, method="isotonic", cv=5
    )
    model_susp_asig.fit(X_train, y_train)

    # Evaluación
    y_pred = model_susp_asig.predict(X_test)
    y_prob = model_susp_asig.predict_proba(X_test)[:, 1]

    print("\n📊 RESULTADOS – Suspenso por asignatura")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("ROC-AUC:", roc_auc_score(y_test, y_prob))
    print(confusion_matrix(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    # Validación cruzada (robustez)
    f1_cv = cross_val_score(best_rf, X, y_susp, cv=5, scoring="f1").mean()
    print("F1 medio (CV):", f1_cv)

    # -------------------------------------------------
    # MODELO 2: PREDICCIÓN DE NOTA (REGRESIÓN)
    # -------------------------------------------------
    model_nota_asig = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        random_state=42,
        n_jobs=-1,
    )
    model_nota_asig.fit(X_train, ynota_train)

    ynota_pred = model_nota_asig.predict(X_test)

    rmse = np.sqrt(mean_squared_error(ynota_test, ynota_pred))
    mae = mean_absolute_error(ynota_test, ynota_pred)

    print("\n📊 RESULTADOS – Predicción de nota")
    print("RMSE:", rmse)
    print("MAE:", mae)

    # -------------------------------------------------
    # MODELO 3: REPITE CURSO (ALUMNO–AÑO)
    # -------------------------------------------------
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

    Xr = agg[feat_rep]
    yr = agg["repite"]

    Xr_train, Xr_test, yr_train, yr_test = train_test_split(
        Xr, yr, test_size=0.2, random_state=42, stratify=yr
    )

    model_rep = RandomForestClassifier(
        n_estimators=150, random_state=42, n_jobs=-1
    )
    model_rep.fit(Xr_train, yr_train)

    print("\n📊 RESULTADOS – Repite curso")
    print("Accuracy:", accuracy_score(yr_test, model_rep.predict(Xr_test)))
    print(classification_report(yr_test, model_rep.predict(Xr_test)))

    # -------------------------------------------------
    # MODELO 4: ABANDONO (BACHILLERATO)
    # -------------------------------------------------
    df_bach = df_model[df_model["nivel_id"] == 4]

    model_ab = None
    if not df_bach.empty:
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

        if bach_agg["abandono"].nunique() > 1:
            Xab = bach_agg.drop(columns=["alumno_id", "abandono"])
            yab = bach_agg["abandono"]

            Xab_tr, Xab_te, yab_tr, yab_te = train_test_split(
                Xab, yab, test_size=0.2, random_state=42, stratify=yab
            )

            model_ab = RandomForestClassifier(
                n_estimators=150, random_state=42, n_jobs=-1
            )
            model_ab.fit(Xab_tr, yab_tr)

            print("\n📊 RESULTADOS – Abandono Bachillerato")
            print("Accuracy:", accuracy_score(yab_te, model_ab.predict(Xab_te)))
            print(classification_report(yab_te, model_ab.predict(Xab_te)))

    # -------------------------------------------------
    # RESULTADO FINAL
    # -------------------------------------------------
    tiempo = time.perf_counter() - inicio
    print(f"\n✅ Entrenamiento finalizado en {int(tiempo//60)}m {int(tiempo%60)}s")

    return {
        "susp_asig": model_susp_asig,
        "nota_asig": model_nota_asig,
        "rep": model_rep,
        "ab": model_ab,
    }


def save_models(modelos, encoders):
    joblib.dump(modelos, "models/modelos.pkl", compress=3)
    joblib.dump(encoders, "models/encoders.pkl", compress=3)


def load_models():
    modelos = joblib.load("models/modelos.pkl")
    encoders = joblib.load("models/encoders.pkl")
    return modelos, encoders
