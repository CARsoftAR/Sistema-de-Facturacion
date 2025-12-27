import random
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.core.files.base import ContentFile
from administrar.models import (
    Empresa, Rubro, Marca, Provincia, Localidad, Cliente, Proveedor,
    Producto, MovimientoStock, Venta, DetalleVenta, MovimientoCaja,
    Remito, DetalleRemito, NotaCredito, DetalleNotaCredito,
    OrdenCompra, DetalleOrdenCompra, Compra, DetalleCompra, Pedido, DetallePedido
)

def populate():
    print("WARNING: This will delete ALL data in 'administrar'. Press Ctrl+C to cancel in 5 seconds...")
    # import time; time.sleep(5)
    
    with transaction.atomic():
        print("Cleaning database...")
        DetalleRemito.objects.all().delete()
        Remito.objects.all().delete()
        DetalleNotaCredito.objects.all().delete()
        NotaCredito.objects.all().delete()
        DetalleVenta.objects.all().delete()
        Venta.objects.all().delete()
        DetallePedido.objects.all().delete()
        Pedido.objects.all().delete()
        MovimientoStock.objects.all().delete()
        MovimientoCaja.objects.all().delete()
        DetalleCompra.objects.all().delete()
        Compra.objects.all().delete()
        DetalleOrdenCompra.objects.all().delete()
        OrdenCompra.objects.all().delete()
        Producto.objects.all().delete()
        Cliente.objects.all().delete()
        Proveedor.objects.all().delete()
        Marca.objects.all().delete()
        Rubro.objects.all().delete()
        Empresa.objects.all().delete()
        Localidad.objects.all().delete()
        Provincia.objects.all().delete()
        
        print("Creating Base Data...")
        
        # --- PROVINCIAS & LOCALIDADES ---
        p_ba = Provincia.objects.create(nombre="Buenos Aires")
        p_caba = Provincia.objects.create(nombre="CABA")
        p_cba = Provincia.objects.create(nombre="Cordoba")
        
        loc_beraza = Localidad.objects.create(nombre="Berazategui", codigo_postal="1884")
        loc_quilmes = Localidad.objects.create(nombre="Quilmes", codigo_postal="1878")
        loc_laplata = Localidad.objects.create(nombre="La Plata", codigo_postal="1900")
        loc_palermo = Localidad.objects.create(nombre="Palermo", codigo_postal="1414")
        
        # --- EMPRESA ---
        Empresa.objects.create(
            nombre="ABBAMAT S.A.",
            cuit="30-71118008-3",
            direccion="Calle 13 (Belgrano) N 4334 Berazategui (1884) Bs. As.",
            iibb="30711180083",
            inicio_actividades=timezone.now().date() - timedelta(days=365*10),
            telefono="(+54) 11 4256-1776",
            email="info@abbamat.com.ar",
            condicion_fiscal="RI",
            tipo_facturacion="MANUAL", # Simpler for testing
            punto_venta="0005"
        )
        
        # --- RUBROS & MARCAS ---
        r_ferreteria = Rubro.objects.create(nombre="Ferreteria", descripcion="Herramientas y materiales generales")
        r_sanitarios = Rubro.objects.create(nombre="Sanitarios", descripcion="Caos y griferia")
        r_elec = Rubro.objects.create(nombre="Electricidad", descripcion="Cables y componentes")
        
        m_bosch = Marca.objects.create(nombre="Bosch")
        m_stanley = Marca.objects.create(nombre="Stanley")
        m_tigre = Marca.objects.create(nombre="Tigre")
        m_abb = Marca.objects.create(nombre="ABB")
        
        # --- PROVEEDORES ---
        prov_bosch = Proveedor.objects.create(
            nombre="Robert Bosch Argentina",
            cuit="30-50000000-1",
            direccion="Blanco Encalada 250",
            localidad=loc_palermo,
            provincia=p_caba,
            email="ventas@bosch.com"
        )
        prov_distri = Proveedor.objects.create(
            nombre="Distribuidora El Tornillo",
            cuit="30-60000000-2",
            direccion="Av. Calchaqui 1500",
            localidad=loc_quilmes,
            provincia=p_ba,
            email="pedidos@eltornillo.com"
        )

        # --- CLIENTES ---
        c_final = Cliente.objects.create(
            nombre="Juan Perez",
            tipo_cliente="P",
            condicion_fiscal="CF",
            domicilio="Calle 14 N 123",
            localidad=loc_beraza,
            provincia=p_ba,
            telefono="11-2222-3333"
        )
        
        c_empresa = Cliente.objects.create(
            nombre="DELTA COMPRESION S.R.L.",
            tipo_cliente="E",
            cuit="30-63831847-0",
            condicion_fiscal="RI",
            domicilio="Benito Lynch 500",
            localidad=loc_laplata,
            provincia=p_ba,
            telefono="0221-444-5555",
            tiene_ctacte=True,
            limite_credito=1000000,
            saldo_actual=0
        )
        
        # --- PRODUCTOS ---
        productos = []
        
        # 1. Tuerca
        p1 = Producto.objects.create(
            codigo="1001",
            descripcion="Tuerca Hexagonal 1/4",
            rubro=r_ferreteria,
            marca=m_stanley,
            tipo_bulto="UN",
            costo=10.00,
            precio_efectivo=20.00,
            precio_tarjeta=25.00,
            precio_ctacte=22.00,
            stock=1000,
            stock_inicial=1000,
            stock_minimo=100
        )
        productos.append(p1)
        
        # 2. Taladro
        p2 = Producto.objects.create(
            codigo="2005",
            descripcion="Taladro Percutor 600W",
            rubro=r_ferreteria,
            marca=m_bosch,
            tipo_bulto="CJ",
            costo=50000.00,
            precio_efectivo=80000.00,
            precio_tarjeta=95000.00,
            precio_ctacte=85000.00,
            stock=20,
            stock_inicial=20,
            stock_minimo=5
        )
        productos.append(p2)
        
        # 3. Cao
        p3 = Producto.objects.create(
            codigo="3020",
            descripcion="Tubo PVC 110mm x 4m",
            rubro=r_sanitarios,
            marca=m_tigre,
            tipo_bulto="MT",
            costo=5000.00,
            precio_efectivo=9000.00,
            precio_tarjeta=11000.00,
            precio_ctacte=9500.00,
            stock=50,
            stock_inicial=50
        )
        productos.append(p3)

        # 4. Item from Image
        p4 = Producto.objects.create(
            codigo="TBRAC188000CBR01",
            descripcion="BRIDA ROSCADA H M27X2 C/ ORING",
            descripcion_larga="Brida especial de alta presion",
            rubro=r_sanitarios,
            marca=m_stanley,
            tipo_bulto="UN",
            costo=15000.00,
            precio_efectivo=25000.00,
            precio_tarjeta=30000.00,
            precio_ctacte=28000.00,
            stock=100,
            stock_inicial=100
        )
        productos.append(p4)

        print("Populating Transactions...")
        
        # --- SCENARIO 1: Simple Sale Receipt (Factura B) ---
        # User walks in, buys a drill, pays cash.
        venta1 = Venta.objects.create(
            cliente=c_final,
            tipo_comprobante="B",
            total=80000.00,
            estado="Emitida"
        )
        DetalleVenta.objects.create(
            venta=venta1,
            producto=p2,
            cantidad=1,
            precio_unitario=80000.00,
            subtotal=80000.00
        )
        # Stock movement
        p2.stock -= 1
        p2.save()
        MovimientoStock.objects.create(producto=p2, tipo='OUT', cantidad=1, referencia=f'Venta {venta1.id}', observaciones="Venta mostrador")
        # Cash movement
        MovimientoCaja.objects.create(tipo='Ingreso', descripcion=f'Cobro Venta {venta1.id} - {c_final.nombre}', monto=80000.00)

        # --- SCENARIO 2: B2B Sale + Remito (Factura A) ---
        # Delta buys 80 Bridas.
        qty_bridas = 80
        price_bridas = p4.precio_ctacte # 28000
        total_bridas = qty_bridas * price_bridas # 2,240,000
        
        venta2 = Venta.objects.create(
            cliente=c_empresa,
            tipo_comprobante="A",
            total=total_bridas,
            estado="Emitida"
        )
        DetalleVenta.objects.create(
            venta=venta2,
            producto=p4,
            cantidad=qty_bridas,
            precio_unitario=price_bridas,
            subtotal=total_bridas
        )
        # Stock impact
        p4.stock -= qty_bridas
        p4.save()
        MovimientoStock.objects.create(producto=p4, tipo='OUT', cantidad=qty_bridas, referencia=f'Venta {venta2.id}', observaciones="Venta Mayorista")
        
        # Remito Generation (based on user image)
        remito1 = Remito.objects.create(
            cliente=c_empresa,
            venta_asociada=venta2,
            direccion_entrega="Benito Lynch 500",
            estado="ENTREGADO",
            # New Fields
            proyecto="25-096",
            orden_compra="200000231",
            pedido_interno="INT-999",
            transportista="Transportes El Rapido",
            cuit_transportista="30-11223344-5",
            ocm="OCM-123",
            maq="MAQ-55",
            material="Acero Inox",
            alcance="Nacional",
            denominacion="Vlvula Control",
        )
        DetalleRemito.objects.create(
            remito=remito1,
            producto=p4,
            cantidad=qty_bridas
        )

        # --- SCENARIO 3: Return (Nota Credito) ---
        # Delta returns 5 Bridas because they were defective.
        nc = NotaCredito.objects.create(
            cliente=c_empresa,
            venta_asociada=venta2,
            tipo_comprobante="NCA",
            total=5 * price_bridas,
            motivo="Devolucion por falla",
            estado="EMITIDA",
            punto_venta="0005"
        )
        DetalleNotaCredito.objects.create(
            nota_credito=nc,
            producto=p4,
            cantidad=5,
            precio_unitario=price_bridas,
            subtotal=5 * price_bridas
        )
        # Stock Return
        p4.stock += 5
        p4.save()
        MovimientoStock.objects.create(producto=p4, tipo='IN', cantidad=5, referencia=f'NC {nc.id}', observaciones="Devolucion Falla")
        
        # --- SCENARIO 4: Purchase Order ---
        oc = OrdenCompra.objects.create(
            proveedor=prov_bosch,
            estado="PENDIENTE",
            total_estimado=1000000.00
        )
        DetalleOrdenCompra.objects.create(
            orden=oc,
            producto=p2,
            cantidad=10,
            precio=50000.00,
            subtotal=500000.00
        )
        
        # --- SCENARIO 5: Pedido ---
        pedido = Pedido.objects.create(
            cliente=c_final,
            estado="PENDIENTE",
            total=p1.precio_efectivo * 50
        )
        DetallePedido.objects.create(
            pedido=pedido,
            producto=p1,
            cantidad=50,
            precio_unitario=p1.precio_efectivo,
            subtotal=p1.precio_efectivo * 50
        )

        print("Database population completed successfully!")

if __name__ == "__main__":
    populate()
