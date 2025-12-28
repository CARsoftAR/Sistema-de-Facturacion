"""
Verificación rápida de contabilidad usando Django shell
"""

from administrar.models import (
    Venta, Compra, Recibo, Cheque, MovimientoCaja,
    Asiento, ItemAsiento, EjercicioContable, PlanCuenta
)
from administrar.services import AccountingService
from decimal import Decimal
from datetime import date

print("="*60)
print("VERIFICACIÓN DE CONTABILIDAD")
print("="*60)

# 1. Verificar Ejercicio
print("\n1. EJERCICIO CONTABLE:")
ejercicio = EjercicioContable.objects.filter(cerrado=False).first()
if ejercicio:
    print(f"✅ Ejercicio vigente: {ejercicio.nombre}")
else:
    print("❌ No hay ejercicio vigente")

# 2. Verificar Plan de Cuentas
print("\n2. PLAN DE CUENTAS:")
cuentas_req = ["Deudores por Ventas", "Ventas", "Proveedores", "Caja en Pesos", "Valores a Depositar"]
for nombre in cuentas_req:
    cuenta = AccountingService._obtener_cuenta(nombre)
    if cuenta:
        print(f"✅ {nombre}: {cuenta.codigo}")
    else:
        print(f"❌ {nombre}: NO ENCONTRADA")

# 3. Balance de Asientos
print("\n3. BALANCE DE ASIENTOS:")
total_asientos = Asiento.objects.count()
desbalanceados = 0
for asiento in Asiento.objects.all():
    debe = sum(item.debe for item in asiento.items.all())
    haber = sum(item.haber for item in asiento.items.all())
    if abs(debe - haber) > Decimal("0.01"):
        desbalanceados += 1
        print(f"❌ Asiento #{asiento.numero} desbalanceado: D={debe}, H={haber}")

if desbalanceados == 0:
    print(f"✅ Todos los {total_asientos} asientos están balanceados")
else:
    print(f"❌ {desbalanceados} asientos desbalanceados de {total_asientos}")

# 4. Ventas
print("\n4. VENTAS:")
total_ventas = Venta.objects.count()
asientos_ventas = Asiento.objects.filter(origen='VENTAS').count()
print(f"Total ventas: {total_ventas}")
print(f"Asientos de ventas: {asientos_ventas}")

# 5. Compras
print("\n5. COMPRAS:")
total_compras = Compra.objects.count()
asientos_compras = Asiento.objects.filter(origen='COMPRAS').count()
print(f"Total compras: {total_compras}")
print(f"Asientos de compras: {asientos_compras}")

# 6. Cheques
print("\n6. CHEQUES:")
total_cheques = Cheque.objects.filter(tipo='TERCERO').count()
asientos_cheques = Asiento.objects.filter(descripcion__icontains='Cheque').count()
print(f"Total cheques de terceros: {total_cheques}")
print(f"Asientos relacionados a cheques: {asientos_cheques}")

# 7. Recibos
print("\n7. RECIBOS:")
total_recibos = Recibo.objects.count()
asientos_recibos = Asiento.objects.filter(descripcion__icontains='Recibo').count()
print(f"Total recibos: {total_recibos}")
print(f"Asientos relacionados a recibos: {asientos_recibos}")

# 8. Movimientos Caja
print("\n8. MOVIMIENTOS DE CAJA:")
total_mov_caja = MovimientoCaja.objects.count()
asientos_caja = Asiento.objects.filter(descripcion__icontains='Caja').count()
print(f"Total movimientos de caja: {total_mov_caja}")
print(f"Asientos de caja: {asientos_caja}")

print("\n" + "="*60)
print("VERIFICACIÓN COMPLETADA")
print("="*60)
