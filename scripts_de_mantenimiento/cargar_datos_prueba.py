"""
Script para poblar la base de datos con datos de prueba.
Ejecutar con: python manage.py shell < cargar_datos_prueba.py
O copiar y pegar en: python manage.py shell
"""
import os
import django
from decimal import Decimal
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import (
    Localidad, Provincia, Cliente, Proveedor, Rubro, Marca, Producto,
    Venta, DetalleVenta, Pedido, DetallePedido, OrdenCompra, DetalleOrdenCompra,
    Compra, DetalleCompra, MovimientoCaja, MovimientoStock,
    PlanCuenta, EjercicioContable, Asiento, ItemAsiento, Empresa, Unidad
)

print("=" * 60)
print("CARGANDO DATOS DE PRUEBA...")
print("=" * 60)

# =========================================
# LOCALIDADES Y PROVINCIAS
# =========================================
print("\n[1/10] Creando Localidades y Provincias...")

prov, _ = Provincia.objects.get_or_create(nombre="Buenos Aires")
Provincia.objects.get_or_create(nombre="Cordoba")
Provincia.objects.get_or_create(nombre="Santa Fe")

localidades_data = [
    ("Capital Federal", "1000"),
    ("La Plata", "1900"),
    ("Mar del Plata", "7600"),
    ("Rosario", "2000"),
    ("Cordoba", "5000"),
]
for nombre, cp in localidades_data:
    Localidad.objects.get_or_create(nombre=nombre, defaults={"codigo_postal": cp})

# =========================================
# RUBROS Y MARCAS
# =========================================
print("[2/10] Creando Rubros y Marcas...")

rubros_data = ["Electronica", "Hogar", "Herramientas", "Limpieza", "Oficina", "Alimentos"]
for r in rubros_data:
    Rubro.objects.get_or_create(nombre=r)

marcas_data = ["Samsung", "LG", "Philips", "Black+Decker", "3M", "Bic", "Arcor", "Coca-Cola"]
for m in marcas_data:
    Marca.objects.get_or_create(nombre=m)

# =========================================
# UNIDADES
# =========================================
print("[3/10] Creando Unidades...")
unidades_data = [("Unidad", "UN"), ("Caja", "CJ"), ("Kilogramo", "KG"), ("Litro", "LT")]
for nombre, desc in unidades_data:
    Unidad.objects.get_or_create(nombre=nombre, defaults={"descripcion": desc})

# =========================================
# PROVEEDORES
# =========================================
print("[4/10] Creando Proveedores...")

proveedores_data = [
    {"nombre": "Distribuidora Norte", "cuit": "30-12345678-9", "telefono": "011-4555-1234", "email": "ventas@distnorte.com"},
    {"nombre": "Mayorista Central", "cuit": "30-98765432-1", "telefono": "011-4666-5678", "email": "contacto@maycentral.com"},
    {"nombre": "Importadora Sur", "cuit": "30-11223344-5", "telefono": "011-4777-9012", "email": "import@importsur.com"},
    {"nombre": "Proveedor Tech", "cuit": "30-55667788-0", "telefono": "011-4888-3456", "email": "ventas@provtech.com"},
]
for p in proveedores_data:
    Proveedor.objects.get_or_create(nombre=p["nombre"], defaults=p)

# =========================================
# CLIENTES
# =========================================
print("[5/10] Creando Clientes...")

clientes_data = [
    {"nombre": "Consumidor Final", "tipo_cliente": "P", "condicion_fiscal": "CF"},
    {"nombre": "Juan Perez", "tipo_cliente": "P", "cuit": "20-12345678-9", "condicion_fiscal": "MT", "telefono": "11-2233-4455", "email": "jperez@mail.com", "domicilio": "Av. Corrientes 1234"},
    {"nombre": "Maria Garcia", "tipo_cliente": "P", "cuit": "27-98765432-1", "condicion_fiscal": "CF", "telefono": "11-6677-8899", "email": "mgarcia@mail.com", "domicilio": "Calle Florida 567"},
    {"nombre": "Ferreteria El Clavo SRL", "tipo_cliente": "E", "cuit": "30-44556677-8", "condicion_fiscal": "RI", "telefono": "011-4111-2222", "email": "admin@elclavo.com", "domicilio": "Av. San Martin 890", "tiene_ctacte": True, "limite_credito": 50000},
    {"nombre": "Electrodomesticos Sur SA", "tipo_cliente": "E", "cuit": "30-11112222-3", "condicion_fiscal": "RI", "telefono": "011-4333-4444", "email": "compras@electrosur.com", "domicilio": "Ruta 2 Km 45", "tiene_ctacte": True, "limite_credito": 100000},
    {"nombre": "Comercio Express", "tipo_cliente": "E", "cuit": "30-55556666-7", "condicion_fiscal": "MT", "telefono": "011-4555-6666", "email": "ventas@express.com", "domicilio": "Av. Libertador 1500"},
]
for c in clientes_data:
    Cliente.objects.get_or_create(nombre=c["nombre"], defaults=c)

# =========================================
# PRODUCTOS
# =========================================
print("[6/10] Creando Productos...")

