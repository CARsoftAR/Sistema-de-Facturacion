import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Empresa
from administrar.afip_service import AFIPService

def test_afip():
    empresa = Empresa.objects.first()
    if not empresa:
        print("Error: No hay empresa configurada.")
        return

    print(f"Probando conexión AFIP para {empresa.nombre} (CUIT {empresa.cuit})...")
    service = AFIPService(empresa)
    
    try:
        print("Paso 1: Intentando obtener Token de Acceso (WSAA)...")
        token, sign = service.obtener_token_acceso()
        print("¡ÉXITO! Token obtenido correctamente.")
        print(f"Token (truncado): {token[:20]}...")
        
        print("\nPaso 2: Consultando último comprobante (WSFE)...")
        # Por defecto probamos Punto Venta 1, Factura B (Tipo 6)
        punto_venta = int(empresa.punto_venta)
        ultimo = service.consultar_ultimo_comprobante(punto_venta, 6)
        print(f"¡ÉXITO! Última Factura B en Punto de Venta {punto_venta}: {ultimo}")
        
    except Exception as e:
        print(f"\nERROR durante la prueba: {str(e)}")
        print("\nVerifica que:")
        print("1. El CUIT sea correcto.")
        print("2. Los certificados estén en 'afip_credenciales/' con los nombres correctos.")
        print("3. La fecha/hora de tu PC esté sincronizada.")

if __name__ == '__main__':
    test_afip()
