
# ==========================================
# API REMITOS Y NOTAS DE CRÉDITO (PAGINADOS)
# ==========================================

@login_required
def api_remitos_listar(request):
    try:
        from django.core.paginator import Paginator
        
        page_number = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 10)
        q = request.GET.get('q', '')
        fecha = request.GET.get('fecha', '')

        remitos = Remito.objects.all().order_by('-fecha', '-id')

        if q:
            remitos = remitos.filter(
                Q(cliente__nombre__icontains=q) | 
                Q(numero__icontains=q)
            )

        if fecha:
            remitos = remitos.filter(fecha=fecha)

        paginator = Paginator(remitos, per_page)
        page_obj = paginator.get_page(page_number)

        data = []
        for r in page_obj:
            data.append({
                'id': r.id,
                'fecha': r.fecha.strftime('%d/%m/%Y'),
                'numero': r.numero_formateado(),
                'cliente': r.cliente.nombre,
                'venta_id': r.venta_asociada.id if r.venta_asociada else None,
                'venta_str': r.venta_asociada.numero_factura() if r.venta_asociada else '-',
                'estado': r.estado
            })

        return JsonResponse({
            'remitos': data,
            'total': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number
        })

    except Exception as e:
        print(f"Error api_remitos_listar: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def api_notas_credito_listar(request):
    try:
        from django.core.paginator import Paginator
        
        page_number = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 10)
        q = request.GET.get('q', '')
        fecha = request.GET.get('fecha', '')

        notas = NotaCredito.objects.all().order_by('-fecha', '-id')

        if q:
            notas = notas.filter(
                Q(cliente__nombre__icontains=q) | 
                Q(numero__icontains=q)
            )
            
        if fecha:
            notas = notas.filter(fecha=fecha)

        paginator = Paginator(notas, per_page)
        page_obj = paginator.get_page(page_number)

        data = []
        for n in page_obj:
            data.append({
                'id': n.id,
                'fecha': n.fecha.strftime('%d/%m/%Y'),
                'numero': n.numero_formateado(),
                'cliente': n.cliente.nombre,
                'venta_id': n.venta_asociada.id if n.venta_asociada else None,
                'venta_str': n.venta_asociada.numero_factura() if n.venta_asociada else '-',
                'total': float(n.total),
                'estado': n.estado
            })

        return JsonResponse({
            'notas_credito': data,
            'total': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number
        })
