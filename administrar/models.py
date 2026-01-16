from django.db import models
from django.contrib.auth.models import User


# ð¹ Condiciones fiscales posibles
CONDICION_FISCAL = [
    ('RI', 'Responsable Inscripto'),
    ('MO', 'Monotributista'),
    ('EX', 'Exento'),
    ('CF', 'Consumidor Final'),
]

# ð¹ Provincia
class Provincia(models.Model):
    nombre = models.CharField(max_length=120)

class Localidad(models.Model):
    nombre = models.CharField(max_length=120, unique=True)
    codigo_postal = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} ({self.codigo_postal})"

    

# ð¹ Clientes
class Cliente(models.Model):
    TIPO_CLIENTE = [
        ("P", "Persona"),
        ("E", "Empresa"),
    ]

    CONDICION_FISCAL = [
        ("RI", "Responsable Inscripto"),
        ("MT", "Monotributo"),
        ("CF", "Consumidor Final"),
        ("EX", "Exento"),
        ("NC", "No Categorizado"),
    ]

    LISTA_PRECIO_CHOICES = [
        ("1", "Efectivo / Contado"),
        ("2", "Cuenta Corriente"),
        ("3", "Tarjeta"),
        ("4", "Mayorista"),
    ]

    CANAL_CHOICES = [
        ("MIN", "Minorista"),
        ("MAY", "Mayorista"),
        ("DIST", "Distribuidor"),
        ("ONL", "Online"),
    ]

    ORIGEN_CHOICES = [
        ("WEB", "Web"),
        ("WSP", "WhatsApp"),
        ("RED", "Redes Sociales"),
        ("REF", "Recomendado"),
        ("OTR", "Otro"),
    ]

    # ð¹ Datos bÃ¡sicos
    nombre = models.CharField(max_length=150)
    tipo_cliente = models.CharField(max_length=1, choices=TIPO_CLIENTE, default="P")
    cuit = models.CharField(max_length=20, blank=True)
    condicion_fiscal = models.CharField(max_length=2, choices=CONDICION_FISCAL, default="CF")
    domicilio = models.CharField(max_length=200, blank=True)
    provincia = models.ForeignKey("Provincia", on_delete=models.SET_NULL, null=True, blank=True)
    localidad = models.ForeignKey("Localidad", on_delete=models.SET_NULL, null=True, blank=True)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.CharField(max_length=100, blank=True)

    # ð¹ Datos comerciales
    lista_precio = models.CharField(max_length=1, choices=LISTA_PRECIO_CHOICES, default="1")
    tipo_factura_preferida = models.CharField(max_length=1, default="B")  # A/B/C
    descuento_predeterminado = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    vendedor_asignado = models.CharField(max_length=100, blank=True)

    # ð¹ Cuenta corriente
    tiene_ctacte = models.BooleanField(default=False)
    limite_credito = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    permitir_superar_limite = models.BooleanField(default=False)
    saldo_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fecha_ultima_compra = models.DateField(null=True, blank=True)
    total_compras_acumulado = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    # ð¹ CRM bÃ¡sico
    contacto_nombre = models.CharField(max_length=100, blank=True)
    contacto_telefono = models.CharField(max_length=30, blank=True)
    contacto_email = models.CharField(max_length=100, blank=True)
    rubro_cliente = models.CharField(max_length=100, blank=True)
    canal = models.CharField(max_length=4, choices=CANAL_CHOICES, blank=True)
    origen = models.CharField(max_length=4, choices=ORIGEN_CHOICES, blank=True)
    notas = models.TextField(blank=True)

    # ð¹ Estado
    activo = models.BooleanField(default=True)
    fecha_alta = models.DateTimeField(auto_now_add=True)
    fecha_baja = models.DateTimeField(null=True, blank=True)
    motivo_baja = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.cuit})" if self.cuit else self.nombre
    

