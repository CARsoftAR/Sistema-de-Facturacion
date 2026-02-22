
import os
import django
from django.db.models import F

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from administrar.models import Producto

print("--- DEBUG STOCK ---")
total = Producto.objects.count()
print(f"Total Productos: {total}")

bajo_stock = Producto.objects.filter(stock__lt=F('stock_minimo'))
print(f"Productos con stock < stock_minimo: {bajo_stock.count()}")

print("\n--- MUESTRA DE PRODUCTOS (Primero 20) ---")
print(f"{'ID':<5} {'DESCRIPCION':<40} {'STOCK':<10} {'MINIMO':<10} {'Â¿BAJO?':<10}")
for p in Producto.objects.all()[:20]:
    es_bajo = "SI" if p.stock < p.stock_minimo else "NO"
    print(f"{p.id:<5} {p.descripcion[:38]:<40} {p.stock:<10} {p.stock_minimo:<10} {es_bajo:<10}")
