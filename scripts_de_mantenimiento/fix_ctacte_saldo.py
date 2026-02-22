import os
import django
import sys
from decimal import Decimal

# Load .env info manual
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                try:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
                except:
                    pass

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente, MovimientoCuentaCorriente

def fix_all_clients():
    print("--- Starting Full Balance Repair ---")
    
    clientes = Cliente.objects.all()
    count_fixed = 0
    
    for c in clientes:
        # Get all movements ordered by oldest first
        movs = MovimientoCuentaCorriente.objects.filter(cliente=c).order_by('fecha', 'id')
        
        if not movs.exists():
            if c.saldo_actual != 0:
                print(f"Client {c.nombre} has no movements but saldo={c.saldo_actual}. Resetting to 0.")
                c.saldo_actual = 0
                c.save()
            continue
            
        real_balance = Decimal('0')
        client_updates = 0
        
        for m in movs:
            old_saldo = m.saldo
            monto = m.monto if m.monto else Decimal('0')
            
            if m.tipo == 'VENTA' or m.tipo == 'DEBE':
                real_balance += monto
            else:
                real_balance -= monto
            
            # Check if this movement's stored saldo is wrong
            if abs(old_saldo - real_balance) > Decimal('0.01'):
                # print(f"  Fixing Mov ID {m.id}: {old_saldo} -> {real_balance}")
                m.saldo = real_balance
                m.save()
                client_updates += 1
        
        # Finally check client saldo
        if abs(c.saldo_actual - real_balance) > Decimal('0.01'):
            print(f"Client {c.nombre} (ID: {c.id}): Fixed Balance {c.saldo_actual} -> {real_balance} ({client_updates} movs fixed)")
            c.saldo_actual = real_balance
            c.save()
            count_fixed += 1
        elif client_updates > 0:
            print(f"Client {c.nombre} (ID: {c.id}): Fixed {client_updates} movements history (Final Balance was OK)")
            
    print(f"\nRepair Complete. Fixed {count_fixed} clients.")

if __name__ == '__main__':
    fix_all_clients()
