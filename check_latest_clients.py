import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente

def check_clients():
    print("--- Last 10 Clients ---")
    clients = Cliente.objects.all().order_by('-id')[:10]
    for c in clients:
        print(f"ID: {c.id} | Nombre: {c.nombre} | Fecha Alta: {c.fecha_alta}")

if __name__ == "__main__":
    check_clients()
