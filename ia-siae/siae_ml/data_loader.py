import mysql.connector
import pandas as pd

# ----------------------------
# CONEXIÓN A LA BASE DE DATOS
# ----------------------------
def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",  # Cambia si es necesario
        password="almiokob",  # Cambia si es necesario
        database="siae_db",
    )

# ----------------------------
# EXTRACCIÓN DE DATOS
# ----------------------------
def extraer_datos():
    conn = conectar_db()
    cursor = conn.cursor(dictionary=True)

    # Alumnos con info básica
    cursor.execute(
        """
                   SELECT a.id,
                          a.sexo,
                          a.fecha_nacimiento,
                          a.nombre,
                          a.apellidos,
                          a.centro_educativo_id,
                          c.provincia,
                          c.nombre AS centro_nombre
                   FROM alumno a
                            JOIN centro_educativo c ON a.centro_educativo_id = c.id
                   """
    )
    alumnos = pd.DataFrame(cursor.fetchall())
    alumnos.rename(columns={"id": "alumno_id"}, inplace=True)
    print(f"Alumnos extraídos: {len(alumnos)}")

    # Matrículas
    cursor.execute(
        """
                   SELECT m.id,
                          m.anio_academico,
                          m.alumno_id,
                          m.curso_id,
                          cu.orden AS curso_orden,
                          cu.nivel_id
                   FROM matricula m
                            JOIN curso cu ON m.curso_id = cu.id
                   """
    )
    matriculas = pd.DataFrame(cursor.fetchall())
    print(f"Matrículas extraídas: {len(matriculas)}")

    # Notas
    cursor.execute(
        """
                   SELECT n.calificacion,
                          n.alumno_id,
                          n.asignatura_id,
                          n.curso_id,
                          n.evaluacion,
                          n.anio_academico,
                          asg.nombre AS asignatura_nombre
                   FROM nota n
                            JOIN asignatura asg ON n.asignatura_id = asg.id
                   """
    )
    notas = pd.DataFrame(cursor.fetchall())
    print(f"Notas extraídas: {len(notas)}")

    # Personal (para ratios)
    cursor.execute(
        """
                   SELECT p.id,
                          p.cargo,
                          p.centro_educativo_id,
                          COUNT(*) OVER (PARTITION BY centro_educativo_id) AS num_personal_centro
                   FROM personal p
                   """
    )
    personal = pd.DataFrame(cursor.fetchall())
    print(f"Personal extraído: {len(personal)}")

    conn.close()

    # Merge datasets
    df = notas.merge(
        matriculas, on=["alumno_id", "curso_id", "anio_academico"], how="left"
    )
    df = df.merge(alumnos, on="alumno_id", how="left")

    # Calcular ratio alumno/personal por centro educativo
    ratios = (
        personal.groupby("centro_educativo_id")["num_personal_centro"]
        .first()
        .reset_index()
    )
    df = df.merge(ratios, on="centro_educativo_id", how="left")

    num_alumnos_centro = (
        df.groupby("centro_educativo_id")["alumno_id"]
        .nunique()
        .reset_index(name="num_alumnos_centro")
    )
    df = df.merge(num_alumnos_centro, on="centro_educativo_id")

    df["ratio_alumno_personal"] = df["num_alumnos_centro"] / df[
        "num_personal_centro"
    ].clip(lower=1)

    # Crear columna 'abandono' (solo para nivel Bachillerato)
    df["abandono"] = 0
    bach_alumnos = df[df["nivel_id"] == 4]["alumno_id"].unique()
    for al in bach_alumnos:
        anios = df[df["alumno_id"] == al]["anio_academico"].unique()
        if len(anios) > 0:
            max_anio = max(anios)
            cursos_alumno = df[df["alumno_id"] == al]["curso_orden"].max()
            # Si no llega al último curso del nivel, se considera abandono
            if cursos_alumno < 2:
                df.loc[
                    (df["alumno_id"] == al) & (df["anio_academico"] == max_anio),
                    "abandono",
                ] = 1

    return df

