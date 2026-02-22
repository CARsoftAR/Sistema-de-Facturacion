
import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

def check():
    print("Checking PlanCuenta Integrity...")
    all_acc = PlanCuenta.objects.all().order_by('codigo')
    print(f"Total Accounts: {all_acc.count()}")

    for acc in all_acc:
        parent = acc.padre
        # Check specific broken ones
        if acc.codigo.startswith('1.1.04') or acc.codigo == '1.1' or acc.codigo == '1.2':
            p_code = parent.codigo if parent else "None"
            hijos_count = acc.hijos.count()
            print(f"Account: {acc.codigo} ({acc.id}) | Parent: {p_code} | Children in DB: {hijos_count}")

            if acc.codigo == '1.1':
                 # List children explicitly
                 for child in acc.hijos.all():
                     print(f"   -> Child: {child.codigo}")

if __name__ == '__main__':
    check()
