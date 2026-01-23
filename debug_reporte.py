import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')

import django
django.setup()

from django.conf import settings
print("Database engine:", settings.DATABASES['default']['ENGINE'])

from administrar.models import Venta
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, Cast
from django.db.models import DateField

# Probar Cast a DateField en lugar de TruncDate
ventas = Venta.objects.all()

# Intento 1: Cast
print("\n--- Usando Cast ---")
try:
    stats = ventas.annotate(day=Cast('fecha', DateField())).values('day').annotate(
        count=Count('id'),
        total_sum=Sum('total')
    ).order_by('day')
    for s in stats[:10]:
        print(f"Día: {s['day']}, Comprobantes: {s['count']}, Total: {s['total_sum']}")
except Exception as e:
    print(f"Error Cast: {e}")

# Intento 2: Extraer fecha manualmente en Python
print("\n--- Agrupando en Python ---")
from collections import defaultdict
by_date = defaultdict(lambda: {'count': 0, 'total': 0})
for v in ventas:
    date_key = v.fecha.date() if v.fecha else None
    by_date[date_key]['count'] += 1
    by_date[date_key]['total'] += float(v.total)

for d, vals in sorted(by_date.items()):
    print(f"Día: {d}, Comprobantes: {vals['count']}, Total: {vals['total']}")
