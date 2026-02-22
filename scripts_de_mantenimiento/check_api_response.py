import requests

# Supongo que el servidor está corriendo en localhost:8000
# Pero como estoy en el entorno del servidor, puedo usar una petición interna simulada si es necesario
# O simplemente confiar en que el código que vi es el que se ejecuta.

# Sin embargo, puedo intentar llamar a la vista directamente en un script de django
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.views import api_proveedores_lista
from django.test import RequestFactory

factory = RequestFactory()
request = factory.get('/api/proveedores/lista/')
response = api_proveedores_lista(request)

print(f"Status: {response.status_code}")
print(f"Content: {response.content.decode('utf-8')}")
