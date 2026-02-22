
import json
from decimal import Decimal
import datetime
from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    Cliente, Producto, Venta, DetalleVenta, 
    CajaDiaria, MovimientoCaja, Marca, Rubro, 
    Proveedor, Compra, DetalleCompra, 
    MovimientoCuentaCorriente, PlanCuenta, EjercicioContable, Asiento,
    Cheque, Recibo, ItemRecibo, Pedido, DetallePedido, Presupuesto, DetallePresupuesto,
    PerfilUsuario
)
from .services import AccountingService

class DeepSystemTest(TestCase):
    def setUp(self):
        # 1. Setup User and Permissions
        self.user = User.objects.create_superuser(username='admin', password='password123', email='admin@test.com')
        self.client.login(username='admin', password='password123')

        # 2. Setup Accounting Structure (Required for AccountingService)
        self.ejercicio = EjercicioContable.objects.create(
            descripcion="Ejercicio 2026",
            fecha_inicio="2026-01-01",
            fecha_fin="2026-12-31",
            cerrado=False
        )

        # Create mandatory accounts
        PlanCuenta.objects.create(codigo="1.1.01", nombre="Activo Disponible", tipo="ACTIVO", imputable=False)
        self.cta_caja = PlanCuenta.objects.create(codigo="1.1.01.001", nombre="Caja en Pesos", tipo="ACTIVO", imputable=True)
        self.cta_deudores = PlanCuenta.objects.create(codigo="1.1.02.001", nombre="Deudores por Ventas", tipo="ACTIVO", imputable=True)
        self.cta_mercaderias = PlanCuenta.objects.create(codigo="1.1.03.001", nombre="Mercader", tipo="ACTIVO", imputable=True)
        self.cta_ventas = PlanCuenta.objects.create(codigo="4.1.01.001", nombre="Ventas", tipo="R_POS", imputable=True)
        self.cta_iva_debito = PlanCuenta.objects.create(codigo="2.1.02.001", nombre="IVA Débito Fiscal", tipo="PASIVO", imputable=True)
        self.cta_iva_credito = PlanCuenta.objects.create(codigo="1.1.04.001", nombre="IVA Crédito Fiscal", tipo="ACTIVO", imputable=True)
        self.cta_proveedores = PlanCuenta.objects.create(codigo="2.1.01.001", nombre="Proveedores", tipo="PASIVO", imputable=True)
        self.cta_cmv = PlanCuenta.objects.create(codigo="5.1.01", nombre="Costo de Mercaderías Vendidas", tipo="R_NEG", imputable=True)

        # 3. Setup Basic Business Data
        self.marca = Marca.objects.create(nombre="Tecno")
        self.rubro = Rubro.objects.create(nombre="Informatica")
        
        # Product with Cost 500, Price 1000
        self.producto = Producto.objects.create(
            codigo="LAPTOP01",
            descripcion="Notebook Pro",
            marca=self.marca,
            rubro=self.rubro,
            stock=10,
            costo=Decimal("500.00"),
            precio_efectivo=Decimal("1000.00"),
            precio_tarjeta=Decimal("1100.00"),
            precio_ctacte=Decimal("1200.00")
        )
        
        self.cliente = Cliente.objects.create(
            nombre="Juan Perez",
            cuit="20-30405060-7",
            condicion_fiscal="RI",
            tiene_ctacte=True,
            limite_credito=Decimal("10000.00")
        )

    def test_completo_flujo_negocio(self):
        """1. Venta -> Cta Cte -> Cobro -> Caja"""
        caja = CajaDiaria.objects.create(usuario=self.user, monto_apertura=Decimal("5000.00"), estado='ABIERTA')
        
        cantidad = Decimal("2")
        precio = Decimal(str(self.producto.precio_ctacte))
        total = cantidad * precio
        
        venta = Venta.objects.create(cliente=self.cliente, tipo_comprobante='A', neto=total/Decimal("1.21"), iva_amount=total-(total/Decimal("1.21")), total=total, medio_pago='CTACTE')
        DetalleVenta.objects.create(venta=venta, producto=self.producto, cantidad=cantidad, precio_unitario=precio, subtotal=total)
        
        self.producto.stock -= int(cantidad)
        self.producto.save()
        
        self.cliente.saldo_actual += total
        self.cliente.save()
        
        AccountingService.registrar_venta(venta)
        
        self.assertEqual(self.producto.stock, 8)
        self.assertEqual(self.cliente.saldo_actual, Decimal("2400.00"))

    def test_compra_y_proveedor(self):
        """2. Compra -> Stock -> Deuda Proveedor"""
        proveedor = Proveedor.objects.create(nombre="Distribuidora S.A.")
        cantidad = Decimal("5")
        precio_costo = Decimal("500.00")
        total = cantidad * precio_costo
        
        compra = Compra.objects.create(proveedor=proveedor, total=total, estado="REGISTRADA")
        DetalleCompra.objects.create(compra=compra, producto=self.producto, cantidad=cantidad, precio=precio_costo, subtotal=total)
        
        self.producto.stock += int(cantidad)
        self.producto.save()
        proveedor.saldo_actual += total
        proveedor.save()
        
        AccountingService.registrar_compra(compra)
        
        self.assertEqual(self.producto.stock, 15)
        self.assertEqual(proveedor.saldo_actual, Decimal("2500.00"))

    def test_ciclo_cheques(self):
        """3. Lifecycle: Portfolio -> Deposited -> Rejected -> Cleared"""
        cheque = Cheque.objects.create(numero="CHQ-001", banco="BN", fecha_emision=timezone.now().date(), fecha_pago=timezone.now().date(), monto=Decimal("15000.00"), cliente=self.cliente, estado='CARTERA')
        self.assertEqual(cheque.estado, 'CARTERA')
        cheque.estado = 'DEPOSITADO'; cheque.save()
        cheque.estado = 'RECHAZADO'; cheque.save()
        self.assertEqual(cheque.estado, 'RECHAZADO')
        cheque.estado = 'COBRADO'; cheque.save()
        self.assertEqual(cheque.estado, 'COBRADO')

    def test_permisos_usuario(self):
        """4. Security: Block Unauthorized API Access"""
        user_limite = User.objects.create_user(username='vendedor_limitado', password='password123')
        PerfilUsuario.objects.create(user=user_limite, acceso_reportes=False) # Access denied to reports
        
        factory = RequestFactory()
        from .views_reportes import api_reportes_generar
        request = factory.get('/api/reportes/generar/', {'id': 'v_diarias'})
        request.user = user_limite
        
        response = api_reportes_generar(request)
        self.assertEqual(response.status_code, 403)

    def test_presupuesto_a_pedido_a_factura(self):
        """5. Workflow Conversion: Budget -> Order -> Invoice"""
        presupuesto = Presupuesto.objects.create(cliente=self.cliente, total=Decimal("2000.00"), estado='PENDIENTE')
        DetallePresupuesto.objects.create(presupuesto=presupuesto, producto=self.producto, cantidad=Decimal("2"), precio_unitario=Decimal("1000.00"), subtotal=Decimal("2000.00"))

        from .views import api_presupuesto_convertir_a_pedido, api_pedido_facturar
        factory = RequestFactory()
        
        # 1. Budget to Order
        req1 = factory.post(f'/api/presupuestos/{presupuesto.id}/convertir/'); req1.user = self.user
        res1 = json.loads(api_presupuesto_convertir_a_pedido(req1, presupuesto.id).content)
        self.assertTrue(res1['ok'])
        pedido = Pedido.objects.get(id=res1['pedido_id'])
        
        # 2. Order to Invoice
        req2 = factory.post(f'/api/pedidos/{pedido.id}/facturar/'); req2.user = self.user
        res2 = json.loads(api_pedido_facturar(req2, pedido.id).content)
        self.assertTrue(res2['ok'])
        
        venta = Venta.objects.latest('id')
        self.assertEqual(venta.total, Decimal("2000.00"))
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 8)

    def test_reportes_y_estadisticas(self):
        """6. Dashboards: Data Consistency"""
        Venta.objects.create(cliente=self.cliente, total=Decimal("1000.00"), medio_pago='EFECTIVO', neto=Decimal("826.45"), iva_amount=Decimal("173.55"))
        from .views_reportes import api_reportes_generar
        factory = RequestFactory()
        request = factory.get('/api/reportes/generar/', {'id': 'v_diarias'}); request.user = self.user
        res_data = json.loads(api_reportes_generar(request).content)
        self.assertTrue(res_data['ok'])
        self.assertEqual(res_data['data'][0]['Total'], 1000.00)

    def test_integridad_iva_y_totales(self):
        """7. Math Integrity"""
        total_venta = Decimal("1500.00")
        neto = (total_venta / Decimal("1.21")).quantize(Decimal("0.01"))
        iva = (total_venta - neto).quantize(Decimal("0.01"))
        self.assertEqual(neto + iva, total_venta)
        self.assertEqual(Decimal(str(self.producto.precio_ctacte)) - Decimal(str(self.producto.costo)), Decimal("700.00"))
