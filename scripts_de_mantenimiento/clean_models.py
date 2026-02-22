"""
Script para limpiar models.py eliminando duplicaciones y agregando modelos contables
"""

# Leer el archivo corrupto
with open(r'c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\models.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar donde termina DetallePedido correctamente (antes de las duplicaciones)
# Buscar la primera ocurrencia de "class Pedido" y luego "class DetallePedido"
# y guardar hasta el final de ese modelo

clean_lines = []
in_detallepedido = False
detallepedido_started = False
found_first_pedido = False

for i, line in enumerate(lines):
    # Copiar todo hasta encontrar problemas
    if i < 180:  # Las primeras 180 líneas están bien
        clean_lines.append(line)
        continue
    
    # Detectar inicio de Venta (primera vez está bien, segunda vez es duplicación)
    if 'class Venta(models.Model):' in line:
        # Si ya vimos Venta antes, aquí empiezan las duplicaciones
        if any('class Venta(models.Model):' in l for l in clean_lines):
            break  # Detener aquí, todo lo que sigue son duplicaciones
    
    clean_lines.append(line)

# Ahora agregar los modelos que faltan al final
models_to_add = '''
# 🔹 Modelo de Venta
class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_comprobante = models.CharField(max_length=2, choices=[('A','Factura A'), ('B','Factura B'), ('C','Factura C')])
    total = models.DecimalField(max_digits=12, decimal_places=2)
    cae = models.CharField(max_length=20, blank=True, null=True)
    estado = models.CharField(max_length=20, default="Emitida")

    def __str__(self):
        return f"Venta {self.id} - {self.cliente.nombre}"


# 🔹 Detalle de Venta
class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.producto.descripcion} x {self.cantidad}"


# 🔹 Caja / Movimiento
class MovimientoCaja(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=[('Ingreso','Ingreso'),('Egreso','Egreso')])
    descripcion = models.CharField(max_length=150)
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.tipo} - {self.descripcion} (${self.monto})"


# 🔹 Proveedores
class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    cuit = models.CharField(max_length=20, blank=True)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.CharField(max_length=100, blank=True)
    direccion = models.CharField(max_length=200, blank=True)

    provincia = models.ForeignKey(Provincia, on_delete=models.SET_NULL, null=True, blank=True)
    localidad = models.ForeignKey(Localidad, on_delete=models.SET_NULL, null=True, blank=True)

    notas = models.TextField(blank=True)

    def __str__(self):
        return self.nombre



# =========================================
# 🔹 MOVIMIENTO DE STOCK
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
# 🔹 ORDEN DE COMPRA (OC)
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
# 🔹 COMPRA / RECEPCIÓN DE MERCADERÍA
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
# 🔹 PEDIDOS
# =========================================
class Pedido(models.Model):
    ESTADO_PEDIDO = [
        ("PENDIENTE", "Pendiente"),
        ("PREPARACION", "En preparación"),
        ("LISTO", "Listo para entregar"),
        ("FACTURADO", "Facturado"),
        ("ANULADO", "Anulado"),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15, choices=ESTADO_PEDIDO, default="PENDIENTE")

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True)

    # vínculo cuando el pedido ya fue facturado
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
# 🔹 MOVIMIENTO DE CUENTA CORRIENTE CLIENTE
# =========================================
class MovimientoCuentaCorriente(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=[("DEBE", "Debe"), ("HABER", "Haber")])
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    saldo = models.DecimalField(max_digits=12, decimal_places=2)  # saldo luego del mov.

    def __str__(self):
        return f"{self.fecha.date()} - {self.tipo} ${self.monto} ({self.cliente.nombre})"


class Unidad(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.nombre


# =========================================
# 🔹 CONFIGURACIÓN DE FACTURAS
# =========================================
class InvoiceTemplate(models.Model):
    title = models.CharField(max_length=100, default="Plantilla Predeterminada")
    logo = models.ImageField(upload_to='invoice_logos/', blank=True, null=True)
    header_html = models.TextField(blank=True, help_text="HTML para la cabecera de la factura")
    footer_html = models.TextField(blank=True, help_text="HTML para el pie de página de la factura")
    css = models.TextField(blank=True, help_text="CSS personalizado para la factura")
    active = models.BooleanField(default=False, help_text="Si está activo, esta plantilla se usará por defecto")

    def save(self, *args, **kwargs):
        if self.active:
            # Desactivar otras plantillas si esta se marca como activa
            InvoiceTemplate.objects.filter(active=True).exclude(pk=self.pk).update(active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# =========================================
# 🔹 MÓDULO CONTABLE
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
    numero = models.IntegerField(help_text="Número correlativo dentro del ejercicio")
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
    descripcion = models.CharField(max_length=200, blank=True, help_text="Detalle opcional de la línea")

    def __str__(self):
        return f"{self.cuenta.nombre} | D: {self.debe} | H: {self.haber}"
'''

# Escribir el archivo limpio
output_lines = clean_lines + [models_to_add]

with open(r'c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\models_clean.py', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print(f"Archivo limpio creado: models_clean.py")
print(f"Líneas originales: {len(lines)}")
print(f"Líneas limpias: {len(clean_lines)}")
print(f"Total en archivo limpio: {len(output_lines)}")
