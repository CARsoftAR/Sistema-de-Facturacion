import os
import django
from datetime import date
import sys

# Setup Django environment
sys.path.append('c:/Sistemas CARSOFT/Sistema de facturacion/Sistema de facturacion')
sys.path.append('c:/Sistemas CARSOFT/Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta, EjercicioContable

print("--- Checking Exercises ---")
today = date.today()
print(f"Today: {today}")
ejercicios = EjercicioContable.objects.filter(fecha_inicio__lte=today, fecha_fin__gte=today, cerrado=False)
if ejercicios.exists():
    for e in ejercicios:
        print(f"Active Exercise: {e.descripcion} ({e.fecha_inicio} - {e.fecha_fin})")
else:
    print("NO ACTIVE EXERCISE FOUND FOR TODAY!")
    all_ejercicios = EjercicioContable.objects.all()
    print(f"Total exercises in DB: {all_ejercicios.count()}")
    for e in all_ejercicios:
        print(f" - {e.descripcion}: {e.fecha_inicio} to {e.fecha_fin} (Closed: {e.cerrado})")

print("\n--- Checking Accounts ---")
target_accounts = ["Valores a Depositar", "Banco", "Deudores por Ventas", "Caja", "Proveedores"]
for target in target_accounts:
    cuentas = PlanCuenta.objects.filter(nombre__icontains=target, imputable=True)
    if cuentas.exists():
        for c in cuentas:
            print(f"Found '{target}': {c.codigo} - {c.nombre} (Imputable: {c.imputable})")
    else:
        print(f"NOT FOUND: '{target}'")
