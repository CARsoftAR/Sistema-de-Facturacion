import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Venta

# Verificar la venta #221
print("=" * 60)
print("VERIFICANDO VENTA #221 EN LA BASE DE DATOS")
print("=" * 60)

try:
    venta = Venta.objects.get(id=221)
    
    print(f"\nVenta ID: {venta.id}")
    print(f"Cliente: {venta.cliente.nombre}")
    print(f"Total: ${venta.total}")
    print(f"Fecha: {venta.fecha}")
    print(f"Tipo Comprobante: {venta.tipo_comprobante}")
    print(f"Estado: '{venta.estado}'")
    print(f"CAE: {venta.cae}")
    print(f"\n>>> PEDIDO ORIGEN: {venta.pedido_origen}")
    
    if venta.pedido_origen:
        print(f"    - Pedido ID: {venta.pedido_origen.id}")
        print(f"    - Pedido Estado: {venta.pedido_origen.estado}")
    else:
        print("    - ¡¡¡ NULL !!!")
    
    print("\n" + "=" * 60)
    
except Venta.DoesNotExist:
    print("ERROR: Venta #221 no encontrada")
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
