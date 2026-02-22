"""
Script para generar datos contables de prueba
Genera: Ejercicio Contable, Plan de Cuentas, Asientos de Ventas y Compras
"""
import os
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import (
    EjercicioContable, PlanCuenta, Asiento, ItemAsiento
)

def crear_ejercicio_contable():
    """Crear ejercicio contable para el a?o actual"""
    print("\n Creando Ejercicio Contable 2025...")
    
    # Eliminar ejercicio anterior si existe
    EjercicioContable.objects.filter(descripcion="Ejercicio 2025").delete()
    
    ejercicio = EjercicioContable.objects.create(
        descripcion="Ejercicio 2025",
        fecha_inicio=datetime.strptime("2025-01-01", "%Y-%m-%d").date(),
        fecha_fin=datetime.strptime("2025-12-31", "%Y-%m-%d").date(),
        cerrado=False
    )
    print(f"[OK] Ejercicio creado: {ejercicio.descripcion}")
    return ejercicio


def crear_plan_cuentas():
    """Crear plan de cuentas b?sico para Argentina"""
    print("\n Creando Plan de Cuentas...")
    
    # Limpiar plan anterior
    PlanCuenta.objects.all().delete()
    
    cuentas_data = [
        # ACTIVO
        {'codigo': '1', 'nombre': 'ACTIVO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '1.1', 'nombre': 'ACTIVO CORRIENTE', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 2, 'padre': '1'},
        {'codigo': '1.1.01', 'nombre': 'CAJA Y BANCOS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.01.001', 'nombre': 'Caja', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
        {'codigo': '1.1.01.002', 'nombre': 'Banco Cuenta Corriente', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
        
        {'codigo': '1.1.02', 'nombre': 'CREDITOS POR VENTAS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.02.001', 'nombre': 'Deudores por Ventas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.02'},
        
        {'codigo': '1.1.03', 'nombre': 'BIENES DE CAMBIO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.03.001', 'nombre': 'Mercader?as', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
        
        {'codigo': '1.1.04', 'nombre': 'OTROS CREDITOS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.04.001', 'nombre': 'IVA Cr?dito Fiscal', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
        
        # PASIVO
        {'codigo': '2', 'nombre': 'PASIVO', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '2.1', 'nombre': 'PASIVO CORRIENTE', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 2, 'padre': '2'},
        {'codigo': '2.1.01', 'nombre': 'DEUDAS COMERCIALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
        {'codigo': '2.1.01.001', 'nombre': 'Proveedores', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
        
        {'codigo': '2.1.02', 'nombre': 'DEUDAS FISCALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
        {'codigo': '2.1.02.001', 'nombre': 'IVA D?bito Fiscal', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
        
        # PATRIMONIO NETO
        {'codigo': '3', 'nombre': 'PATRIMONIO NETO', 'tipo': 'PN', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '3.1', 'nombre': 'CAPITAL', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
        {'codigo': '3.1.01', 'nombre': 'Capital Social', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.1'},
        {'codigo': '3.2', 'nombre': 'RESULTADOS ACUMULADOS', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
        {'codigo': '3.2.01', 'nombre': 'Resultados Acumulados', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.2'},
        
        # RESULTADOS POSITIVOS (INGRESOS)
        {'codigo': '4', 'nombre': 'RESULTADOS POSITIVOS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '4.1', 'nombre': 'INGRESOS POR VENTAS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 2, 'padre': '4'},
        {'codigo': '4.1.01', 'nombre': 'Ventas', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
        
        # RESULTADOS NEGATIVOS (EGRESOS)
        {'codigo': '5', 'nombre': 'RESULTADOS NEGATIVOS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '5.1', 'nombre': 'COSTO DE MERCADERIAS VENDIDAS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
        {'codigo': '5.1.01', 'nombre': 'Costo de Ventas', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.1'},
    ]
    
    # Crear cuentas padres primero
    cuentas_creadas = {}
    for nivel in range(1, 5):
        for cuenta_data in cuentas_data:
            if cuenta_data['nivel'] == nivel:
                padre_obj = None
                if cuenta_data['padre']:
                    padre_obj = cuentas_creadas.get(cuenta_data['padre'])
                
                cuenta = PlanCuenta.objects.create(
                    codigo=cuenta_data['codigo'],
                    nombre=cuenta_data['nombre'],
                    tipo=cuenta_data['tipo'],
                    imputable=cuenta_data['imputable'],
                    nivel=cuenta_data['nivel'],
                    padre=padre_obj
                )
                cuentas_creadas[cuenta_data['codigo']] = cuenta
                print(f"  [OK] {cuenta.codigo} - {cuenta.nombre}")
    
    print(f"\n[OK] Plan de Cuentas creado: {len(cuentas_creadas)} cuentas")
    return cuentas_creadas


def crear_asiento_apertura(ejercicio, cuentas):
    """Crear asiento de apertura con saldos iniciales"""
    print("\n Creando Asiento de Apertura...")
    
    # Obtener pr?ximo n?mero de asiento
    ultimo_asiento = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
    numero = 1 if not ultimo_asiento else ultimo_asiento.numero + 1
    
    asiento = Asiento.objects.create(
        fecha=datetime.strptime("2025-01-01 00:00:00", "%Y-%m-%d %H:%M:%S"),
        descripcion="Asiento de Apertura - Ejercicio 2025",
        ejercicio=ejercicio,
        numero=numero,
        origen='APERTURA',
        usuario='Sistema'
    )
    
    # ACTIVOS (DEBE)
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.01.001'],  # Caja
        debe=Decimal('50000.00'),
        haber=Decimal('0.00'),
        descripcion='Saldo inicial en caja'
    )
    
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.01.002'],  # Banco
        debe=Decimal('200000.00'),
        haber=Decimal('0.00'),
        descripcion='Saldo inicial en banco'
    )
    
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.03.001'],  # Mercader?as
        debe=Decimal('150000.00'),
        haber=Decimal('0.00'),
        descripcion='Stock inicial de mercader?as'
    )
    
    # PATRIMONIO NETO (HABER)
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['3.1.01'],  # Capital Social
        debe=Decimal('0.00'),
        haber=Decimal('400000.00'),
        descripcion='Capital aportado'
    )
    
    print(f"[OK] Asiento de Apertura #{asiento.numero} creado")
    return asiento


def crear_asiento_de_venta(ejercicio, cuentas, numero_asiento, fecha, monto_neto, iva, total, descripcion="Venta de mercader?as"):
    """Crea un asiento contable por una venta"""
    
    asiento = Asiento.objects.create(
        fecha=fecha,
        descripcion=descripcion,
        ejercicio=ejercicio,
        numero=numero_asiento,
        origen='VENTAS',
        usuario='Sistema'
    )
    
    # DEBE: Deudores por Ventas (Total con IVA)
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.02.001'],
        debe=total,
        haber=Decimal('0.00'),
        descripcion=f'Venta seg?n factura'
    )
    
    # HABER: Ventas (Neto)
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['4.1.01'],
        debe=Decimal('0.00'),
        haber=monto_neto,
        descripcion='Ventas del per?odo'
    )
    
    # HABER: IVA D?bito Fiscal
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['2.1.02.001'],
        debe=Decimal('0.00'),
        haber=iva,
        descripcion='IVA sobre ventas'
    )
    
    # DEBE: Costo de Ventas
    costo = monto_neto * Decimal('0.60')  # Costo del 60% del precio de venta
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['5.1.01'],
        debe=costo,
        haber=Decimal('0.00'),
        descripcion='Costo de mercader?as vendidas'
    )
    
    # HABER: Mercader?as
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.03.001'],
        debe=Decimal('0.00'),
        haber=costo,
        descripcion='Baja de stock por venta'
    )
    
    return asiento


def crear_asiento_de_compra(ejercicio, cuentas, numero_asiento, fecha, monto_neto, iva, total, descripcion="Compra de mercader?as"):
    """Crea un asiento contable por una compra"""
    
    asiento = Asiento.objects.create(
        fecha=fecha,
        descripcion=descripcion,
        ejercicio=ejercicio,
        numero=numero_asiento,
        origen='COMPRAS',
        usuario='Sistema'
    )
    
    # DEBE: Mercader?as (Neto)
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.03.001'],
        debe=monto_neto,
        haber=Decimal('0.00'),
        descripcion='Compra de mercader?as'
    )
    
    # DEBE: IVA Cr?dito Fiscal
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.04.001'],
        debe=iva,
        haber=Decimal('0.00'),
        descripcion='IVA sobre compras'
    )
    
    # HABER: Proveedores (Total con IVA)
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['2.1.01.001'],
        debe=Decimal('0.00'),
        haber=total,
        descripcion='Deuda con proveedores'
    )
    
    return asiento


def crear_asiento_cobro(ejercicio, cuentas, numero_asiento, fecha, monto, descripcion="Cobro de clientes"):
    """Crea un asiento contable por cobro de clientes"""
    
    asiento = Asiento.objects.create(
        fecha=fecha,
        descripcion=descripcion,
        ejercicio=ejercicio,
        numero=numero_asiento,
        origen='COBROS',
        usuario='Sistema'
    )
    
    # DEBE: Banco
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.01.002'],
        debe=monto,
        haber=Decimal('0.00'),
        descripcion='Ingreso en banco'
    )
    
    # HABER: Deudores por Ventas
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.02.001'],
        debe=Decimal('0.00'),
        haber=monto,
        descripcion='Cobro de clientes'
    )
    
    return asiento


def crear_asiento_pago(ejercicio, cuentas, numero_asiento, fecha, monto, descripcion="Pago a proveedores"):
    """Crea un asiento contable por pago a proveedores"""
    
    asiento = Asiento.objects.create(
        fecha=fecha,
        descripcion=descripcion,
        ejercicio=ejercicio,
        numero=numero_asiento,
        origen='PAGOS',
        usuario='Sistema'
    )
    
    # DEBE: Proveedores
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['2.1.01.001'],
        debe=monto,
        haber=Decimal('0.00'),
        descripcion='Pago a proveedores'
    )
    
    # HABER: Banco
    ItemAsiento.objects.create(
        asiento=asiento,
        cuenta=cuentas['1.1.01.002'],
        debe=Decimal('0.00'),
        haber=monto,
        descripcion='Egreso de banco'
    )
    
    return asiento


def main():
    print("="*60)
    print("*** GENERADOR DE DATOS CONTABLES DE PRUEBA")
    print("="*60)
    
    # 1. Crear ejercicio contable
    ejercicio = crear_ejercicio_contable()
    
    # 2. Crear plan de cuentas
    cuentas = crear_plan_cuentas()
    
    # 3. Crear asiento de apertura
    crear_asiento_apertura(ejercicio, cuentas)
    
    # 4. Crear asientos de operaciones comerciales
    print("\n Creando Asientos Comerciales...")
    
    numero_asiento = 2
    fecha_base = datetime.strptime("2025-01-15 10:00:00", "%Y-%m-%d %H:%M:%S")
    
    # Ventas de Enero
    print("\n   Ventas de Enero:")
    for i in range(5):
        monto_neto = Decimal(str(10000 + (i * 2000)))
        iva = monto_neto * Decimal('0.21')
        total = monto_neto + iva
        fecha = fecha_base + timedelta(days=i*3)
        
        asiento = crear_asiento_de_venta(
            ejercicio, cuentas, numero_asiento, fecha,
            monto_neto, iva, total,
            f"Venta #{i+1} - Enero 2025"
        )
        print(f"    [OK] Asiento #{numero_asiento}: Venta ${total:,.2f}")
        numero_asiento += 1
    
    # Compras de Enero
    print("\n   Compras de Enero:")
    for i in range(3):
        monto_neto = Decimal(str(15000 + (i * 3000)))
        iva = monto_neto * Decimal('0.21')
        total = monto_neto + iva
        fecha = fecha_base + timedelta(days=i*4 + 1)
        
        asiento = crear_asiento_de_compra(
            ejercicio, cuentas, numero_asiento, fecha,
            monto_neto, iva, total,
            f"Compra #{i+1} - Enero 2025"
        )
        print(f"    [OK] Asiento #{numero_asiento}: Compra ${total:,.2f}")
        numero_asiento += 1
    
    # Cobros
    print("\n   Cobros:")
    for i in range(2):
        monto = Decimal(str(12000 + (i * 1000)))
        fecha = fecha_base + timedelta(days=i*5 + 10)
        
        asiento = crear_asiento_cobro(
            ejercicio, cuentas, numero_asiento, fecha,
            monto, f"Cobro #{i+1}"
        )
        print(f"    [OK] Asiento #{numero_asiento}: Cobro ${monto:,.2f}")
        numero_asiento += 1
    
    # Pagos
    print("\n   Pagos:")
    for i in range(2):
        monto = Decimal(str(18000 + (i * 2000)))
        fecha = fecha_base + timedelta(days=i*5 + 12)
        
        asiento = crear_asiento_pago(
            ejercicio, cuentas, numero_asiento, fecha,
            monto, f"Pago #{i+1}"
        )
        print(f"    [OK] Asiento #{numero_asiento}: Pago ${monto:,.2f}")
        numero_asiento += 1
    
    print("\n" + "="*60)
    print("[OK] DATOS CONTABLES GENERADOS EXITOSAMENTE")
    print("="*60)
    print("\n Ahora puedes visualizar:")
    print("  ? Libro Diario: Todos los asientos en orden cronol?gico")
    print("  ? Libro Mayor: Movimientos por cuenta")
    print("  ? Balance de Sumas y Saldos")
    print("  ? Balance General (Estado de Situaci?n Patrimonial)")
    print("\n Accede a Contabilidad desde el men? principal")
    print("="*60)


if __name__ == "__main__":
    main()
