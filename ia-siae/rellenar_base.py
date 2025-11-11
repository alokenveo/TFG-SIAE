import random
from datetime import date

import mysql.connector
from faker import Faker


# ----------------------------
# CONEXIÓN A LA BASE DE DATOS
# ----------------------------
def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="almiokob",
        database="siae_db"
    )


# ----------------------------
# CONFIGURAR FAKER
# ----------------------------
# Faker con localización española (es_ES)
faker = Faker('es_ES')


# ----------------------------
# FUNCIONES AUXILIARES
# ----------------------------
def get_asignaturas_por_curso(cursor, curso_id):
    cursor.execute("SELECT id FROM asignatura WHERE curso_id = %s", (curso_id,))
    return [row[0] for row in cursor.fetchall()]


def generar_dni():
    """Genera un DNI español válido (no verificado, pero formato correcto)."""
    letras = "TRWAGMYFPDXBNJZSQVHLCKE"
    numero = random.randint(10000000, 99999999)
    letra = letras[numero % 23]
    return f"{numero}{letra}"


def generar_fecha_nacimiento(inicio=2004, fin=2013):
    """Generar fecha de nacimiento entre los años dados."""
    year = random.randint(inicio, fin)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return date(year, month, day)

def calcular_curso_inicial(fecha_nac, anio_inicial=2019):
    edad = anio_inicial - fecha_nac.year
    # Educación Infantil (3–5 años)
    if 3 <= edad <= 5:
        return edad - 2

    # Educación Primaria (6–11 años)
    elif 6 <= edad <= 11:
        return edad - 2

    # ESO (12–15 años)
    elif 12 <= edad <= 15:
        return edad - 2

    # Bachillerato (16–17 años)
    elif 16 <= edad <= 17:
        return edad - 2

    # Fuera de rango (demasiado joven o mayor)
    else:
        return None

def get_centros_por_nivel(cursor, nivel_id):
    cursor.execute("""
        SELECT centro_id FROM centro_nivel WHERE nivel_id = %s
    """, (nivel_id,))
    return [row[0] for row in cursor.fetchall()]

def centro_ofrece_nivel(cursor, centro_id, nivel_id):
    cursor.execute("""
        SELECT COUNT(*) FROM centro_nivel
        WHERE centro_id = %s AND nivel_id = %s
    """, (centro_id, nivel_id))
    return cursor.fetchone()[0] > 0

# Mapa de cursos a niveles (basado en el esquema proporcionado)
curso_a_nivel = {
    1: 1, 2: 1, 3: 1,  # Infantil
    4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2,  # Primaria
    10: 3, 11: 3, 12: 3, 13: 3,  # ESO
    14: 4, 15: 4  # Bachillerato
}


