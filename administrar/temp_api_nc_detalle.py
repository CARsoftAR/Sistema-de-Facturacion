
@login_required
def api_nota_credito_detalle(request, id):
    try:
        nc = NotaCredito.objects.get(pk=id)
        
        detalles = []
        for det in nc.detalles.all():
            detalles.append({
                'id': det.id,
                'producto': det.producto.nombre,
                'cantidad': det.cantidad,
                'precio_unitario': float(det.precio_unitario),
                'subtotal': float(det.subtotal)
            })
            
        data = {
            'ok': True,
            'header': {
                'id': nc.id,
                'fecha': nc.fecha.strftime('%d/%m/%Y %H:%M'),
                'numero': nc.numero_formateado(),
                'cliente': nc.cliente.nombre_completo,
                'venta_asociada': f"#{nc.venta_asociada.id} ({nc.venta_asociada.tipo_comprobante})" if nc.venta_asociada else "-",
                'total': float(nc.total),
                'estado': nc.estado,
                'motivo': nc.motivo,
                'tipo_comprobante': nc.tipo_comprobante 
            },
            'items': detalles
        }
        return JsonResponse(data)
    except NotaCredito.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Nota de Crédito no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
