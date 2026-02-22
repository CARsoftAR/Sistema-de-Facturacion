import os
import django
from datetime import date
from django.utils import timezone
from django.db.models import Sum

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from administrar.models import Venta

# Check specifically Jan 9th and Jan 10th
dates_to_check = [date(2026, 1, 9), date(2026, 1, 10)]

print("--- SALES CHECK ---")
for d in dates_to_check:
    # Construct naive range for the day, then make aware if needed or use the manual logic I implemented in views
    # Let's see raw sales with their timestamps to be sure
    print(f"\nChecking Date: {d}")
    
    # Range in full UTC
    # But since I implemented a manual -3h fix in the view, I should check what falls into that "Virtual Day"
    
    # Just list all sales and let's see their hours
    sales = Venta.objects.all().order_by('fecha')
    for s in sales:
        dt_arg = s.fecha - timezone.timedelta(hours=3)
        if dt_arg.date() == d:
            print(f"  MATCH! ID: {s.id} | UTC: {s.fecha} | ARG: {dt_arg} | Total: {s.total}")

print("--- END CHECK ---")
