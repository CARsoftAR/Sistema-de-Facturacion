import os
import django
import json
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta, ItemAsiento, Asiento
from django.test import RequestFactory
from administrar.views import api_mayor_consultar

print("=" * 60)
print("DIAGNÓSTICO LIBRO MAYOR")
print("=" * 60)

# 1. Buscar una cuenta con movimientos
item = ItemAsiento.objects.first()
if not item:
    print("ERROR: No hay movimientos contables en la base de datos (ItemAsiento vacío).")
    print("Corre el script 'generar_datos_contables.py' primero.")
    exit()

cuenta_con_movimientos = item.cuenta
print(f"Cuenta de prueba encontrada: {cuenta_con_movimientos} (ID: {cuenta_con_movimientos.id})")
print(f"Es imputable: {cuenta_con_movimientos.imputable}")

# Contar movimientos directos
count = ItemAsiento.objects.filter(cuenta=cuenta_con_movimientos).count()
print(f"Movimientos directos en BD: {count}")

# 2. Simular llamada a la API
factory = RequestFactory()
url = f'/api/contabilidad/mayor/?cuenta_id={cuenta_con_movimientos.id}'
request = factory.get(url)

try:
    response = api_mayor_consultar(request)
    print(f"\nStatus Code: {response.status_code}")
    
    content = json.loads(response.content.decode('utf-8'))
    
    if content.get('success'):
        print(f"Success: True")
        print(f"Movimientos retornados: {len(content.get('movimientos', []))}")
        
        if len(content.get('movimientos', [])) > 0:
            print("EJEMPLO DE MOVIMIENTO:")
            print(content['movimientos'][0])
        else:
            print("WARNING: La API retornó 0 movimientos a pesar de que existen en BD.")
    else:
        print(f"Success: False")
        print(f"Error: {content.get('error')}")

except Exception as e:
    print(f"EXCEPCIÓN AL LLAMAR API: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
