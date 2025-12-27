import os
import django
import sys

# Setup Django environment
sys.path.append('c:\\Sistemas CARSOFT\\Sistema de facturacion\\Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import InvoiceTemplate

templates = InvoiceTemplate.objects.all()
print(f"Found {templates.count()} templates.")
for t in templates:
    print(f"ID: {t.id}, Title: '{t.title}', Active: {t.active}")
    print(f"  CSS length: {len(t.css)}")
    print(f"  Header length: {len(t.header_html)}")
    print(f"  Footer length: {len(t.footer_html)}")
    print("-" * 20)
