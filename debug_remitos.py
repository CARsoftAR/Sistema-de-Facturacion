
import os
import django
import sys

# Setup Django standalone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Remito, Venta

print("--- DEBUGGING REMITOS ---")
remitos_count = Remito.objects.count()
print(f"Total Remitos in DB: {remitos_count}")

if remitos_count > 0:
    for r in Remito.objects.all().order_by('-id')[:5]:
        print(f"ID: {r.id} | Numero: {r.numero_formateado()} | Cliente: {r.cliente.nombre} | Fecha: {r.fecha}")
else:
    print("No remitos found.")

print("\n--- DEBUGGING VENTAS RECENTES ---")
ventas = Venta.objects.all().order_by('-id')[:5]
for v in ventas:
    print(f"Venta ID: {v.id} | Factura: {v.numero_factura()} | Cliente: {v.cliente.nombre} | Fecha: {v.fecha}")
