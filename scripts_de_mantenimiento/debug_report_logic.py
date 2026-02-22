
from administrar.models import Venta
from django.db.models import Sum, Count, Avg
from datetime import datetime
from collections import defaultdict

# Simular params
fecha_desde_str = '2025-12-01'
fecha_hasta_str = '2025-12-07'

print(f"Probando filtro: {fecha_desde_str} al {fecha_hasta_str}")

# Query base
ventas = Venta.objects.all()

# Aplicar filtros de fecha
if fecha_desde_str:
    try:
        fecha_desde = datetime.strptime(fecha_desde_str, '%Y-%m-%d').date()
        ventas = ventas.filter(fecha__date__gte=fecha_desde)
        print(f"Despues de filtro desde: {ventas.count()} ventas")
    except ValueError as e:
        print(f"Error fecha desde: {e}")

if fecha_hasta_str:
    try:
        fecha_hasta = datetime.strptime(fecha_hasta_str, '%Y-%m-%d').date()
        ventas = ventas.filter(fecha__date__lte=fecha_hasta)
        print(f"Despues de filtro hasta: {ventas.count()} ventas")
    except ValueError as e:
        print(f"Error fecha hasta: {e}")

# Estadísticas generales
total_ventas = ventas.aggregate(total=Sum('total'))['total'] or 0
cantidad_ventas = ventas.count()

print(f"Total Ventas Calculado: {total_ventas}")
print(f"Cantidad Ventas: {cantidad_ventas}")

if cantidad_ventas == 0:
    print("DEBUG: Revisando fechas de todas las ventas:")
    for v in Venta.objects.all().order_by('-fecha')[:5]:
        print(f"ID: {v.id} Fecha: {v.fecha} (Date: {v.fecha.date()})")
