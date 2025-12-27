"""
Script para limpiar y poblar la base de datos con datos de prueba
Ejecutar con: python manage.py poblar_datos
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from administrar.models import (
    Provincia, Localidad, Marca, Rubro, Unidad, Proveedor, 
    Cliente, Producto, Venta, DetalleVenta, Compra, DetalleCompra,
    OrdenCompra, DetalleOrdenCompra, Pedido, DetallePedido,
    MovimientoCaja, MovimientoStock, PlanCuenta, EjercicioContable, 
    Asiento, ItemAsiento, PerfilUsuario
)
from administrar.services import AccountingService
from decimal import Decimal
from datetime import datetime, timedelta, date
import random

class Command(BaseCommand):
    help = 'Limpia y puebla la base de datos con datos de prueba'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Limpiando datos de prueba...'))
        
        # Limpiar tablas (en orden inverso de dependencias)
        ItemAsiento.objects.all().delete()
        Asiento.objects.all().delete()
        EjercicioContable.objects.all().delete()
        PlanCuenta.objects.all().delete()
        MovimientoCaja.objects.all().delete()
        DetallePedido.objects.all().delete()
        Pedido.objects.all().delete()
        DetalleOrdenCompra.objects.all().delete()
        OrdenCompra.objects.all().delete()
        DetalleCompra.objects.all().delete()
        Compra.objects.all().delete()
        DetalleVenta.objects.all().delete()
        Venta.objects.all().delete()
        MovimientoStock.objects.all().delete()
        Producto.objects.all().delete()
        Cliente.objects.all().delete()
        Proveedor.objects.all().delete()
        Unidad.objects.all().delete()
        Rubro.objects.all().delete()
        Marca.objects.all().delete()
        Localidad.objects.all().delete()
        Provincia.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('[OK] Datos limpiados'))
        
        # ========================================
        # POBLAR DATOS
        # ========================================
        
        self.stdout.write(self.style.WARNING('Poblando base de datos...'))
        
        # 1. PROVINCIAS Y LOCALIDADES
        provincias_nombres = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 
                              'Entre Ríos', 'Salta', 'Misiones', 'Chaco', 'Corrientes']
        
        provincias = []
        for nombre in provincias_nombres:
            prov = Provincia.objects.create(nombre=nombre)
            provincias.append(prov)
        
        localidades_nombres = [
            'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Olavarría',
            'Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Alta Gracia',
            'Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto',
            'Mendoza', 'San Rafael', 'Godoy Cruz', 'Maipú',
            'San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo'
        ]
        
        for loc_nombre in localidades_nombres:
            Localidad.objects.create(
                nombre=loc_nombre,
                codigo_postal=str(random.randint(1000, 9999))
            )
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Provincia.objects.count()} provincias creadas'))
        self.stdout.write(self.style.SUCCESS(f'[OK] {Localidad.objects.count()} localidades creadas'))
        
        # 2. MARCAS
        marcas_nombres = [
            'Samsung', 'LG', 'Sony', 'Philips', 'Panasonic',
            'HP', 'Dell', 'Lenovo', 'Asus', 'Acer',
            'Logitech', 'Razer', 'Corsair', 'Kingston', 'Western Digital',
            'Canon', 'Epson', 'Brother', 'Xerox', 'Ricoh'
        ]
        marcas = {}
        for nombre in marcas_nombres:
            marca = Marca.objects.create(nombre=nombre)
            marcas[nombre] = marca
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Marca.objects.count()} marcas creadas'))
        
        # 3. RUBROS
        rubros_nombres = [
            'Electrónica', 'Informática', 'Periféricos', 'Almacenamiento',
            'Audio y Video', 'Impresoras', 'Accesorios', 'Cables y Conectores',
            'Redes', 'Telefonía', 'Gaming', 'Oficina', 'Hogar', 'Iluminación'
        ]
        rubros = {}
        for nombre in rubros_nombres:
            rubro = Rubro.objects.create(nombre=nombre)
            rubros[nombre] = rubro
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Rubro.objects.count()} rubros creados'))
        
        # 4. UNIDADES
        unidades_data = [
            'Unidad', 'Kilogramo', 'Litro', 'Metro', 'Caja', 'Paquete', 'Docena'
        ]
        for nombre in unidades_data:
            Unidad.objects.create(nombre=nombre)
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Unidad.objects.count()} unidades creadas'))
        
        # 5. PROVEEDORES
        proveedores_nombres = [
            'Distribuidora Tech SA', 'Mayorista Electrónica SRL', 'Importadora Global',
            'Comercial del Sur', 'Tecnología Avanzada', 'Suministros Industriales',
            'Electro Mayorista', 'Insumos y Componentes', 'Distribuidora Central',
            'Proveedor Integral SA'
        ]
        proveedores = []
        for i, nombre in enumerate(proveedores_nombres, 1):
            prov = Proveedor.objects.create(
                nombre=nombre,
                cuit=f'20-{30000000 + i:08d}-{random.randint(0,9)}',
                telefono=f'011-{random.randint(4000, 4999)}-{random.randint(1000, 9999)}',
                email=f'{nombre.lower().replace(" ", "")[:15]}@proveedor.com',
                direccion=f'Av. Principal {random.randint(100, 9999)}',
                provincia=random.choice(provincias),
                notas='Proveedor de confianza'
            )
            proveedores.append(prov)
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Proveedor.objects.count()} proveedores creados'))
        
        # 6. CLIENTES
        clientes_nombres = [
            'Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Martínez',
            'Roberto Fernández', 'Laura López', 'Diego Sánchez', 'Sofía Romero',
            'Martín García', 'Valentina Torres', 'Lucas Díaz', 'Camila Ruiz',
            'Empresa Tech SRL', 'Comercial del Norte SA', 'Industrias Modernas',
            'Servicios Integrales', 'Soluciones Empresariales', 'Grupo Comercial',
            'Distribuidora Regional', 'Mayorista del Centro'
        ]
        clientes = []
        condiciones = ['CF', 'RI', 'MT', 'EX']
        listas_precio = ['EFECTIVO', 'CTACTE', 'TARJETA', 'MAYORISTA']
        
        for i, nombre in enumerate(clientes_nombres, 1):
            es_empresa = 'SRL' in nombre or 'SA' in nombre
            cliente = Cliente.objects.create(
                nombre=nombre,
                cuit=f'20-{20000000 + i:08d}-{random.randint(0,9)}' if es_empresa else '',
                telefono=f'011-{random.randint(4000, 4999)}-{random.randint(1000, 9999)}',
                email=f'{nombre.lower().replace(" ", "")[:15]}@cliente.com',
                domicilio=f'Calle {random.randint(1, 100)} #{random.randint(100, 9999)}',
                provincia=random.choice(provincias),
                condicion_fiscal=random.choice(condiciones),
                lista_precio=random.choice(['1', '2', '3', '4']),
                limite_credito=Decimal(random.randint(10000, 100000)),
                activo=True
            )
            clientes.append(cliente)
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Cliente.objects.count()} clientes creados'))
        
        # 7. PRODUCTOS
        productos_data = [
            # Electrónica
            ('TV-SAM-55', 'Smart TV Samsung 55" 4K UHD', 'Samsung', 'Electrónica', 450000, 550000, 600000, 650000, 15),
            ('TV-LG-65', 'Smart TV LG 65" OLED', 'LG', 'Electrónica', 850000, 1050000, 1100000, 1150000, 8),
            ('TV-SONY-43', 'Smart TV Sony 43" Full HD', 'Sony', 'Electrónica', 320000, 420000, 450000, 480000, 20),
            
            # Informática
            ('NB-HP-15', 'Notebook HP 15" i5 8GB 256GB SSD', 'HP', 'Informática', 550000, 680000, 720000, 750000, 12),
            ('NB-DELL-14', 'Notebook Dell 14" i7 16GB 512GB SSD', 'Dell', 'Informática', 850000, 1050000, 1100000, 1150000, 8),
            ('PC-LEN-DT', 'PC Lenovo Desktop i5 8GB 1TB', 'Lenovo', 'Informática', 420000, 520000, 550000, 580000, 15),
            ('MON-ASUS-24', 'Monitor ASUS 24" Full HD', 'Asus', 'Informática', 85000, 105000, 112000, 118000, 25),
            ('MON-LG-27', 'Monitor LG 27" 4K', 'LG', 'Informática', 180000, 220000, 235000, 248000, 18),
            
            # Periféricos
            ('TEC-LOG-K120', 'Teclado Logitech K120', 'Logitech', 'Periféricos', 8500, 10500, 11200, 11800, 50),
            ('TEC-RAZ-BW', 'Teclado Razer BlackWidow Mecánico', 'Razer', 'Periféricos', 65000, 80000, 85000, 90000, 15),
            ('MOU-LOG-M185', 'Mouse Logitech M185 Inalámbrico', 'Logitech', 'Periféricos', 6500, 8000, 8500, 9000, 60),
            ('MOU-RAZ-VM', 'Mouse Razer Viper Mini Gaming', 'Razer', 'Periféricos', 28000, 35000, 37000, 39000, 22),
            ('WEB-LOG-C920', 'Webcam Logitech C920 Full HD', 'Logitech', 'Periféricos', 45000, 55000, 58000, 62000, 18),
            
            # Almacenamiento
            ('SSD-KING-240', 'SSD Kingston 240GB', 'Kingston', 'Almacenamiento', 18000, 22000, 23500, 25000, 35),
            ('SSD-WD-500', 'SSD Western Digital 500GB', 'Western Digital', 'Almacenamiento', 35000, 43000, 46000, 48000, 28),
            ('HDD-WD-1TB', 'Disco Duro WD 1TB', 'Western Digital', 'Almacenamiento', 28000, 35000, 37000, 39000, 30),
            ('USB-KING-32', 'Pendrive Kingston 32GB', 'Kingston', 'Almacenamiento', 4500, 5500, 5900, 6200, 80),
            
            # Impresoras
            ('IMP-HP-2775', 'Impresora HP DeskJet 2775', 'HP', 'Impresoras', 85000, 105000, 112000, 118000, 12),
            ('IMP-EPS-L3250', 'Impresora Epson L3250 Multifunción', 'Epson', 'Impresoras', 180000, 220000, 235000, 248000, 10),
            ('IMP-CAN-G3160', 'Impresora Canon G3160', 'Canon', 'Impresoras', 165000, 205000, 218000, 230000, 8),
            
            # Audio y Video
            ('AUR-SONY-WH', 'Auriculares Sony WH-1000XM4', 'Sony', 'Audio y Video', 180000, 220000, 235000, 248000, 15),
            ('AUR-LOG-G733', 'Auriculares Logitech G733 Gaming', 'Logitech', 'Audio y Video', 95000, 118000, 125000, 132000, 20),
            ('PARLANTE-LG', 'Parlante LG XBOOM 500W', 'LG', 'Audio y Video', 125000, 155000, 165000, 175000, 12),
        ]
        
        productos = []
        for codigo, desc, marca_nom, rubro_nom, costo, p_efec, p_tarj, p_ctacte, stock in productos_data:
            prod = Producto.objects.create(
                codigo=codigo,
                descripcion=desc,
                descripcion_larga=f'{desc} - Producto de alta calidad',
                marca=marcas.get(marca_nom),
                rubro=rubros.get(rubro_nom),
                proveedor=random.choice(proveedores),
                tipo_bulto='UN',
                stock_inicial=stock,
                stock=stock,
                stock_minimo=5,
                stock_maximo=stock * 2,
                costo=Decimal(costo),
                precio_efectivo=Decimal(p_efec),
                precio_tarjeta=Decimal(p_tarj),
                precio_ctacte=Decimal(p_ctacte),
                precio_lista4=Decimal(p_ctacte * 0.95)
            )
            productos.append(prod)
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Producto.objects.count()} productos creados'))
        
        # ========================================
        # MOVED UP: PLAN DE CUENTAS (Required for Accounting)
        # ========================================
        cuentas_data = [
            # ========== ACTIVO ==========
            ('1', 'ACTIVO', 'ACTIVO', False, None),
            
            # ACTIVO CORRIENTE
            ('1.1', 'ACTIVO CORRIENTE', 'ACTIVO', False, '1'),
            ('1.1.1', 'Caja y Bancos', 'ACTIVO', False, '1.1'),
            ('1.1.1.01', 'Caja', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.02', 'Caja Chica', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.03', 'Banco Nación Cta. Cte.', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.04', 'Banco Provincia Cta. Cte.', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.05', 'Banco Galicia Cta. Cte.', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.06', 'Banco Santander Cta. Cte.', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.07', 'Mercado Pago', 'ACTIVO', True, '1.1.1'),
            ('1.1.1.08', 'Valores a Depositar', 'ACTIVO', True, '1.1.1'),
            
            ('1.1.2', 'Inversiones', 'ACTIVO', False, '1.1'),
            ('1.1.2.01', 'Plazo Fijo', 'ACTIVO', True, '1.1.2'),
            ('1.1.2.02', 'Fondos Comunes de Inversión', 'ACTIVO', True, '1.1.2'),
            ('1.1.2.03', 'Títulos Públicos', 'ACTIVO', True, '1.1.2'),
            
            ('1.1.3', 'Créditos por Ventas', 'ACTIVO', False, '1.1'),
            ('1.1.3.01', 'Deudores por Ventas', 'ACTIVO', True, '1.1.3'),
            ('1.1.3.02', 'Documentos a Cobrar', 'ACTIVO', True, '1.1.3'),
            ('1.1.3.03', 'Tarjetas de Crédito a Cobrar', 'ACTIVO', True, '1.1.3'),
            ('1.1.3.04', 'Cheques de Terceros en Cartera', 'ACTIVO', True, '1.1.3'),
            ('1.1.3.05', 'Cheques Diferidos', 'ACTIVO', True, '1.1.3'),
            ('1.1.3.06', 'Previsión para Deudores Incobrables', 'ACTIVO', True, '1.1.3'),
            
            ('1.1.4', 'Otros Créditos', 'ACTIVO', False, '1.1'),
            ('1.1.4.01', 'Anticipos a Proveedores', 'ACTIVO', True, '1.1.4'),
            ('1.1.4.02', 'Anticipos al Personal', 'ACTIVO', True, '1.1.4'),
            ('1.1.4.03', 'IVA Crédito Fiscal', 'ACTIVO', True, '1.1.4'),
            ('1.1.4.04', 'IVA Saldo a Favor', 'ACTIVO', True, '1.1.4'),
            ('1.1.4.05', 'Retenciones y Percepciones IIBB', 'ACTIVO', True, '1.1.4'),
            ('1.1.4.06', 'Retenciones Ganancias', 'ACTIVO', True, '1.1.4'),
            ('1.1.4.07', 'Gastos Pagados por Adelantado', 'ACTIVO', True, '1.1.4'),
            
            ('1.1.5', 'Bienes de Cambio', 'ACTIVO', False, '1.1'),
            ('1.1.5.01', 'Mercaderías', 'ACTIVO', True, '1.1.5'),
            ('1.1.5.02', 'Mercaderías en Tránsito', 'ACTIVO', True, '1.1.5'),
            ('1.1.5.03', 'Mercaderías en Consignación', 'ACTIVO', True, '1.1.5'),
            ('1.1.5.04', 'Materias Primas', 'ACTIVO', True, '1.1.5'),
            ('1.1.5.05', 'Productos en Proceso', 'ACTIVO', True, '1.1.5'),
            ('1.1.5.06', 'Productos Terminados', 'ACTIVO', True, '1.1.5'),
            
            # ACTIVO NO CORRIENTE
            ('1.2', 'ACTIVO NO CORRIENTE', 'ACTIVO', False, '1'),
            ('1.2.1', 'Bienes de Uso', 'ACTIVO', False, '1.2'),
            ('1.2.1.01', 'Inmuebles', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.02', 'Rodados', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.03', 'Muebles y Útiles', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.04', 'Instalaciones', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.05', 'Maquinarias', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.06', 'Equipos de Computación', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.07', 'Herramientas', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.08', 'Amortización Acumulada Inmuebles', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.09', 'Amortización Acumulada Rodados', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.10', 'Amortización Acumulada Muebles', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.11', 'Amortización Acumulada Instalaciones', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.12', 'Amortización Acumulada Maquinarias', 'ACTIVO', True, '1.2.1'),
            ('1.2.1.13', 'Amortización Acumulada Equipos Computación', 'ACTIVO', True, '1.2.1'),
            
            ('1.2.2', 'Activos Intangibles', 'ACTIVO', False, '1.2'),
            ('1.2.2.01', 'Marcas y Patentes', 'ACTIVO', True, '1.2.2'),
            ('1.2.2.02', 'Llave de Negocio', 'ACTIVO', True, '1.2.2'),
            ('1.2.2.03', 'Software', 'ACTIVO', True, '1.2.2'),
            ('1.2.2.04', 'Amortización Acumulada Intangibles', 'ACTIVO', True, '1.2.2'),
            
            # ========== PASIVO ==========
            ('2', 'PASIVO', 'PASIVO', False, None),
            
            # PASIVO CORRIENTE
            ('2.1', 'PASIVO CORRIENTE', 'PASIVO', False, '2'),
            ('2.1.1', 'Deudas Comerciales', 'PASIVO', False, '2.1'),
            ('2.1.1.01', 'Proveedores', 'PASIVO', True, '2.1.1'),
            ('2.1.1.02', 'Documentos a Pagar', 'PASIVO', True, '2.1.1'),
            ('2.1.1.03', 'Anticipos de Clientes', 'PASIVO', True, '2.1.1'),
            ('2.1.1.04', 'Acreedores Varios', 'PASIVO', True, '2.1.1'),
            
            ('2.1.2', 'Deudas Bancarias y Financieras', 'PASIVO', False, '2.1'),
            ('2.1.2.01', 'Préstamos Bancarios', 'PASIVO', True, '2.1.2'),
            ('2.1.2.02', 'Descubierto Bancario', 'PASIVO', True, '2.1.2'),
            ('2.1.2.03', 'Tarjetas de Crédito a Pagar', 'PASIVO', True, '2.1.2'),
            ('2.1.2.04', 'Intereses a Pagar', 'PASIVO', True, '2.1.2'),
            
            ('2.1.3', 'Deudas Fiscales', 'PASIVO', False, '2.1'),
            ('2.1.3.01', 'IVA Débito Fiscal', 'PASIVO', True, '2.1.3'),
            ('2.1.3.02', 'IVA a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.03', 'Retenciones IVA a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.04', 'Percepciones IVA a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.05', 'Impuesto a las Ganancias a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.06', 'Retenciones Ganancias a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.07', 'Ingresos Brutos a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.08', 'Retenciones IIBB a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.09', 'Percepciones IIBB a Pagar', 'PASIVO', True, '2.1.3'),
            ('2.1.3.10', 'Impuesto sobre los Débitos y Créditos', 'PASIVO', True, '2.1.3'),
            ('2.1.3.11', 'Tasas Municipales a Pagar', 'PASIVO', True, '2.1.3'),
            
            ('2.1.4', 'Deudas Sociales', 'PASIVO', False, '2.1'),
            ('2.1.4.01', 'Sueldos a Pagar', 'PASIVO', True, '2.1.4'),
            ('2.1.4.02', 'Cargas Sociales a Pagar', 'PASIVO', True, '2.1.4'),
            ('2.1.4.03', 'Aportes y Contribuciones a Pagar', 'PASIVO', True, '2.1.4'),
            ('2.1.4.04', 'Provisión SAC', 'PASIVO', True, '2.1.4'),
            ('2.1.4.05', 'Provisión Vacaciones', 'PASIVO', True, '2.1.4'),
            ('2.1.4.06', 'Retenciones a Pagar', 'PASIVO', True, '2.1.4'),
            
            ('2.1.5', 'Otras Deudas', 'PASIVO', False, '2.1'),
            ('2.1.5.01', 'Honorarios a Pagar', 'PASIVO', True, '2.1.5'),
            ('2.1.5.02', 'Alquileres a Pagar', 'PASIVO', True, '2.1.5'),
            ('2.1.5.03', 'Servicios a Pagar', 'PASIVO', True, '2.1.5'),
            
            # PASIVO NO CORRIENTE
            ('2.2', 'PASIVO NO CORRIENTE', 'PASIVO', False, '2'),
            ('2.2.1', 'Deudas a Largo Plazo', 'PASIVO', False, '2.2'),
            ('2.2.1.01', 'Préstamos Bancarios Largo Plazo', 'PASIVO', True, '2.2.1'),
            ('2.2.1.02', 'Obligaciones Negociables', 'PASIVO', True, '2.2.1'),
            ('2.2.1.03', 'Deudas Hipotecarias', 'PASIVO', True, '2.2.1'),
            
            # ========== PATRIMONIO NETO ==========
            ('3', 'PATRIMONIO NETO', 'PN', False, None),
            ('3.1', 'Capital', 'PN', False, '3'),
            ('3.1.1', 'Capital Social', 'PN', True, '3.1'),
            ('3.1.2', 'Aportes Irrevocables', 'PN', True, '3.1'),
            ('3.1.3', 'Ajuste de Capital', 'PN', True, '3.1'),
            
            ('3.2', 'Reservas', 'PN', False, '3'),
            ('3.2.1', 'Reserva Legal', 'PN', True, '3.2'),
            ('3.2.2', 'Reserva Estatutaria', 'PN', True, '3.2'),
            ('3.2.3', 'Reserva Facultativa', 'PN', True, '3.2'),
            
            ('3.3', 'Resultados', 'PN', False, '3'),
            ('3.3.1', 'Resultados No Asignados', 'PN', True, '3.3'),
            ('3.3.2', 'Resultados del Ejercicio', 'PN', True, '3.3'),
            ('3.3.3', 'Resultados Acumulados', 'PN', True, '3.3'),
            
            # ========== RESULTADO POSITIVO (INGRESOS) ==========
            ('4', 'RESULTADO POSITIVO', 'R_POS', False, None),
            ('4.1', 'Ingresos por Ventas', 'R_POS', False, '4'),
            ('4.1.1', 'Ventas', 'R_POS', True, '4.1'),
            ('4.1.2', 'Ventas Contado', 'R_POS', True, '4.1'),
            ('4.1.3', 'Ventas Cuenta Corriente', 'R_POS', True, '4.1'),
            ('4.1.4', 'Ventas Tarjeta', 'R_POS', True, '4.1'),
            ('4.1.5', 'Devoluciones sobre Ventas', 'R_POS', True, '4.1'),
            ('4.1.6', 'Descuentos sobre Ventas', 'R_POS', True, '4.1'),
            ('4.1.7', 'Bonificaciones sobre Ventas', 'R_POS', True, '4.1'),
            
            ('4.2', 'Otros Ingresos', 'R_POS', False, '4'),
            ('4.2.1', 'Intereses Ganados', 'R_POS', True, '4.2'),
            ('4.2.2', 'Diferencias de Cambio Positivas', 'R_POS', True, '4.2'),
            ('4.2.3', 'Recupero de Gastos', 'R_POS', True, '4.2'),
            ('4.2.4', 'Alquileres Ganados', 'R_POS', True, '4.2'),
            ('4.2.5', 'Ingresos Varios', 'R_POS', True, '4.2'),
            
            # ========== RESULTADO NEGATIVO (EGRESOS) ==========
            ('5', 'RESULTADO NEGATIVO', 'R_NEG', False, None),
            ('5.1', 'Costo de Ventas', 'R_NEG', False, '5'),
            ('5.1.1', 'Costo de Mercaderías Vendidas', 'R_NEG', True, '5.1'),
            ('5.1.2', 'Fletes sobre Compras', 'R_NEG', True, '5.1'),
            
            ('5.2', 'Gastos de Comercialización', 'R_NEG', False, '5'),
            ('5.2.1', 'Sueldos y Jornales Ventas', 'R_NEG', True, '5.2'),
            ('5.2.2', 'Cargas Sociales Ventas', 'R_NEG', True, '5.2'),
            ('5.2.3', 'Comisiones sobre Ventas', 'R_NEG', True, '5.2'),
            ('5.2.4', 'Publicidad y Propaganda', 'R_NEG', True, '5.2'),
            ('5.2.5', 'Gastos de Entrega', 'R_NEG', True, '5.2'),
            ('5.2.6', 'Fletes sobre Ventas', 'R_NEG', True, '5.2'),
            
            ('5.3', 'Gastos de Administración', 'R_NEG', False, '5'),
            ('5.3.1', 'Sueldos y Jornales Administración', 'R_NEG', True, '5.3'),
            ('5.3.2', 'Cargas Sociales Administración', 'R_NEG', True, '5.3'),
            ('5.3.3', 'Honorarios Profesionales', 'R_NEG', True, '5.3'),
            ('5.3.4', 'Honorarios Directores', 'R_NEG', True, '5.3'),
            ('5.3.5', 'Alquileres', 'R_NEG', True, '5.3'),
            ('5.3.6', 'Luz, Gas y Teléfono', 'R_NEG', True, '5.3'),
            ('5.3.7', 'Seguros', 'R_NEG', True, '5.3'),
            ('5.3.8', 'Papelería y Útiles', 'R_NEG', True, '5.3'),
            ('5.3.9', 'Gastos de Limpieza', 'R_NEG', True, '5.3'),
            ('5.3.10', 'Gastos de Mantenimiento', 'R_NEG', True, '5.3'),
            ('5.3.11', 'Gastos de Movilidad', 'R_NEG', True, '5.3'),
            ('5.3.12', 'Gastos de Representación', 'R_NEG', True, '5.3'),
            ('5.3.13', 'Impuestos y Tasas', 'R_NEG', True, '5.3'),
            ('5.3.14', 'Ingresos Brutos', 'R_NEG', True, '5.3'),
            ('5.3.15', 'Tasas Municipales', 'R_NEG', True, '5.3'),
            ('5.3.16', 'Impuesto sobre los Débitos y Créditos', 'R_NEG', True, '5.3'),
            ('5.3.17', 'Amortizaciones', 'R_NEG', True, '5.3'),
            ('5.3.18', 'Deudores Incobrables', 'R_NEG', True, '5.3'),
            ('5.3.19', 'Gastos Bancarios', 'R_NEG', True, '5.3'),
            ('5.3.20', 'Gastos de Informática', 'R_NEG', True, '5.3'),
            
            ('5.4', 'Gastos Financieros', 'R_NEG', False, '5'),
            ('5.4.1', 'Intereses Perdidos', 'R_NEG', True, '5.4'),
            ('5.4.2', 'Comisiones Bancarias', 'R_NEG', True, '5.4'),
            ('5.4.3', 'Diferencias de Cambio Negativas', 'R_NEG', True, '5.4'),
            ('5.4.4', 'Descuentos Otorgados', 'R_NEG', True, '5.4'),
            
            ('5.5', 'Otros Egresos', 'R_NEG', False, '5'),
            ('5.5.1', 'Donaciones', 'R_NEG', True, '5.5'),
            ('5.5.2', 'Gastos Varios', 'R_NEG', True, '5.5'),
            ('5.5.3', 'Quebrantos', 'R_NEG', True, '5.5'),
        ]
        
        cuentas_map = {}
        for codigo, nombre, tipo, imputable, padre_codigo in cuentas_data:
            padre = cuentas_map.get(padre_codigo) if padre_codigo else None
            nivel = codigo.count('.') + 1
            
            cuenta = PlanCuenta.objects.create(
                codigo=codigo,
                nombre=nombre,
                tipo=tipo,
                imputable=imputable,
                nivel=nivel,
                padre=padre
            )
            cuentas_map[codigo] = cuenta
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {PlanCuenta.objects.count()} cuentas creadas'))
        
        # ========================================
        # MOVED UP: EJERCICIO CONTABLE (Auto-detect year)
        # ========================================
        anio_actual = datetime.now().year
        ejercicio = EjercicioContable.objects.create(
            descripcion=f'Ejercicio {anio_actual}',
            fecha_inicio=date(anio_actual, 1, 1),
            fecha_fin=date(anio_actual, 12, 31),
            cerrado=False
        )
        self.stdout.write(self.style.SUCCESS(f'[OK] Ejercicio contable {anio_actual} creado'))

        # 8. VENTAS (Creating sales AND accounting entries)
        fecha_inicio = datetime.now() - timedelta(days=90)
        for i in range(50):
            fecha = fecha_inicio + timedelta(days=random.randint(0, 90))
            if fecha.year != anio_actual: # Ensure date is within the current fiscal year
                 fecha = fecha.replace(year=anio_actual)
                 
            cliente = random.choice(clientes)
            tipo_cbte = 'A' if cliente.condicion_fiscal == 'RI' else 'B'
            
            venta = Venta.objects.create(
                cliente=cliente,
                fecha=fecha,
                tipo_comprobante=tipo_cbte,
                estado='Emitida',
                total=Decimal(0)
            )
            
            # Agregar productos a la venta
            num_productos = random.randint(1, 5)
            total_venta = Decimal(0)
            for _ in range(num_productos):
                producto = random.choice(productos)
                cantidad = random.randint(1, 3)
                precio = producto.precio_efectivo
                subtotal = precio * cantidad
                
                DetalleVenta.objects.create(
                    venta=venta,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=precio,
                    subtotal=subtotal
                )
                total_venta += subtotal
            
            venta.total = total_venta
            venta.save()
            
            # GENERATE ACCOUNTING ENTRY
            try:
                AccountingService.registrar_venta(venta)
                # Note: registrar_venta uses today's date or venta.fecha.date() to find Ejercicio
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating accounting for sale {venta.id}: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Venta.objects.count()} ventas creadas (y asientos contabilizados)'))
        
        # 9. PEDIDOS
        estados_pedido = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'FACTURADO']
        for i in range(30):
            fecha = fecha_inicio + timedelta(days=random.randint(0, 90))
            cliente = random.choice(clientes)
            
            pedido = Pedido.objects.create(
                cliente=cliente,
                fecha=fecha,
                estado=random.choice(estados_pedido),
                observaciones=f'Pedido #{i+1}',
                total=Decimal(0)
            )
            
            num_productos = random.randint(1, 4)
            total_pedido = Decimal(0)
            for _ in range(num_productos):
                producto = random.choice(productos)
                cantidad = random.randint(1, 5)
                precio = producto.precio_efectivo
                subtotal = precio * cantidad
                
                DetallePedido.objects.create(
                    pedido=pedido,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=precio,
                    subtotal=subtotal
                )
                total_pedido += subtotal
            
            pedido.total = total_pedido
            pedido.save()
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {Pedido.objects.count()} pedidos creados'))
        
        # 10. MOVIMIENTOS DE CAJA
        tipos_mov = ['Ingreso', 'Egreso']
        for i in range(40):
            fecha = fecha_inicio + timedelta(days=random.randint(0, 90))
            if fecha.year != anio_actual: fecha = fecha.replace(year=anio_actual)

            tipo = random.choice(tipos_mov)
            monto = Decimal(random.randint(1000, 50000))
            
            MovimientoCaja.objects.create(
                tipo=tipo,
                descripcion=f'{tipo} #{i+1}',
                monto=monto if tipo == 'Ingreso' else -monto,
                fecha=fecha
            )
        
        self.stdout.write(self.style.SUCCESS(f'[OK] {MovimientoCaja.objects.count()} movimientos de caja creados'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('BASE DE DATOS POBLADA EXITOSAMENTE'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(self.style.SUCCESS(f'Provincias: {Provincia.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Localidades: {Localidad.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Marcas: {Marca.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Rubros: {Rubro.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Proveedores: {Proveedor.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Clientes: {Cliente.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Productos: {Producto.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Ventas: {Venta.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Asientos: {Asiento.objects.count()}'))
