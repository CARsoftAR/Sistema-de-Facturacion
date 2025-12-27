import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente, Proveedor, MovimientoCuentaCorriente, MovimientoCuentaCorrienteProveedor

def populate_clientes():
    print("--- Generando Datos de Clientes ---")
    clientes_data = [
        {"nombre": "Empresa Demo S.A.", "cuit": "30-11223344-5", "telefono": "11-4455-6677", "limite": 100000},
        {"nombre": "Juan Pérez", "cuit": "20-99887766-1", "telefono": "11-1234-5678", "limite": 50000},
        {"nombre": "Tech Solutions SRL", "cuit": "33-55667788-9", "telefono": "11-9988-7766", "limite": 200000},
    ]

    for data in clientes_data:
        cliente, created = Cliente.objects.get_or_create(
            nombre=data["nombre"],
            defaults={
                "cuit": data["cuit"], 
                "telefono": data["telefono"],
                "domicilio": "Calle Falsa 123",
                "email": "test@example.com",
                "tiene_ctacte": True,
                "limite_credito": data["limite"],
                "activo": True
            }
        )
        if created:
            print(f"Cliente creado: {cliente.nombre}")
        else:
            print(f"Cliente existente: {cliente.nombre}")

        # Limpiar movimientos viejos para este test (opcional, pero para que quede limpio)
        MovimientoCuentaCorriente.objects.filter(cliente=cliente).delete()
        cliente.saldo_actual = 0
        cliente.save()

        # Generar Movimientos
        saldo = 0
        fecha_base = datetime.now() - timedelta(days=30)
        
        # Mov 1: Venta (Debe)
        monto = Decimal(random.randint(10000, 50000))
        saldo += monto
        MovimientoCuentaCorriente.objects.create(
            cliente=cliente,
            fecha=fecha_base + timedelta(days=1),
            tipo="DEBE",
            descripcion="Factura Venta #0001-" + str(random.randint(1000,9999)),
            monto=monto,
            saldo=saldo
        )

        # Mov 2: Otro cargo / Venta (Debe)
        monto2 = Decimal(random.randint(5000, 15000))
        saldo += monto2
        MovimientoCuentaCorriente.objects.create(
            cliente=cliente,
            fecha=fecha_base + timedelta(days=5),
            tipo="DEBE",
            descripcion="Nota de Débito por Intereses",
            monto=monto2,
            saldo=saldo
        )

        # Mov 3: Pago Parcial (Haber)
        pago = Decimal(random.randint(10000, 30000))
        saldo -= pago
        MovimientoCuentaCorriente.objects.create(
            cliente=cliente,
            fecha=fecha_base + timedelta(days=10),
            tipo="HABER",
            descripcion="Pago a cuenta (Transferencia)",
            monto=pago,
            saldo=saldo
        )
        
        cliente.saldo_actual = saldo
        cliente.save()
        print(f"  -> Saldo Final: ${saldo}")

def populate_proveedores():
    print("\n--- Generando Datos de Proveedores ---")
    prov_data = [
        {"nombre": "Distribuidora Mayorista SA", "cuit": "30-11111111-1", "telefono": "11-0000-1111"},
        {"nombre": "Importadora Global", "cuit": "30-22222222-2", "telefono": "11-2222-3333"},
    ]

    for data in prov_data:
        prov, created = Proveedor.objects.get_or_create(
            nombre=data["nombre"],
            defaults={
                "cuit": data["cuit"],
                "telefono": data["telefono"],
                "direccion": "Av. Importadores 999",
                "email": "contacto@proveedor.com"
            }
        )
        if created:
            print(f"Proveedor creado: {prov.nombre}")
        else:
            print(f"Proveedor existente: {prov.nombre}")

        # Limpiar
        MovimientoCuentaCorrienteProveedor.objects.filter(proveedor=prov).delete()
        prov.saldo_actual = 0
        prov.save()

        saldo = 0 # Deuda nostra
        fecha_base = datetime.now() - timedelta(days=20)

        # Mov 1: Compra (Haber - Aumenta deuda)
        compra = Decimal(random.randint(100000, 500000))
        saldo += compra
        MovimientoCuentaCorrienteProveedor.objects.create(
            proveedor=prov,
            fecha=fecha_base + timedelta(days=2),
            tipo="HABER",
            descripcion="Factura Compra A-0001-00005544",
            monto=compra,
            saldo=saldo
        )

        # Mov 2: Pago nuestro (Debe - Baja deuda)
        pago = Decimal(random.randint(50000, 100000))
        saldo -= pago
        MovimientoCuentaCorrienteProveedor.objects.create(
            proveedor=prov,
            fecha=fecha_base + timedelta(days=15),
            tipo="DEBE",
            descripcion="Orden de Pago #5599 (Cheque Propio)",
            monto=pago,
            saldo=saldo
        )

        prov.saldo_actual = saldo
        prov.save()
        print(f"  -> Saldo (Deuda) Final: ${saldo}")

if __name__ == '__main__':
    populate_clientes()
    populate_proveedores()
    print("\n=== DATOS GENERADOS CON ÉXITO ===")
