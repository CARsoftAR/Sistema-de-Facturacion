# Usar una imagen base oficial de Python
FROM python:3.10-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Establecer variables de entorno
# PYTHONDONTWRITEBYTECODE: Evita que Python escriba archivos .pyc
# PYTHONUNBUFFERED: Asegura que la salida de Python se envíe directamente a la terminal
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema necesarias para mysqlclient y psycopg2
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    libpq-dev \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requerimientos
COPY requirements.txt /app/

# Instalar las dependencias de Python
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . /app/

# Recolectar archivos estáticos
RUN python manage.py collectstatic --noinput

# Exponer el puerto 8000
EXPOSE 8000

# Comando para ejecutar la aplicación usando Gunicorn
CMD ["gunicorn", "sistema_comercial.wsgi:application", "--bind", "0.0.0.0:8000"]