rubro_elec = Rubro.objects.get(nombre="Electronica")
rubro_hogar = Rubro.objects.get(nombre="Hogar")
rubro_herr = Rubro.objects.get(nombre="Herramientas")
rubro_limp = Rubro.objects.get(nombre="Limpieza")
rubro_ofic = Rubro.objects.get(nombre="Oficina")

marca_samsung = Marca.objects.get(nombre="Samsung")
marca_lg = Marca.objects.get(nombre="LG")
marca_philips = Marca.objects.get(nombre="Philips")
marca_bd = Marca.objects.get(nombre="Black+Decker")
marca_bic = Marca.objects.get(nombre="Bic")

proveedor1 = Proveedor.objects.first()

productos_data = [
    {"codigo": "PROD001", "descripcion": "Television LED 32 pulgadas", "rubro": rubro_elec, "marca": marca_samsung, "costo": 80000, "precio_efectivo": 120000, "precio_tarjeta": 130000, "precio_ctacte": 125000, "stock": 15, "proveedor": proveedor1},
    {"codigo": "PROD002", "descripcion": "Heladera No Frost 360L", "rubro": rubro_hogar, "marca": marca_lg, "costo": 250000, "precio_efectivo": 380000, "precio_tarjeta": 420000, "precio_ctacte": 400000, "stock": 8, "proveedor": proveedor1},
    {"codigo": "PROD003", "descripcion": "Microondas 20L", "rubro": rubro_hogar, "marca": marca_samsung, "costo": 35000, "precio_efectivo": 55000, "precio_tarjeta": 60000, "precio_ctacte": 57000, "stock": 20, "proveedor": proveedor1},
    {"codigo": "PROD004", "descripcion": "Licuadora 600W", "rubro": rubro_hogar, "marca": marca_philips, "costo": 18000, "precio_efectivo": 28000, "precio_tarjeta": 31000, "precio_ctacte": 29000, "stock": 25, "proveedor": proveedor1},
    {"codigo": "PROD005", "descripcion": "Taladro Percutor 13mm", "rubro": rubro_herr, "marca": marca_bd, "costo": 22000, "precio_efectivo": 35000, "precio_tarjeta": 38000, "precio_ctacte": 36000, "stock": 12, "proveedor": proveedor1},
    {"codigo": "PROD006", "descripcion": "Amoladora 4 1/2", "rubro": rubro_herr, "marca": marca_bd, "costo": 15000, "precio_efectivo": 24000, "precio_tarjeta": 26000, "precio_ctacte": 25000, "stock": 18, "proveedor": proveedor1},
    {"codigo": "PROD007", "descripcion": "Aspiradora 1800W", "rubro": rubro_limp, "marca": marca_philips, "costo": 45000, "precio_efectivo": 68000, "precio_tarjeta": 75000, "precio_ctacte": 70000, "stock": 10, "proveedor": proveedor1},
    {"codigo": "PROD008", "descripcion": "Lampara LED 12W", "rubro": rubro_elec, "marca": marca_philips, "costo": 800, "precio_efectivo": 1500, "precio_tarjeta": 1700, "precio_ctacte": 1600, "stock": 100, "proveedor": proveedor1},
    {"codigo": "PROD009", "descripcion": "Birome Azul x12", "rubro": rubro_ofic, "marca": marca_bic, "costo": 150, "precio_efectivo": 350, "precio_tarjeta": 400, "precio_ctacte": 370, "stock": 200, "proveedor": proveedor1},
    {"codigo": "PROD010", "descripcion": "Calculadora Cientifica", "rubro": rubro_ofic, "marca": None, "costo": 5000, "precio_efectivo": 8500, "precio_tarjeta": 9500, "precio_ctacte": 9000, "stock": 30, "proveedor": proveedor1},
]

for p in productos_data:
    Producto.objects.get_or_create(codigo=p["codigo"], defaults=p)

# =========================================
# EMPRESA
# =========================================
print("[7/10] Configurando Empresa...")
Empresa.objects.get_or_create(
    nombre="CARSOFT Demo",
    defaults={
        "cuit": "30-11111111-1",
        "direccion": "Av. Demo 123",
        "condicion_fiscal": "RI",
        "punto_venta": "0001"
    }
)

# =========================================
# PLAN DE CUENTAS CONTABLE
# =========================================
print("[8/10] Creando Plan de Cuentas...")

