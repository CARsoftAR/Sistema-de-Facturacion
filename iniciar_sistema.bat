@echo off
title Sistema de Facturacion - Servidor
echo ==========================================
echo   INICIANDO SISTEMA DE FACTURACION
echo ==========================================
echo.
echo 1. Activando entorno virtual...
if exist venv\Scripts\activate (
    call venv\Scripts\activate
) else (
    echo [ADVERTENCIA] No se encontro carpeta venv. Intentando usar python global.
)

echo 2. Abriendo navegador...
start http://localhost:8000

echo 3. Iniciando servidor...
echo    (No cierres esta ventana mientras uses el sistema)
echo.
python run_waitress.py
pause
