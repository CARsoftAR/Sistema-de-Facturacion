from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.utils import timezone
from django.utils.timezone import make_aware, get_current_timezone
from datetime import datetime, time
from decimal import Decimal
import json

from .models import Producto, MovimientoStock, Empresa


@csrf_exempt
@require_http_methods(["POST"])
def api_stock_ajuste_crear(request):
    """
    Crear un ajuste manual de stock.
    Recibe: producto_id, tipo (IN/OUT), cantidad, observaciones
    """
    try:
        data = json.loads(request.body)
        producto_id = data.get('producto_id')
        tipo = data.get('tipo')  # 'IN' o 'OUT'
        cantidad = Decimal(str(data.get('cantidad', 0)))
        observaciones = data.get('observaciones', '')

        # Validaciones
        if not producto_id:
            return JsonResponse({'error': 'Producto requerido'}, status=400)
        
        if tipo not in ['IN', 'OUT']:
            return JsonResponse({'error': 'Tipo debe ser IN o OUT'}, status=400)
        
        if cantidad <= 0:
            return JsonResponse({'error': 'Cantidad debe ser mayor a 0'}, status=400)

        # Obtener producto
        try:
            producto = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)

        # Verificar stock negativo si está configurado
        empresa = Empresa.objects.first()
        if empresa and not empresa.permitir_stock_negativo:
            if tipo == 'OUT' and producto.stock < cantidad:
                return JsonResponse({
                    'error': f'Stock insuficiente. Stock actual: {producto.stock}'
                }, status=400)

        # Crear movimiento
        movimiento = MovimientoStock.objects.create(
            producto=producto,
            tipo=tipo,
            cantidad=cantidad,
            referencia='Ajuste Manual',
            observaciones=observaciones
        )

        # Actualizar stock del producto
        if tipo == 'IN':
            producto.stock += int(cantidad)
        else:  # OUT
            producto.stock -= int(cantidad)
        
        producto.save()

        return JsonResponse({
            'success': True,
            'movimiento_id': movimiento.id,
            'stock_anterior': producto.stock - int(cantidad) if tipo == 'IN' else producto.stock + int(cantidad),
            'stock_nuevo': producto.stock,
            'mensaje': f'Ajuste de stock realizado correctamente'
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_stock_movimientos_listar(request):
    """
    Listar movimientos de stock con filtros opcionales.
    Parámetros: producto_id, tipo, fecha_desde, fecha_hasta, page, per_page
    """
    try:
        # Filtros
        producto_id = request.GET.get('producto_id')
        tipo = request.GET.get('tipo')
        fecha_desde = request.GET.get('fecha_desde')
        fecha_hasta = request.GET.get('fecha_hasta')
        search = request.GET.get('search', '')
        
        # Paginación
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))

        # Query base
        movimientos = MovimientoStock.objects.select_related('producto').all()

        # Aplicar filtros
        if producto_id:
            movimientos = movimientos.filter(producto_id=producto_id)
        
        if tipo:
            movimientos = movimientos.filter(tipo=tipo)
        
        tz = get_current_timezone()

        if fecha_desde:
            try:
                date_obj = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
                dt_desde = make_aware(datetime.combine(date_obj, time.min), tz)
                movimientos = movimientos.filter(fecha__gte=dt_desde)
            except ValueError:
                pass
        
        if fecha_hasta:
            try:
                date_obj = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
                dt_hasta = make_aware(datetime.combine(date_obj, time.max), tz)
                movimientos = movimientos.filter(fecha__lte=dt_hasta)
            except ValueError:
                pass
        
        if search:
            movimientos = movimientos.filter(
                Q(producto__codigo__icontains=search) |
                Q(producto__descripcion__icontains=search) |
                Q(referencia__icontains=search) |
                Q(observaciones__icontains=search)
            )

        # Ordenar por fecha descendente
        movimientos = movimientos.order_by('-fecha')

        # Contar total
        total = movimientos.count()

        # Paginar
        start = (page - 1) * per_page
        end = start + per_page
        movimientos_page = movimientos[start:end]

        # Serializar
        data = []
        for mov in movimientos_page:
            data.append({
                'id': mov.id,
                'fecha': timezone.localtime(mov.fecha).strftime('%Y-%m-%d %H:%M:%S'),
                'producto_id': mov.producto.id,
                'producto_codigo': mov.producto.codigo,
                'producto_descripcion': mov.producto.descripcion,
                'tipo': mov.tipo,
                'tipo_display': 'Entrada' if mov.tipo == 'IN' else 'Salida',
                'cantidad': float(mov.cantidad),
                'referencia': mov.referencia,
                'observaciones': mov.observaciones,
            })

        return JsonResponse({
            'movimientos': data,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_stock_movimientos_producto(request, producto_id):
    """
    Obtener todos los movimientos de un producto específico.
    """
    try:
        # Verificar que el producto existe
        try:
            producto = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)

        # Obtener movimientos
        movimientos = MovimientoStock.objects.filter(
            producto_id=producto_id
        ).order_by('-fecha')

        # Serializar
        data = []
        for mov in movimientos:
            data.append({
                'id': mov.id,
                'fecha': timezone.localtime(mov.fecha).strftime('%Y-%m-%d %H:%M:%S'),
                'tipo': mov.tipo,
                'tipo_display': 'Entrada' if mov.tipo == 'IN' else 'Salida',
                'cantidad': float(mov.cantidad),
                'referencia': mov.referencia,
                'observaciones': mov.observaciones,
            })

        return JsonResponse({
            'producto': {
                'id': producto.id,
                'codigo': producto.codigo,
                'descripcion': producto.descripcion,
                'stock_actual': producto.stock,
                'stock_minimo': producto.stock_minimo,
                'stock_maximo': producto.stock_maximo,
            },
            'movimientos': data,
            'total': len(data)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
