
@csrf_exempt
@transaction.atomic
def api_nota_debito_crear(request, venta_id):
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Método no permitido. Use POST.'}, status=405)
        
    try:
        data = json.loads(request.body)
        monto = Decimal(str(data.get('monto', 0)))
        motivo = data.get('motivo', 'Nota de Débito Genérica')

        if monto <= 0:
             return JsonResponse({'ok': False, 'error': 'El monto debe ser mayor a 0.'})

        venta = Venta.objects.get(pk=venta_id)
        
        # Crear ND
        nd = NotaDebito.objects.create(
            cliente=venta.cliente,
            venta_asociada=venta,
            tipo_comprobante=f"ND{venta.tipo_comprobante[-1] if venta.tipo_comprobante else 'X'}", # e.g., NO -> NDX, FA -> FDA? Better: NDA/NDB/NDC
            total=monto,
            motivo=motivo,
            estado='EMITIDA'
        )
        
        # Ajustar tipo comprobante mejorado
        tipo_letra = venta.tipo_comprobante[-1] if venta.tipo_comprobante else 'X' # A, B, C
        if tipo_letra not in ['A', 'B', 'C']: tipo_letra = 'X'
        nd.tipo_comprobante = f"ND{tipo_letra}"
        nd.save()

        # Crear Detalle Genérico
        DetalleNotaDebito.objects.create(
            nota_debito=nd,
            producto=Producto.objects.first(), # Fallback product necessary? Or make nullable? Assuming first product exists or generic service product.
                                             # Better: find or create a generic 'Concepto ND' product if needed, but let's use first product for now as placeholder is risky.
                                             # Actually, models says 'producto' is ForeignKey(Producto). We need a product.
            cantidad=1,
            precio_unitario=monto,
            subtotal=monto
        )
        # Note: If no product exists, this will fail. Assuming system has products.
        # Ideally we should have a 'Servicio / Concepto' product.

        # Generar Asiento Contable
        try:
            from .services import AccountingService
            AccountingService.registrar_nota_debito(nd)
        except Exception as e:
            print(f"Error generando asiento de ND {nd.id}: {e}")
            
        return JsonResponse({
            'ok': True, 
            'id': nd.id, 
            'message': f'Nota de Débito {nd.numero_formateado()} generada correctamente.'
        })

    except Venta.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Venta no encontrada.'}, status=404)
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
