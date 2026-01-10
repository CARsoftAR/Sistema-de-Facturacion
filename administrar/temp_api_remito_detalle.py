
@login_required
def api_remito_detalle(request, id):
    try:
        r = get_object_or_404(Remito, pk=id)
        
        items = []
        for item in r.detalles.all():
            items.append({
                'id': item.id,
                'producto': item.producto.descripcion,
                'cantidad': float(item.cantidad),
            })

        data = {
            'id': r.id,
            'numero': r.numero_formateado(),
            'fecha': r.fecha.strftime('%d/%m/%Y %H:%M'),
            'cliente': r.cliente.nombre,
            'direccion': r.cliente.domicilio, # O la dirección de entrega específica si existiera en el modelo
            'venta_asociada': r.venta_asociada.numero_factura_formateado() if r.venta_asociada else '-',
            'estado': r.estado,
            'items': items
        }
        return JsonResponse(data)
    except Exception as e:
        print(f"Error api_remito_detalle: {e}")
        return JsonResponse({'error': str(e)}, status=500)
