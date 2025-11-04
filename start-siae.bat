@echo off
setlocal enabledelayedexpansion

set IA_PATH=C:\Users\FREDY\git\TFG-SIAE\ia-siae
set BACKEND_PATH=C:\Users\FREDY\git\TFG-SIAE\backend-siae
set FRONTEND_PATH=C:\Users\FREDY\git\TFG-SIAE\frontend-siae

:MENU
cls
echo =========================================
echo      GESTOR DE PROYECTOS SIAE
echo =========================================
echo [1] Iniciar todos los servicios
echo [2] Detener todos los servicios
echo [3] Salir
echo.
set /p opcion=Selecciona una opcion: 

if "%opcion%"=="1" goto START
if "%opcion%"=="2" goto STOP
if "%opcion%"=="3" exit
goto MENU

:START
echo Iniciando IA...
start "IA - FastAPI" cmd /k "cd /d %IA_PATH% && .venv\Scripts\activate && uvicorn main:app --reload"
timeout /t 5 >nul
echo Iniciando backend...
start "Backend - Spring" cmd /k "cd /d %BACKEND_PATH% && mvn spring-boot:run"
timeout /t 15 >nul
echo Iniciando frontend...
start "Frontend - React" cmd /k "cd /d %FRONTEND_PATH% && npm start"
chcp 65001 >nul
echo ✅ Todo en marcha.
pause
goto MENU

:STOP
echo Deteniendo servicios...
taskkill /FI "WINDOWTITLE eq IA - FastAPI" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend - Spring" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend - React" /T /F >nul 2>&1
taskkill /IM "uvicorn.exe" /F >nul 2>&1
taskkill /IM "java.exe" /F >nul 2>&1
taskkill /IM "node.exe" /F >nul 2>&1
chcp 65001 >nul
echo 🛑 Todos los servicios se han detenido.
pause
goto MENU
