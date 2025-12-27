import os
import sys
import django
from decimal import Decimal

# Setup Django environment
sys.path.append('c:/Sistemas CARSOFT/Sistema de facturacion/Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Venta, Cliente, Asiento, Compra, Proveedor, Producto, DetalleVenta
from administrar.services import AccountingService

print("="*60)
print("TEST CONTABILIDAD AVANZADA (IMPUESTOS Y COSTOS)")
print("="*60)

# 1. Setup Data
cliente, _ = Cliente.objects.get_or_create(nombre="Test TaxClient", cuit="22123456789")
proveedor, _ = Proveedor.objects.get_or_create(nombre="Test TaxProv", cuit="33123456789")
producto, _ = Producto.objects.get_or_create(
    codigo="TEST-001", 
    defaults={
        'descripcion': 'Test Product', 
        'precio_efectivo': 100, 
        'precio_tarjeta': 110,
        'precio_ctacte': 120,
        'costo': 50
    }
)
producto.costo = Decimal("50.00") # Force cost
producto.save()

# 2. Test Sales (Venta $121 -> Neto $100, IVA $21, Costo $50)
print("\n--- TEST VENTA ---")
venta = Venta.objects.create(
    cliente=cliente,
    tipo_comprobante="A",
    total=Decimal("121.00"),
    estado="Emitida"
)
DetalleVenta.objects.create(
    venta=venta, 
    producto=producto, 
    cantidad=1, 
    precio_unitario=100, 
    subtotal=100
)

print(f"Venta #{venta.id} created ($121.00). Cost expected: $50.00")
try:
    AccountingService.registrar_venta(venta)
    # Check
    asiento = Asiento.objects.filter(descripcion__contains=f"Venta A {venta.numero_factura_formateado()}").last()
    if asiento:
        print(f"[OK] Asiento #{asiento.numero} created.")
        for item in asiento.items.all():
            print(f"   > {item.cuenta.nombre}: D={item.debe} | H={item.haber}")
    else:
        print("[FAIL] No Asiento found.")
except Exception as e:
    print(f"ERROR: {e}")


# 3. Test Purchase (Compra $242 -> Neto $200, IVA $42)
print("\n--- TEST COMPRA ---")
compra = Compra.objects.create(
    proveedor=proveedor,
    total=Decimal("242.00"),
    estado="REGISTRADA"
)
print(f"Compra #{compra.id} created ($242.00).")
try:
    AccountingService.registrar_compra(compra)
    # Check
    asiento = Asiento.objects.filter(descripcion__contains=f"Compra - {proveedor.nombre}").last()
    if asiento:
        print(f"[OK] Asiento #{asiento.numero} created.")
        for item in asiento.items.all():
            print(f"   > {item.cuenta.nombre}: D={item.debe} | H={item.haber}")
    else:
        print("[FAIL] No Asiento found.")
except Exception as e:
    print(f"ERROR: {e}")
