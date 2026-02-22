import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Proveedor

count = Proveedor.objects.count()
print(f"Total providers: {count}")
for p in Proveedor.objects.all()[:5]:
    print(f"- {p.id}: {p.nombre}")
