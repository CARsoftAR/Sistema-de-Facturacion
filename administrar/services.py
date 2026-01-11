from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from decimal import Decimal
from datetime import date
from .models import Cheque, Asiento, ItemAsiento, PlanCuenta, EjercicioContable, Cliente

class AccountingService:
    """
    Servicio centralizado para la generación de asientos contables 
    basados en eventos de negocio (Ventas, Compras, Cheques).
    """
    # Nombres de cuentas contables esperadas
    CUENTA_VALORES_A_DEPOSITAR = "Valores a Depositar"
    CUENTA_DEUDORES_POR_VENTAS = "Deudores por Ventas"
    CUENTA_BANCO = "Banco" 
    CUENTA_PROVEEDORES = "Proveedores"
    CUENTA_VENTAS = "Ventas"
    CUENTA_COMPRAS = "Mercader"
    CUENTA_IVA_DEBITO = "2.1.02.001"
    CUENTA_IVA_CREDITO = "1.1.04.001"
    CUENTA_COSTO_MERCADERIAS = "5.1.01"
    
    # Cuentas para Medios de Pago
    CUENTA_CAJA = "Caja en Pesos"
    CUENTA_TARJETAS_A_COBRAR = "Tarjetas a Cobrar"  # Activo - Crédito por cobrar de tarjetas
    CUENTA_COMISIONES_TARJETA = "Comisiones Tarjeta"  # Gasto - Comisión del procesador
    
    # Cuentas de Retenciones
    CUENTA_RETENCIONES_A_DEPOSITAR = "Retenciones a Depositar" # Pasivo (Pago a Proveedor)
    CUENTA_RETENCIONES_SUFRIDAS = "Retenciones Sufridas"     # Activo (Cobro a Cliente)


    @classmethod
    def _obtener_ejercicio_vigente(cls, fecha=None):
        if not fecha:
            fecha = date.today()
        
        try:
            return EjercicioContable.objects.get(
                fecha_inicio__lte=fecha, 
                fecha_fin__gte=fecha,
                cerrado=False
            )
        except EjercicioContable.DoesNotExist:
            return None

    @classmethod
    def _obtener_cuenta(cls, nombre_o_codigo):
        """Busca una cuenta por nombre parcial O codigo, priorizando coincidencia exacta"""
        # Intentar buscar por CODIGO exacto primero
        por_codigo = PlanCuenta.objects.filter(codigo=nombre_o_codigo, imputable=True).first()
        if por_codigo: return por_codigo

        # Buscar por Nombre
        matches = PlanCuenta.objects.filter(nombre__icontains=nombre_o_codigo, imputable=True)
        exact = matches.filter(nombre__iexact=nombre_o_codigo).first()
        if exact: return exact
        return matches.first()

    @classmethod
    def registrar_alta_cheque(cls, cheque):
        """
        Genera asiento de ingreso de cheque de tercero (Cobro a Cliente).
        Debe: Valores a Depositar
        Haber: Deudores por Ventas
        """
        if cheque.tipo != 'TERCERO':
            return # Solo contabilizamos cheques de terceros al recibirlos
            
        if isinstance(cheque.fecha_emision, date) and not hasattr(cheque.fecha_emision, 'date'):
             fecha_target = cheque.fecha_emision
        else:
             fecha_target = cheque.fecha_emision.date()
             
        ejercicio = cls._obtener_ejercicio_vigente(fecha_target)
        if not ejercicio:
            print(f"No hay ejercicio vigente para la fecha {cheque.fecha_emision}")
            return

        cuenta_debe = cls._obtener_cuenta(cls.CUENTA_VALORES_A_DEPOSITAR)
        cuenta_haber = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)

        if not cuenta_debe or not cuenta_haber:
            print(f"Faltan cuentas configuradas: {cls.CUENTA_VALORES_A_DEPOSITAR} o {cls.CUENTA_DEUDORES_POR_VENTAS}")
            return

        descripcion = f"Ingreso Cheque {cheque.numero} - {cheque.banco} - {cheque.cliente}"

        # Verificar si ya existe un asiento para este cheque (para evitar duplicados simples)
        # Esto es una validación básica, se podría mejorar con un campo en Cheque 'asiento_ingreso'
        existing = Asiento.objects.filter(descripcion=descripcion, ejercicio=ejercicio).exists()
        if existing:
            return

        with transaction.atomic():
            # Buscar último número de asiento
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=cheque.fecha_emision,
                descripcion=descripcion,
                ejercicio=ejercicio,
                origen='COBROS',
                usuario='Sistema' # Idealmente el usuario logueado
            )

            # Item Debe
            ItemAsiento.objects.create(
                asiento=asiento,
                cuenta=cuenta_debe,
                debe=cheque.monto,
                haber=0
            )

            # Item Haber
            ItemAsiento.objects.create(
                asiento=asiento,
                cuenta=cuenta_haber,
                debe=0,
                haber=cheque.monto
            )
            
    @classmethod
    def registrar_cambio_estado(cls, cheque, estado_anterior, cuenta_destino=None):
        """
        Maneja los cambios de estado del cheque.
        Parametro cuenta_destino opcional para Deposito.
        """
        nuevo_estado = cheque.estado
        print(f"DEBUG: Cambio estado cheque {cheque.id} de {estado_anterior} a {nuevo_estado}")
        
        if estado_anterior == 'CARTERA' and nuevo_estado == 'DEPOSITADO':
            cls._registrar_deposito(cheque, cuenta_destino)
        elif estado_anterior == 'DEPOSITADO' and nuevo_estado == 'RECHAZADO':
            cls._registrar_rechazo(cheque)
        elif estado_anterior == 'DEPOSITADO' and nuevo_estado == 'COBRADO':
            # Generalmente "Depositado" ya implica que está en el banco. "Cobrado" podría no requerir asiento extra
            # o confirmar la acreditación. Por ahora no hacemos nada.
            pass

    @classmethod
    def _obtener_cuenta_banco(cls, cuenta_bancaria):
        """Intenta obtener la cuenta contable específica para un banco"""
        if not cuenta_bancaria:
            return cls._obtener_cuenta(cls.CUENTA_BANCO)
            
        # 1. Buscar por nombre exacto del banco (ej: "Banco Galicia")
        cuenta = cls._obtener_cuenta(cuenta_bancaria.banco)
        if cuenta: return cuenta
        
        # 2. Buscar por Alias
        if cuenta_bancaria.alias:
            cuenta = cls._obtener_cuenta(cuenta_bancaria.alias)
            if cuenta: return cuenta
            
        # 3. Fallback genérico
        return cls._obtener_cuenta(cls.CUENTA_BANCO)

    @classmethod
    def _registrar_deposito(cls, cheque, cuenta_destino=None):
        """
        Depósito de cheque en banco.
        Debe: Banco X (Activo)
        Haber: Valores a Depositar (Activo que baja)
        """
        fecha_asiento = date.today()
        ejercicio = cls._obtener_ejercicio_vigente(fecha_asiento)
        
        if not ejercicio: 
            print(f"DEBUG: No se encontro ejercicio vigente para {fecha_asiento}")
            return

        # Obtener cuenta banco destino
        cuenta_banco = cls._obtener_cuenta_banco(cuenta_destino)
        cuenta_valores = cls._obtener_cuenta(cls.CUENTA_VALORES_A_DEPOSITAR)

        print(f"DEBUG: Cuentas para deposito: Banco={cuenta_banco}, Valores={cuenta_valores}")

        if not cuenta_banco or not cuenta_valores:
            print("DEBUG: Faltan cuentas para deposito")
            return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1
            
            desc_banco = cuenta_destino.banco if cuenta_destino else "Banco"
            
            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha_asiento,
                descripcion=f"Depósito Cheque {cheque.numero} en {desc_banco}",
                ejercicio=ejercicio,
                origen='COBROS', 
                usuario='Sistema'
            )

            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_banco, debe=cheque.monto, haber=0)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_valores, debe=0, haber=cheque.monto)
            print(f"DEBUG: Asiento {nuevo_numero} creado para deposito cheque {cheque.numero}")

    @classmethod
    def registrar_movimiento_banco(cls, movimiento):
        """
        Genera asiento para movimientos manuales de banco (Credito/Debito).
        """
        fecha_asiento = movimiento.fecha
        ejercicio = cls._obtener_ejercicio_vigente(fecha_asiento)
        
        if not ejercicio: return

        # Obtener cuenta banco
        cuenta_banco = cls._obtener_cuenta_banco(movimiento.cuenta)
        # Cuenta contrapartida (gastos varios por defecto, o ingreso varios)
        # En una implementacion real, el usuario debiera poder elegir la cuenta contable
        # Aquí simplificamos usando una cuenta genérica
        cuenta_contrapartida = None
        
        if movimiento.tipo == 'DEBITO': # Egreso/Gasto
            cuenta_contrapartida = cls._obtener_cuenta("Gastos Varios") 
            if not cuenta_contrapartida: cuenta_contrapartida = cls._obtener_cuenta("Gastos Generales")
        else: # CREDITO / Ingreso
            cuenta_contrapartida = cls._obtener_cuenta("Ingresos Varios")
            if not cuenta_contrapartida: cuenta_contrapartida = cls._obtener_cuenta("Otros Ingresos")

        if not cuenta_banco or not cuenta_contrapartida:
             print(f"Faltan cuentas par movimiento banco: {movimiento.tipo}")
             return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1
            
            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha_asiento,
                descripcion=f"Movimiento Banco {movimiento.tipo}: {movimiento.descripcion}",
                ejercicio=ejercicio,
                origen='PAGOS' if movimiento.tipo == 'DEBITO' else 'COBROS',
                usuario='Sistema'
            )

            monto = abs(movimiento.monto)

            if movimiento.tipo == 'DEBITO':
                # Egreso: Haber Banco, Debe Gasto
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_contrapartida, debe=monto, haber=0)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_banco, debe=0, haber=monto)
            else:
                # Ingreso: Debe Banco, Haber Ingreso
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_banco, debe=monto, haber=0)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_contrapartida, debe=0, haber=monto)
                
            print(f"DEBUG: Asiento {nuevo_numero} creado para movimiento banco manual")

    @classmethod
    def _registrar_rechazo(cls, cheque):
        """
        Rechazo de cheque. Vuelve la deuda al cliente y sale del banco (gastos aparte).
        Debe: Deudores por Ventas (o Cheques Rechazados)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=cheque.monto, haber=0)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_banco, debe=0, haber=cheque.monto)

    @classmethod
    def registrar_pago_compra_contado(cls, compra):
        """
        Registra el pago de una compra al contado (Efectivo).
        Debe: Proveedores (Cancelación de deuda)
        Haber: Caja (Salida de dinero)
        """
        fecha = getattr(compra, 'fecha', date.today())
        if hasattr(fecha, 'date'): fecha = fecha.date()

        ejercicio = cls._obtener_ejercicio_vigente(fecha)
        if not ejercicio: return

        cuenta_proveedores = cls._obtener_cuenta(cls.CUENTA_PROVEEDORES)
        cuenta_caja = cls._obtener_cuenta(cls.CUENTA_CAJA) or cls._obtener_cuenta("Caja en Pesos")

        if not all([cuenta_proveedores, cuenta_caja]):
            print(f"Faltan cuentas para pago contado compra: Prov={cuenta_proveedores}, Caja={cuenta_caja}")
            return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha,
                descripcion=f"Pago Compra #{compra.id} (Efectivo)",
                ejercicio=ejercicio,
                origen='PAGOS',
                usuario='Sistema'
            )

            # Debe: Proveedores (Baja el pasivo)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_proveedores, debe=compra.total, haber=0)
            
            # Haber: Caja (Sale dinero)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=0, haber=compra.total)
            
            print(f"DEBUG: Asiento Pago Contado {nuevo_numero} generado para Compra {compra.id}.")

    @classmethod
    def registrar_pago_compra_cheque_propio(cls, compra, cheque):
        """
        Genera asiento de pago con cheque propio.
        Debe: Proveedores
        Haber: Banco (si al dia) o Cheques Diferidos a Pagar
        """
        fecha = getattr(compra, 'fecha', date.today())
        if hasattr(fecha, 'date'): fecha = fecha.date()

        ejercicio = cls._obtener_ejercicio_vigente(fecha)
        if not ejercicio: return

        cuenta_proveedores = cls._obtener_cuenta(cls.CUENTA_PROVEEDORES)
        
        # Determinar cuenta haber
        if cheque.fecha_pago > cheque.fecha_emision:
            # Diferido
            cuenta_haber = cls._obtener_cuenta("Cheques Diferidos a Pagar")
            if not cuenta_haber: cuenta_haber = cls._obtener_cuenta("Documentos a Pagar")
        else:
            # Al día -> Banco
            # Intentar buscar cuenta banco especifica si el cheque tiene banco
            cuenta_haber = cls._obtener_cuenta(cheque.banco)
            if not cuenta_haber: cuenta_haber = cls._obtener_cuenta(cls.CUENTA_BANCO)

        if not all([cuenta_proveedores, cuenta_haber]):
            print(f"Faltan cuentas para pago cheque propio (Banco: {cheque.banco})")
            return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha,
                descripcion=f"Pago Compra #{compra.id} (Ch/{cheque.numero})",
                ejercicio=ejercicio,
                origen='PAGOS',
                usuario='Sistema'
            )

            # Debe: Proveedores
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_proveedores, debe=compra.total, haber=0)
            
            # Haber: Banco
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_haber, debe=0, haber=compra.total)

            print(f"DEBUG: Asiento Pago Cheque {nuevo_numero} generado para Compra {compra.id}.")

    @classmethod
    def registrar_venta(cls, venta):
        """
        Genera asiento de venta con IVA y Costo (CMV).
        1. Venta:
           Debe: Deudores por Ventas (Total)
           Haber: Ventas (Neto)
           Haber: IVA Débito Fiscal
        2. Costo (CMV):
           Debe: Costo de Ventas
           Haber: Mercaderías
        """
        ejercicio = cls._obtener_ejercicio_vigente(venta.fecha.date())
        if not ejercicio:
            print(f"No hay ejercicio vigente para venta {venta.id}")
            return

        # Cuentas Venta
        cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)
        cuenta_ventas = cls._obtener_cuenta(cls.CUENTA_VENTAS)
        cuenta_iva_debito = cls._obtener_cuenta(cls.CUENTA_IVA_DEBITO)
        
        # Cuentas Costo
        cuenta_cmv = cls._obtener_cuenta(cls.CUENTA_COSTO_MERCADERIAS)
        cuenta_mercaderias = cls._obtener_cuenta(cls.CUENTA_COMPRAS)

        # DEBUG DETALLADO
        if not cuenta_deudores: print(f"MISSING: {cls.CUENTA_DEUDORES_POR_VENTAS}")
        if not cuenta_ventas: print(f"MISSING: {cls.CUENTA_VENTAS}")
        if not cuenta_iva_debito: print(f"MISSING: {cls.CUENTA_IVA_DEBITO}")
        if not cuenta_cmv: print(f"MISSING: {cls.CUENTA_COSTO_MERCADERIAS}")
        if not cuenta_mercaderias: print(f"MISSING: {cls.CUENTA_COMPRAS}")

        if not all([cuenta_deudores, cuenta_ventas, cuenta_iva_debito, cuenta_cmv, cuenta_mercaderias]):
            print("Faltan cuentas configuradas para Venta/IVA/Costo")
            return

        # Cálculos Venta (Asumimos Total es Bruto, IVA 21%)
        total = venta.total
        neto = total / Decimal("1.21")
        iva = total - neto

        # Cálculos Costo
        total_costo = Decimal("0.00")
        for detalle in venta.detalles.all():
            costo_unitario = detalle.producto.costo
            total_costo += (detalle.cantidad * costo_unitario)

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=venta.fecha,
                descripcion=f"Venta {venta.tipo_comprobante} {venta.numero_factura_formateado()} - {venta.cliente.nombre}",
                ejercicio=ejercicio,
                origen='VENTAS',
                usuario='Sistema'
            )

            # 1. Asiento de Venta
            # D: Deudores (Total)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=total, haber=0)
            # H: Ventas (Neto)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_ventas, debe=0, haber=neto)
            # H: IVA Débito
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_iva_debito, debe=0, haber=iva)

            # 2. Asiento de Costo (en el mismo asiento contable o separado? Generalmente juntos es mas limpio)
            if total_costo > 0:
                # D: CMV
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_cmv, debe=total_costo, haber=0)
                # H: Mercaderías (Activo)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_mercaderias, debe=0, haber=total_costo)
            
            print(f"DEBUG: Asiento Venta {nuevo_numero} creado (Neto: {neto}, IVA: {iva}, Costo: {total_costo})")

    @classmethod
    def registrar_compra(cls, compra):
        """
        Genera asiento de compra.
        Debe: Mercaderías (Neto)
        Debe: IVA Crédito Fiscal
        Haber: Proveedores (Total)
        """
        # Asumimos que 'compra' tiene fecha, total, y proveedor
        fecha = getattr(compra, 'fecha', date.today())
        if hasattr(fecha, 'date'): fecha = fecha.date() # Si es datetime
        
        ejercicio = cls._obtener_ejercicio_vigente(fecha)
        if not ejercicio:
            print(f"No hay ejercicio vigente para compra {compra.id}")
            return

        cuenta_mercaderias = cls._obtener_cuenta(cls.CUENTA_COMPRAS)
        cuenta_iva_credito = cls._obtener_cuenta(cls.CUENTA_IVA_CREDITO)
        cuenta_proveedores = cls._obtener_cuenta(cls.CUENTA_PROVEEDORES)

        if not all([cuenta_mercaderias, cuenta_iva_credito, cuenta_proveedores]):
            print("Faltan cuentas para compra/IVA")
            return

        # Cálculos (Asumimos Total Bruto, IVA 21%)
        total = compra.total
        neto = total / Decimal("1.21")
        iva = total - neto

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            # Intentar obtener info del proveedor
            prov_nombre = compra.proveedor.nombre if compra.proveedor else "Proveedor desconoc."

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha,
                descripcion=f"Compra - {prov_nombre}",
                ejercicio=ejercicio,
                origen='COMPRAS',
                usuario='Sistema'
            )

            # Item Debe (Mercaderías - Neto)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_mercaderias, debe=neto, haber=0)

            # Item Debe (IVA Crédito)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_iva_credito, debe=iva, haber=0)
            
            # Item Haber (Proveedores - Total)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_proveedores, debe=0, haber=total)
            
            print(f"DEBUG: Asiento Compra {nuevo_numero} creado (Neto: {neto}, IVA: {iva})")

    @classmethod
    def registrar_cobro_venta_contado(cls, venta):
        """
        Genera asiento de cobro inmediato (Caja vs Deudores) para venta contado.
        Debe: Caja
        Haber: Deudores por Ventas
        """
        ejercicio = cls._obtener_ejercicio_vigente(venta.fecha.date())
        if not ejercicio: return

        cuenta_caja = cls._obtener_cuenta("Caja en Pesos")
        cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)

        if not cuenta_caja or not cuenta_deudores:
            print("Faltan cuentas para cobro (Caja o Deudores)")
            return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=venta.fecha,
                descripcion=f"Cobro Venta #{venta.id} - {venta.cliente.nombre}",
                ejercicio=ejercicio,
                origen='COBROS',
                usuario='Sistema'
            )

            # Debe Caja
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=venta.total, haber=0)
            # Haber Deudores
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=0, haber=venta.total)

            print(f"DEBUG: Asiento Cobro {nuevo_numero} creado para Venta {venta.id}")

    @classmethod
    def registrar_cobro_venta_tarjeta(cls, venta, comision_porcentaje=Decimal("0.03")):
        """
        Genera asiento de cobro con tarjeta.
        La tarjeta genera un crédito a cobrar de la procesadora, menos comisión.
        
        Contablemente:
        - Debe: Tarjetas a Cobrar (monto neto que recibiremos)
        - Debe: Comisiones Tarjeta (gasto por la comisión, si aplica)
        - Haber: Deudores por Ventas (cancelamos la deuda del cliente)
        
        NOTA: Si no existe cuenta de comisiones, se registra el total sin desglose.
        """
        ejercicio = cls._obtener_ejercicio_vigente(venta.fecha.date())
        if not ejercicio: return

        cuenta_tarjetas = cls._obtener_cuenta(cls.CUENTA_TARJETAS_A_COBRAR)
        cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)
        cuenta_comisiones = cls._obtener_cuenta(cls.CUENTA_COMISIONES_TARJETA)

        # Si no existe cuenta Tarjetas, usamos Caja como fallback
        if not cuenta_tarjetas:
            cuenta_tarjetas = cls._obtener_cuenta(cls.CUENTA_CAJA)
            
        if not cuenta_tarjetas or not cuenta_deudores:
            print("Faltan cuentas para cobro tarjeta (Tarjetas/Caja o Deudores)")
            return

        # Calcular montos
        total = venta.total
        comision = total * comision_porcentaje if cuenta_comisiones else Decimal("0")
        neto_tarjeta = total - comision

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=venta.fecha,
                descripcion=f"Cobro Tarjeta Venta #{venta.id} - {venta.cliente.nombre}",
                ejercicio=ejercicio,
                origen='COBROS',
                usuario='Sistema'
            )

            # Debe Tarjetas a Cobrar (neto)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_tarjetas, debe=neto_tarjeta, haber=0)
            
            # Debe Comisiones (si existe la cuenta y hay comisión)
            if cuenta_comisiones and comision > 0:
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_comisiones, debe=comision, haber=0)
            
            # Haber Deudores (total)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=0, haber=total)

            print(f"DEBUG: Asiento Cobro Tarjeta {nuevo_numero} creado para Venta {venta.id} (Neto: {neto_tarjeta}, Comisión: {comision})")

    @classmethod
    def registrar_cobro_venta_cheque(cls, venta, cheque):
        """
        Genera asiento de cobro con cheque de tercero.
        Cuando un cliente paga con cheque, el cheque entra a cartera.
        
        Contablemente:
        - Debe: Valores a Depositar (cheque en cartera)
        - Haber: Deudores por Ventas (cancelamos la deuda del cliente)
        
        NOTA: El cheque debe ser creado previamente como objeto Cheque.
        """
        ejercicio = cls._obtener_ejercicio_vigente(venta.fecha.date())
        if not ejercicio: return

        cuenta_valores = cls._obtener_cuenta(cls.CUENTA_VALORES_A_DEPOSITAR)
        cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)

        if not cuenta_valores or not cuenta_deudores:
            print("Faltan cuentas para cobro cheque (Valores o Deudores)")
            return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=venta.fecha,
                descripcion=f"Cobro Cheque #{cheque.numero} Venta #{venta.id} - {venta.cliente.nombre}",
                ejercicio=ejercicio,
                origen='COBROS',
                usuario='Sistema'
            )

            # Debe Valores a Depositar
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_valores, debe=cheque.monto, haber=0)
            # Haber Deudores
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=0, haber=cheque.monto)

            print(f"DEBUG: Asiento Cobro Cheque {nuevo_numero} creado para Venta {venta.id}, Cheque {cheque.numero}")


    @classmethod
    def registrar_recibo(cls, recibo):
        """
        Genera un asiento contable único para un recibo de cobro o pago, 
        consolidando todas sus formas de pago.
        """
        fecha = recibo.fecha
        ejercicio = cls._obtener_ejercicio_vigente(fecha)
        if not ejercicio: return

        # Determinar cuenta de la entidad (Cliente o Proveedor)
        if recibo.tipo == 'CLIENTE':
            cuenta_entidad = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)
            origen = 'COBROS'
            descripcion_prefix = f"Cobro Recibo #{recibo.numero:08d} - {recibo.cliente.nombre}"
        else:
            cuenta_entidad = cls._obtener_cuenta(cls.CUENTA_PROVEEDORES)
            origen = 'PAGOS'
            descripcion_prefix = f"Pago Recibo #{recibo.numero:08d} - {recibo.proveedor.nombre}"

        if not cuenta_entidad:
            print(f"Error: No se encontró la cuenta contable para {recibo.tipo}")
            return

        items = recibo.items.all()
        if not items: return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=datetime.combine(fecha, datetime.min.time()),
                descripcion=f"{descripcion_prefix} {recibo.observaciones[:50]}",
                ejercicio=ejercicio,
                origen=origen,
                usuario='Sistema'
            )

            # 1. Registrar Items (Contrapartidas)
            for item in items:
                cuenta_item = None
                if item.forma_pago == 'EFECTIVO':
                    cuenta_item = cls._obtener_cuenta(cls.CUENTA_CAJA) or cls._obtener_cuenta("Caja en Pesos")
                elif item.forma_pago == 'CHEQUE':
                    if recibo.tipo == 'CLIENTE':
                        cuenta_item = cls._obtener_cuenta(cls.CUENTA_VALORES_A_DEPOSITAR)
                    else:
                        # Pago a proveedor con cheque propio o de tercero (endosado)
                        # Por simplicidad, si es pago usamos la cuenta del banco o valores
                        cuenta_item = cls._obtener_cuenta(item.banco) or cls._obtener_cuenta(cls.CUENTA_BANCO)
                elif item.forma_pago == 'TRANSFERENCIA':
                    cuenta_item = cls._obtener_cuenta(item.banco) or cls._obtener_cuenta(cls.CUENTA_BANCO)
                elif item.forma_pago == 'RETENCION':
                    if recibo.tipo == 'CLIENTE':
                        cuenta_item = cls._obtener_cuenta(cls.CUENTA_RETENCIONES_SUFRIDAS)
                    else:
                        cuenta_item = cls._obtener_cuenta(cls.CUENTA_RETENCIONES_A_DEPOSITAR)
                
                if not cuenta_item: 
                    cuenta_item = cls._obtener_cuenta("Cuentas de Orden") # Fallback

                # Asignar Debe/Haber según tipo de recibo
                if recibo.tipo == 'CLIENTE':
                    # Cobro: Entra Activo (Debe), Baja Deuda Cliente (Haber)
                    ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_item, debe=item.monto, haber=0, descripcion=f"{item.forma_pago} {item.referencia}")
                else:
                    # Pago: Sale Activo (Haber), Baja Deuda Proveedor (Debe)
                    ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_item, debe=0, haber=item.monto, descripcion=f"{item.forma_pago} {item.referencia}")

            # 2. Registrar Cuenta de Entidad (Deudores/Proveedores)
            if recibo.tipo == 'CLIENTE':
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_entidad, debe=0, haber=recibo.total)
            else:
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_entidad, debe=recibo.total, haber=0)

            print(f"DEBUG: Asiento consolidado {nuevo_numero} generado para Recibo {recibo.numero}")

    @classmethod
    def registrar_nota_credito(cls, nc):
        """
        Genera asiento de Nota de Crédito (Anulación de venta).
        Debe: Ventas (Neto), IVA Débito (reversión)
        Haber: Deudores por Ventas (Total)
        """
        fecha = nc.fecha.date() if hasattr(nc.fecha, 'date') else nc.fecha
        ejercicio = cls._obtener_ejercicio_vigente(fecha)
        if not ejercicio: return

        cuenta_ventas = cls._obtener_cuenta(cls.CUENTA_VENTAS)
        cuenta_iva = cls._obtener_cuenta(cls.CUENTA_IVA_DEBITO)
        cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)

        if not all([cuenta_ventas, cuenta_iva, cuenta_deudores]):
            print("Faltan cuentas para Nota de Crédito")
            return

        total = nc.total
        neto = total / Decimal("1.21")
        iva = total - neto

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=nc.fecha,
                descripcion=f"NC {nc.numero_formateado()} - {nc.cliente.nombre}",
                ejercicio=ejercicio,
                origen='VENTAS',
                usuario='Sistema'
            )

            # Debe: Ventas (Baja ingreso)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_ventas, debe=neto, haber=0)
            # Debe: IVA Débito (Baja deuda fiscal)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_iva, debe=iva, haber=0)
            # Haber: Deudores por Ventas (Baja crédito)
            ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=0, haber=total)

            print(f"DEBUG: Asiento NC {nuevo_numero} generado para {nc.id}")
        """
        Genera asiento para retención impositiva.
        
        CASO 1: Pago a Proveedor (Somos Agentes de Retención)
        - Disminuye deuda con Proveedor (Debe) -> Ya lo hace el recibo globalmente, 
          pero contablemente debemos reflejar que NO sale caja sino que nace un pasivo fiscal.
          El recibo global hara: Proveedores (D) vs [Caja, Cheque, Retencion...] (H)
          Aqui solo necesitamos asegurar que la contrapartida sea la cuenta de Retencion (Pasivo).
          
          Espera... el flujo actual de recibos NO genera un asiento único multipropósito.
          Parece que genera asientos por partes (cheque, caja).
          Entonces, necesitamos generar aqui:
          Debe: Proveedores (Cancelacion de deuda por el monto retenido)
          Haber: Retenciones a Depositar (Pasivo Fiscal)

        CASO 2: Cobro a Cliente (Cliente nos retiene)
        - Disminuye deuda del Cliente (Haber) -> Ya lo hace el recibo global.
        - Entra un "papelito" que vale dinero fiscal (Activo).
          Debe: Retenciones Sufridas (Activo)
          Haber: Deudores por Ventas
        """
        ejercicio = cls._obtener_ejercicio_vigente(recibo.fecha)
        if not ejercicio: return

        if recibo.tipo == 'PROVEEDOR':
            # Pago a Proveedor: Retenemos -> Pasivo
            cuenta_proveedores = cls._obtener_cuenta(cls.CUENTA_PROVEEDORES)
            cuenta_retencion = cls._obtener_cuenta(cls.CUENTA_RETENCIONES_A_DEPOSITAR) 
            # Ojo: Podriamos buscar cuentas mas especificas segun el tipo (IIBB, Ganancias)
            
            # Intento de cuenta especifica
            if item_retencion.retencion_tipo:
                cuenta_especifica = cls._obtener_cuenta(f"Retenciones {item_retencion.retencion_tipo} a Depositar")
                if cuenta_especifica: cuenta_retencion = cuenta_especifica

            if not cuenta_proveedores or not cuenta_retencion:
                print(f"Faltan cuentas para retencion proveedor: {cls.CUENTA_PROVEEDORES} o {cls.CUENTA_RETENCIONES_A_DEPOSITAR}")
                return

            descripcion = f"Retención {item_retencion.retencion_tipo} #{item_retencion.retencion_numero} - Pago {recibo.proveedor.nombre}"
            
            with transaction.atomic():
                # Crear asiento
                ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
                nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

                asiento = Asiento.objects.create(
                    numero=nuevo_numero,
                    fecha=recibo.fecha,
                    descripcion=descripcion,
                    ejercicio=ejercicio,
                    origen='PAGOS',
                    usuario='Sistema'
                )

                # Debe: Proveedores (Bajamos deuda)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_proveedores, debe=item_retencion.monto, haber=0)
                # Haber: Retenciones a Depositar (Aumentamos Pasivo)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_retencion, debe=0, haber=item_retencion.monto)

        elif recibo.tipo == 'CLIENTE':
            # Cobro a Cliente: Nos retienen -> Activo
            cuenta_deudores = cls._obtener_cuenta(cls.CUENTA_DEUDORES_POR_VENTAS)
            cuenta_retencion = cls._obtener_cuenta(cls.CUENTA_RETENCIONES_SUFRIDAS)

             # Intento de cuenta especifica
            if item_retencion.retencion_tipo:
                cuenta_especifica = cls._obtener_cuenta(f"Retenciones {item_retencion.retencion_tipo} Sufridas")
                if cuenta_especifica: cuenta_retencion = cuenta_especifica
            
            if not cuenta_deudores or not cuenta_retencion:
                print("Faltan cuentas para retencion cliente")
                return

            descripcion = f"Retención {item_retencion.retencion_tipo} #{item_retencion.retencion_numero} - Cobro {recibo.cliente.nombre}"

            with transaction.atomic():
                ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
                nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1

                asiento = Asiento.objects.create(
                    numero=nuevo_numero,
                    fecha=recibo.fecha,
                    descripcion=descripcion,
                    ejercicio=ejercicio,
                    origen='COBROS',
                    usuario='Sistema'
                )

                # Debe: Retenciones Sufridas (Entra Activo)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_retencion, debe=item_retencion.monto, haber=0)
                # Haber: Deudores (Baja deuda cliente)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_deudores, debe=0, haber=item_retencion.monto)

    @classmethod
    def registrar_movimiento_caja(cls, movimiento):
        """
        Genera asiento para movimientos manuales de caja (Ingreso/Egreso).
        """
        fecha_asiento = movimiento.fecha
        ejercicio = cls._obtener_ejercicio_vigente(fecha_asiento)
        
        if not ejercicio: return

        cuenta_caja = cls._obtener_cuenta("Caja en Pesos")
        if not cuenta_caja:
            print("Falta cuenta Caja")
            return

        # Determinar contrapartida basada en descripcion o tipo
        cuenta_contrapartida = None
        descripcion_lower = movimiento.descripcion.lower()

        if movimiento.tipo == 'Ingreso':
            if 'apertura' in descripcion_lower:
                cuenta_contrapartida = cls._obtener_cuenta("Fondo Fijo") # O Capital / Aporte
                if not cuenta_contrapartida: cuenta_contrapartida = cls._obtener_cuenta("Caja Anterior") # Fallback
            else:
                cuenta_contrapartida = cls._obtener_cuenta("Ingresos Varios")
                if not cuenta_contrapartida: cuenta_contrapartida = cls._obtener_cuenta("Ventas")
        
        else: # Egreso
            if 'retiro' in descripcion_lower:
                cuenta_contrapartida = cls._obtener_cuenta("Retiros Socios")
            else:
                cuenta_contrapartida = cls._obtener_cuenta("Gastos Varios")
                if not cuenta_contrapartida: cuenta_contrapartida = cls._obtener_cuenta("Gastos Generales")

        # Fallback final si no encuentra contrapartida específica
        if not cuenta_contrapartida:
            cuenta_contrapartida = cls._obtener_cuenta("Cuentas de Orden") # Para no fallar, pero idealmente debe existir

        if not cuenta_contrapartida:
             print(f"Falta cuenta contrapartida para movimiento caja: {movimiento.tipo}")
             return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1
            
            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha_asiento,
                descripcion=f"Movimiento Caja {movimiento.tipo}: {movimiento.descripcion}",
                ejercicio=ejercicio,
                origen='COBROS' if movimiento.tipo == 'Ingreso' else 'PAGOS',
                usuario='Sistema'
            )

            # Debe: Caja (Ingreso) / Contrapartida (Egreso)
            # Haber: Contrapartida (Ingreso) / Caja (Egreso)
            
            if movimiento.tipo == 'Ingreso':
                # D: Caja, H: Ingreso
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=movimiento.monto, haber=0)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_contrapartida, debe=0, haber=movimiento.monto)
            else:
                # D: Gasto, H: Caja
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_contrapartida, debe=movimiento.monto, haber=0)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=0, haber=movimiento.monto)
            
            print(f"DEBUG: Asiento {nuevo_numero} creado para movimiento caja manual")

    @classmethod
    def registrar_arqueo_caja(cls, movimiento, diferencia):
        """
        Genera asiento para diferencia de arqueo (Faltante/Sobrante).
        """
        fecha_asiento = movimiento.fecha
        ejercicio = cls._obtener_ejercicio_vigente(fecha_asiento)
        
        if not ejercicio: return

        cuenta_caja = cls._obtener_cuenta("Caja en Pesos")
        if not cuenta_caja: return

        cuenta_contrapartida = None
        
        # Diferencia: (Monto Real - Monto Sistema)
        # Si Diferencia es NEGATIVA (-100) -> Faltante (Egreso) -> Debe Faltante, Haber Caja
        # Si Diferencia es POSITIVA (+100) -> Sobrante (Ingreso) -> Debe Caja, Haber Sobrante
        
        if diferencia < 0: # FALTANTE
            cuenta_contrapartida = cls._obtener_cuenta("Faltante de Caja")
            tipo_asiento = 'PAGOS' # Perdida
        else: # SOBRANTE
            cuenta_contrapartida = cls._obtener_cuenta("Sobrante de Caja")
            tipo_asiento = 'COBROS' # Ganancia

        if not cuenta_contrapartida:
            print(f"Falta cuenta ajuste caja ({'Faltante' if diferencia < 0 else 'Sobrante'})")
            return

        with transaction.atomic():
            ultimo_numero = Asiento.objects.filter(ejercicio=ejercicio).order_by('-numero').first()
            nuevo_numero = (ultimo_numero.numero + 1) if ultimo_numero else 1
            
            asiento = Asiento.objects.create(
                numero=nuevo_numero,
                fecha=fecha_asiento,
                descripcion=f"Ajuste Arqueo: {movimiento.descripcion}",
                ejercicio=ejercicio,
                origen=tipo_asiento,
                usuario='Sistema'
            )

            monto_abs = abs(diferencia)

            if diferencia < 0: # Faltante
                # D: Faltante, H: Caja
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_contrapartida, debe=monto_abs, haber=0)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=0, haber=monto_abs)
            else: # Sobrante
                # D: Caja, H: Sobrante
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=monto_abs, haber=0)
                ItemAsiento.objects.create(asiento=asiento, cuenta=cuenta_contrapartida, debe=0, haber=monto_abs)

            print(f"DEBUG: Asiento Arqueo {nuevo_numero} generado. Dif: {diferencia}")
 
         @ c l a s s m e t h o d  
         d e f   r e g i s t r a r _ n o t a _ d e b i t o ( c l s ,   n d ) :  
                 " " "  
                 G e n e r a   a s i e n t o   d e   N o t a   d e   D � � b i t o   ( C a r g o   e x t r a   a   c l i e n t e ) .  
                 D e b e :   D e u d o r e s   p o r   V e n t a s   ( T o t a l )   -   A u m e n t a   d e u d a  
                 H a b e r :   V e n t a s / I n g r e s o s   ( N e t o )  
                 H a b e r :   I V A   D � � b i t o   F i s c a l  
                 " " "  
                 f e c h a   =   n d . f e c h a . d a t e ( )   i f   h a s a t t r ( n d . f e c h a ,   ' d a t e ' )   e l s e   n d . f e c h a  
                 e j e r c i c i o   =   c l s . _ o b t e n e r _ e j e r c i c i o _ v i g e n t e ( f e c h a )  
                 i f   n o t   e j e r c i c i o :   r e t u r n  
  
                 c u e n t a _ d e u d o r e s   =   c l s . _ o b t e n e r _ c u e n t a ( c l s . C U E N T A _ D E U D O R E S _ P O R _ V E N T A S )  
                 c u e n t a _ v e n t a s   =   c l s . _ o b t e n e r _ c u e n t a ( c l s . C U E N T A _ V E N T A S )  
                 c u e n t a _ i v a   =   c l s . _ o b t e n e r _ c u e n t a ( c l s . C U E N T A _ I V A _ D E B I T O )  
  
                 i f   n o t   a l l ( [ c u e n t a _ d e u d o r e s ,   c u e n t a _ v e n t a s ,   c u e n t a _ i v a ] ) :  
                         p r i n t ( " F a l t a n   c u e n t a s   p a r a   N o t a   d e   D � � b i t o " )  
                         r e t u r n  
  
                 t o t a l   =   n d . t o t a l  
                 n e t o   =   t o t a l   /   D e c i m a l ( " 1 . 2 1 " )  
                 i v a   =   t o t a l   -   n e t o  
  
                 w i t h   t r a n s a c t i o n . a t o m i c ( ) :  
                         u l t i m o _ n u m e r o   =   A s i e n t o . o b j e c t s . f i l t e r ( e j e r c i c i o = e j e r c i c i o ) . o r d e r _ b y ( ' - n u m e r o ' ) . f i r s t ( )  
                         n u e v o _ n u m e r o   =   ( u l t i m o _ n u m e r o . n u m e r o   +   1 )   i f   u l t i m o _ n u m e r o   e l s e   1  
  
                         a s i e n t o   =   A s i e n t o . o b j e c t s . c r e a t e (  
                                 n u m e r o = n u e v o _ n u m e r o ,  
                                 f e c h a = n d . f e c h a ,  
                                 d e s c r i p c i o n = f " N D   { n d . n u m e r o _ f o r m a t e a d o ( ) }   -   { n d . c l i e n t e . n o m b r e } " ,  
                                 e j e r c i c i o = e j e r c i c i o ,  
                                 o r i g e n = ' V E N T A S ' ,  
                                 u s u a r i o = ' S i s t e m a '  
                         )  
  
                         #   D e b e :   D e u d o r e s   p o r   V e n t a s   ( A u m e n t a   c r � � d i t o   a   c o b r a r )  
                         I t e m A s i e n t o . o b j e c t s . c r e a t e ( a s i e n t o = a s i e n t o ,   c u e n t a = c u e n t a _ d e u d o r e s ,   d e b e = t o t a l ,   h a b e r = 0 )  
                          
                         #   H a b e r :   V e n t a s   ( I n g r e s o )  
                         I t e m A s i e n t o . o b j e c t s . c r e a t e ( a s i e n t o = a s i e n t o ,   c u e n t a = c u e n t a _ v e n t a s ,   d e b e = 0 ,   h a b e r = n e t o )  
                          
                         #   H a b e r :   I V A   D � � b i t o   ( D e u d a   f i s c a l )  
                         I t e m A s i e n t o . o b j e c t s . c r e a t e ( a s i e n t o = a s i e n t o ,   c u e n t a = c u e n t a _ i v a ,   d e b e = 0 ,   h a b e r = i v a )  
  
                         p r i n t ( f " D E B U G :   A s i e n t o   N D   { n u e v o _ n u m e r o }   g e n e r a d o   p a r a   { n d . i d } " )  
 