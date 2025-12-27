import os
import django
import json
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta, ItemAsiento
from django.test import RequestFactory
from administrar.views import api_mayor_consultar

print("=" * 60)
print("DIAGNÓSTICO LIBRO MAYOR - CUENTA AGRUPADORA")
print("=" * 60)

# Buscamos una cuenta padre de alguna cuenta que tenga movimientos
item = ItemAsiento.objects.first()
if not item:
    print("NO HAY DATOS.")
    exit()

hijo = item.cuenta
padre = hijo.padre

if not padre:
    print(f"La cuenta {hijo} no tiene padre. Buscando otra...")
    # Intento buscar alguna cuenta con padre
    for pc in PlanCuenta.objects.exclude(padre=None):
        if ItemAsiento.objects.filter(cuenta=pc).exists():
            hijo = pc
            padre = pc.padre
            break

if not padre:
    print("No encontré ninguna jerarquía con datos para probar.")
    exit()

print(f"Cuenta HIJO: {hijo} (ID: {hijo.id}) - Movimientos: {ItemAsiento.objects.filter(cuenta=hijo).count()}")
print(f"Cuenta PADRE: {padre} (ID: {padre.id}) - Movimientos directos: {ItemAsiento.objects.filter(cuenta=padre).count()}")

# Simular llamada a la API para el PADRE
factory = RequestFactory()
url = f'/api/contabilidad/mayor/?cuenta_id={padre.id}'
request = factory.get(url)

response = api_mayor_consultar(request)
content = json.loads(response.content.decode('utf-8'))

print(f"\nResultados API para PADRE ({padre}):")
print(f"Movimientos retornados: {len(content.get('movimientos', []))}")

print("\n" + "=" * 60)
