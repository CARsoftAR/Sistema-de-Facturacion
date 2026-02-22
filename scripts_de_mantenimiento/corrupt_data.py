import os
import django
import sys

# Load .env
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente, MovimientoCuentaCorriente

c = Cliente.objects.get(id=1)
last_mov = MovimientoCuentaCorriente.objects.filter(cliente=c).order_by('-fecha').first()
if last_mov:
    print(f"Original Saldo: {last_mov.saldo}")
    last_mov.saldo = 40538147.00
    last_mov.save()
    print(f"Corrupted Saldo to: {last_mov.saldo}")
else:
    print("No movements found")
