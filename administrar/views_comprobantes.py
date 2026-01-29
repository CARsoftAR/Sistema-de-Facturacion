from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db import transaction
from .models import Venta, DetalleVenta, NotaCredito, DetalleNotaCredito, NotaDebito, DetalleNotaDebito, Remito, DetalleRemito, Producto, MovimientoStock, Empresa

@login_required
def lista_nc_nd(request):
    notas_credito = NotaCredito.objects.all().order_by('-fecha')
    notas_debito = NotaDebito.objects.all().order_by('-fecha')
    return render(request, 'administrar/comprobantes/lista_nc_nd.html', {
        'notas_credito': notas_credito,
        'notas_debito': notas_debito
    })

@login_required
def lista_remitos(request):
    remitos = Remito.objects.all().order_by('-fecha')
    return render(request, 'administrar/comprobantes/lista_remitos.html', {
        'remitos': remitos
    })

@login_required
@transaction.atomic
@login_required
@transaction.atomic
def crear_nota_credito(request, venta_id):
    venta = get_object_or_404(Venta, pk=venta_id)
    
    if request.method == 'POST':
        import json
        
        # Check if it's a JSON request (API)
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                motivo = data.get('motivo', '')
                items = data.get('items', [])
                
                if not items:
                    return JsonResponse({'ok': False, 'error': 'La NC debe tener al menos un ítem'}, status=400)

                # Calcular total real de la NC basado en los items enviados
                total_nc = sum(float(i.get('subtotal', 0)) for i in items)

                nc = NotaCredito.objects.create(
                    cliente=venta.cliente,
                    venta_asociada=venta,
                    tipo_comprobante=f"NC{venta.tipo_comprobante}", 
                    total=total_nc, # Usamos el total calculado de los items
                    motivo=motivo,
                    estado='EMITIDA'
                )

                for item_data in items:
                    # Item data viene del frontend (puede ser un producto de la venta original o uno nuevo si se permite)
                    # En NC estricta, deberían ser items de la venta. Pero para flexibilidad "igual a ND", permitimos productos.
                    # Asumimos que envian 'id' que es el ID del PRODUCTO, no del detalle de venta.
                    prod_id = item_data.get('id') 
                    cantidad = float(item_data.get('cantidad', 0))
                    precio = float(item_data.get('precio', 0))
                    
                    if cantidad <= 0: continue

                    producto = get_object_or_404(Producto, pk=prod_id)
                    subtotal = cantidad * precio

                    DetalleNotaCredito.objects.create(
                        nota_credito=nc,
                        producto=producto,
                        cantidad=cantidad,
                        precio_unitario=precio,
                        subtotal=subtotal
                    )

                    # Devolver stock
                    producto.stock += int(cantidad) 
                    producto.save()
                    
                    MovimientoStock.objects.create(
                        producto=producto,
                        tipo='IN',
                        cantidad=cantidad,
                        referencia=f"NC {nc.numero_formateado()} (Anula Venta {venta.id})",
                        observaciones=f"Devolución parcial/total - {motivo}"
                    )

                # Generar Asiento
                try:
                    from .services import AccountingService
                    AccountingService.registrar_nota_credito(nc)
                except Exception as e:
                    print(f"Error generando asiento de NC {nc.id}: {e}")

                return JsonResponse({'ok': True, 'message': 'Nota de Crédito generada correctamente', 'id': nc.id})

            except Exception as e:
                print(f"Error creando NC API: {e}")
                return JsonResponse({'ok': False, 'error': str(e)}, status=500)

        # Manejo TRADICIONAL (Form Post completo - anulación total por defecto)
        else:
            motivo = request.POST.get('motivo', '')
            
            # Crear NC por Total
            nc = NotaCredito.objects.create(
                cliente=venta.cliente,
                venta_asociada=venta,
                tipo_comprobante=f"NC{venta.tipo_comprobante}",
                total=venta.total,
                motivo=motivo,
                estado='EMITIDA'
            )
            
            # Copiar detalles completos
            for det in venta.detalles.all():
                DetalleNotaCredito.objects.create(
                    nota_credito=nc,
                    producto=det.producto,
                    cantidad=det.cantidad,
                    precio_unitario=det.precio_unitario,
                    subtotal=det.subtotal
                )
                
                det.producto.stock += int(det.cantidad)
                det.producto.save()
                MovimientoStock.objects.create(
                    producto=det.producto,
                    tipo='IN',
                    cantidad=det.cantidad,
                    referencia=f"NC {nc.id} (Anula Venta {venta.id})",
                    observaciones="Devolución por Nota de Crédito"
                )

            try:
                from .services import AccountingService
                AccountingService.registrar_nota_credito(nc)
            except Exception as e:
                print(f"Error generando asiento de NC {nc.id}: {e}")

            messages.success(request, f'Nota de Crédito {nc.numero_formateado()} generada correctamente.')
            return redirect('detalle_venta', venta_id=venta.id)
    
    return render(request, 'administrar/comprobantes/crear_nc.html', {'venta': venta})

