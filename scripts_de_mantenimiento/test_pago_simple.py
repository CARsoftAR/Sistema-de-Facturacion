
import os
import django
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente, MovimientoCuentaCorriente, CajaDiaria
from django.test import RequestFactory
from administrar.views import api_cc_cliente_registrar_pago

def test_pago():
    cliente = Cliente.objects.first()
    if not cliente:
        print("No hay clientes")
        return

    # Asegurarse de que haya una caja abierta para probar integración
    caja = CajaDiaria.objects.filter(estado='ABIERTA').first()
    if not caja:
        from django.contrib.auth.models import User
        user = User.objects.first()
        caja = CajaDiaria.objects.create(usuario=user, estado='ABIERTA', monto_apertura=1000)
        print(f"Caja abierta para el test: {caja.id}")

    factory = RequestFactory()
    data = {
        'monto': '150.50',
        'fecha': '2025-01-17',
        'metodo_pago': 'EFECTIVO',
        'descripcion': 'Test Pago Integrado'
    }
    # Enviar como JSON
    request = factory.post(f'/api/ctacte/clientes/{cliente.id}/registrar-pago/', 
                           data=json.dumps(data), 
                           content_type='application/json')
    
    from django.contrib.auth.models import User
    user = User.objects.first()
    request.user = user

    try:
        response = api_cc_cliente_registrar_pago(request, cliente.id)
        print(f"Response Status: {response.status_code}")
        print(f"Response Content: {response.content.decode()}")
        
        if response.status_code == 200:
            # Verificar si se creo el movimiento de caja
            from administrar.models import MovimientoCaja
            ultimo_mov = MovimientoCaja.objects.filter(descripcion__contains="Recibo").last()
            if ultimo_mov:
                print(f"DEBUG: Movimiento de caja creado OK: {ultimo_mov.descripcion} - ${ultimo_mov.monto}")
            else:
                print("DEBUG: No se encontro movimiento de caja")
                
            # Verificar si se creo el asiento
            from administrar.models import Asiento
            ultimo_asiento = Asiento.objects.last()
            print(f"DEBUG: Ultimo asiento: {ultimo_asiento.descripcion} (ID: {ultimo_asiento.id})")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"FAILED with exception: {e}")

if __name__ == "__main__":
    test_pago()