cuentas_data = [
    # ACTIVO
    ("1", "ACTIVO", "ACTIVO", False, 1, None),
    ("1.1", "ACTIVO CORRIENTE", "ACTIVO", False, 2, "1"),
    ("1.1.01", "Caja", "ACTIVO", True, 3, "1.1"),
    ("1.1.02", "Banco", "ACTIVO", True, 3, "1.1"),
    ("1.1.03", "Deudores por Ventas", "ACTIVO", True, 3, "1.1"),
    ("1.1.04", "Mercaderias", "ACTIVO", True, 3, "1.1"),
    # PASIVO
    ("2", "PASIVO", "PASIVO", False, 1, None),
    ("2.1", "PASIVO CORRIENTE", "PASIVO", False, 2, "2"),
    ("2.1.01", "Proveedores", "PASIVO", True, 3, "2.1"),
    ("2.1.02", "Sueldos a Pagar", "PASIVO", True, 3, "2.1"),
    # PATRIMONIO NETO
    ("3", "PATRIMONIO NETO", "PN", False, 1, None),
    ("3.1", "Capital", "PN", True, 2, "3"),
    ("3.2", "Resultados Acumulados", "PN", True, 2, "3"),
    # RESULTADOS POSITIVOS
    ("4", "INGRESOS", "R_POS", False, 1, None),
    ("4.1", "Ventas", "R_POS", True, 2, "4"),
    ("4.2", "Intereses Ganados", "R_POS", True, 2, "4"),
    # RESULTADOS NEGATIVOS
    ("5", "EGRESOS", "R_NEG", False, 1, None),
    ("5.1", "Costo de Ventas", "R_NEG", True, 2, "5"),
    ("5.2", "Gastos Administrativos", "R_NEG", True, 2, "5"),
    ("5.3", "Gastos de Ventas", "R_NEG", True, 2, "5"),
]

cuenta_dict = {}
for codigo, nombre, tipo, imputable, nivel, padre_codigo in cuentas_data:
    padre = cuenta_dict.get(padre_codigo) if padre_codigo else None
    cuenta, _ = PlanCuenta.objects.get_or_create(
        codigo=codigo,
        defaults={"nombre": nombre, "tipo": tipo, "imputable": imputable, "nivel": nivel, "padre": padre}
    )
    cuenta_dict[codigo] = cuenta

# =========================================
# EJERCICIO CONTABLE
# =========================================
print("[9/10] Creando Ejercicio Contable...")
from datetime import date
ejercicio, _ = EjercicioContable.objects.get_or_create(
    descripcion="Ejercicio 2025",
    defaults={
        "fecha_inicio": date(2025, 1, 1),
        "fecha_fin": date(2025, 12, 31),
        "cerrado": False
    }
)

# =========================================
# VENTAS DE EJEMPLO
# =========================================
print("[10/10] Creando Ventas, Pedidos y Movimientos...")

cliente_cf = Cliente.objects.get(nombre="Consumidor Final")
cliente_empresa = Cliente.objects.filter(tipo_cliente="E").first()
prod1 = Producto.objects.get(codigo="PROD001")
prod2 = Producto.objects.get(codigo="PROD003")
prod3 = Producto.objects.get(codigo="PROD008")

# Venta 1
if not Venta.objects.filter(id=1).exists():
    venta1 = Venta.objects.create(cliente=cliente_cf, tipo_comprobante="B", total=175000, estado="Emitida")
    DetalleVenta.objects.create(venta=venta1, producto=prod1, cantidad=1, precio_unitario=120000, subtotal=120000)
    DetalleVenta.objects.create(venta=venta1, producto=prod2, cantidad=1, precio_unitario=55000, subtotal=55000)
    MovimientoCaja.objects.create(tipo="Ingreso", descripcion=f"Venta #{venta1.id}", monto=175000)

# Venta 2
if not Venta.objects.filter(id=2).exists():
    venta2 = Venta.objects.create(cliente=cliente_empresa, tipo_comprobante="A", total=3000, estado="Emitida")
    DetalleVenta.objects.create(venta=venta2, producto=prod3, cantidad=2, precio_unitario=1500, subtotal=3000)
    MovimientoCaja.objects.create(tipo="Ingreso", descripcion=f"Venta #{venta2.id}", monto=3000)

# Pedido pendiente
if not Pedido.objects.exists():
    pedido = Pedido.objects.create(cliente=cliente_empresa, estado="PENDIENTE", total=68000, observaciones="Pedido de prueba")
    DetallePedido.objects.create(pedido=pedido, producto=Producto.objects.get(codigo="PROD007"), cantidad=1, precio_unitario=68000, subtotal=68000)

# Orden de Compra
proveedor = Proveedor.objects.first()
if not OrdenCompra.objects.exists():
    oc = OrdenCompra.objects.create(proveedor=proveedor, estado="PENDIENTE", total_estimado=500000)
    DetalleOrdenCompra.objects.create(orden=oc, producto=prod1, cantidad=5, precio=80000, subtotal=400000)
    DetalleOrdenCompra.objects.create(orden=oc, producto=prod2, cantidad=3, precio=35000, subtotal=105000)

print("\n" + "=" * 60)
print("DATOS DE PRUEBA CARGADOS EXITOSAMENTE!")
print("=" * 60)
print(f"  - Localidades: {Localidad.objects.count()}")
print(f"  - Clientes: {Cliente.objects.count()}")
print(f"  - Proveedores: {Proveedor.objects.count()}")
print(f"  - Productos: {Producto.objects.count()}")
print(f"  - Ventas: {Venta.objects.count()}")
print(f"  - Pedidos: {Pedido.objects.count()}")
print(f"  - Ordenes de Compra: {OrdenCompra.objects.count()}")
print(f"  - Cuentas Contables: {PlanCuenta.objects.count()}")
print(f"  - Ejercicios Contables: {EjercicioContable.objects.count()}")
print("=" * 60)