@login_required
@transaction.atomic
def crear_remito(request, venta_id):
    venta = get_object_or_404(Venta, pk=venta_id)
    
    if request.method == 'POST':
        direccion = request.POST.get('direccion_entrega', venta.cliente.domicilio)
        
        remito = Remito.objects.create(
            cliente=venta.cliente,
            venta_asociada=venta,
            direccion_entrega=direccion,
            estado='GENERADO'
        )
        
        for det in venta.detalles.all():
            DetalleRemito.objects.create(
                remito=remito,
                producto=det.producto,
                cantidad=det.cantidad
            )
            
            # IMPORTANTE: Si la venta YA descontó stock, el remito NO debe descontarlo de nuevo.
            # Asumimos que la Venta descuenta stock al confirmarse.
            # El remito es solo el documento de traslado.
            
        messages.success(request, f'Remito {remito.numero_formateado()} generado correctamente.')
        return redirect('detalle_venta', venta_id=venta.id)

    return render(request, 'administrar/comprobantes/crear_remito.html', {'venta': venta})

@login_required
def detalle_remito(request, id):
    remito = get_object_or_404(Remito, pk=id)
    return render(request, 'administrar/comprobantes/detalle_remito.html', {'remito': remito})

@login_required
def imprimir_remito(request, id):
    from .utils_pdf import render_to_pdf
    remito = get_object_or_404(Remito, pk=id)
    empresa = Empresa.objects.first()
    
    context = {'remito': remito, 'empresa': empresa}
    
    response = render_to_pdf('administrar/comprobantes/rem_pdf.html', context)
    if response:
        filename = f"Remito_{remito.numero_formateado().replace('-', '_')}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
        
    return render(request, 'administrar/comprobantes/rem_modern.html', context)


@login_required
def imprimir_nc(request, id):
    from .utils_pdf import render_to_pdf
    nc = get_object_or_404(NotaCredito, pk=id)
    empresa = Empresa.objects.first()
    
    context = {
        'nota': nc,
        'empresa': empresa,
        'detalles': nc.detalles.all()
    }
    
    response = render_to_pdf('administrar/comprobantes/nc_nd_pdf.html', context)
    if response:
        filename = f"NotaCredito_{nc.numero_formateado().replace('-', '_')}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
        
    return render(request, 'administrar/comprobantes/nc_modern.html', context)

@login_required
def imprimir_nd(request, id):
    from .utils_pdf import render_to_pdf
    nd = get_object_or_404(NotaDebito, pk=id)
    empresa = Empresa.objects.first()
    
    context = {
        'nota': nd,
        'empresa': empresa,
        'detalles': nd.detalles.all()
    }
    
    response = render_to_pdf('administrar/comprobantes/nc_nd_pdf.html', context)
    if response:
        filename = f"NotaDebito_{nd.numero_formateado().replace('-', '_')}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
        
    return render(request, 'administrar/comprobantes/nd_modern.html', context)

