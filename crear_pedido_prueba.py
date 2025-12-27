import os
import django
import datetime
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Pedido, DetallePedido, Cliente, Producto, Venta, DetalleVenta
from django.db import transaction

print("=" * 60)
print("CREANDO PEDIDO DE PRUEBA Y CONVIRTIÉNDOLO A VENTA")
print("=" * 60)

try:
    with transaction.atomic():
        # 1. Obtener cliente y productos
        cliente = Cliente.objects.first()
        if not cliente:
            print("ERROR: No hay clientes en la base de datos")
            exit(1)
        
        productos = Producto.objects.filter(stock__gt=0)[:2]
        if not productos.exists():
            print("ERROR: No hay productos con stock disponible")
            exit(1)
        
        print(f"\n1. Cliente seleccionado: {cliente.nombre}")
        print(f"   Condición fiscal: {cliente.condicion_fiscal}")
        
        # 2. Crear pedido
        pedido = Pedido.objects.create(
            cliente=cliente,
            estado='PENDIENTE',
            total=0,
            observaciones='Pedido de prueba para verificar vinculación con facturas'
        )
        
        print(f"\n2. Pedido creado: #{pedido.id}")
        
        # 3. Agregar productos al pedido
        total_pedido = Decimal('0.00')
        print(f"\n3. Agregando productos al pedido:")
        
        for i, producto in enumerate(productos, 1):
            cantidad = 2
            precio = producto.precio_efectivo
            subtotal = precio * cantidad
            
            DetallePedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio,
                subtotal=subtotal
            )
            
            total_pedido += subtotal
            print(f"   - {producto.descripcion}")
            print(f"     Cantidad: {cantidad} x ${precio} = ${subtotal}")
        
        # Actualizar total del pedido
        pedido.total = total_pedido
        pedido.save()
        
        print(f"\n   TOTAL PEDIDO: ${total_pedido}")
        
        # 4. Convertir pedido a venta (simulando la API)
        print(f"\n4. Convirtiendo pedido a venta...")
        
        # Determinar tipo de comprobante
        tipo_cbte = 'A' if cliente.condicion_fiscal == 'RI' else 'B'
        
        # Crear venta
        venta = Venta.objects.create(
            cliente=pedido.cliente,
            total=pedido.total,
            estado='Emitida',
            tipo_comprobante=tipo_cbte,
            fecha=datetime.datetime.now(),
            pedido_origen=pedido  # <<<< VINCULACIÓN
        )
        
        print(f"   - Venta creada: #{venta.id}")
        print(f"   - Tipo comprobante: Factura {tipo_cbte}")
        print(f"   - Número factura: {venta.numero_factura_formateado()}")
        
        # Crear detalles y descontar stock
        detalles_pedido = DetallePedido.objects.filter(pedido=pedido)
        for det in detalles_pedido:
            DetalleVenta.objects.create(
                venta=venta,
                producto=det.producto,
                cantidad=det.cantidad,
                precio_unitario=det.precio_unitario,
                subtotal=det.subtotal
            )
            
            # Descontar stock
            producto = det.producto
            producto.stock -= det.cantidad
            producto.save()
            
            print(f"   - Agregado: {det.producto.descripcion} (Stock actualizado)")
        
        # Vincular pedido con venta
        pedido.venta = venta
        pedido.estado = 'FACTURADO'
        pedido.save()
        
        print(f"\n5. Pedido vinculado con venta")
        print(f"   - Pedido #{pedido.id} -> estado: {pedido.estado}")
        print(f"   - Venta #{venta.id} -> pedido_origen: #{venta.pedido_origen.id if venta.pedido_origen else 'NULL'}")
        
        print("\n" + "=" * 60)
        print("PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        print(f"\nAHORA PUEDES:")
        print(f"1. Ir a VENTAS en el sistema")
        print(f"2. Buscar la Venta #{venta.id}")
        print(f"3. Hacer clic en VER (ojo) para ver el detalle")
        print(f"4. Deberías ver: 'Origen: Pedido #{pedido.id}'")
        print(f"\nTambién puedes:")
        print(f"- Imprimir la factura y ver 'Pedido N° #{pedido.id}'")
        print(f"- Ir a PEDIDOS y ver que el pedido #{pedido.id} está FACTURADO")
        print("=" * 60)
        
except Exception as e:
    print(f"\nERROR: {str(e)}")
    import traceback
    traceback.print_exc()
