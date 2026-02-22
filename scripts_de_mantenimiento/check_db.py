
import os
import django
import sys

# Setup Django environment
sys.path.append('c:\\Sistema de Facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_facturacion.settings')
django.setup()

from administrar.models import OrdenCompra

print(f"Total Ordenes: {OrdenCompra.objects.count()}")
for o in OrdenCompra.objects.all().order_by('-id')[:10]:
    print(f"ID: {o.id} - Fecha: {o.fecha} - Estado: {o.estado}")