# ð¹ Rubros
class Rubro(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# ð¹ Marcas
class Marca(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre



# ð¹ Modelo de Empresa
class Empresa(models.Model):
    nombre = models.CharField(max_length=100)
    cuit = models.CharField(max_length=20)
    direccion = models.CharField(max_length=150)
    iibb = models.CharField(max_length=50, blank=True, verbose_name="Ingresos Brutos")
    inicio_actividades = models.DateField(null=True, blank=True, verbose_name="Inicio de Actividades")
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    condicion_fiscal = models.CharField(max_length=2, choices=CONDICION_FISCAL)
    punto_venta = models.CharField(max_length=5, default="0001")
    
    # ConfiguraciÃ³n de FacturaciÃ³n
    tipo_facturacion = models.CharField(max_length=20, choices=[('AFIP', 'AFIP ElectrÃ³nica'), ('FISCAL', 'Impresora Fiscal'), ('MANUAL', 'Factura Manual')], default='AFIP')
    moneda_predeterminada = models.CharField(max_length=3, choices=[('ARS', 'Peso Argentino'), ('USD', 'DÃ³lar')], default='ARS')
    certificado_afip = models.FileField(upload_to='afip/', blank=True, null=True)
    clave_privada_afip = models.FileField(upload_to='afip/', blank=True, null=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)

    # UbicaciÃ³n
    localidad = models.CharField(max_length=100, blank=True)
    provincia = models.CharField(max_length=100, blank=True)

    # Identidad
    nombre_fantasia = models.CharField(max_length=100, blank=True, verbose_name="Nombre de Fantasía")

    # ConfiguraciÃ³n
    habilita_remitos = models.BooleanField(default=True, verbose_name="Habilitar Remitos")
    actualizar_precios_compra = models.BooleanField(default=False, verbose_name="Actualizar Precios en Compra")
    permitir_stock_negativo = models.BooleanField(default=False, verbose_name="Permitir Stock Negativo")
    alerta_stock_minimo = models.BooleanField(default=True, verbose_name="Alerta de Stock Mínimo")
    auto_foco_codigo_barras = models.BooleanField(default=False, verbose_name="Auto-Foco Código de Barras")
    margen_ganancia_defecto = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, verbose_name="Margen de Ganancia por Defecto (%)")
    metodo_ganancia = models.CharField(
        max_length=10, 
        choices=[('MARKUP', 'Markup (Sobre Costo)'), ('MARGIN', 'Margen Real (Sobre Venta)')], 
        default='MARKUP',
        verbose_name="Método de Cálculo de Ganancia"
    )
    discriminar_iva_compras = models.BooleanField(default=False, verbose_name="Discriminar IVA en Compras")
    discriminar_iva_ventas = models.BooleanField(default=False, verbose_name="Discriminar IVA en Ventas")
    redondeo_precios = models.IntegerField(
        choices=[(1, 'Sin Redondeo'), (10, 'Múltiplos de 10'), (50, 'Múltiplos de 50'), (100, 'Múltiplos de 100')],
        default=1,
        verbose_name="Redondeo de Precios"
    )

    # ConfiguraciÃ³n de Correo
    smtp_server = models.CharField(max_length=100, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_security = models.CharField(max_length=10, choices=[('STARTTLS', 'STARTTLS'), ('SSL', 'SSL')], default='STARTTLS')
    smtp_user = models.CharField(max_length=100, blank=True)
    smtp_password = models.CharField(max_length=100, blank=True)

    # Configuracion de Impresion
    papel_impresion = models.CharField(max_length=20, choices=[('A4', 'A4'), ('T80', 'Ticket 80mm'), ('T58', 'Ticket 58mm')], default='A4')
    pie_factura = models.CharField(max_length=200, blank=True)
    
    # Configuracion UI
    items_por_pagina = models.IntegerField(default=10, verbose_name="Items por Página")

    def __str__(self):
        return self.nombre


# ð¹ Proveedores
class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    cuit = models.CharField(max_length=20, blank=True)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.CharField(max_length=100, blank=True)
    direccion = models.CharField(max_length=200, blank=True)

    provincia = models.ForeignKey(Provincia, on_delete=models.SET_NULL, null=True, blank=True)
    localidad = models.ForeignKey(Localidad, on_delete=models.SET_NULL, null=True, blank=True)

    condicion_fiscal = models.CharField(max_length=2, choices=CONDICION_FISCAL, default='CF')
    cbu = models.CharField(max_length=22, blank=True, verbose_name="CBU")
    alias = models.CharField(max_length=100, blank=True, verbose_name="Alias CBU")

    saldo_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    notas = models.TextField(blank=True)

    def __str__(self):
        return self.nombre


# ð¹ Modelo de Producto
class Producto(models.Model):

    TIPO_BULTO = [
        ("UN", "Unidad"),
        ("CJ", "Caja"),
        ("PA", "Paquete"),
        ("LT", "Litros"),
        ("KG", "Kilogramos"),
        ("MT", "Metros"),
    ]

    codigo = models.CharField(max_length=20, unique=True)
    descripcion = models.CharField(max_length=150)
    descripcion_larga = models.TextField(blank=True)

    marca = models.ForeignKey('Marca', on_delete=models.SET_NULL, null=True, blank=True)
    rubro = models.ForeignKey('Rubro', on_delete=models.SET_NULL, null=True, blank=True)
    proveedor = models.ForeignKey('Proveedor', on_delete=models.SET_NULL, null=True, blank=True)

    # â¤ NUEVOS CAMPOS
    tipo_bulto = models.CharField(max_length=5, default="UN")
    iva_alicuota = models.DecimalField(max_digits=5, decimal_places=2, default=21.0, verbose_name="Alícuota IVA (%)")
    stock_inicial = models.IntegerField(default=0)

    stock = models.IntegerField(default=0)            # Stock actual
    stock_minimo = models.IntegerField(default=0)
    stock_maximo = models.IntegerField(default=0)

    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    precio_efectivo = models.DecimalField(max_digits=10, decimal_places=2)
    precio_tarjeta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_ctacte = models.DecimalField(max_digits=10, decimal_places=2)
    precio_lista4 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.descripcion} ({self.codigo})"


# ð¹ Modelo de Venta
class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_comprobante = models.CharField(max_length=2, choices=[('A','Factura A'), ('B','Factura B'), ('C','Factura C')])
    neto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    iva_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    cae = models.CharField(max_length=20, blank=True, null=True)
    estado = models.CharField(max_length=20, default="Emitida")
    
    MEDIO_PAGO_CHOICES = [
        ('EFECTIVO', 'Efectivo'),
        ('TARJETA', 'Tarjeta'),
        ('CHEQUE', 'Cheque'),
        ('CTACTE', 'Cuenta Corriente'),
        ('OTRO', 'Otro'),
    ]
    medio_pago = models.CharField(max_length=10, choices=MEDIO_PAGO_CHOICES, default='EFECTIVO')
    
    # Referencia al pedido que originó esta venta (si aplica)
    pedido_origen = models.ForeignKey('Pedido', on_delete=models.SET_NULL, null=True, blank=True, related_name='ventas_generadas')

    def numero_factura_formateado(self):
        """Retorna el nÃºmero de factura con formato: {punto_venta}-{id:08d}"""
        empresa = Empresa.objects.first()
        punto_venta = empresa.punto_venta if empresa else "0001"
        return f"{punto_venta}-{self.id:08d}"

    def __str__(self):
        return f"Venta {self.id} - {self.cliente.nombre}"


# ð¹ Detalle de Venta
class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    neto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    iva_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.producto.descripcion} x {self.cantidad}"


