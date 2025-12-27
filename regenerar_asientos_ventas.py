import os
import django
from decimal import Decimal
from django.db.models import Max

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Venta, Asiento, ItemAsiento, EjercicioContable, PlanCuenta

print("=" * 60)
print("REGENERACIÓN DE ASIENTOS DE VENTAS")
print("=" * 60)

# 1. Obtener ejercicio y cuentas
ejercicio = EjercicioContable.objects.filter(cerrado=False).last()
if not ejercicio:
    print("ERROR: No hay ejercicio contable abierto.")
    exit()

cta_ventas = PlanCuenta.objects.filter(codigo='4.1.01').first()
cta_deudores = PlanCuenta.objects.filter(codigo='1.1.02.001').first()
cta_iva = PlanCuenta.objects.filter(codigo='2.1.02.001').first()

if not (cta_ventas and cta_deudores):
    print(f"ERROR: No se encontraron las cuentas. Ventas: {cta_ventas}, Deudores: {cta_deudores}")
    exit()

print(f"Ejercicio: {ejercicio.descripcion}")
print(f"Cuentas: {cta_ventas.nombre}, {cta_deudores.nombre}")

# 2. Buscar ventas sin asiento
# Como no tenemos campo 'asiento' en Venta, buscamos por descripción en Asiento o asumimos que vamos a regenerar todo lo que no esté.
# Estrategia: Buscar todas las ventas y verificar si existe un asiento con 'Venta Fac-X ID' en la descripción.

ventas = Venta.objects.filter(estado__in=['Emitida', 'Pagada']).order_by('fecha')
creados = 0
omitidos = 0

for venta in ventas:
    descripcion_busqueda = f"Venta Fac-{venta.tipo_comprobante} {venta.id}"
    
    # Verificar existencia
    existe = Asiento.objects.filter(descripcion__contains=descripcion_busqueda, origen='VENTAS').exists()
    
    if existe:
        print(f"Skipping Venta #{venta.id} (ya contabilizada)")
        omitidos += 1
        continue
        
    print(f"Contabilizando Venta #{venta.id} - ${venta.total}")
    
    # Calcular montos
    monto_iva = Decimal('0')
    monto_neto = venta.total
    if venta.tipo_comprobante == 'A':
        monto_neto = venta.total / Decimal('1.21')
        monto_iva = venta.total - monto_neto
    
    # Crear Asiento
    numero = (Asiento.objects.filter(ejercicio=ejercicio).aggregate(m=Max('numero'))['m'] or 0) + 1
    
    cliente_nombre = venta.cliente.nombre if venta.cliente else "Consumidor Final"
    
    asiento = Asiento.objects.create(
        numero=numero,
        fecha=venta.fecha,
        descripcion=f"{descripcion_busqueda} - {cliente_nombre}",
        ejercicio=ejercicio,
        origen='VENTAS'
    )
    
    # DEBE: Deudores
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cta_deudores,
        debe=venta.total,
        haber=0,
        descripcion=f"Factura {venta.tipo_comprobante}-{venta.id}"
    )
    
    # HABER: Ventas
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cta_ventas,
        debe=0,
        haber=monto_neto,
        descripcion=f"Venta Artículos"
    )
    
    # HABER: IVA
    if monto_iva > 0 and cta_iva:
        ItemAsiento.objects.create(
            asiento=asiento,
            cuenta=cta_iva,
            debe=0,
            haber=monto_iva,
            descripcion=f"IVA Débito Fiscal"
        )
    
    creados += 1

print("-" * 60)
print(f"Proceso finalizado.")
print(f"Asientos creados: {creados}")
print(f"Asientos omitidos: {omitidos}")
print("=" * 60)
