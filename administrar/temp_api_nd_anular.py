@csrf_exempt
@login_required
@transaction.atomic
def api_nota_debito_anular(request, id):
    """Anular una Nota de Débito existente"""
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Método no permitido. Use POST.'}, status=405)
        
    try:
        nd = NotaDebito.objects.get(pk=id)
        
        # Verificar que no esté ya anulada
        if nd.estado == 'ANULADA':
            return JsonResponse({'ok': False, 'error': 'Esta Nota de Débito ya está anulada.'})
        
        # Cambiar estado a ANULADA
        nd.estado = 'ANULADA'
        nd.save()
        
        # Generar Asiento Contable de Reversión
        try:
            from .services import AccountingService
            from .models import Asiento, ItemAsiento, Ejercicio
            from decimal import Decimal
            from datetime import date
            
            fecha_asiento = date.today()
            ejercicio = AccountingService._obtener_ejercicio_vigente(fecha_asiento)
            
            if ejercicio:
                # Obtener cuentas
                cuenta_deudores = AccountingService._obtener_cuenta(AccountingService.CUENTA_DEUDORES_POR_VENTAS)
                cuenta_ventas = AccountingService._obtener_cuenta(AccountingService.CUENTA_VENTAS)
                cuenta_iva = AccountingService._obtener_cuenta(AccountingService.CUENTA_IVA_DEBITO)
                
                if all([cuenta_deudores, cuenta_ventas, cuenta_iva]):
                    total = nd.total
                    neto = total / Decimal("1.21")
                    iva = total - neto
                    
                    # Crear asiento de reversión (invertir el asiento original)
                    ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
                    nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1
                    
                    asiento = Asiento.objects.create(
                        numero=nuevo_numero,
                        fecha=fecha_asiento,
                        descripcion=f"Anulación ND {nd.numero_formateado()} - {nd.cliente.nombre}",
                        ejercicio=ejercicio,
                        origen='VENTAS',
                        usuario='Sistema'
                    )
                    
                    # Reversión: Invertir el asiento original
                    # Original era: Debe Deudores, Haber Ventas + IVA
                    # Reversión: Haber Deudores, Debe Ventas + IVA
                    ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=0, haber=total)
                    ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_ventas, debe=neto, haber=0)
                    ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_iva, debe=iva, haber=0)
                    
                    print(f"DEBUG: Asiento reversión ND {nuevo_numero} generado para anulación de ND {nd.id}")
        except Exception as e:
            print(f"Error generando asiento de reversión ND {nd.id}: {e}")
            # No fallar la anulación si falla el asiento
            
        return JsonResponse({
            'ok': True,
            'message': f'Nota de Débito {nd.numero_formateado()} anulada correctamente.'
        })
        
    except NotaDebito.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Nota de Débito no encontrada.'}, status=404)
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
