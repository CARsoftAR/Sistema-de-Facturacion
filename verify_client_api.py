import os
import django
import json
from django.test import RequestFactory
from django.contrib.auth.models import User

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.views import api_cliente_nuevo, api_cliente_editar, api_cliente_detalle
from administrar.models import Cliente

def verify():
    factory = RequestFactory()
    user = User.objects.first()
    
    print("--- Testing api_cliente_nuevo ---")
    data = {
        "nombre": "API TEST CLIENT",
        "cuit": "20123456789",
        "provincia": "1",
        "localidad": "1",
        "tiene_ctacte": "on"
    }
    
    # Simulate POST with FormData
    request = factory.post('/api/clientes/nuevo/', data)
    request.user = user
    request.content_type = 'application/x-www-form-urlencoded'
    
    response = api_cliente_nuevo(request)
    print(f"Status: {response.status_code}")
    res_data = json.loads(response.content)
    print(f"Response: {res_data}")
    
    if not res_data.get('ok'):
        print("FAILED")
        return

    client_id = res_data['cliente']['id']
    
    print("\n--- Testing api_cliente_editar ---")
    edit_data = {
        "nombre": "API TEST CLIENT UPDATED",
        "cuit": "20123456781",
        "activo": "off"
    }
    
    request_edit = factory.post(f'/api/clientes/{client_id}/editar/', edit_data)
    request_edit.user = user
    request_edit.content_type = 'application/x-www-form-urlencoded'
    
    response_edit = api_cliente_editar(request_edit, client_id)
    print(f"Status: {response_edit.status_code}")
    res_edit_data = json.loads(response_edit.content)
    print(f"Response: {res_edit_data}")
    
    # Final check in DB
    c = Cliente.objects.get(id=client_id)
    print(f"\nFinal DB State: {c.nombre}, Cuit: {c.cuit}, Activo: {c.activo}")
    
    # Cleanup
    # c.delete()
    # print("Deleted test client.")

if __name__ == "__main__":
    verify()
