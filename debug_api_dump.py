import os
import django
import json
from datetime import timedelta, datetime
from django.utils import timezone
from django.db.models import Sum

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from administrar.models import Venta

# REPLICATE VIEWS LOGIC EXACTLY
from django.conf import settings
print(f"SETTINGS TIME_ZONE: {settings.TIME_ZONE}")
print(f"SETTINGS USE_TZ: {settings.USE_TZ}")

local_now = timezone.localtime(timezone.now())
hoy_date = local_now.date()
print(f"Local Now: {local_now}")
print(f"Hoy Date: {hoy_date}")

fecha_inicio_chart = hoy_date - timedelta(days=6)
start_chart_dt = timezone.make_aware(datetime.combine(fecha_inicio_chart, datetime.min.time()))

print(f"Chart Start DT: {start_chart_dt}")

# Fetch all sales in the range
ventas_range = Venta.objects.filter(fecha__gte=start_chart_dt).values('fecha', 'total')

# Aggregate in Python
daily_totals = {}
for v in ventas_range:
    # Convert UTC from DB back to Local Date for grouping
    local_dt = timezone.localtime(v['fecha'])
    day_str = local_dt.strftime('%Y-%m-%d')
    print(f"Sale: {v['fecha']} -> Local: {local_dt} -> Key: {day_str} ($ {v['total']})")
    daily_totals[day_str] = daily_totals.get(day_str, 0) + float(v['total'])
    
chart_labels = []
chart_data = []
for i in range(7):
    dia_iter = fecha_inicio_chart + timedelta(days=i)
    dia_str = dia_iter.strftime('%Y-%m-%d')
    chart_labels.append(dia_iter.strftime('%d/%m'))
    val = daily_totals.get(dia_str, 0)
    chart_data.append(val)
    print(f"Index {i}: {dia_str} ({chart_labels[-1]}) -> {val}")

print("\nFINAL DATA LIST:")
print(chart_data)
print("\nFINAL LABELS LIST:")
print(chart_labels)
