import pandas as pd
from sklearn.preprocessing import LabelEncoder


# PREPARAR FEATURES AVANZADAS
# ----------------------------
def prepare_features(df):
    # Asegurarnos de tener tipos correctos
    df["fecha_nacimiento"] = pd.to_datetime(df["fecha_nacimiento"])
    df["anio_academico"] = df["anio_academico"].astype(int)
    df["curso_orden"] = df["curso_orden"].astype(int)

    # Nota previa por asignatura (ya lo calculabas)
    df = df.sort_values(["alumno_id", "asignatura_id", "anio_academico", "evaluacion"])
    df["nota_previa"] = df.groupby(["alumno_id", "asignatura_id"])[
        "calificacion"
    ].shift(1)

    # Suspenso binario (target por asignatura)
    df["suspenso"] = (df["calificacion"] < 5).astype(int)

    # Edad / edad_esperada / retraso (recalcula por si acaso)
    df["edad"] = df["anio_academico"] - pd.to_datetime(df["fecha_nacimiento"]).dt.year
    df["edad_esperada"] = df["curso_orden"] + 5
    df.loc[df["nivel_id"] == 3, "edad_esperada"] += 6
    df.loc[df["nivel_id"] == 4, "edad_esperada"] += 10
    df["retraso"] = df["edad"] - df["edad_esperada"]

    # Features agregadas por alumno-año
    # num_suspensos_ult_anio: cuántas asignaturas suspendió ese alumno en ese año
    df["num_suspensos_ult_anio"] = df.groupby(["alumno_id", "anio_academico"])[
        "suspenso"
    ].transform("sum")

    # Suspensos acumulados hasta la fila actual
    df["suspensos_acumulados"] = df.groupby("alumno_id")["suspenso"].cumsum()

    # Media anual por alumno (ya la calculaste antes, pero la dejamos como feature)
    medias_anuales = (
        df.groupby(["alumno_id", "anio_academico"])["calificacion"]
        .mean()
        .reset_index(name="media_anual")
    )
    df = df.merge(medias_anuales, on=["alumno_id", "anio_academico"], how="left")

    # Codificar sexo y provincia con LabelEncoder y guardar encoders para inferencia
    le_sexo = LabelEncoder()
    df["sexo_enc"] = le_sexo.fit_transform(df["sexo"].fillna("UNK"))

    le_prov = LabelEncoder()
    df["provincia_enc"] = le_prov.fit_transform(df["provincia"].fillna("UNK"))

    # convertir asignatura a entero (si no lo está)
    df["asignatura_id"] = df["asignatura_id"].astype(int)

    # Guardar encoders en el propio dataframe (como atributos temporales)
    encoders = {"sexo": le_sexo, "provincia": le_prov}

    return df, encoders
