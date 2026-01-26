import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Proveedor, Cliente

name = "Cliente Prueba"
p = Proveedor.objects.filter(nombre__icontains=name).first()
c = Cliente.objects.filter(nombre__icontains=name).first()

if p:
    print(f"FOUND PROVIDER: {p.nombre} (ID: {p.id})")
else:
    print("PROVIDER NOT FOUND")

if c:
    print(f"FOUND CLIENT: {c.nombre} (ID: {c.id})")
else:
    print("CLIENT NOT FOUND")