# 🔹 Caja / Movimiento
class CajaDiaria(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.PROTECT)
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    monto_apertura = models.DecimalField(max_digits=12, decimal_places=2)
    monto_cierre_sistema = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monto_cierre_real = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=10, choices=[('ABIERTA', 'Abierta'), ('CERRADA', 'Cerrada')], default='ABIERTA')
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"Caja {self.id} - {self.fecha_apertura.date()} ({self.estado})"


class MovimientoCaja(models.Model):
    caja_diaria = models.ForeignKey(CajaDiaria, on_delete=models.CASCADE, related_name='movimientos', null=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=[('Ingreso','Ingreso'),('Egreso','Egreso')])
    descripcion = models.CharField(max_length=150)
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.tipo} - {self.descripcion} (${self.monto})"


# =========================================
# ð¹ MOVIMIENTO DE STOCK
# =========================================
class MovimientoStock(models.Model):
    TIPO_MOVIMIENTO = [
        ("IN", "Entrada"),
        ("OUT", "Salida"),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=3, choices=TIPO_MOVIMIENTO)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    referencia = models.CharField(max_length=50, blank=True)  # Ej: "Compra 15", "Venta 8"
    observaciones = models.TextField(blank=True)

    def __str__(self):
        signo = "+" if self.tipo == "IN" else "-"
        return f"{self.producto.descripcion} {signo}{self.cantidad} ({self.referencia})"


# =========================================
# ð¹ ORDEN DE COMPRA (OC)
# =========================================
class OrdenCompra(models.Model):
    ESTADO_OC = [
        ("BORRADOR", "Borrador"),
        ("PENDIENTE", "Pendiente"),
        ("APROBADA", "Aprobada"),
        ("CANCELADA", "Cancelada"),
        ("RECIBIDA", "Recibida"),
    ]

    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    nro_orden = models.CharField(max_length=30, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADO_OC, default="PENDIENTE")
    observaciones = models.TextField(blank=True)
    neto_estimado = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    iva_estimado = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_estimado = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"OC {self.id} - {self.proveedor.nombre}"


class DetalleOrdenCompra(models.Model):
    orden = models.ForeignKey(OrdenCompra, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"OC {self.orden.id} - {self.producto.descripcion} x {self.cantidad}"


# =========================================
# ð¹ COMPRA / RECEPCIÃN DE MERCADERÃA
# =========================================
class Compra(models.Model):
    ESTADO_COMPRA = [
        ("PENDIENTE", "Pendiente"),
        ("REGISTRADA", "Registrada"),
        ("ANULADA", "Anulada"),
    ]

    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    orden_compra = models.ForeignKey(OrdenCompra, on_delete=models.SET_NULL, null=True, blank=True)
    nro_comprobante = models.CharField(max_length=50, blank=True)
    tipo_comprobante = models.CharField(max_length=2, blank=True)  # FA/FB/FC, etc.
    neto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    iva = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=10, choices=ESTADO_COMPRA, default="REGISTRADA")
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"Compra {self.id} - {self.proveedor.nombre}"


