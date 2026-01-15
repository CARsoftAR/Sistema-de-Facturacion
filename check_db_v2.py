
import os
import sys
import django
from datetime import datetime

# Add the project root to sys.path
sys.path.append(r'c:\Sistema de Facturacion')

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')

# Setup Django
django.setup()

from administrar.models import OrdenCompra

print(f"--- DB CHECK START at {datetime.now()} ---")
count = OrdenCompra.objects.count()
print(f"Total OrdenCompra count: {count}")

print("Last 10 OrdenCompra records (ordered by -id):")
for o in OrdenCompra.objects.all().order_by('-id')[:10]:
    print(f"ID: {o.id} | Fecha: {o.fecha} | Prov: {o.proveedor.nombre} | Estado: {o.estado} | Total: {o.total_estimado}")

print("--- DB CHECK END ---")
