
with open(r'c:\Sistema de Facturacion\administrar\views.py', 'a', encoding='utf-8') as f:
    f.write('''

# ==========================================
# AUTOMATIZACIONES CONTABLES
# ==========================================

@login_required
def api_contabilidad_centralizar_ventas(request):
    """API para centralizar ventas del día en el libro diario"""
    from administrar.models import Venta, Asiento, ItemAsiento, EjercicioContable, PlanCuenta
    from django.db.models import Max
    import datetime
    from django.http import JsonResponse
    
    try:
        hoy = datetime.date.today()
        ventas = Venta.objects.filter(fecha__date=hoy, estado__in=["Emitida", "Pagada"])
        
        ejercicio = EjercicioContable.objects.filter(cerrado=False).last()
        if not ejercicio:
            return JsonResponse({"ok": False, "error": "No hay ejercicio contable abierto"}, status=400)
            
        # Buscar cuentas (Ventas, Deudores, IVA)
        cta_ventas = PlanCuenta.objects.filter(codigo__in=["4.1.01", "4.1.01.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="Venta", imputable=True).first()
        cta_deudores = PlanCuenta.objects.filter(codigo__in=["1.1.02.001", "1.1.03.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="Deudor", imputable=True).first()
        cta_iva = PlanCuenta.objects.filter(codigo__in=["2.1.02.001", "2.1.03.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="IVA D", imputable=True).first()
        
        if not (cta_ventas and cta_deudores):
            return JsonResponse({"ok": False, "error": "No se encontraron las cuentas de Ventas o Deudores en el Plan de Cuentas"}, status=400)
            
        count = 0
        for v in ventas:
            if Asiento.objects.filter(origen="VENTAS", referencia_id=v.id).exists():
                continue
                
            num = (Asiento.objects.filter(ejercicio=ejercicio).aggregate(m=Max("numero"))["m"] or 0) + 1
            asiento = Asiento.objects.create(
                numero=num,
                fecha=v.fecha,
                descripcion=f"Centralización Venta #{v.id} - {v.cliente.nombre[:50]}",
                ejercicio=ejercicio,
                origen="VENTAS",
                referencia_id=v.id
            )
            
            # DEBE: Deudores
            ItemAsiento.objects.create(asiento=asiento, cuenta=cta_deudores, debe=v.total, haber=0)
            # HABER: Ventas
            ItemAsiento.objects.create(asiento=asiento, cuenta=cta_ventas, debe=0, haber=v.neto)
            # HABER: IVA
            if v.iva_amount > 0 and cta_iva:
                ItemAsiento.objects.create(asiento=asiento, cuenta=cta_iva, debe=0, haber=v.iva_amount)
            count += 1
            
        return JsonResponse({"ok": True, "mensaje": f"Se centralizaron {count} ventas del día."})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)

@login_required
def api_contabilidad_centralizar_compras(request):
    """API para centralizar compras del día"""
    from administrar.models import Compra, Asiento, ItemAsiento, EjercicioContable, PlanCuenta
    from django.db.models import Max
    import datetime
    from django.http import JsonResponse
    
    try:
        hoy = datetime.date.today()
        compras = Compra.objects.filter(fecha__date=hoy, estado="REGISTRADA")
        
        ejercicio = EjercicioContable.objects.filter(cerrado=False).last()
        if not ejercicio:
            return JsonResponse({"ok": False, "error": "No hay ejercicio contable abierto"}, status=400)
            
        cta_mercaderia = PlanCuenta.objects.filter(codigo__in=["1.1.03.001", "1.1.05.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="Mercader", imputable=True).first()
        cta_proveedores = PlanCuenta.objects.filter(codigo__in=["2.1.01.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="Proveedor", imputable=True).first()
        cta_iva_c = PlanCuenta.objects.filter(codigo__in=["1.1.04.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="IVA C", imputable=True).first()
        
        if not (cta_mercaderia and cta_proveedores):
            return JsonResponse({"ok": False, "error": "No se encontraron las cuentas de Mercaderías o Proveedores"}, status=400)
            
        count = 0
        for c in compras:
            if Asiento.objects.filter(origen="COMPRAS", referencia_id=c.id).exists():
                continue
                
            num = (Asiento.objects.filter(ejercicio=ejercicio).aggregate(m=Max("numero"))["m"] or 0) + 1
            asiento = Asiento.objects.create(
                numero=num,
                fecha=c.fecha,
                descripcion=f"Centralización Compra #{c.id} - {c.proveedor.nombre[:50]}",
                ejercicio=ejercicio,
                origen="COMPRAS",
                referencia_id=c.id
            )
            
            # DEBE: Mercadería (Neto)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cta_mercaderia, debe=c.neto, haber=0)
            # DEBE: IVA (si aplica)
            if c.iva > 0 and cta_iva_c:
                ItemAsiento.objects.create(asiento=asiento, cuenta=cta_iva_c, debe=c.iva, haber=0)
            # HABER: Proveedores (Total)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cta_proveedores, debe=0, haber=c.total)
            count += 1
            
        return JsonResponse({"ok": True, "mensaje": f"Se centralizaron {count} compras del día."})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)

@login_required
def api_contabilidad_centralizar_cmv(request):
    """API para generar el asiento de Costo de Mercadería Vendida"""
    from administrar.models import Venta, DetalleVenta, Asiento, ItemAsiento, EjercicioContable, PlanCuenta
    from django.db.models import Max, Sum, F
    from decimal import Decimal
    import datetime
    from django.http import JsonResponse
    
    try:
        hoy = datetime.date.today()
        ejercicio = EjercicioContable.objects.filter(cerrado=False).last()
        if not ejercicio:
            return JsonResponse({"ok": False, "error": "No hay ejercicio contable abierto"}, status=400)
            
        # Verificar si ya se hizo hoy
        if Asiento.objects.filter(fecha__date=hoy, descripcion__contains="ASIENTO CMV").exists():
             return JsonResponse({"ok": False, "error": "El asiento de CMV de hoy ya fue generado."}, status=400)
             
        # Calcular el costo total de lo vendido hoy
        detalles = DetalleVenta.objects.filter(venta__fecha__date=hoy, venta__estado__in=["Emitida", "Pagada"])
        total_costo = Decimal("0")
        
        for d in detalles:
            costo_unitario = d.producto.costo
            total_costo += d.cantidad * costo_unitario
            
        if total_costo == 0:
            return JsonResponse({"ok": False, "error": "No hay movimientos de venta con costo para procesar hoy."}, status=400)
            
        cta_cmv = PlanCuenta.objects.filter(codigo__in=["5.1.01.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="CMV", imputable=True).first()
        cta_stock = PlanCuenta.objects.filter(codigo__in=["1.1.05.001", "1.1.03.001"]).first() or PlanCuenta.objects.filter(nombre__icontains="Mercader", imputable=True).first()
        
        if not (cta_cmv and cta_stock):
            return JsonResponse({"ok": False, "error": "No se encontraron las cuentas de CMV o Mercaderías"}, status=400)
            
        num = (Asiento.objects.filter(ejercicio=ejercicio).aggregate(m=Max("numero"))["m"] or 0) + 1
        asiento = Asiento.objects.create(
            numero=num,
            fecha=datetime.datetime.now(),
            descripcion=f"ASIENTO CMV - CENTRALIZACION DIARIA {hoy}",
            ejercicio=ejercicio,
            origen="MANUAL"
        )
        
        # DEBE: Gasto (CMV)
        ItemAsiento.objects.create(asiento=asiento, cuenta=cta_cmv, debe=total_costo, haber=0)
        # HABER: Activo (Stock)
        ItemAsiento.objects.create(asiento=asiento, cuenta=cta_stock, debe=0, haber=total_costo)
        
        return JsonResponse({"ok": True, "mensaje": f"Asiento de CMV generado por ${total_costo:,.2f}."})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)
''')