@login_required
def api_nota_credito_detalle(request, id):
    try:
        nc = NotaCredito.objects.get(pk=id)
        
        items = [{
            'id': d.id,
            'producto': d.producto.descripcion,
            'cantidad': float(d.cantidad),
            'precio_unitario': float(d.precio_unitario),
            'subtotal': float(d.subtotal)
        } for d in nc.detalles.all()]

        data = {
            'ok': True,
            'header': {
                'id': nc.id,
                'numero': nc.numero_formateado(),
                'fecha': nc.fecha.strftime('%d/%m/%Y %H:%M'),
                'cliente': nc.cliente.nombre,
                'venta_asociada': f"#{nc.venta_asociada.id}" if nc.venta_asociada else "-",
                'total': float(nc.total),
                'motivo': nc.motivo,
                'estado': nc.estado
            },
            'items': items
        }
        return JsonResponse(data)
    except NotaCredito.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Nota de Crédito no encontrada'}, status=404)

@login_required
def api_nota_debito_detalle(request, id):
    try:
        nd = NotaDebito.objects.get(pk=id)
        
        items = [{
            'id': d.id,
            'producto': d.producto.descripcion,
            'cantidad': float(d.cantidad),
            'precio_unitario': float(d.precio_unitario),
            'subtotal': float(d.subtotal)
        } for d in nd.detalles.all()]

        data = {
            'ok': True,
            'header': {
                'id': nd.id,
                'numero': nd.numero_formateado(),
                'fecha': nd.fecha.strftime('%d/%m/%Y %H:%M'),
                'cliente': nd.cliente.nombre,
                'venta_asociada': f"#{nd.venta_asociada.id}" if nd.venta_asociada else "-",
                'total': float(nd.total),
                'motivo': nd.motivo,
                'estado': nd.estado
            },
            'items': items
        }
        return JsonResponse(data)
    except NotaDebito.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Nota de Débito no encontrada'}, status=404)

@login_required
@transaction.atomic
def api_remito_guardar(request):
    if request.method == 'POST':
        try:
            import json
            data = json.loads(request.body)
            
            venta_id = data.get('venta_id')
            cliente_id = data.get('cliente_id')
            direccion_entrega = data.get('direccion_entrega', '')
            items = data.get('items', [])
            
            if not items:
                return JsonResponse({'ok': False, 'error': 'El remito debe tener al menos un ítem'}, status=400)

            venta = None
            cliente = None

            if venta_id:
                venta = get_object_or_404(Venta, pk=venta_id)
                cliente = venta.cliente
                # Si hay venta, usamos la dirección del cliente si no se especificó otra
                if not direccion_entrega:
                    direccion_entrega = cliente.domicilio
            elif cliente_id:
                 # Remito Independiente
                 from .models import Cliente
                 cliente = get_object_or_404(Cliente, pk=cliente_id)
                 if not direccion_entrega:
                    direccion_entrega = cliente.domicilio
            else:
                return JsonResponse({'ok': False, 'error': 'Debe especificar una Venta o un Cliente'}, status=400)

            # Crear el Remito
            remito = Remito.objects.create(
                cliente=cliente,
                venta_asociada=venta, # Puede ser None
                direccion_entrega=direccion_entrega,
                estado='GENERADO',
                observaciones=data.get('observaciones', '')
            )
            
            # Procesar Ítems
            for item in items:
                prod_id = item.get('producto_id')
                cantidad = float(item.get('cantidad', 0))
                
                if cantidad <= 0:
                    continue
                    
                producto = get_object_or_404(Producto, pk=prod_id)
                
                DetalleRemito.objects.create(
                    remito=remito,
                    producto=producto,
                    cantidad=cantidad
                )
                
                # STOCK LOGIC:
                # Si NO hay venta asociada, el remito mueve stock (es una entrega directa/"negro"/garantía)
                if not venta:
                    producto.stock -= int(cantidad) 
                    producto.save()
                    
                    MovimientoStock.objects.create(
                        producto=producto,
                        tipo='OUT',
                        cantidad=cantidad,
                        referencia=f"Remito {remito.numero_formateado()}",
                        observaciones="Entrega por Remito Independiente"
                    )

            return JsonResponse({'ok': True, 'id': remito.id, 'message': 'Remito generado correctamente'})

        except Exception as e:
            print(f"Error guardando remito: {e}")
            return JsonResponse({'ok': False, 'error': str(e)}, status=500)
            
    return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)
