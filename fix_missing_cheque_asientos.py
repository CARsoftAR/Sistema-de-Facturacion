import os
import sys
import django
from datetime import date

# Setup Django environment
sys.path.append('c:/Sistemas CARSOFT/Sistema de facturacion/Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cheque, Asiento
from administrar.services import AccountingService

print("="*60)
print("CORRECCION DE ASIENTOS FALTANTES")
print("="*60)

# Cheques en estado avanzado pero sin asientos
cheques = Cheque.objects.filter(estado__in=['DEPOSITADO', 'COBRADO', 'RECHAZADO'])

for c in cheques:
    print(f"\nProcessing Cheque #{c.id} ({c.numero}) - State: {c.estado}")
    
    # 1. Check & Fix "Ingreso" (Alta)
    asientos_alta = Asiento.objects.filter(descripcion__contains=f"Ingreso Cheque {c.numero}")
    if not asientos_alta.exists():
        print(f" > Missing 'Ingreso' Asiento. Creating...")
        if c.tipo == 'TERCERO':
            try:
                AccountingService.registrar_alta_cheque(c)
                print("   [OK] Created Ingreso Asiento")
            except Exception as e:
                print(f"   [ERROR] Failed to create Ingreso: {e}")
        else:
            print("   [INFO] Cheque PROPIO doesn't generate Ingreso (it's a Payment)")
    else:
        print(" > 'Ingreso' Asiento found.")

    # 2. Check & Fix "Deposito"
    if c.estado in ['DEPOSITADO', 'COBRADO', 'RECHAZADO']:
        # Note: If RECHAZADO, it must have been deposited first.
        asientos_depo = Asiento.objects.filter(descripcion__contains=f"Depósito Cheque {c.numero}")
        if not asientos_depo.exists():
            print(f" > Missing 'Deposito' Asiento. Creating...")
            try:
                # Force usage of service internal method for deposit
                # We want to date it properly? Service uses date.today(). 
                # Ideally we mock or just let it use today (Dec 6th is fine).
                AccountingService._registrar_deposito(c)
                print("   [OK] Created Deposito Asiento")
            except Exception as e:
                print(f"   [ERROR] Failed to create Deposito: {e}")
        else:
            print(" > 'Deposito' Asiento found.")

print("\nDone.")
