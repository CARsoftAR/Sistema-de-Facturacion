
import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

def verify():
    count = PlanCuenta.objects.count()
    print(f"VERIFICACION FINAL: El sistema tiene {count} cuentas en la base de datos.")
    
    if count < 50:
        print("ALERT: Low account count!")
    else:
        print("Count seems correctly populated.")

if __name__ == '__main__':
    verify()
