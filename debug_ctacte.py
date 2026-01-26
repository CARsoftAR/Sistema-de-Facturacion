import os
import django
import sys

# Load .env manually
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente, MovimientoCuentaCorriente
from django.db.models import Sum

def debug_client(name_part):
    print(f"--- Debugging Client matching '{name_part}' ---")
    clientes = Cliente.objects.filter(nombre__icontains=name_part)
    if not clientes.exists():
        print("No matches found.")
        return

    for c in clientes:
        print(f"\nID: {c.id} | Name: {c.nombre} | Stored Saldo Actual: {c.saldo_actual}")
        
        movs = MovimientoCuentaCorriente.objects.filter(cliente=c).order_by('fecha')
        count = movs.count()
        print(f"Total Movements: {count}")
        
        if count == 0:
            continue
            
        calculated_saldo = 0
        last_stored_saldo = 0
        mismatch_count = 0
        
        print(f"{'Date':<20} | {'Type':<10} | {'Monto':<12} | {'Calc Saldo':<15} | {'Stored Saldo':<15} | {'Diff'}")
        print("-" * 90)
        
        for m in movs:
            if m.tipo == 'VENTA' or m.tipo == 'DEBE':
                calculated_saldo += m.monto
            else:
                calculated_saldo -= m.monto
                
            diff = calculated_saldo - m.saldo
            if abs(diff) > 0.01:
                mismatch_count += 1
            
            last_stored_saldo = m.saldo
            
            # Print only first 5 and last 5 and any mismatch
            # actually print all for now if reasonable, or summary
        
        print(f"\nFinal Calculated Saldo: {calculated_saldo}")
        print(f"Final Stored Saldo (Last Mov): {last_stored_saldo}")
        print(f"Client.saldo_actual: {c.saldo_actual}")
        print(f"Total Mismatches in history: {mismatch_count}")
        
        if abs(calculated_saldo - c.saldo_actual) > 0.01:
            print(">>> CRITICAL: Calculated balance does NOT match Client.saldo_actual")
        else:
            print(">>> OK: Calculated balance matches Client.saldo_actual")
            
        if abs(last_stored_saldo - c.saldo_actual) > 0.01:
             print(">>> CRITICAL: Last stored movement saldo does NOT match Client.saldo_actual")
        else:
             print(">>> OK: Last stored movement matching Client.saldo_actual")

if __name__ == '__main__':
    debug_client("Cliente Prueba")
