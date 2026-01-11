
@login_required
def api_notas_debito_listar(request):
    """API para listar notas de débito"""
    try:
        nds = NotaDebito.objects.select_related('cliente', 'venta_asociada').all().order_by('-fecha')
        
        data = []
        for nd in nds:
            data.append({
                'id': nd.id,
                'numero': nd.numero_formateado(),
                'fecha': nd.fecha.strftime('%d/%m/%Y %H:%M'),
                'cliente': nd.cliente.nombre,
                'venta_id': nd.venta_asociada.id if nd.venta_asociada else None,
                'venta_str': nd.venta_asociada.numero_factura_formateado() if nd.venta_asociada else '-',
                'total': float(nd.total),
                'estado': nd.estado,
                'tipo': nd.tipo_comprobante
            })
            
        return JsonResponse({'notas_debito': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def api_nota_debito_detalle(request, id):
    try:
        nd = NotaDebito.objects.get(pk=id)
        
        detalles = []
        for det in nd.detalles.all():
            detalles.append({
                'id': det.id,
                'producto': det.producto.descripcion,
                'cantidad': det.cantidad,
                'precio_unitario': float(det.precio_unitario),
                'subtotal': float(det.subtotal)
            })
            
        data = {
            'ok': True,
            'header': {
                'id': nd.id,
                'fecha': nd.fecha.strftime('%d/%m/%Y %H:%M'),
                'numero': nd.numero_formateado(),
                'cliente': nd.cliente.nombre,
                'venta_asociada': f"#{nd.venta_asociada.id} ({nd.venta_asociada.tipo_comprobante})" if nd.venta_asociada else "-",
                'total': float(nd.total),
                'estado': nd.estado,
                'motivo': nd.motivo,
                'tipo_comprobante': nd.tipo_comprobante 
            },
            'items': detalles
        }
        return JsonResponse(data)
    except NotaDebito.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Nota de Débito no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
