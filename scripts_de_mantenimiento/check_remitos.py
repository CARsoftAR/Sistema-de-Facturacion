import os
import django
import sys

# Setup Django environment
sys.path.append(r'c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Remito

print(f"Total Remitos: {Remito.objects.count()}")
for r in Remito.objects.order_by('-id')[:5]:
    print(f"ID: {r.id}, Venta: {r.venta_asociada.id}, Fecha: {r.fecha}, Cliente: {r.cliente.nombre}")
