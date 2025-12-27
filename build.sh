#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Crear superusuario automáticamente si están definidas las variables
if [[ -n "$DJANGO_SUPERUSER_USERNAME" && -n "$DJANGO_SUPERUSER_PASSWORD" ]]; then
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput || echo "Superuser creation skipped (might already exist)"
fi

# Poblar datos de prueba si se solicita
if [[ "$POBLAR_DB" == "true" || "$POBLAR_DB" == "TRUE" ]]; then
    echo "Poblando base de datos con datos de prueba..."
    python manage.py poblar_datos
fi
