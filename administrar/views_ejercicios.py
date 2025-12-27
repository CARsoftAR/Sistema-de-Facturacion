
# =======================================
# 🔹 API EJERCICIOS CONTABLES
# =======================================

def api_ejercicios_listar(request):
    """API para listar ejercicios contables"""
    from administrar.models import EjercicioContable
    
    try:
        ejercicios = EjercicioContable.objects.all().order_by('-fecha_inicio')
        data = []
        for e in ejercicios:
            data.append({
                'id': e.id,
                'descripcion': e.descripcion,
                'fecha_inicio': e.fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_fin': e.fecha_fin.strftime('%Y-%m-%d'),
                'cerrado': e.cerrado
            })
            
        return JsonResponse({
            'success': True,
            'ejercicios': data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_POST
def api_ejercicios_crear(request):
    """API para crear un nuevo ejercicio contable"""
    from administrar.models import EjercicioContable
    
    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    
    descripcion = data.get('descripcion', '').strip()
    fecha_inicio = data.get('fecha_inicio', '')
    fecha_fin = data.get('fecha_fin', '')
    
    if not descripcion:
        return JsonResponse({'error': 'La descripción es requerida'}, status=400)
    
    try:
        ejercicio = EjercicioContable.objects.create(
            descripcion=descripcion,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
        
        return JsonResponse({
            'ok': True,
            'ejercicio': {
                'id': ejercicio.id,
                'descripcion': ejercicio.descripcion,
                'fecha_inicio': ejercicio.fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_fin': ejercicio.fecha_fin.strftime('%Y-%m-%d'),
                'cerrado': ejercicio.cerrado
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def api_ejercicios_editar(request, id):
    """API para editar un ejercicio contable"""
    from administrar.models import EjercicioContable
    
    try:
        ejercicio = EjercicioContable.objects.get(id=id)
    except EjercicioContable.DoesNotExist:
        return JsonResponse({'error': 'Ejercicio no encontrado'}, status=404)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    
    descripcion = data.get('descripcion', '').strip()
    fecha_inicio = data.get('fecha_inicio', '')
    fecha_fin = data.get('fecha_fin', '')
    cerrado = data.get('cerrado', False)
    
    if not descripcion:
        return JsonResponse({'error': 'La descripción es requerida'}, status=400)
    
    try:
        ejercicio.descripcion = descripcion
        ejercicio.fecha_inicio = fecha_inicio
        ejercicio.fecha_fin = fecha_fin
        ejercicio.cerrado = cerrado
        ejercicio.save()
        
        return JsonResponse({
            'ok': True,
            'ejercicio': {
                'id': ejercicio.id,
                'descripcion': ejercicio.descripcion,
                'fecha_inicio': ejercicio.fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_fin': ejercicio.fecha_fin.strftime('%Y-%m-%d'),
                'cerrado': ejercicio.cerrado
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def api_ejercicios_eliminar(request, id):
    """API para eliminar un ejercicio contable"""
    from administrar.models import EjercicioContable
    
    try:
        ejercicio = EjercicioContable.objects.get(id=id)
    except EjercicioContable.DoesNotExist:
        return JsonResponse({'error': 'Ejercicio no encontrado'}, status=404)
    
    # Verificar si tiene asientos asociados
    if hasattr(ejercicio, 'asiento_set') and ejercicio.asiento_set.exists():
        return JsonResponse({
            'error': 'No se puede eliminar un ejercicio que tiene asientos contables asociados'
        }, status=400)
    
    try:
        ejercicio.delete()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Ejercicio eliminado correctamente'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
