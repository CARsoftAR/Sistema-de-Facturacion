
import os
import django
import json
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from administrar.models import (
    OrdenCompra, Compra, Proveedor, Producto, 
    MovimientoCaja, MovimientoStock, Cheque
)
from administrar.views import api_orden_compra_guardar
from django.test import RequestFactory
from django.db import transaction

def verify_direct_purchase():
    print("--- INICIANDO VERIFICACIÓN DE COMPRA DIRECTA ---")

    # 1. Setup Datos Prueba
    prov, _ = Proveedor.objects.get_or_create(
        nombre="PROVEEDOR TEST DIRECTO", 
        defaults={'cuit': '20333333339', 'condicion_fiscal': 'RI'}
    )
    prod, _ = Producto.objects.get_or_create(
        codigo="TEST001", 
        defaults={'descripcion': 'PRODUCTO TEST', 'precio_efectivo': 100, 'costo': 50, 'stock': 10}
    )
    stock_inicial = prod.stock

    print(f"Stock Inicial: {stock_inicial}")

    # 2. Simular Request POST para Compra CONTADO
    factory = RequestFactory()
    
    payload = {
        "proveedor": prov.id,
        "observaciones": "Compra Directa Test Script",
        "items": [
            {"producto_id": prod.id, "cantidad": 5, "precio": 60} # Costo 60
        ],
        "recepcionar": True,
        "medio_pago": "EFECTIVO",
        "datos_cheque": None
    }
    
    print("\n[TEST 1] Enviando Compra CONTADO...")
    request = factory.post(
        '/api/compras/orden/guardar/',
        data=json.dumps(payload),
        content_type='application/json'
    )
    
    # Ejecutar vista
    response = api_orden_compra_guardar(request)
    resp_data = json.loads(response.content)
    
    if not resp_data.get('ok'):
        print(f"FAILED: {resp_data.get('error')}")
        return

    orden_id = resp_data['orden_id']
    print(f"SUCCESS: Orden #{orden_id} creada")

    # 3. Verificaciones Base
    orden = OrdenCompra.objects.get(id=orden_id)
    print(f"Estado Orden: {orden.estado} (Esperado: RECIBIDA)")
    
    # Verificar Compra generada
    try:
        compra = Compra.objects.get(orden_compra=orden)
        print(f"Compra Generada: #{compra.id} - Total: {compra.total}")
    except Compra.DoesNotExist:
        print("ERROR: No se generó la Compra asociada")
        return

    # Verificar Stock
    prod.refresh_from_db()
    print(f"Stock Final: {prod.stock} (Esperado: {stock_inicial + 5})")

    if prod.stock != stock_inicial + 5:
        print("ERROR: El stock no se actualizó correctamente")
    
    # 4. Verificar Pago (Caja)
    # Buscamos movimiento de caja reciente
    mov_caja = MovimientoCaja.objects.filter(
        descripcion__contains=f"Compra #{compra.id}", 
        tipo="Egreso"
    ).last()
    
    if mov_caja:
        print(f"Movimiento Caja: #{mov_caja.id} - Monto: {mov_caja.monto}")
    else:
        print("ERROR: No se encontró movimiento de caja")

    # 5. Verificar Asiento Contable
    # Deben haber 2 asientos: Compra (Prov) y Pago (Prov vs Caja)
    # OJO: Mi logica usa fecha actual.
    from administrar.models import Asiento, ItemAsiento
    
    asientos = Asiento.objects.filter(descripcion__contains=f"Compra #{compra.id}") # Pago Compra #ID...
    # También el asiento de la compra dice "Compra - Proveedor..."
    
    print(f"\nAsientos encontrados relacionados a la compra:")
    for a in asientos:
        print(f" - Asiento #{a.numero}: {a.descripcion}")
        for stat in a.items.all():
            print(f"   > {stat.cuenta.nombre}: D:{stat.debe} | H:{stat.haber}")

    print("\n--- TEST 1 FINALIZADO ---\n")

    # [TEST 2] Si quisieramos probar cheque propio...
    # payload['medio_pago'] = 'CHEQUE'
    # payload['datos_cheque'] = { ... }
    # ...

if __name__ == "__main__":
    try:
        with transaction.atomic():
            verify_direct_purchase()
            # raise Exception("Rollback testing") # Descomentar para no ensuciar DB real si se desea
    except Exception as e:
        print(f"Error General: {e}")
