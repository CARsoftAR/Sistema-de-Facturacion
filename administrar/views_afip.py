from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Empresa
from .afip_service import AFIPService
import logging

logger = logging.getLogger(__name__)

@login_required
def api_afip_test_conexion(request):
    """API para probar la conexión con AFIP y verificar certificados"""
    try:
        empresa = Empresa.objects.first()
        if not empresa:
            return JsonResponse({'ok': False, 'error': 'No hay empresa configurada'})
            
        service = AFIPService(empresa)
        
        # 1. Intentar obtener el TA (Token de Acceso)
        # Esto valida Certificado, Clave Privada y CUIT
        try:
            token, sign = service.obtener_token_acceso()
        except Exception as e:
            return JsonResponse({
                'ok': False, 
                'error': f'Fallo en Autenticación (WSAA): {str(e)}',
                'detalle': 'Asegúrate de haber subido el certificado (.crt) correcto.'
            })
            
        # 2. Intentar consultar el último comprobante
        # Esto valida que el CUIT esté autorizado para el servicio WSFE
        try:
            pv = int(empresa.punto_venta)
            ultimo = service.consultar_ultimo_comprobante(pv, 6) # 6 = Factura B
            return JsonResponse({
                'ok': True, 
                'message': 'Conexión con AFIP exitosa',
                'data': {
                    'proximo_numero': ultimo + 1,
                    'punto_venta': pv,
                    'token_valido': True
                }
            })
        except Exception as e:
            return JsonResponse({
                'ok': False, 
                'error': f'Fallo en Facturación (WSFE): {str(e)}',
                'detalle': 'Es posible que el punto de venta no esté dado de alta en AFIP como "Factura Electrónica".'
            })
            
    except Exception as e:
        logger.error(f"Error general en api_afip_test_conexion: {str(e)}")
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@login_required
def api_afip_consultar_ultimo(request):
    """API para consultar el último comprobante de un tipo y PV"""
    try:
        pv = int(request.GET.get('pv', 1))
        tipo = int(request.GET.get('tipo', 6)) # 6 = B, 1 = A, 11 = C
        
        empresa = Empresa.objects.first()
        service = AFIPService(empresa)
        
        ultimo = service.consultar_ultimo_comprobante(pv, tipo)
        return JsonResponse({'ok': True, 'proximo': ultimo + 1})
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)
