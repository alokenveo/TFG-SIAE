import mysql.connector

def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="almiokob",
        database="siae_db"
    )

def vaciar_tablas():
    conn = conectar_db()
    cursor = conn.cursor()
    tablas = ['nota', 'matricula', 'alumno', 'personal']

    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
    for tabla in tablas:
        cursor.execute(f"TRUNCATE TABLE {tabla};")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

    conn.commit()
    cursor.close()
    conn.close()
    print("Tablas vaciadas exitosamente")

if __name__ == "__main__":
    vaciar_tablas()
