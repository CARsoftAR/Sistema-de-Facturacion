import os

code_to_append = r'''

# =======================================
# 🔹 REPORTES Y ESTADÍSTICAS
# =======================================

@login_required
@verificar_permiso('reportes')
def reportes(request):
    """Vista principal de reportes y estadísticas"""
    return render(request, "administrar/reportes.html")


@login_required
@verificar_permiso('reportes')
def api_estadisticas_ventas(request):
    """API para obtener estadísticas de ventas"""
    from django.db.models import Sum, Count, Avg
    from datetime import datetime, timedelta
    from collections import defaultdict
    
    # Parámetros de filtro
    fecha_desde_str = request.GET.get('fecha_desde', '')
    fecha_hasta_str = request.GET.get('fecha_hasta', '')
    
    # Query base
    ventas = Venta.objects.all()
    
    # Aplicar filtros de fecha
    if fecha_desde_str:
        try:
            fecha_desde = datetime.strptime(fecha_desde_str, '%Y-%m-%d').date()
            ventas = ventas.filter(fecha__date__gte=fecha_desde)
        except ValueError:
            pass
    
    if fecha_hasta_str:
        try:
            fecha_hasta = datetime.strptime(fecha_hasta_str, '%Y-%m-%d').date()
            ventas = ventas.filter(fecha__date__lte=fecha_hasta)
        except ValueError:
            pass
    
    # Si no hay filtros especific set default range (últimos 12 meses)
    if not fecha_desde_str and not fecha_hasta_str:
        hace_12_meses = datetime.now() - timedelta(days=365)
        ventas = ventas.filter(fecha__gte=hace_12_meses)
    
    # Estadísticas generales
    total_ventas = ventas.aggregate(total=Sum('total'))['total'] or 0
    cantidad_ventas = ventas.count()
    promedio_venta = ventas.aggregate(promedio=Avg('total'))['promedio'] or 0
    
    # Ventas por mes
    ventas_por_mes = defaultdict(float)
    for venta in ventas:
        mes_key = venta.fecha.strftime('%Y-%m')
        ventas_por_mes[mes_key] += float(venta.total)
    
    # Ordenar por fecha
    ventas_por_mes_lista = [
        {'mes': mes, 'total': total}
        for mes, total in sorted(ventas_por_mes.items())
    ]
    
    # Top 5 clientes
    top_clientes = ventas.values('cliente__nombre').annotate(
        total=Sum('total'),
        cantidad=Count('id')
    ).order_by('-total')[:5]
    
    top_clientes_lista = [
        {
            'nombre': item['cliente__nombre'],
            'total': float(item['total']),
            'cantidad': item['cantidad']
        }
        for item in top_clientes
    ]
    
    # Top 5 productos vendidos
    detalles = DetalleVenta.objects.filter(venta__in=ventas).values(
        'producto__descripcion'
    ).annotate(
        cantidad_total=Sum('cantidad'),
        importe_total=Sum('subtotal')
    ).order_by('-cantidad_total')[:5]
    
    top_productos_lista = [
        {
            'nombre': item['producto__descripcion'],
            'cantidad': float(item['cantidad_total']),
            'importe': float(item['importe_total'])
        }
        for item in detalles
    ]
    
    # Distribución por método de pago
    metodos_pago = ventas.values('metodo_pago').annotate(
        total=Sum('total'),
        cantidad=Count('id')
    ).order_by('-total')
    
    metodos_pago_lista = [
        {
            'metodo': item['metodo_pago'] or 'No especificado',
            'total': float(item['total']),
            'cantidad': item['cantidad']
        }
        for item in metodos_pago
    ]
    
    return JsonResponse({
        'ok': True,
        'total_ventas': float(total_ventas),
        'cantidad_ventas': cantidad_ventas,
        'promedio_venta': float(promedio_venta),
        'ventas_por_mes': ventas_por_mes_lista,
        'top_clientes': top_clientes_lista,
        'top_productos': top_productos_lista,
        'metodos_pago': metodos_pago_lista,
    })


@login_required
@verificar_permiso('reportes')
def api_estadisticas_compras(request):
    """API para obtener estadísticas de compras"""
    from django.db.models import Sum, Count, Avg
    from datetime import datetime, timedelta
    from collections import defaultdict
    
    # Parámetros de filtro
    fecha_desde_str = request.GET.get('fecha_desde', '')
    fecha_hasta_str = request.GET.get('fecha_hasta', '')
    
    # Query base
    compras = Compra.objects.all()
    
    # Aplicar filtros de fecha
    if fecha_desde_str:
        try:
            fecha_desde = datetime.strptime(fecha_desde_str, '%Y-%m-%d').date()
            compras = compras.filter(fecha__date__gte=fecha_desde)
        except ValueError:
            pass
    
    if fecha_hasta_str:
        try:
            fecha_hasta = datetime.strptime(fecha_hasta_str, '%Y-%m-%d').date()
            compras = compras.filter(fecha__date__lte=fecha_hasta)
        except ValueError:
            pass
    
    # Default: últimos 12 meses
    if not fecha_desde_str and not fecha_hasta_str:
        hace_12_meses = datetime.now() - timedelta(days=365)
        compras = compras.filter(fecha__gte=hace_12_meses)
    
    # Estadísticas generales
    total_compras = compras.aggregate(total=Sum('total'))['total'] or 0
    cantidad_compras = compras.count()
    promedio_compra = compras.aggregate(promedio=Avg('total'))['promedio'] or 0
    
    # Compras por mes
    compras_por_mes = defaultdict(float)
    for compra in compras:
        mes_key = compra.fecha.strftime('%Y-%m')
        compras_por_mes[mes_key] += float(compra.total)
    
    compras_por_mes_lista = [
        {'mes': mes, 'total': total}
        for mes, total in sorted(compras_por_mes.items())
    ]
   
    # Top 5 proveedores
    top_proveedores = compras.values('proveedor__nombre').annotate(
        total=Sum('total'),
        cantidad=Count('id')
    ).order_by('-total')[:5]
    
    top_proveedores_lista = [
        {
            'nombre': item['proveedor__nombre'] or 'Sin proveedor',
            'total': float(item['total']),
            'cantidad': item['cantidad']
        }
        for item in top_proveedores
    ]
    
    # Top 5 productos comprados
    detalles = DetalleCompra.objects.filter(compra__in=compras).values(
        'producto__descripcion'
    ).annotate(
        cantidad_total=Sum('cantidad'),
        importe_total=Sum('subtotal')
    ).order_by('-cantidad_total')[:5]
    
    top_productos_lista = [
        {
            'nombre': item['producto__descripcion'],
            'cantidad': float(item['cantidad_total']),
            'importe': float(item['importe_total'])
        }
        for item in detalles
    ]
    
    return JsonResponse({
        'ok': True,
        'total_compras': float(total_compras),
        'cantidad_compras': cantidad_compras,
        'promedio_compra': float(promedio_compra),
        'compras_por_mes': compras_por_mes_lista,
        'top_proveedores': top_proveedores_lista,
        'top_productos': top_productos_lista,
    })


@login_required
@verificar_permiso('reportes')
def api_estadisticas_stock(request):
    """API para obtener estadísticas de inventario"""
    from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField
    
    # Productos con stock bajo (menor al stock mínimo)
    productos_stock_bajo = Producto.objects.filter(
        stock__lt=F('stock_minimo')
    ).values('codigo', 'descripcion', 'stock', 'stock_minimo')
    
    stock_bajo_lista = [
        {
            'codigo': p['codigo'],
            'descripcion': p['descripcion'],
            'stock_actual': float(p['stock']),
            'stock_minimo': float(p['stock_minimo'])
        }
        for p in productos_stock_bajo[:10]  # Limitar a 10
    ]
    
    # Valorización total del inventario (stock * costo)
    total_productos = Producto.objects.count()
    
    # Calcular valorización
    valorizacion = Producto.objects.aggregate(
        total=Sum(ExpressionWrapper(
            F('stock') * F('costo'),
            output_field=DecimalField()
        ))
    )['total'] or 0
    
    # Distribución por rubro
    por_rubro = Producto.objects.values('rubro__nombre').annotate(
        cantidad=Count('id'),
        stock_total=Sum('stock'),
        valor=Sum(ExpressionWrapper(
            F('stock') * F('costo'),
            output_field=DecimalField()
        ))
    ).order_by('-cantidad')[:10]
    
    rubros_lista = [
        {
            'rubro': r['rubro__nombre'] or 'Sin rubro',
            'cantidad_productos': r['cantidad'],
            'stock_total': float(r['stock_total'] or 0),
            'valorización': float(r['valor'] or 0)
        }
        for r in por_rubro
    ]
    
    # Distribución por marca
    por_marca = Producto.objects.values('marca__nombre').annotate(
        cantidad=Count('id'),
        stock_total=Sum('stock')
    ).order_by('-cantidad')[:10]
    
    marcas_lista = [
        {
            'marca': m['marca__nombre'] or 'Sin marca',
            'cantidad_productos': m['cantidad'],
            'stock_total': float(m['stock_total'] or 0)
        }
        for m in por_marca
    ]
    
    return JsonResponse({
        'ok': True,
        'total_productos': total_productos,
        'valorizacion_total': float(valorizacion),
        'productos_stock_bajo': stock_bajo_lista,
        'cantidad_stock_bajo': len(stock_bajo_lista),
        'distribucion_rubros': rubros_lista,
        'distribucion_marcas': marcas_lista,
    })


@login_required
@verificar_permiso('reportes')
def api_estadisticas_caja(request):
    """API para obtener estadísticas de caja"""
    from django.db.models import Sum
    from datetime import datetime, timedelta
    from collections import defaultdict
    
    # Parámetros de filtro
    fecha_desde_str = request.GET.get('fecha_desde', '')
    fecha_hasta_str = request.GET.get('fecha_hasta', '')
    
    # Query base
    movimientos = MovimientoCaja.objects.all()
   
    # Aplicar filtros de fecha
    if fecha_desde_str:
        try:
            fecha_desde = datetime.strptime(fecha_desde_str, '%Y-%m-%d').date()
            movimientos = movimientos.filter(fecha__date__gte=fecha_desde)
        except ValueError:
            pass
    
    if fecha_hasta_str:
        try:
            fecha_hasta = datetime.strptime(fecha_hasta_str, '%Y-%m-%d').date()
            movimientos = movimientos.filter(fecha__date__lte=fecha_hasta)
        except ValueError:
            pass
    
    # Default: últimos 12 meses
    if not fecha_desde_str and not fecha_hasta_str:
        hace_12_meses = datetime.now() - timedelta(days=365)
        movimientos = movimientos.filter(fecha__gte=hace_12_meses)
    
    # Totales de ingresos y egresos
    ingresos_total = movimientos.filter(tipo='Ingreso').aggregate(total=Sum('monto'))['total'] or 0
    egresos_total = movimientos.filter(tipo='Egreso').aggregate(total=Sum('monto'))['total'] or 0
    balance = float(ingresos_total) - float(egresos_total)
    
    # Ingresos y egresos por mes
    ingresos_por_mes = defaultdict(float)
    egresos_por_mes = defaultdict(float)
    
    for mov in movimientos:
        mes_key = mov.fecha.strftime('%Y-%m')
        if mov.tipo == 'Ingreso':
            ingresos_por_mes[mes_key] += float(mov.monto)
        else:
            egresos_por_mes[mes_key] += float(mov.monto)
    
    # Combinar en una lista ordenada
    todos_meses = set(ingresos_por_mes.keys()) | set(egresos_por_mes.keys())
    movimientos_por_mes_lista = [
        {
            'mes': mes,
            'ingresos': ingresos_por_mes.get(mes, 0),
            'egresos': egresos_por_mes.get(mes, 0),
            'balance': ingresos_por_mes.get(mes, 0) - egresos_por_mes.get(mes, 0)
        }
        for mes in sorted(todos_meses)
    ]
    
    # Promedio diario (si hay filtro de fechas)
    dias_total = 30  # Default
    if fecha_desde_str and fecha_hasta_str:
        try:
            fecha_desde = datetime.strptime(fecha_desde_str, '%Y-%m-%d').date()
            fecha_hasta = datetime.strptime(fecha_hasta_str, '%Y-%m-%d').date()
            dias_total = (fecha_hasta - fecha_desde).days + 1
        except:
            pass
    
    promedio_diario_ingresos = float(ingresos_total) / dias_total if dias_total > 0 else 0
    promedio_diario_egresos = float(egresos_total) / dias_total if dias_total > 0 else 0
    
    return JsonResponse({
        'ok': True,
        'ingresos_total': float(ingresos_total),
        'egresos_total': float(egresos_total),
        'balance': balance,
        'movimientos_por_mes': movimientos_por_mes_lista,
        'promedio_diario_ingresos': promedio_diario_ingresos,
        'promedio_diario_egresos': promedio_diario_egresos,
        'cantidad_movimientos': movimientos.count(),
    })
'''

with open(r'c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\views.py', 'a', encoding='utf-8') as f:
    f.write(code_to_append)

print("Actualizado successfully")
