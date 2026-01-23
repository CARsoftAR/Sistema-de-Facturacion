import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')

import django
django.setup()

from administrar.models import Venta, DetalleVenta, Cliente, Producto
from datetime import datetime, timedelta
from decimal import Decimal
import random
from django.utils import timezone

# Obtener cliente y producto existentes
cliente = Cliente.objects.first()
producto = Producto.objects.first()

print(f"Usando cliente: {cliente.nombre}")
print(f"Usando producto: {producto.descripcion}")

# Crear ventas para los ultimos 120 dias (para tener muchas filas)
ventas_creadas = 0
fecha_inicio = timezone.now() - timedelta(days=120)

for i in range(120):  # 120 dias = 4 meses
    fecha = fecha_inicio + timedelta(days=i)
    
    # Crear 1 venta por dia para asegurar 120 filas en el reporte
    total = Decimal(random.randint(5000, 100000))
    iva = total * Decimal('0.21') / Decimal('1.21')
    neto = total - iva
    
    venta = Venta.objects.create(
        cliente=cliente,
        tipo_comprobante=random.choice(['A', 'B', 'C']),
        neto=neto,
        iva_amount=iva,
        total=total,
        medio_pago='EFECTIVO',
        estado='Emitida'
    )
    # Actualizar la fecha manualmente
    Venta.objects.filter(id=venta.id).update(fecha=fecha)
    
    # Crear detalle
    DetalleVenta.objects.create(
        venta=venta,
        producto=producto,
        cantidad=random.randint(1, 10),
        precio_unitario=producto.precio_efectivo,
        neto=neto,
        iva_amount=iva,
        subtotal=total
    )
    ventas_creadas += 1
    if ventas_creadas % 20 == 0:
        print(f"Creadas {ventas_creadas} ventas...")

print(f"\nSe crearon {ventas_creadas} ventas de prueba!")
print(f"Total de ventas en el sistema: {Venta.objects.count()}")
