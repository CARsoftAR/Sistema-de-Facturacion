import os
import django
import random
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Producto, Cliente, Venta, DetalleVenta

def generate_data(count=100):
    client = Cliente.objects.first()
    
    if not client:
        print("Error: No hay clientes en la base de datos.")
        return

    print(f"Generando {count} productos nuevos y sus ventas...")
    
    for i in range(1, count + 1):
        # Crear un producto único
        prod_code = f"TEST-{i:03d}"
        prod_desc = f"Producto de Prueba {i:03d}"
        
        prod, created = Producto.objects.get_or_create(
            codigo=prod_code,
            defaults={
                'descripcion': prod_desc,
                'precio_efectivo': Decimal('1200.00'),
                'precio_tarjeta': Decimal('1300.00'),
                'precio_ctacte': Decimal('1400.00'),
                'costo': Decimal('800.00'),
                'stock': 100
            }
        )

        # Fecha aleatoria en los últimos 30 días
        random_days = random.randint(0, 30)
        random_hours = random.randint(0, 23)
        random_date = timezone.now() - timedelta(days=random_days, hours=random_hours)

        # Crear la venta
        venta = Venta.objects.create(
            cliente=client,
            tipo_comprobante='B',
            neto=Decimal('100.00'),
            iva_amount=Decimal('21.00'),
            total=Decimal('121.00'),
            estado='Emitida',
            medio_pago='EFECTIVO',
            fecha=random_date
        )
        
        # Forzar la fecha
        Venta.objects.filter(id=venta.id).update(fecha=random_date)
        
        # Crear el detalle
        DetalleVenta.objects.create(
            venta=venta,
            producto=prod,
            cantidad=random.randint(1, 10),
            precio_unitario=prod.precio_efectivo,
            neto=prod.precio_efectivo / Decimal('1.21'),
            iva_amount=prod.precio_efectivo - (prod.precio_efectivo / Decimal('1.21')),
            subtotal=prod.precio_efectivo * 1 # simplificado
        )
        # Recalcular totales (opcional pero bueno para consistencia)
        detalles = DetalleVenta.objects.filter(venta=venta)
        venta.neto = sum(d.neto for d in detalles)
        venta.iva_amount = sum(d.iva_amount for d in detalles)
        venta.total = sum(d.subtotal for d in detalles)
        venta.save()

    print("Proceso completado.")

if __name__ == "__main__":
    generate_data(150)
