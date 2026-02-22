
import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

def fix():
    print("Fixing Hierarchy based on Codes...")
    cuentas = PlanCuenta.objects.all().order_by('codigo')
    fixed_count = 0

    for c in cuentas:
        if '.' not in c.codigo:
            continue # Root node like '1', '2'
        
        # Calculate expected parent code
        parts = c.codigo.split('.')
        # Parent code is everything except the last part
        parent_code = '.'.join(parts[:-1])
        
        # Check current parent
        current_parent = c.padre
        
        if current_parent and current_parent.codigo == parent_code:
            continue # Already correct
            
        # Find parent
        expected_parent = PlanCuenta.objects.filter(codigo=parent_code).first()
        
        if expected_parent:
            print(f"Fixing {c.codigo} ({c.nombre}): Parent {current_parent} -> {expected_parent}")
            c.padre = expected_parent
            c.nivel = expected_parent.nivel + 1
            c.save()
            fixed_count += 1
        else:
            print(f"Create Parent Warning: Parent {parent_code} NOT FOUND for child {c.codigo}")

    print(f"Done. Fixed {fixed_count} accounts.")

if __name__ == '__main__':
    fix()