# ----------------------------
# GENERAR ALUMNOS
# ----------------------------
def generar_alumnos(cursor, conn, num_alumnos=500):
    for _ in range(num_alumnos):
        apellido = f"{faker.last_name()} {faker.last_name()}"
        sexo = random.choice(['MASCULINO', 'FEMENINO'])
        if sexo == 'MASCULINO':
            nombre = faker.first_name_male()
        else:
            nombre = faker.first_name_female()
        fecha_nac = generar_fecha_nacimiento()
        dni = generar_dni()

        # Calcular curso inicial y nivel
        curso_inicial = calcular_curso_inicial(fecha_nac)
        if curso_inicial is None:
            continue  # Saltar si fuera de rango
        nivel_inicial = curso_a_nivel.get(curso_inicial)
        if nivel_inicial is None:
            continue

        # Obtener centros que ofrecen el nivel inicial
        posibles_centros = get_centros_por_nivel(cursor, nivel_inicial)
        if not posibles_centros:
            print(f"Advertencia: No hay centros que ofrezcan el nivel {nivel_inicial}. Saltando alumno.")
            continue
        centro_id = random.choice(posibles_centros)

        cursor.execute("""
            INSERT INTO alumno (dni, apellidos, fecha_nacimiento, nombre, sexo, centro_educativo_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (dni, apellido, fecha_nac, nombre, sexo, centro_id))
        conn.commit()

    print(f"{num_alumnos} registros de alumnos generados exitosamente (o menos si algunos se saltaron).")


# ----------------------------
# SIMULAR FLUJO (AÑOS 2019-2025)
# ----------------------------
def simular_flujo(cursor, conn):
    anios = range(2019, 2026)
    evaluaciones = ["1ª Evaluación", "2ª Evaluación", "3ª Evaluación"]

    # Obtener todos los alumnos
    cursor.execute("SELECT id, centro_educativo_id, fecha_nacimiento FROM alumno")
    alumnos = cursor.fetchall()

    for alumno_id, centro_actual, fecha_nac in alumnos:
        curso_actual = calcular_curso_inicial(fecha_nac)
        if curso_actual is None:
            continue  # alumno no válido o fuera del rango

        performance = random.choices(
            ['bueno', 'medio', 'malo'],
            weights=[0.30, 0.45, 0.25],
            k=1
        )[0]

        abandono_prob = 0.2 if performance == 'malo' else 0.1 if performance == 'medio' else 0.05

        for anio in anios:
            # Solo permitir abandono si el alumno está en Bachillerato
            if curso_actual >= 14 and random.random() < abandono_prob:
                break

            # Obtener nivel del curso actual
            nivel_actual = curso_a_nivel.get(curso_actual)
            if nivel_actual is None:
                break

            # Verificar si el centro actual ofrece el nivel; si no, cambiar a uno que sí
            if not centro_ofrece_nivel(cursor, centro_actual, nivel_actual):
                posibles_centros = get_centros_por_nivel(cursor, nivel_actual)
                if not posibles_centros:
                    print(f"Advertencia: No hay centros para nivel {nivel_actual}. Saltando matrícula para alumno {alumno_id} en {anio}.")
                    break
                centro_actual = random.choice(posibles_centros)

            # Crear matrícula con el centro (posiblemente cambiado)
            cursor.execute("""
                INSERT INTO matricula (anio_academico, alumno_id, centro_educativo_id, curso_id)
                VALUES (%s, %s, %s, %s)
            """, (anio, alumno_id, centro_actual, curso_actual))
            matricula_id = cursor.lastrowid

            # Generar notas
            asignaturas = get_asignaturas_por_curso(cursor, curso_actual)
            media_total = 0

            for eval in evaluaciones:
                for asig_id in asignaturas:
                    mean = 8 if performance == 'bueno' else 6 if performance == 'medio' else 4
                    nota = random.normalvariate(mean, 1.5)
                    nota = max(0, min(10, round(nota, 1)))
                    media_total += nota

                    cursor.execute("""
                        INSERT INTO nota (calificacion, alumno_id, asignatura_id, curso_id, evaluacion, anio_academico)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (nota, alumno_id, asig_id, curso_actual, eval, anio))

            # Calcular media y decidir si avanza o repite
            num_notas = len(asignaturas) * len(evaluaciones)
            if num_notas > 0:
                media_total /= num_notas

            if media_total > 5:
                curso_actual += 1
                if curso_actual > 15:
                    break  # Graduado
            else:
                abandono_prob += 0.05

        conn.commit()

    print("Flujo de matrículas y notas generados exitosamente.")


# ----------------------------
# GENERAR PERSONAL
# ----------------------------
def generar_personal(cursor, conn, num_personal=100):
    # Obtener todos los centros de la DB
    cursor.execute("SELECT id FROM centro_educativo")
    centros = [row[0] for row in cursor.fetchall()]
    if not centros:
        print("Advertencia: No hay centros en la DB. No se genera personal.")
        return

    for _ in range(num_personal):
        nombre = faker.first_name()
        apellidos = f"{faker.last_name()} {faker.last_name()}"
        cargo = random.choice(['Docente', 'Administrativo', 'Coordinador', 'Director'])
        centro_id = random.choice(centros)
        dni = generar_dni()

        cursor.execute("""
            INSERT INTO personal (apellidos, cargo, nombre, centro_educativo_id, dni )
            VALUES (%s, %s, %s, %s, %s)
        """, (apellidos, cargo, nombre, centro_id, dni))
        conn.commit()

    print(f"{num_personal} registros de personal generados exitosamente.")


# ----------------------------
# PROGRAMA PRINCIPAL
# ----------------------------
if __name__ == "__main__":
    conn = conectar_db()
    cursor = conn.cursor()

    generar_alumnos(cursor, conn, num_alumnos=500)
    simular_flujo(cursor, conn)
    generar_personal(cursor, conn, num_personal=100)

    cursor.close()
    conn.close()