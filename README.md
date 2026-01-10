# 🎓 SIAE - Sistema de Información y Administración Educativa

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.13-009688.svg)](https://fastapi.tiangolo.com/)

Sistema integral de gestión educativa con capacidades de análisis predictivo mediante inteligencia artificial, desarrollado como Trabajo de Fin de Grado.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Módulos del Sistema](#-módulos-del-sistema)
- [API REST](#-api-rest)
- [Modelos de Machine Learning](#-modelos-de-machine-learning)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

### 🏫 Gestión Educativa
- **Gestión de Centros Educativos**: Administración completa de centros con niveles educativos configurables
- **Gestión de Alumnos**: Registro, matrícula y seguimiento académico personalizado
- **Gestión de Personal**: Control de plantilla docente y administrativa
- **Matrículas**: Sistema flexible de matrículas con validación de centros y cursos
- **Expedientes Académicos**: Historial completo con generación de informes en PDF

### 📊 Dashboard y Análisis
- **Dashboard Multi-Rol**: Vistas personalizadas según perfil (Administrador/Gestor/Invitado)
- **KPIs en Tiempo Real**: Indicadores clave de rendimiento educativo
- **Gráficos Interactivos**: Visualizaciones con Recharts para análisis de datos
- **Filtros Avanzados**: Búsqueda y filtrado por múltiples criterios

### 🤖 Inteligencia Artificial
- **Predicción de Riesgo Académico**: Identifica alumnos en riesgo de repetir o abandonar
- **Análisis por Asignatura**: Predicción de rendimiento por materia
- **Tendencias Educativas**: Forecasting de tasas de suspensos
- **Recomendaciones Personalizadas**: Sugerencias de intervención basadas en ML
- **Análisis de Disparidades**: Detección de brechas por género y provincia
- **Impacto del Ratio Alumno/Personal**: Simulaciones de escenarios

### 🔐 Seguridad
- **Autenticación JWT**: Sistema robusto de autenticación con tokens
- **Control de Acceso por Roles**: Permisos granulares (ADMIN, GESTOR, INVITADO)
- **Recuperación de Contraseña**: Sistema de reset vía email
- **Encriptación BCrypt**: Contraseñas hasheadas con Spring Security

---

## 🏗️ Arquitectura

```
TFG-SIAE/
├── backend-siae/          # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── unex/cum/tfg/siae/
│   │   │   │       ├── config/         # Configuración (CORS, AppConfig)
│   │   │   │       ├── controller/     # Controladores REST
│   │   │   │       ├── model/          # Entidades JPA
│   │   │   │       ├── repository/     # Repositorios Spring Data
│   │   │   │       ├── security/       # JWT, SecurityConfig
│   │   │   │       └── services/       # Lógica de negocio
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── DatosEducativos.sql
│   │   └── test/
│   └── pom.xml
│
├── frontend-siae/         # Frontend React
│   ├── public/
│   │   └── logo-siae.png
│   ├── src/
│   │   ├── api/            # Servicios API (axios)
│   │   ├── components/     # Componentes React
│   │   │   ├── layout/     # Navbar, Sidebar
│   │   │   └── *.js        # Forms (Alumno, Centro, etc.)
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Vistas principales
│   │   ├── styles/         # Tema MUI
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── ia-siae/               # Microservicio IA (FastAPI + ML)
│   ├── models/            # Modelos entrenados (.pkl)
│   ├── scripts/
│   │   ├── ml_train.py    # Entrenamiento de modelos
│   │   ├── ml_predict.py  # Predicciones CLI
│   │   ├── rellenar_base.py  # Generación de datos
│   │   └── vaciar_base.py
│   ├── siae_ml/
│   │   ├── data_loader.py    # Conexión MySQL
│   │   ├── features.py       # Feature engineering
│   │   ├── model_trainer.py  # Entrenamiento ML
│   │   └── predictor.py      # Lógica de predicción
│   ├── main.py            # API FastAPI
│   └── requirements.txt
│
└── README.md
```

---

## 🛠️ Tecnologías

### Backend (Spring Boot)
- **Java 17**
- **Spring Boot 3.5.3**
- **Spring Data JPA** (Hibernate)
- **Spring Security** (JWT)
- **MySQL Connector**
- **Maven** (gestión de dependencias)

### Frontend (React)
- **React 18.2.0**
- **React Router 6.14.1**
- **Material-UI 7.3.4** (componentes UI)
- **Recharts 3.3.0** (gráficos)
- **Axios 1.12.2** (cliente HTTP)
- **Framer Motion 12.23.24** (animaciones)
- **jsPDF** (generación de PDFs)

### Microservicio IA (Python)
- **Python 3.11**
- **FastAPI 0.115.13**
- **scikit-learn 1.7.2**
- **pandas 2.3.3**
- **numpy 2.3.4**
- **statsmodels 0.14.5**
- **MySQL Connector Python**
- **Uvicorn** (servidor ASGI)

### Base de Datos
- **MySQL 8**

---

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- **Java JDK 17+** ([Descargar](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 16+** y **npm** ([Descargar](https://nodejs.org/))
- **Python 3.11+** ([Descargar](https://www.python.org/downloads/))
- **MySQL 8+** ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **Maven 3.9+** (incluido con Spring Boot)

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/alokenveo/TFG-SIAE.git
cd TFG-SIAE
```

### 2️⃣ Configurar Base de Datos

```bash
# Iniciar MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE siae_db;

# Importar estructura inicial (opcional)
USE siae_db;
SOURCE backend-siae/src/main/resources/Estructura_SIAE_DB.sql;
```

### 3️⃣ Backend (Spring Boot)

```bash
cd backend-siae

# Editar application.properties con tus credenciales MySQL
# Ubicación: src/main/resources/application.properties

# Compilar y ejecutar en el CMD Windows:
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### 4️⃣ Frontend (React)

```bash
cd frontend-siae

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El frontend estará disponible en `http://localhost:3000`

### 5️⃣ Microservicio IA (Python)

```bash
cd ia-siae

# Crear entorno virtual (recomendado)
python -m venv .venv

# Activar entorno virtual
# En Linux/Mac:
source .venv/bin/activate
# En Windows:
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Entrenar modelos (primera vez o tras cambios en datos)
python scripts/ml_train.py

# Iniciar API FastAPI
python main.py
```

El microservicio IA estará disponible en `http://localhost:8000`

---

## ⚙️ Configuración

### Backend (`application.properties`)

```properties
# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/siae_db?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Puerto del servidor
server.port=8080

# URL del microservicio IA
siae.ia-service.url=http://localhost:8000

# JWT Secret (cambiar en producción)
jwt.secret=TU_SECRET_BASE64
```

### Frontend (`.env` opcional)

```bash
REACT_APP_API_URL=http://localhost:8080/api
```

### Microservicio IA (`siae_ml/data_loader.py`)

```python
def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="TU_PASSWORD",
        database="siae_db"
    )
```

---

## 📖 Uso

### Primer Login

Credenciales por defecto (creadas en `DatosEducativos.sql`):

```
Usuario: admin@siae.edu
Contraseña: admin123
Rol: ADMIN
```

### Flujo de Trabajo Típico

1. **Login** → Autenticación con JWT
2. **Dashboard** → Visualización de KPIs según rol
3. **Gestión**:
   - **Centros** (solo ADMIN): Crear/editar centros y asignar niveles
   - **Alumnos**: Registro, edición, búsqueda avanzada
   - **Matrículas**: Inscripción en cursos con validación
   - **Notas**: Registro por evaluación y asignatura
4. **Análisis IA** (ADMIN/GESTOR):
   - Ver predicciones de riesgo por alumno
   - Analizar tendencias por centro/provincia
   - Generar recomendaciones automáticas

### Generación de Datos de Prueba

```bash
cd ia-siae

# Vaciar tablas (¡cuidado en producción!)
python scripts/vaciar_base.py

# Generar 500 alumnos con historial 2019-2025
python scripts/rellenar_base.py
```

---

## 🧩 Módulos del Sistema

### Gestión de Centros
- CRUD completo de centros educativos
- Asignación de niveles educativos (Infantil, Primaria, ESO, Bachillerato)
- Filtros por provincia, tipo (público/privado/concertado)

### Gestión de Alumnos
- Registro con validación de DNI
- Historial académico completo
- Exportación de expedientes en PDF
- Búsqueda por DNI, nombre, centro, año de nacimiento

### Gestión de Matrículas
- Validación de centro → nivel → curso → asignaturas
- Soporte para cambios de centro
- Registro de notas por evaluación (1ª, 2ª, 3ª)

### Gestión de Personal
- Registro de docentes y administrativos
- Asignación a centros educativos
- Cálculo de ratios alumno/personal

### Dashboard
- **Admin**: Visión nacional (provincias, centros, niveles)
- **Gestor**: Visión del centro asignado
- **Invitado**: Sin acceso a datos sensibles

---

## 🔌 API REST

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "admin@siae.edu",
  "password": "admin123"
}

Response:
{
  "token": "Bearer eyJhbGc...",
  "usuario": { ... }
}
```

### Alumnos

```http
GET /api/alumnos/lista?page=0&size=20&search=juan
Authorization: Bearer TOKEN

GET /api/alumnos/{id}
GET /api/alumnos/dni/{dni}
POST /api/alumnos/registrar
PUT /api/alumnos/editar/{id}
DELETE /api/alumnos/eliminar/{id}
```

### Matrículas

```http
POST /api/matriculas/registrar
{
  "alumnoId": 1,
  "centroEducativoId": 2,
  "cursoId": 10,
  "anioAcademico": 2025
}

GET /api/matriculas/lista?cursoId=10&anio=2025
GET /api/matriculas/alumno/{alumnoId}
```

### IA - Predicciones

```http
POST /api/ia/stats?anio=2025
GET /api/ia/rendimiento
```

**Documentación completa:** `http://localhost:8080/swagger-ui.html` (si Swagger está habilitado)

---

## 🤖 Modelos de Machine Learning

### Entrenamiento

```bash
cd ia-siae
python scripts/ml_train.py
```

**Modelos entrenados:**
1. **Suspenso por Asignatura** (`Random Forest Classifier`)
   - Predice probabilidad de suspender cada materia
   - Calibrado con isotonic regression
   
2. **Nota Esperada** (`Random Forest Regressor`)
   - Predice calificación numérica (0-10)
   
3. **Repetir Curso** (`Random Forest Classifier`)
   - Predice si el alumno repetirá basándose en media anual
   
4. **Abandono Escolar** (`Random Forest Classifier`)
   - Solo para Bachillerato, predice abandono

### Features Utilizadas

- **Temporales**: edad, retraso escolar
- **Académicas**: nota_previa, media_anual, suspensos_acumulados
- **Estructurales**: ratio_alumno_personal, curso_orden, nivel_id
- **Demográficas**: sexo, provincia

### Métricas

```
RMSE Nota: ~0.85
Accuracy Suspenso: ~92%
Accuracy Repetir: ~89%
Accuracy Abandono: ~86%
```

### Predicciones CLI

```bash
python scripts/ml_predict.py

# Opciones:
# 1. Predicción por alumno individual
# 2. Agregadas por centro/provincia
# 3. Rendimiento por asignatura
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones de Código

- **Java**: Camel Case, JavaDoc en métodos públicos
- **JavaScript**: ESLint + Prettier
- **Python**: PEP 8, Type hints recomendados

---

## 📝 Licencia

Este proyecto es un Trabajo de Fin de Grado (TFG) desarrollado para fines académicos.

---

## 👨‍💻 Autor

**Alfredo Mituy Okenve Obiang**  
Universidad de Extremadura  
Grado en Ingeniería Informática  
Curso 2024/2025

📧 Email: [fredymituy@gmail.com](mailto:fredymituy@gmail.com)  
🔗 LinkedIn: [Alfredo M. Okenve](https://linkedin.com/in/alfredo-mituy-okenve-obiang-72180124b)

---

## 🙏 Agradecimientos

- Material-UI por el sistema de diseño
- FastAPI por la documentación automática
- scikit-learn por los modelos de ML
- Spring Boot por la robustez del backend
- Comunidad de Stack Overflow y GitHub

---

## 📸 Capturas de Pantalla

### Dashboard Administrador
![Dashboard](docs/screenshots/dashboard-admin.png)

### Gestión de Alumnos
![Alumnos](docs/screenshots/gestion-alumnos.png)

### Análisis IA
![IA](docs/screenshots/analisis-ia.png)

---


**⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub**
