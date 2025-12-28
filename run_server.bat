@echo off
REM Script para iniciar el servidor Django con el entorno virtual

REM Activar entorno virtual y ejecutar servidor
call venv\Scripts\activate.bat
python manage.py runserver
