import os
import sys
import django

sys.path.append('c:/Sistemas CARSOFT/Sistema de facturacion/Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

print("="*60)
print("DIAGNOSTICO CUENTAS IMPUESTOS Y COSTOS")
print("="*60)

keywords = ["IVA", "Debito", "Dèbito", "Crédito", "Credito", "Costo", "CMV"]

for k in keywords:
    print(f"\n--- Searching for '{k}' ---")
    matches = PlanCuenta.objects.filter(nombre__icontains=k)
    for c in matches:
        print(f"[{c.id}] {c.codigo} - {c.nombre} (Imputable: {c.imputable})")
