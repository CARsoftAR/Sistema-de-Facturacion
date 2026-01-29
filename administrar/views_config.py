import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Empresa
import os
from datetime import datetime

logger = logging.getLogger(__name__)

def log_to_file(message):
    """Helper para escribir logs a un archivo"""
    log_file = os.path.join(os.path.dirname(__file__), 'config_debug.log')
    with open(log_file, 'a', encoding='utf-8') as f:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        f.write(f"[{timestamp}] {message}\n")

@login_required
def api_config_obtener(request):
    """API para obtener la configuración del sistema"""
    try:
        empresa, created = Empresa.objects.get_or_create(
            id=1,
            defaults={
                'nombre': 'Mi Empresa',
                'cuit': '00-00000000-0',
                'direccion': '',
                'condicion_fiscal': 'RI',
                'punto_venta': '0001',
            }
        )
        
        return JsonResponse({
            'nombre': empresa.nombre,
            'nombre_fantasia': empresa.nombre_fantasia,
            'cuit': empresa.cuit,
            'direccion': empresa.direccion,
            'localidad': empresa.localidad,
            'provincia': empresa.provincia,
            'telefono': empresa.telefono,
            'email': empresa.email,
            'condicion_fiscal': empresa.condicion_fiscal,
            'iibb': empresa.iibb,
            'inicio_actividades': empresa.inicio_actividades.strftime('%Y-%m-%d') if empresa.inicio_actividades else '',
            'punto_venta': empresa.punto_venta,
            'moneda_predeterminada': empresa.moneda_predeterminada,
            'logo': empresa.logo.url if empresa.logo else None,
            'habilita_remitos': empresa.habilita_remitos,
            'actualizar_precios_compra': empresa.actualizar_precios_compra,
            'permitir_stock_negativo': empresa.permitir_stock_negativo,
            'alerta_stock_minimo': empresa.alerta_stock_minimo,
            'margen_ganancia_defecto': float(empresa.margen_ganancia_defecto),
            'metodo_ganancia': empresa.metodo_ganancia,
            'papel_impresion': empresa.papel_impresion,
            'pie_factura': empresa.pie_factura,
            'ocultar_barra_scroll': empresa.ocultar_barra_scroll,
            'ancho_contenido': empresa.ancho_contenido,
            'auto_foco_codigo_barras': empresa.auto_foco_codigo_barras,
            'comportamiento_codigo_barras': empresa.comportamiento_codigo_barras,
            'discriminar_iva_compras': empresa.discriminar_iva_compras,
            'discriminar_iva_ventas': empresa.discriminar_iva_ventas,
            'redondeo_precios': empresa.redondeo_precios,
            'smtp_server': empresa.smtp_server,
            'smtp_port': empresa.smtp_port,
            'smtp_user': empresa.smtp_user,
            'smtp_security': empresa.smtp_security,
            'has_smtp_password': bool(empresa.smtp_password),
            # Backups
            'backup_local_path': empresa.backup_local_path,
            'backup_google_drive_enabled': empresa.backup_google_drive_enabled,
            'backup_google_drive_folder_id': empresa.backup_google_drive_folder_id,
            'has_google_drive_credentials': bool(empresa.backup_google_drive_credentials),
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def api_config_guardar(request):
    """API para guardar la configuración del sistema"""
    try:
        # Determinar si es JSON o multipart
        content_type = request.content_type
        if 'application/json' in content_type:
            data = json.loads(request.body.decode('utf-8'))
        else:
            # Es multipart/form-data
            data = request.POST.dict()
            # Convertir strings booleanos de FormData
            for key in data:
                if data[key].lower() == 'true':
                    data[key] = True
                elif data[key].lower() == 'false':
                    data[key] = False
        
        # Debug: escribir a archivo
        log_to_file("=== DATOS RECIBIDOS EN API CONFIG ===")
        log_to_file(f"Content-Type: {content_type}")
        
        empresa, created = Empresa.objects.get_or_create(
            id=1,
            defaults={
                'nombre': 'Mi Empresa',
                'cuit': '00-00000000-0',
                'direccion': '',
                'condicion_fiscal': 'RI',
                'punto_venta': '0001',
            }
        )
        
        # Actualizar campos de la empresa (si vienen en el request)
        empresa.nombre = data.get('nombre', empresa.nombre)
        empresa.nombre_fantasia = data.get('nombre_fantasia', empresa.nombre_fantasia)
        empresa.cuit = data.get('cuit', empresa.cuit)
        empresa.direccion = data.get('direccion', empresa.direccion)
        empresa.localidad = data.get('localidad', empresa.localidad)
        empresa.provincia = data.get('provincia', empresa.provincia)
        empresa.telefono = data.get('telefono', empresa.telefono)
        empresa.email = data.get('email', empresa.email)
        empresa.condicion_fiscal = data.get('condicion_fiscal', empresa.condicion_fiscal)
        empresa.iibb = data.get('iibb', empresa.iibb)
        empresa.punto_venta = data.get('punto_venta', empresa.punto_venta)
        
        inicio_actividades = data.get('inicio_actividades')
        if inicio_actividades:
            try:
                empresa.inicio_actividades = datetime.strptime(inicio_actividades, '%Y-%m-%d').date()
            except:
                pass

        # Manejo del Logo
        if 'logo' in request.FILES:
            empresa.logo = request.FILES['logo']

        # Actualizar campos generales de configuración
        if 'habilita_remitos' in data: empresa.habilita_remitos = data['habilita_remitos']
        if 'actualizar_precios_compra' in data: empresa.actualizar_precios_compra = data['actualizar_precios_compra']
        if 'permitir_stock_negativo' in data: empresa.permitir_stock_negativo = data['permitir_stock_negativo']
        if 'alerta_stock_minimo' in data: empresa.alerta_stock_minimo = data['alerta_stock_minimo']
        if 'margen_ganancia_defecto' in data: empresa.margen_ganancia_defecto = data['margen_ganancia_defecto']
        if 'metodo_ganancia' in data: empresa.metodo_ganancia = data['metodo_ganancia']
        if 'papel_impresion' in data: empresa.papel_impresion = data['papel_impresion']
        if 'pie_factura' in data: empresa.pie_factura = data['pie_factura']
        if 'ocultar_barra_scroll' in data: empresa.ocultar_barra_scroll = data['ocultar_barra_scroll']
        if 'ancho_contenido' in data: empresa.ancho_contenido = data['ancho_contenido']
        if 'auto_foco_codigo_barras' in data: empresa.auto_foco_codigo_barras = data['auto_foco_codigo_barras']
        if 'comportamiento_codigo_barras' in data: empresa.comportamiento_codigo_barras = data['comportamiento_codigo_barras']
        if 'discriminar_iva_compras' in data: empresa.discriminar_iva_compras = data['discriminar_iva_compras']
        if 'discriminar_iva_ventas' in data: empresa.discriminar_iva_ventas = data['discriminar_iva_ventas']
        if 'redondeo_precios' in data: empresa.redondeo_precios = data['redondeo_precios']
        
        # SMTP
        if 'smtp_server' in data: empresa.smtp_server = data['smtp_server']
        if 'smtp_port' in data: empresa.smtp_port = data['smtp_port']
        if 'smtp_user' in data: empresa.smtp_user = data['smtp_user']
        if 'smtp_security' in data: empresa.smtp_security = data['smtp_security']
        
        smtp_password = data.get('smtp_password', '')
        if smtp_password:
            empresa.smtp_password = smtp_password
        
        # Backups
        if 'backup_local_path' in data: empresa.backup_local_path = data['backup_local_path']
        if 'backup_google_drive_enabled' in data: empresa.backup_google_drive_enabled = data['backup_google_drive_enabled']
        if 'backup_google_drive_folder_id' in data: empresa.backup_google_drive_folder_id = data['backup_google_drive_folder_id']
        
        google_credentials = data.get('backup_google_drive_credentials')
        if google_credentials:
            if isinstance(google_credentials, dict):
                empresa.backup_google_drive_credentials = json.dumps(google_credentials)
            else:
                empresa.backup_google_drive_credentials = google_credentials
        
        empresa.save()
        
        logo_url = empresa.logo.url if empresa.logo else None
        
        return JsonResponse({
            'ok': True, 
            'message': 'Configuración guardada correctamente',
            'logo_url': logo_url
        })
    except Exception as e:
        log_to_file(f"=== ERROR AL GUARDAR CONFIGURACIÓN: {str(e)} ===")
        import traceback
        log_to_file(traceback.format_exc())
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@login_required
def api_seleccionar_carpeta(request):
    """API que abre el selector de carpetas nativo del SO"""
    try:
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.withdraw()  # Ocultar la ventana principal de tk
        root.attributes("-topmost", True)  # Poner al frente de todo
        
        # Abrir el selector de carpetas
        folder_selected = filedialog.askdirectory()
        
        root.destroy()
        
        if folder_selected:
            # Normalizar ruta para Windows (reemplazar / por \)
            folder_selected = folder_selected.replace('/', '\\')
            return JsonResponse({'ok': True, 'path': folder_selected})
        else:
            return JsonResponse({'ok': False, 'message': 'Selección cancelada'})
            
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
