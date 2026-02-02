@echo off
echo ========================================
echo   REINICIANDO SERVIDOR DE DESARROLLO
echo ========================================
echo.

echo [1/3] Deteniendo procesos Node.js anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo      OK - Procesos detenidos

echo.
echo [2/3] Cambiando a directorio frontend...
cd /d "%~dp0frontend"
echo      OK - En directorio: %CD%

echo.
echo [3/3] Iniciando servidor Vite...
echo.
echo ========================================
echo   SERVIDOR INICIANDO...
echo ========================================
echo.

npm run dev

pause
