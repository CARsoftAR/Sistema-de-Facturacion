@echo off
echo ========================================
echo   REINICIANDO SERVIDOR VITE
echo ========================================
echo.

cd /d "c:\Sistema de Facturacion\frontend"

echo [1/2] Deteniendo procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/2] Iniciando servidor de desarrollo...
echo.

start cmd /k "npm run dev"

echo.
echo ========================================
echo   SERVIDOR INICIADO
echo ========================================
echo.
echo Abre tu navegador en:
echo http://localhost:5173/static/dist/ventas-premium
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