class DetalleCompra(models.Model):
    compra = models.ForeignKey(Compra, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Compra {self.compra.id} - {self.producto.descripcion} x {self.cantidad}"


# =========================================
# ð¹ PEDIDOS
# =========================================
class Pedido(models.Model):
    ESTADO_PEDIDO = [
        ("PENDIENTE", "Pendiente"),
        ("PREPARACION", "En preparaciÃ³n"),
        ("LISTO", "Listo para entregar"),
        ("FACTURADO", "Facturado"),
        ("ANULADO", "Anulado"),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15, choices=ESTADO_PEDIDO, default="PENDIENTE")

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True)

    # vÃ­nculo cuando el pedido ya fue facturado
    venta = models.ForeignKey("Venta", on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.cliente.nombre}"


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Pedido {self.pedido.id} - {self.producto.descripcion} x {self.cantidad}"


# =========================================
# 🔹 PRESUPUESTOS
# =========================================
class Presupuesto(models.Model):
    ESTADO_PRESUPUESTO = [
        ("PENDIENTE", "Pendiente"),
        ("APROBADO", "Aprobado (Vendido)"),
        ("VENCIDO", "Vencido"),
        ("CANCELADO", "Cancelado"),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    validez = models.IntegerField(default=15, help_text="Días de validez")
    estado = models.CharField(max_length=15, choices=ESTADO_PRESUPUESTO, default="PENDIENTE")

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True)

    # Vínculo si se conviritió en venta
    venta = models.ForeignKey("Venta", on_delete=models.SET_NULL, null=True, blank=True, related_name='presupuesto_origen')
    # Vínculo si se convirtió en pedido
    pedido = models.ForeignKey("Pedido", on_delete=models.SET_NULL, null=True, blank=True, related_name='presupuesto_origen')

    def __str__(self):
        return f"Presupuesto #{self.id} - {self.cliente.nombre}"


class DetallePresupuesto(models.Model):
    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    # Guardamos descripción y precio al momento del presupuesto por si cambian
    descripcion_producto = models.CharField(max_length=200, blank=True) 
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Item Presup. {self.presupuesto.id} - {self.producto.descripcion}"


