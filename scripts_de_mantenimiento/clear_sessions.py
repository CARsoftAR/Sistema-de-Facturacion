import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import ActiveSession
print('Sesiones activas:', ActiveSession.objects.count())
for s in ActiveSession.objects.all():
    print(f"  - Usuario: {s.user.username}, IP: {s.ip_address}")
deleted = ActiveSession.objects.all().delete()
print('Eliminadas:', deleted)
