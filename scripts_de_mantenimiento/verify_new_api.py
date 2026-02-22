import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.views import api_proveedores_lista
from django.test import RequestFactory
from django.contrib.auth.models import User

# Crear un usuario para simular login si es necesario, 
# o simplemente usar uno existente si ya lo hay.
user = User.objects.filter(is_superuser=True).first() or User.objects.first()

factory = RequestFactory()
request = factory.get('/api/proveedores/lista/')
request.user = user # Simular login

response = api_proveedores_lista(request)

print(f"Status: {response.status_code}")
data = json.loads(response.content.decode('utf-8'))
print(f"OK: {data.get('ok')}")
print(f"Num Providers: {len(data.get('proveedores', []))}")
if data.get('proveedores'):
    print(f"First Provider: {data['proveedores'][0]['nombre']}")
