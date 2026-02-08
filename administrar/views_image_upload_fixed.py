from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, F, Avg
from datetime import date, timedelta, datetime
from .models import Venta, Cliente, Producto, MovimientoCaja, Pedido, PerfilUsuario
from django.http import JsonResponse


@login_required
def api_mi_perfil_imagen(request):
    try:
        # Debug: imprimir información del request
        print(f'DEBUG: request.method = {request.method}')
        print(f'DEBUG: request.FILES = {dict(request.FILES)}')
        
        if 'imagen' not in request.FILES:
            return JsonResponse({'success': False, 'message': 'No se recibió ninguna imagen'})
        
        imagen = request.FILES['imagen']
        print(f'DEBUG: Archivo recibido: {imagen.name}, tamaño: {imagen.size}, tipo: {imagen.content_type}')
        
        # Validar tipo de archivo
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if imagen.content_type not in allowed_types:
            print(f'DEBUG: Tipo no permitido: {imagen.content_type}')
            return JsonResponse({'success': False, 'message': f'Tipo de archivo no permitido. Usar: {", ".join(allowed_types)})
        
        # Validar tamaño (max 10MB para ser más permisivo)
        max_size = 10 * 1024 * 1024
        if imagen.size > max_size:
            print(f'DEBUG: Archivo demasiado grande: {imagen.size} bytes')
            return JsonResponse({'success': False, 'message': f'La imagen es demasiado grande (máximo: {max_size // (1024*1024)}MB)'})
        
        # Obtener o crear perfil del usuario
        try:
            perfil, created = PerfilUsuario.objects.get_or_create(user=request.user)
            print(f'DEBUG: Perfil obtenido/creado: {created}')
        except Exception as e:
            print(f'DEBUG: Error al obtener perfil: {str(e)}')
            return JsonResponse({'success': False, 'message': f'Error al obtener perfil del usuario: {str(e)}'})
        
        # Guardar imagen anterior si existe
        try:
            old_image = perfil.imagen
            if old_image and old_image.name:
                try:
                    old_image.delete(save=False)
                    print(f'DEBUG: Imagen anterior eliminada: {old_image.name}')
                except Exception as e:
                    print(f'DEBUG: Error al eliminar imagen anterior: {str(e)}')
        except Exception as e:
            print(f'DEBUG: Error al manejar imagen anterior: {str(e)}')
        
        # Guardar nueva imagen
        try:
            perfil.imagen = imagen
            perfil.save()
            print(f'DEBUG: Imagen guardada exitosamente')
        except Exception as e:
            print(f'DEBUG: Error al guardar imagen: {str(e)}')
            return JsonResponse({'success': False, 'message': f'Error al guardar la imagen: {str(e)}'})
        
        image_url = perfil.imagen.url if perfil.imagen else None
        print(f'DEBUG: URL de imagen: {image_url}')
        
        return JsonResponse({
            'success': True, 
            'message': 'Imagen actualizada correctamente',
            'url': image_url,
            'filename': imagen.name,
            'debug': f'Archivo guardado: {imagen.name} ({imagen.size} bytes), URL: {image_url}'
        })
        
    except Exception as e:
        print(f'DEBUG: Error general en api_mi_perfil_imagen: {str(e)}')
        return JsonResponse({
            'success': False, 
            'message': f'Error al procesar la imagen: {str(e)}'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': f'Error al procesar la imagen: {str(e)}'
        })