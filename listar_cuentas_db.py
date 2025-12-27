import os
import django
# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

print("=" * 60)
print("DIAGNÓSTICO PLAN DE CUENTAS")
print("=" * 60)

cuentas = PlanCuenta.objects.all().order_by('codigo')
if not cuentas.exists():
    print("NO HAY CUENTAS EN LA BASE DE DATOS.")
else:
    print(f"Total cuentas: {cuentas.count()}")
    for c in cuentas:
        print(f"{c.codigo} - {c.nombre} (Imputable: {c.imputable})")

print("\n" + "=" * 60)