# =========================================
# ð¹ MOVIMIENTO DE CUENTA CORRIENTE CLIENTE
# =========================================
class MovimientoCuentaCorriente(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=[("DEBE", "Debe"), ("HABER", "Haber")])
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    saldo = models.DecimalField(max_digits=12, decimal_places=2)  # saldo luego del mov.
    
    # Referencias opcionales para trazabilidad
    venta = models.ForeignKey('Venta', on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_cc')
    recibo = models.ForeignKey('Recibo', on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_cc')

    def __str__(self):
        return f"{self.fecha.date()} - {self.tipo} ${self.monto} ({self.cliente.nombre})"


class MovimientoCuentaCorrienteProveedor(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=[("DEBE", "Debe"), ("HABER", "Haber")])
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    saldo = models.DecimalField(max_digits=12, decimal_places=2)  # saldo luego del mov.

    def __str__(self):
        return f"{self.fecha.date()} - {self.tipo} ${self.monto} ({self.proveedor.nombre})"


class Unidad(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.nombre


# =========================================
# ð¹ CONFIGURACIÃN DE FACTURAS
# =========================================
class InvoiceTemplate(models.Model):
    title = models.CharField(max_length=100, default="Plantilla Predeterminada")
    logo = models.ImageField(upload_to='invoice_logos/', blank=True, null=True)
    header_html = models.TextField(blank=True, help_text="HTML para la cabecera de la factura")
    footer_html = models.TextField(blank=True, help_text="HTML para el pie de pÃ¡gina de la factura")
    css = models.TextField(blank=True, help_text="CSS personalizado para la factura")
    active = models.BooleanField(default=False, help_text="Si estÃ¡ activo, esta plantilla se usarÃ¡ por defecto")

    def save(self, *args, **kwargs):
        if self.active:
            # Desactivar otras plantillas si esta se marca como activa
            InvoiceTemplate.objects.filter(active=True).exclude(pk=self.pk).update(active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# =========================================
# ð¹ MÃDULO CONTABLE
# =========================================

class PlanCuenta(models.Model):
    TIPO_CUENTA = [
        ('ACTIVO', 'Activo'),
        ('PASIVO', 'Pasivo'),
        ('PN', 'Patrimonio Neto'),
        ('R_POS', 'Resultado Positivo'),
        ('R_NEG', 'Resultado Negativo'),
    ]

    codigo = models.CharField(max_length=20, unique=True, help_text="Ej: 1.1.01.001")
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CUENTA)
    imputable = models.BooleanField(default=True, help_text="Si es True, recibe asientos. Si es False, es rubro agrupador.")
    nivel = models.IntegerField(default=1)
    padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='hijos')

    class Meta:
        ordering = ['codigo']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class EjercicioContable(models.Model):
    descripcion = models.CharField(max_length=100, help_text="Ej: Ejercicio 2025")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    cerrado = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-fecha_inicio']

    def __str__(self):
        return self.descripcion


class Asiento(models.Model):
    ORIGEN_CHOICES = [
        ('MANUAL', 'Manual'),
        ('VENTAS', 'Ventas'),
        ('COMPRAS', 'Compras'),
        ('COBROS', 'Cobros'),
        ('PAGOS', 'Pagos'),
        ('APERTURA', 'Apertura'),
        ('CIERRE', 'Cierre'),
    ]

    fecha = models.DateTimeField()
    descripcion = models.CharField(max_length=200)
    ejercicio = models.ForeignKey(EjercicioContable, on_delete=models.PROTECT)
    numero = models.IntegerField(help_text="NÃºmero correlativo dentro del ejercicio")
    origen = models.CharField(max_length=10, choices=ORIGEN_CHOICES, default='MANUAL')
    
    # Referencia opcional a otros modelos (Venta, Compra, etc.)
    referencia_id = models.IntegerField(null=True, blank=True)
    
    usuario = models.CharField(max_length=100, blank=True, default='Sistema')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha', '-numero']
        unique_together = ['ejercicio', 'numero']

    def __str__(self):
        return f"Asiento #{self.numero} - {self.descripcion}"


class ItemAsiento(models.Model):
    asiento = models.ForeignKey(Asiento, on_delete=models.CASCADE, related_name='items')
    cuenta = models.ForeignKey(PlanCuenta, on_delete=models.PROTECT)
    debe = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    haber = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    descripcion = models.CharField(max_length=200, blank=True, help_text="Detalle opcional de la lÃ­nea")

    def __str__(self):
        return f"{self.cuenta.nombre} | D: {self.debe} | H: {self.haber}"

# 🔹 Perfil de Usuario para Permisos

class PerfilUsuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    acceso_ventas = models.BooleanField(default=False, verbose_name="Acceso a Ventas")
    acceso_compras = models.BooleanField(default=False, verbose_name="Acceso a Compras")
    acceso_productos = models.BooleanField(default=False, verbose_name="Acceso a Productos")
    acceso_clientes = models.BooleanField(default=False, verbose_name="Acceso a Clientes")
    acceso_proveedores = models.BooleanField(default=False, verbose_name="Acceso a Proveedores")
    acceso_caja = models.BooleanField(default=False, verbose_name="Acceso a Caja")
    acceso_contabilidad = models.BooleanField(default=False, verbose_name="Acceso a Contabilidad")
    acceso_configuracion = models.BooleanField(default=False, verbose_name="Acceso a ConfiguraciÃ³n")
    acceso_usuarios = models.BooleanField(default=False, verbose_name="Acceso a Usuarios")
    acceso_reportes = models.BooleanField(default=False, verbose_name="Acceso a Reportes")
    
    # Nuevos permisos granulares
    acceso_pedidos = models.BooleanField(default=False, verbose_name="Acceso a Pedidos")
    acceso_bancos = models.BooleanField(default=False, verbose_name="Acceso a Bancos")
    acceso_ctacte = models.BooleanField(default=False, verbose_name="Acceso a Ctas. Corrientes")
    acceso_remitos = models.BooleanField(default=False, verbose_name="Acceso a Remitos")
    
    imagen = models.ImageField(upload_to='perfiles/', blank=True, null=True, verbose_name="Imagen de Perfil")

    def __str__(self):
        return f"Perfil de {self.user.username}"


# =========================================
# ð¹ MÃDULO DE SEGURIDAD
# =========================================

class LoginHistory(models.Model):
    """Historial de intentos de inicio de sesiÃ³n"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                            help_text="Usuario (null si el intento fallÃ³)")
    username = models.CharField(max_length=150, help_text="Nombre de usuario intentado")
    ip_address = models.GenericIPAddressField(help_text="DirecciÃ³n IP del cliente")
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False, help_text="Si el login fue exitoso")
    user_agent = models.TextField(blank=True, help_text="User agent del navegador")
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Historial de Login"
        verbose_name_plural = "Historial de Logins"
    
    def __str__(self):
        status = "Ãxito" if self.success else "Fallido"
        return f"{self.username} - {status} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"


class ActiveSession(models.Model):
    """Sesiones activas de usuarios"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-last_activity']
        verbose_name = "SesiÃ³n Activa"
        verbose_name_plural = "Sesiones Activas"
    
    def __str__(self):
        return f"{self.user.username} - {self.ip_address} - {self.login_time.strftime('%d/%m/%Y %H:%M')}"


class ActivityLog(models.Model):
    """BitÃ¡cora de actividades del sistema"""
    ACTION_TYPES = [
        ('CREATE', 'CreaciÃ³n'),
        ('UPDATE', 'ModificaciÃ³n'),
        ('DELETE', 'EliminaciÃ³n'),
        ('LOGIN', 'Inicio de sesiÃ³n'),
        ('LOGOUT', 'Cierre de sesiÃ³n'),
        ('PASSWORD_CHANGE', 'Cambio de contraseÃ±a'),
        ('SESSION_CLOSE', 'Cierre de sesiÃ³n remoto'),
        ('OTHER', 'Otro'),
    ]
    
    MODULE_CHOICES = [
        ('PRODUCTOS', 'Productos'),
        ('VENTAS', 'Ventas'),
        ('COMPRAS', 'Compras'),
        ('CLIENTES', 'Clientes'),
        ('PROVEEDORES', 'Proveedores'),
        ('USUARIOS', 'Usuarios'),
        ('CAJA', 'Caja'),
        ('CONTABILIDAD', 'Contabilidad'),
        ('CONFIGURACION', 'ConfiguraciÃ³n'),
        ('SEGURIDAD', 'Seguridad'),
        ('SISTEMA', 'Sistema'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    description = models.TextField()
    details = models.JSONField(null=True, blank=True, help_text="Detalles adicionales en formato JSON")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Registro de Actividad"
        verbose_name_plural = "Registros de Actividad"
    
    def __str__(self):
        user_str = self.user.username if self.user else "Sistema"
        return f"{user_str} - {self.get_action_type_display()} - {self.description[:50]}"


class Backup(models.Model):
    """Modelo para gestionar backups de la base de datos"""
    UBICACION_CHOICES = [
        ('LOCAL', 'Disco Local'),
        ('USB', 'Pendrive/USB'),
        ('NUBE', 'Nube'),
    ]
    
    TIPO_CHOICES = [
        ('DB', 'Base de Datos'),
        ('SISTEMA', 'Archivos de Sistema'),
    ]
    
    nombre = models.CharField(max_length=255, help_text="Nombre del backup")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='DB')
    archivo = models.CharField(max_length=500, help_text="Ruta del archivo de backup")
    tamanio = models.BigIntegerField(help_text="TamaÃ±o en bytes")
    ubicacion = models.CharField(max_length=10, choices=UBICACION_CHOICES, default='LOCAL')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    descripcion = models.TextField(blank=True, help_text="DescripciÃ³n opcional del backup")
    
    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = "Backup"
        verbose_name_plural = "Backups"
    
    def __str__(self):
        return f"{self.nombre} - {self.fecha_creacion.strftime('%d/%m/%Y %H:%M')}"
    
    def tamanio_formateado(self):
        """Retorna el tamaÃ±o en formato legible"""
        if self.tamanio < 1024:
            return f"{self.tamanio} B"
        elif self.tamanio < 1024 * 1024:
            return f"{self.tamanio / 1024:.2f} KB"
        elif self.tamanio < 1024 * 1024 * 1024:
            return f"{self.tamanio / (1024 * 1024):.2f} MB"
        else:
            return f"{self.tamanio / (1024 * 1024 * 1024):.2f} GB"

# =========================================
# ðx ¹ NOTAS DE CRÃ0 DITO Y DÃ0 BITO
# =========================================
class NotaCredito(models.Model):
    ESTADO_NC = [
        ("PENDIENTE", "Pendiente"),
        ("EMITIDA", "Emitida"),
        ("ANULADA", "Anulada"),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    venta_asociada = models.ForeignKey(Venta, on_delete=models.SET_NULL, null=True, blank=True, related_name="notas_credito")
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_comprobante = models.CharField(max_length=3, choices=[('NCA','Nota CrÃ©dito A'), ('NCB','Nota CrÃ©dito B'), ('NCC','Nota CrÃ©dito C')])
    total = models.DecimalField(max_digits=12, decimal_places=2)
    cae = models.CharField(max_length=20, blank=True, null=True)
    motivo = models.TextField(blank=True)
    estado = models.CharField(max_length=10, choices=ESTADO_NC, default="PENDIENTE")
    
    # Para impresiÃ³n
    punto_venta = models.CharField(max_length=5, default="0001")

    def numero_formateado(self):
        return f"{self.punto_venta}-{self.id:08d}"

    def __str__(self):
        return f"{self.tipo_comprobante} {self.numero_formateado()} - {self.cliente.nombre}"


class DetalleNotaCredito(models.Model):
    nota_credito = models.ForeignKey(NotaCredito, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.producto.descripcion} x {self.cantidad}"


class NotaDebito(models.Model):
    ESTADO_ND = [
        ("PENDIENTE", "Pendiente"),
        ("EMITIDA", "Emitida"),
        ("ANULADA", "Anulada"),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    venta_asociada = models.ForeignKey(Venta, on_delete=models.SET_NULL, null=True, blank=True, related_name="notas_debito")
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_comprobante = models.CharField(max_length=3, choices=[('NDA','Nota Débito A'), ('NDB','Nota Débito B'), ('NDC','Nota Débito C')])
    total = models.DecimalField(max_digits=12, decimal_places=2)
    cae = models.CharField(max_length=20, blank=True, null=True)
    motivo = models.TextField(blank=True)
    estado = models.CharField(max_length=10, choices=ESTADO_ND, default="PENDIENTE")
    
    punto_venta = models.CharField(max_length=5, default="0001")

    def numero_formateado(self):
        return f"{self.punto_venta}-{self.id:08d}"

    def __str__(self):
        return f"{self.tipo_comprobante} {self.numero_formateado()} - {self.cliente.nombre}"


class DetalleNotaDebito(models.Model):
    nota_debito = models.ForeignKey(NotaDebito, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.producto.descripcion} x {self.cantidad}"



class DetalleNotaDebito(models.Model):
    nota_debito = models.ForeignKey(NotaDebito, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.producto.descripcion} x {self.cantidad}"


# =========================================
# ðx ¹ REMITOS
# =========================================
class Remito(models.Model):
    ESTADO_REMITO = [
        ("GENERADO", "Generado"),
        ("EN_CAMINO", "En Camino"),
        ("ENTREGADO", "Entregado"),
        ("ANULADO", "Anulado"),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    venta_asociada = models.ForeignKey(Venta, on_delete=models.SET_NULL, null=True, blank=True, related_name="remitos")
    fecha = models.DateTimeField(auto_now_add=True)
    direccion_entrega = models.CharField(max_length=200, blank=True)

    # Datos Adicionales para Impresion
    proyecto = models.CharField(max_length=100, blank=True)
    orden_compra = models.CharField(max_length=50, blank=True)
    pedido_interno = models.CharField(max_length=50, blank=True)
    
    transportista = models.CharField(max_length=100, blank=True)
    cuit_transportista = models.CharField(max_length=20, blank=True)
    
    maq = models.CharField(max_length=50, blank=True, verbose_name="M.A.Q.")
    material = models.CharField(max_length=50, blank=True)
    
    ocm = models.CharField(max_length=50, blank=True, verbose_name="O.C.M.")
    alcance = models.CharField(max_length=50, blank=True)
    denominacion = models.CharField(max_length=100, blank=True, verbose_name="Denominacion y Capacidad")
    estado = models.CharField(max_length=15, choices=ESTADO_REMITO, default="GENERADO")
    observaciones = models.TextField(blank=True)
    
    punto_venta = models.CharField(max_length=5, default="0001")

    def numero_formateado(self):
        return f"R-{self.punto_venta}-{self.id:08d}"

    def __str__(self):
        return f"Remito {self.numero_formateado()} - {self.cliente.nombre}"


class DetalleRemito(models.Model):
    remito = models.ForeignKey(Remito, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    
    # En remitos a veces no se muestra precio, pero lo guardamos por referencia?
    # Por ahora solo cantidad y producto.

    def __str__(self):
        return f"{self.producto.descripcion} x {self.cantidad}"


# =========================================
# 🔹 CHEQUES
# =========================================
class Cheque(models.Model):
    TIPO_CHEQUE = [('PROPIO', 'Propio'), ('TERCERO', 'Tercero')]
    ESTADO_CHEQUE = [
        ('CARTERA', 'En Cartera'),
        ('DEPOSITADO', 'Depositado'),
        ('COBRADO', 'Cobrado'),
        ('ENTREGADO', 'Entregado'), # a proveedores
        ('RECHAZADO', 'Rechazado'),
        ('ANULADO', 'Anulado'),
    ]

    numero = models.CharField(max_length=50)
    banco = models.CharField(max_length=100)
    fecha_emision = models.DateField()
    fecha_pago = models.DateField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    
    tipo = models.CharField(max_length=10, choices=TIPO_CHEQUE, default='TERCERO')
    estado = models.CharField(max_length=15, choices=ESTADO_CHEQUE, default='CARTERA')
    
    # Origen (quien nos lo dio)
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name='cheques')
    firmante = models.CharField(max_length=150, blank=True, help_text="Nombre de quien entrega el cheque")
    cuit_firmante = models.CharField(max_length=20, blank=True)
    
    # Destino (a quien se lo dimos / endosamos)
    destinatario = models.CharField(max_length=150, blank=True, help_text="A quien se entrega")
    
    observaciones = models.TextField(blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cheque {self.banco} #{self.numero} - ${self.monto}"


# =========================================
# 🔹 RECIBOS DE COBRO Y PAGO
# =========================================
class Recibo(models.Model):
    """Recibo formal de cobro o pago con múltiples formas de pago"""
    TIPO_CHOICES = [
        ('CLIENTE', 'Cliente'),
        ('PROVEEDOR', 'Proveedor'),
    ]
    
    numero = models.IntegerField(unique=True)  # Número secuencial
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=models.PROTECT, related_name='recibos')
    proveedor = models.ForeignKey(Proveedor, null=True, blank=True, on_delete=models.PROTECT, related_name='recibos')
    fecha = models.DateField()
    total = models.DecimalField(max_digits=12, decimal_places=2)
    observaciones = models.TextField(blank=True)
    anulado = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_anulacion = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-numero']
        verbose_name = 'Recibo'
        verbose_name_plural = 'Recibos'
    
    def __str__(self):
        entidad = self.cliente.nombre if self.cliente else self.proveedor.nombre
        return f"Recibo #{self.numero} - {entidad}"
    
    def numero_formateado(self):
        """Retorna el número de recibo formateado"""
        return f"REC-{self.numero:08d}"


class ItemRecibo(models.Model):
    """Detalle de formas de pago de un recibo"""
    FORMA_PAGO_CHOICES = [
        ('EFECTIVO', 'Efectivo'),
        ('CHEQUE', 'Cheque'),
        ('TRANSFERENCIA', 'Transferencia'),
        ('DEBITO', 'Tarjeta de Débito'),
        ('CREDITO', 'Tarjeta de Crédito'),
        ('RETENCION', 'Retención Impositiva'),
        ('OTRO', 'Otro'),
    ]
    
    recibo = models.ForeignKey(Recibo, related_name='items', on_delete=models.CASCADE)
    forma_pago = models.CharField(max_length=20, choices=FORMA_PAGO_CHOICES)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Para cheques
    cheque = models.ForeignKey(Cheque, null=True, blank=True, on_delete=models.SET_NULL, related_name='items_recibo')
    
    # Para transferencias/otros
    banco = models.CharField(max_length=100, blank=True)
    referencia = models.CharField(max_length=100, blank=True, help_text="Número de operación, comprobante, etc.")

    # Para retenciones
    RETENCION_TIPOS = [
        ('IIBB', 'Ingresos Brutos'),
        ('GANANCIAS', 'Ganancias'),
        ('SUSS', 'SUSS'),
        ('IVA', 'IVA'),
        ('OTRA', 'Otra'),
    ]
    retencion_numero = models.CharField(max_length=50, blank=True, help_text="Número de certificado")
    retencion_tipo = models.CharField(max_length=20, choices=RETENCION_TIPOS, blank=True)

    
    class Meta:
        verbose_name = 'Item de Recibo'
        verbose_name_plural = 'Items de Recibo'
    
    def __str__(self):
        return f"{self.forma_pago}: ${self.monto}"


# ==========================================
# GESTIÓN BANCARIA
# ==========================================

class CuentaBancaria(models.Model):
    banco = models.CharField(max_length=100)
    cbu = models.CharField(max_length=22, blank=True)
    alias = models.CharField(max_length=100, blank=True)
    moneda = models.CharField(max_length=3, default='ARS', choices=[('ARS', 'Pesos'), ('USD', 'Dólares')])
    
    saldo_inicial = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    saldo_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.banco} ({self.moneda}) - {self.alias or self.cbu}"

class ConciliacionBancaria(models.Model):
    ESTADOS = [('PENDIENTE', 'Pendiente'), ('CERRADA', 'Cerrada')]
    
    cuenta = models.ForeignKey(CuentaBancaria, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    
    saldo_banco = models.DecimalField(max_digits=12, decimal_places=2, help_text="Saldo según extracto bancario")
    saldo_sistema = models.DecimalField(max_digits=12, decimal_places=2, help_text="Saldo calculado en sistema")
    
    estado = models.CharField(max_length=15, choices=ESTADOS, default='PENDIENTE')
    fecha_proceso = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conciliación {self.cuenta} ({self.fecha_inicio} - {self.fecha_fin})"

class MovimientoBanco(models.Model):
    cuenta = models.ForeignKey(CuentaBancaria, related_name='movimientos', on_delete=models.CASCADE)
    fecha = models.DateField()
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=12, decimal_places=2) # Positivo=Crédito, Negativo=Débito
    
    conciliado = models.BooleanField(default=False)
    conciliacion = models.ForeignKey(ConciliacionBancaria, null=True, blank=True, on_delete=models.SET_NULL, related_name='movimientos_conciliados')
    fecha_conciliado = models.DateField(null=True, blank=True)
    
    referencia_interna = models.CharField(max_length=100, blank=True, help_text="Referencia a Cheque, Transferencia, etc.")

    def __str__(self):
        return f"{self.fecha} - {self.descripcion} (${self.monto})"
