from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField, Q, DateField
from django.db.models.functions import Cast
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Venta, Compra, Producto, MovimientoCaja, Cliente, Proveedor, DetalleVenta, DetalleCompra, Empresa
from .views import verificar_permiso

@login_required
@verificar_permiso('reportes')
def api_reportes_generar(request):
    """API unificada para generar datos de cualquier reporte"""
    report_id = request.GET.get('id')
    fecha_desde_str = request.GET.get('fecha_desde')
    fecha_hasta_str = request.GET.get('fecha_hasta')
    
    if not report_id:
        return JsonResponse({'ok': False, 'error': 'ID de reporte no especificado'})

    # Procesar fechas
    fecha_desde = None
    fecha_hasta = None
    if fecha_desde_str:
        try:
            fecha_desde = datetime.strptime(fecha_desde_str, '%Y-%m-%d')
        except ValueError:
            pass
    if fecha_hasta_str:
        try:
            # Hasta el final del día
            fecha_hasta = datetime.strptime(fecha_hasta_str, '%Y-%m-%d') + timedelta(days=1) - timedelta(seconds=1)
        except ValueError:
            pass

    try:
        data = []
        headers = []
        
        # --- VENTAS ---
        if report_id == 'v_diarias':
            ventas = Venta.objects.all()
            if fecha_desde: ventas = ventas.filter(fecha__gte=fecha_desde)
            if fecha_hasta: ventas = ventas.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Comprobantes', 'Total Neto', 'IVA', 'Total']
            # Agrupar por fecha (solo día) usando Cast para compatibilidad con MySQL
            stats = ventas.annotate(day=Cast('fecha', DateField())).values('day').annotate(
                count=Count('id'),
                neto_sum=Sum('neto'),
                iva_sum=Sum('iva_amount'),
                total_sum=Sum('total')
            ).order_by('day')
            
            for s in stats:
                fecha_str = s['day'].strftime('%d/%m/%Y') if s['day'] else ''
                data.append({
                    'Fecha': fecha_str,
                    'Comprobantes': s['count'],
                    'Total Neto': float(s['neto_sum'] or 0),
                    'IVA': float(s['iva_sum'] or 0),
                    'Total': float(s['total_sum'] or 0)
                })

        elif report_id == 'v_articulos':
            detalles = DetalleVenta.objects.all()
            if fecha_desde: detalles = detalles.filter(venta__fecha__gte=fecha_desde)
            if fecha_hasta: detalles = detalles.filter(venta__fecha__lte=fecha_hasta)
            
            headers = ['Producto', 'Cantidad Vendida', 'Total Recaudado']
            stats = detalles.values('producto__descripcion').annotate(
                qty=Sum('cantidad'),
                total=Sum('subtotal')
            ).order_by('-qty')[:50]
            
            for s in stats:
                data.append({
                    'Producto': s['producto__descripcion'],
                    'Cantidad Vendida': float(s['qty'] or 0),
                    'Total Recaudado': float(s['total'] or 0)
                })

        elif report_id == 'iva_ventas':
            ventas = Venta.objects.all().select_related('cliente')
            if fecha_desde: ventas = ventas.filter(fecha__gte=fecha_desde)
            if fecha_hasta: ventas = ventas.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Tipo', 'Nro', 'Cliente', 'CUIT', 'Neto', 'IVA', 'Total']
            for v in ventas.order_by('fecha'):
                data.append({
                    'Fecha': v.fecha.strftime('%d/%m/%Y'),
                    'Tipo': v.tipo_comprobante,
                    'Nro': v.numero_factura_formateado(),
                    'Cliente': v.cliente.nombre,
                    'CUIT': v.cliente.cuit or '',
                    'Neto': float(v.neto or 0),
                    'IVA': float(v.iva_amount or 0),
                    'Total': float(v.total or 0)
                })

        # --- CAJA ---
        elif report_id == 'c_gastos':
            movs = MovimientoCaja.objects.filter(tipo='Egreso')
            if fecha_desde: movs = movs.filter(fecha__gte=fecha_desde)
            if fecha_hasta: movs = movs.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Concepto', 'Monto']
            for m in movs.order_by('fecha'):
                data.append({
                    'Fecha': m.fecha.strftime('%d/%m/%Y %H:%M'),
                    'Concepto': m.concepto,
                    'Monto': float(m.monto or 0)
                })

        # --- COMPRAS ---
        elif report_id == 'co_diarias':
            compras = Compra.objects.all()
            if fecha_desde: compras = compras.filter(fecha__gte=fecha_desde)
            if fecha_hasta: compras = compras.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Comprobantes', 'Total']
            stats = compras.annotate(day=TruncDate('fecha')).values('day').annotate(
                count=Count('id'),
                total_sum=Sum('total')
            ).order_by('day')
            
            for s in stats:
                fecha_str = s['day'].strftime('%d/%m/%Y') if s['day'] else ''
                data.append({
                    'Fecha': fecha_str,
                    'Comprobantes': s['count'],
                    'Total': float(s['total_sum'] or 0)
                })

        elif report_id == 'iva_compras':
            compras = Compra.objects.all().select_related('proveedor')
            if fecha_desde: compras = compras.filter(fecha__gte=fecha_desde)
            if fecha_hasta: compras = compras.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Tipo', 'Nro', 'Proveedor', 'CUIT', 'Neto', 'IVA', 'Total']
            for c in compras.order_by('fecha'):
                data.append({
                    'Fecha': c.fecha.strftime('%d/%m/%Y'),
                    'Tipo': c.tipo_comprobante,
                    'Nro': c.nro_comprobante,
                    'Proveedor': c.proveedor.nombre,
                    'CUIT': c.proveedor.cuit or '',
                    'Neto': float(c.neto or 0),
                    'IVA': float(c.iva or 0),
                    'Total': float(c.total or 0)
                })

        # --- CLIENTES ---
        elif report_id == 'cl_saldos':
            clientes = Cliente.objects.filter(saldo__gt=0)
            headers = ['Cliente', 'Teléfono', 'Saldo Pendiente']
            for cl in clientes.order_by('-saldo'):
                data.append({
                    'Cliente': cl.nombre,
                    'Teléfono': cl.telefono or '',
                    'Saldo Pendiente': float(cl.saldo or 0)
                })

        # --- PRODUCTOS ---
        elif report_id == 'p_stock':
            prods = Producto.objects.all()
            headers = ['Código', 'Descripción', 'Rubro', 'Stock', 'Costo', 'Valorización']
            for p in prods.order_by('descripcion'):
                data.append({
                    'Código': p.codigo,
                    'Descripción': p.descripcion,
                    'Rubro': p.rubro.nombre if p.rubro else '',
                    'Stock': float(p.stock or 0),
                    'Costo': float(p.costo or 0),
                    'Valorización': float((p.stock or 0) * (p.costo or 0))
                })

        elif report_id == 'p_critico':
            prods = Producto.objects.filter(stock__lte=F('stock_minimo'))
            headers = ['Código', 'Descripción', 'Stock Actual', 'Stock Mínimo', 'Faltante']
            for p in prods.order_by('descripcion'):
                data.append({
                    'Código': p.codigo,
                    'Descripción': p.descripcion,
                    'Stock Actual': float(p.stock or 0),
                    'Stock Mínimo': float(p.stock_minimo or 0),
                    'Faltante': float(p.stock_minimo - p.stock)
                })

        elif report_id == 'cl_mov':
            cliente_id = request.GET.get('cliente_id')
            if not cliente_id:
                return JsonResponse({'ok': False, 'error': 'Debe seleccionar un cliente'})
            
            from .models import MovimientoCuentaCorriente
            movs = MovimientoCuentaCorriente.objects.filter(cliente_id=cliente_id)
            if fecha_desde: movs = movs.filter(fecha__gte=fecha_desde)
            if fecha_hasta: movs = movs.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Concepto', 'Debe (Venta)', 'Haber (Pago)', 'Saldo']
            for m in movs.order_by('fecha'):
                data.append({
                    'Fecha': m.fecha.strftime('%d/%m/%Y'),
                    'Concepto': m.concepto,
                    'Debe (Venta)': float(m.debe or 0),
                    'Haber (Pago)': float(m.haber or 0),
                    'Saldo': float(m.saldo_acumulado or 0)
                })

        # --- PROVEEDORES ---
        elif report_id == 'pr_saldos':
            provs = Proveedor.objects.filter(saldo__gt=0)
            headers = ['Proveedor', 'Teléfono', 'Saldo Pendiente']
            for p in provs.order_by('-saldo'):
                data.append({
                    'Proveedor': p.nombre,
                    'Teléfono': p.telefono or '',
                    'Saldo Pendiente': float(p.saldo or 0)
                })

        elif report_id == 'pr_mov':
            prov_id = request.GET.get('proveedor_id')
            if not prov_id:
                return JsonResponse({'ok': False, 'error': 'Debe seleccionar un proveedor'})
            
            from .models import MovimientoCuentaCorrienteProveedor
            movs = MovimientoCuentaCorrienteProveedor.objects.filter(proveedor_id=prov_id)
            if fecha_desde: movs = movs.filter(fecha__gte=fecha_desde)
            if fecha_hasta: movs = movs.filter(fecha__lte=fecha_hasta)
            
            headers = ['Fecha', 'Concepto', 'Debe (Compra)', 'Haber (Pago)', 'Saldo']
            for m in movs.order_by('fecha'):
                data.append({
                    'Fecha': m.fecha.strftime('%d/%m/%Y'),
                    'Concepto': m.concepto,
                    'Debe (Compra)': float(m.debe or 0),
                    'Haber (Pago)': float(m.haber or 0),
                    'Saldo': float(m.saldo_acumulado or 0)
                })

        # --- CONTABILIDAD ---
        elif report_id == 'co_resultados':
            # Cálculo simple de ventas - costos - gastos
            ventas_tot = Venta.objects.all()
            gastos_tot = MovimientoCaja.objects.filter(tipo='Egreso')
            if fecha_desde: 
                ventas_tot = ventas_tot.filter(fecha__gte=fecha_desde)
                gastos_tot = gastos_tot.filter(fecha__gte=fecha_desde)
            if fecha_hasta: 
                ventas_tot = ventas_tot.filter(fecha__lte=fecha_hasta)
                gastos_tot = gastos_tot.filter(fecha__lte=fecha_hasta)

            v_sum = ventas_tot.aggregate(s=Sum('total'))['s'] or 0
            n_sum = ventas_tot.aggregate(s=Sum('neto'))['s'] or 0
            g_sum = gastos_tot.aggregate(s=Sum('monto'))['s'] or 0
            
            # Aproximación del costo de mercadería vendida (CMV)
            # Podríamos calcularlo exacto sumando costos de DetalleVenta
            detalles = DetalleVenta.objects.filter(venta__in=ventas_tot)
            cmv = 0
            for d in detalles:
                # Buscamos el costo en el momento de la venta o actual
                cmv += (d.cantidad * (d.producto.costo if d.producto else 0))

            headers = ['Concepto', 'Monto']
            data = [
                {'Concepto': 'TOTAL VENTAS (Neto)', 'Monto': float(n_sum)},
                {'Concepto': '(-) COSTO MERCADERÍA (CMV)', 'Monto': float(cmv)},
                {'Concepto': '(=) UTILIDAD BRUTA', 'Monto': float(n_sum - cmv)},
                {'Concepto': '(-) GASTOS OPERATIVOS', 'Monto': float(g_sum)},
                {'Concepto': '(=) RESULTADO DEL EJERCICIO', 'Monto': float(n_sum - cmv - g_sum)},
            ]

        else:
            return JsonResponse({'ok': False, 'error': f'Reporte "{report_id}" no implementado aún'})

        return JsonResponse({
            'ok': True,
            'report_id': report_id,
            'headers': headers,
            'data': data
        })

    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)})
