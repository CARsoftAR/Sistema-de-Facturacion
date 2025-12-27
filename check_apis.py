import os
import django
import json
# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from django.test import RequestFactory
from django.urls import resolve
from administrar.views import api_plan_cuentas_lista, api_ejercicios_listar, api_mayor_consultar
from administrar.models import PlanCuenta

print("=" * 60)
print("DIAGNÓSTICO INTEGRAL API CONTABILIDAD")
print("=" * 60)

factory = RequestFactory()

def test_api(name, url, view_func, params=None):
    print(f"\nProbando API: {name}")
    print(f"URL: {url}")
    try:
        # Verificar resolución de URL
        resolver = resolve(url.split('?')[0])
        print(f"URL resuelve a: {resolver.view_name}")
        
        # Crear request
        if params:
            url_full = f"{url}?{params}"
        else:
            url_full = url
            
        request = factory.get(url_full)
        response = view_func(request)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            content = json.loads(response.content.decode('utf-8'))
            if isinstance(content, list):
                 print(f"Datos recibidos (lista): {len(content)} items")
            elif content.get('success') or content.get('ok'):
                print("Success: True")
                keys = list(content.keys())
                print(f"Claves en respuesta: {keys}")
                # Mostrar detalles específicos
                if 'cuentas' in content:
                    print(f"Total cuentas raíz: {len(content['cuentas'])}")
                if 'ejercicios' in content:
                    print(f"Total ejercicios: {len(content['ejercicios'])}")
                if 'movimientos' in content:
                     print(f"Total movimientos: {len(content['movimientos'])}")
            else:
                print("Success: False (lógica)")
                print(f"Error: {content.get('error')}")
        else:
            print(f"Error HTTP: {response.content.decode('utf-8')}")
            
    except Exception as e:
        print(f"FALLÓ: {str(e)}")
        import traceback
        traceback.print_exc()

# 1. Test Plan de Cuentas
test_api("Plan de Cuentas", "/api/contabilidad/plan-cuentas/", api_plan_cuentas_lista)

# 2. Test Ejercicios
test_api("Ejercicios", "/api/contabilidad/ejercicios/", api_ejercicios_listar)

# 3. Test Mayor (buscando una cuenta válida)
cuenta = PlanCuenta.objects.filter(imputable=True).first()
if cuenta:
    params = f"cuenta_id={cuenta.id}"
    test_api("Libro Mayor (Consulta)", "/api/contabilidad/mayor/", api_mayor_consultar, params)
else:
    print("\nSKIP: No hay cuentas imputables para probar el Mayor.")

print("\n" + "=" * 60)
