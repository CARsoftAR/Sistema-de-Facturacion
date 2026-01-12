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
def crear_nota_credito(request, venta_id):
    venta = get_object_or_404(Venta, pk=venta_id)
    
    if request.method == 'POST':
        motivo = request.POST.get('motivo', '')
        
        # Crear NC
        nc = NotaCredito.objects.create(
            cliente=venta.cliente,
            venta_asociada=venta,
            tipo_comprobante=f"NC{venta.tipo_comprobante}", # Si es Factura A -> NCA
            total=venta.total,
            motivo=motivo,
            estado='EMITIDA'
        )
        
        # Copiar detalles
        for det in venta.detalles.all():
            DetalleNotaCredito.objects.create(
                nota_credito=nc,
                producto=det.producto,
                cantidad=det.cantidad,
                precio_unitario=det.precio_unitario,
                subtotal=det.subtotal
            )
            
            # Devolver stock (NC implica devolución de mercadería generalmente)
            # Opcional: preguntar al usuario si devuelve stock. Asumimos que sí por defecto en anulación completa.
            det.producto.stock += int(det.cantidad) # Asumiendo cantidad entera por ahora
            det.producto.save()
            MovimientoStock.objects.create(
                producto=det.producto,
                tipo='IN',
                cantidad=det.cantidad,
                referencia=f"NC {nc.id} (Anula Venta {venta.id})",
                observaciones="Devolución por Nota de Crédito"
            )

        # Generar Asiento Contable
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
    remito = get_object_or_404(Remito, pk=id)
    empresa = Empresa.objects.first()
    
    model = request.GET.get('model', 'modern')
    modelos_validos = ['modern', 'minimal', 'classic', 'elegant', 'tech', 'industrial', 'eco', 'compact', 'luxury', 'bold']
    if model not in modelos_validos:
        model = 'modern'
        
    context = {'remito': remito, 'empresa': empresa}
    template_name = f'administrar/comprobantes/rem_{model}.html'
    
    try:
        return render(request, template_name, context)
    except:
        return render(request, 'administrar/comprobantes/rem_modern.html', context)

@login_required
def imprimir_nc(request, id):
    nc = get_object_or_404(NotaCredito, pk=id)
    empresa = Empresa.objects.first()
    
    model = request.GET.get('model', 'modern')
    modelos_validos = ['modern', 'minimal', 'classic', 'elegant', 'tech', 'industrial', 'eco', 'compact', 'luxury', 'bold']
    
    if model not in modelos_validos:
        model = 'modern'
        
    template_name = f'administrar/comprobantes/nc_{model}.html'
    
    context = {
        'nota': nc,
        'empresa': empresa,
        'detalles': nc.detalles.all()
    }
    
    try:
        return render(request, template_name, context)
    except:
        return render(request, 'administrar/comprobantes/nc_modern.html', context)

@login_required
def imprimir_nd(request, id):
    nd = get_object_or_404(NotaDebito, pk=id)
    empresa = Empresa.objects.first()
    
    model = request.GET.get('model', 'modern')
    modelos_validos = ['modern', 'minimal', 'classic', 'elegant', 'tech', 'industrial', 'eco', 'compact', 'luxury', 'bold']
    
    if model not in modelos_validos:
        model = 'modern'
        
    template_name = f'administrar/comprobantes/nd_{model}.html'
    
    context = {
        'nota': nd,
        'empresa': empresa,
        'detalles': nd.detalles.all()
    }
    
    try:
        return render(request, template_name, context)
    except:
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
