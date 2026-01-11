
    @classmethod
    def registrar_nota_debito(cls, nd):
        """
        Genera asiento de Nota de Débito (Cargo extra a cliente).
        Debe: Deudores por Ventas (Total) - Aumenta deuda
        Haber: Ventas/Ingresos (Neto)
        Haber: IVA Débito Fiscal
        """
        fecha = nd.fecha.date() if hasattr(nd.fecha, 'date') else nd.fecha
        ejercicio = cls._obtener_ejercicio_vigente(fecha)
        if not ejercicio: return

        cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)
        cuenta_ventas = cls._obtener_cuenta(cls.CUENTA_VENTAS)
        cuenta_iva = cls._obtener_cuenta(cls.CUENTA_IVA_DEBITO)

        if not all([cuenta_deudores, cuenta_ventas, cuenta_iva]):
            print("Faltan cuentas para Nota de Débito")
            return

        total = nd.total
        neto = total / Decimal("1.21")
        iva = total - neto

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=nd.fecha,
                descripcion=f"ND {nd.numero_formateado()} - {nd.cliente.nombre}",
                ejercicio=ejercicio,
                origen='VENTAS',
                usuario='Sistema'
            )

            # Debe: Deudores por Ventas (Aumenta crédito a cobrar)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=total, haber=0)
            
            # Haber: Ventas (Ingreso)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_ventas, debe=0, haber=neto)
            
            # Haber: IVA Débito (Deuda fiscal)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_iva, debe=0, haber=iva)

            print(f"DEBUG: Asiento ND {nuevo_numero} generado para {nd.id}")
