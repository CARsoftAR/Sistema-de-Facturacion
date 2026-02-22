import os
import django
import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Producto, Proveedor, Compra, DetalleCompra

def generate_purchases(count=100):
    products = list(Producto.objects.all())
    provider = Proveedor.objects.first()
    
    if not products:
        print("Error: No hay productos en la base de datos.")
        return
    if not provider:
        print("Error: No hay proveedores en la base de datos.")
        return

    print(f"Generando {count} compras adicionales...")
    
    # Obtener fecha actual sin microsegundos para evitar problemas
    base_date = timezone.now().replace(microsecond=0)

    for i in range(count):
        # Seleccionar 1-3 productos aleatorios
        num_items = random.randint(1, 3)
        selected_prods = random.sample(products, min(num_items, len(products)))
        
        # Distribuir en los últimos 'count' días
        random_date = base_date - timedelta(days=i, minutes=random.randint(0, 1440))

        # Crear la compra
        compra = Compra.objects.create(
            proveedor=provider,
            tipo_comprobante='FA',
            nro_comprobante=f"0001-{random.randint(10000000, 99999999):08d}",
            neto=0,
            iva=0,
            total=0,
            estado='REGISTRADA'
        )
        
        total_neto = Decimal('0')
        total_iva = Decimal('0')
        total_compra = Decimal('0')
        
        detalles_to_create = []
        for prod in selected_prods:
            qty = random.randint(1, 10)
            cost = prod.costo or Decimal('500.00')
            neto = cost / Decimal('1.21')
            iva = cost - neto
            subtotal = cost * qty
            
            detalles_to_create.append(DetalleCompra(
                compra=compra,
                producto=prod,
                cantidad=qty,
                precio=cost,
                subtotal=subtotal
            ))
            
            total_neto += neto * qty
            total_iva += iva * qty
            total_compra += subtotal
            
        DetalleCompra.objects.bulk_create(detalles_to_create)
            
        # Actualizar totales Y FECHA en una sola llamada de update
        # para evitar el conflicto con el objeto Python
        Compra.objects.filter(id=compra.id).update(
            neto=total_neto,
            iva=total_iva,
            total=total_compra,
            fecha=random_date
        )

        # Feedback de progreso cada 10 items
        if (i + 1) % 10 == 0:
            print(f"  > Progreso: {i + 1}/{count} compras generadas...")

    print(f"\nProceso completado: Se generaron {count} compras exitosamente.")

if __name__ == "__main__":
    generate_purchases(100)
