import json
from decimal import Decimal
from datetime import date
from django.test import TestCase, Client
from django.urls import reverse
from .models import Cliente, Producto, Venta, MovimientoCaja, MovimientoCuentaCorriente, Cheque, Asiento, PlanCuenta, EjercicioContable

class VentaPagosTestCase(TestCase):
    def setUp(self):
        # 1. Setup básico
        self.cliente = Cliente.objects.create(nombre="Cliente Test", condicion_fiscal="CF")
        self.producto = Producto.objects.create(
            codigo="P1", descripcion="Producto 1", precio_efectivo=1000, 
            precio_tarjeta=1100, precio_ctacte=1200, stock=100
        )
        
        # 2. Setup Contable (Ejercicio y Cuentas)
        self.ejercicio = EjercicioContable.objects.create(
            descripcion="2025", fecha_inicio=date(2025,1,1), fecha_fin=date(2025,12,31)
        )
        
        # Cuentas necesarias
        self.cta_caja = PlanCuenta.objects.create(codigo="1.1.01.001", nombre="Caja en Pesos", tipo="ACTIVO")
        self.cta_deudores = PlanCuenta.objects.create(codigo="1.1.03.001", nombre="Deudores por Ventas", tipo="ACTIVO")
        self.cta_valores = PlanCuenta.objects.create(codigo="1.1.03.004", nombre="Valores a Depositar", tipo="ACTIVO")
        self.cta_tarjetas = PlanCuenta.objects.create(codigo="1.1.03.003", nombre="Tarjetas a Cobrar", tipo="ACTIVO")
        self.cta_comisiones = PlanCuenta.objects.create(codigo="5.1.02.005", nombre="Comisiones Tarjeta", tipo="R_NEG")
        
        self.cta_ventas = PlanCuenta.objects.create(codigo="4.1.01.001", nombre="Ventas", tipo="R_POS")
        self.cta_iva = PlanCuenta.objects.create(codigo="2.1.02.001", nombre="IVA Debito Fiscal", tipo="PASIVO")
        self.cta_cmv = PlanCuenta.objects.create(codigo="5.1.01", nombre="Costo Mercaderias", tipo="R_NEG")
        self.cta_mercaderias = PlanCuenta.objects.create(codigo="1.1.04.001", nombre="Mercaderias", tipo="ACTIVO") # Reusing code but logic matches
        
        self.url = reverse('api_venta_guardar')

    def test_venta_efectivo(self):
        """Venta efectivo debe generar asiento Caja y Deudores"""
        data = {
            "cliente_id": self.cliente.id,
            "items": [{"id": self.producto.id, "cantidad": 1, "precio": 1000, "subtotal": 1000}],
            "total_general": 1000,
            "medio_pago": "EFECTIVO"
        }
        
        response = self.client.post(self.url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        
        # Verificar Asiento Cobro
        asiento = Asiento.objects.filter(descripcion__contains="Cobro Venta", origen="COBROS").last()
        self.assertIsNotNone(asiento)
        
        # Debe haber Caja (D) y Deudores (H)
        item_caja = asiento.items.filter(cuenta__nombre="Caja en Pesos").first()
        item_deudores = asiento.items.filter(cuenta__nombre="Deudores por Ventas").first()
        
        self.assertEqual(item_caja.debe, 1000)
        self.assertEqual(item_deudores.haber, 1000)

    def test_venta_tarjeta(self):
        """Venta tarjeta debe generar asiento Tarjetas a Cobrar y Comisiones"""
        data = {
            "cliente_id": self.cliente.id,
            "items": [{"id": self.producto.id, "cantidad": 1, "precio": 1000, "subtotal": 1000}],
            "total_general": 1000,
            "medio_pago": "TARJETA"
        }
        
        response = self.client.post(self.url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        
        # Verificar Asiento Cobro
        asiento = Asiento.objects.filter(descripcion__contains="Cobro Tarjeta", origen="COBROS").last()
        self.assertIsNotNone(asiento)
        
        # Debe haber Tarjetas (D), Comisiones (D) y Deudores (H)
        item_tarjeta = asiento.items.filter(cuenta__nombre="Tarjetas a Cobrar").first()
        item_comision = asiento.items.filter(cuenta__nombre="Comisiones Tarjeta").first()
        item_deudores = asiento.items.filter(cuenta__nombre="Deudores por Ventas").first()
        
        # Comisión 3% de 1000 = 30
        self.assertEqual(item_comision.debe, 30)
        self.assertEqual(item_tarjeta.debe, 970) # 1000 - 30
        self.assertEqual(item_deudores.haber, 1000)

    def test_venta_cheque(self):
        """Venta cheque debe crear Cheque y asiento Valores a Depositar"""
        data = {
            "cliente_id": self.cliente.id,
            "items": [{"id": self.producto.id, "cantidad": 1, "precio": 1000, "subtotal": 1000}],
            "total_general": 1000,
            "medio_pago": "CHEQUE",
            "cheque": {
                "numero": "CH-123",
                "banco": "Banco Test",
                "fecha_pago": "2025-02-01"
            }
        }
        
        response = self.client.post(self.url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        
        # 1. Verificar Cheque creado
        cheque = Cheque.objects.filter(numero="CH-123").first()
        self.assertIsNotNone(cheque)
        self.assertEqual(cheque.estado, "CARTERA")
        
        # 2. Verificar Asiento
        asiento = Asiento.objects.filter(descripcion__contains="Cobro Cheque", origen="COBROS").last()
        self.assertIsNotNone(asiento)
        
        item_valores = asiento.items.filter(cuenta__nombre="Valores a Depositar").first()
        self.assertEqual(item_valores.debe, 1000)

    def test_venta_ctacte(self):
        """Venta Cta Cte NO debe generar asiento de cobro inmediato"""
        data = {
            "cliente_id": self.cliente.id,
            "items": [{"id": self.producto.id, "cantidad": 1, "precio": 1000, "subtotal": 1000}],
            "total_general": 1000,
            "medio_pago": "CTACTE"
        }
        
        response = self.client.post(self.url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        
        # Verificar que NO hay asiento de cobro asociado a esta venta
        # Solo debe estar el asiento de la VENTA en sí
        asientos = Asiento.objects.filter(fecha=date.today())
        # Debería haber 1 (La Venta), no 2 (Venta + Cobro)
        # Nota: setUp crea cuentas pero no asientos.
        # Filter by description to be sure
        asiento_cobro = Asiento.objects.filter(descripcion__contains="Cobro", origen="COBROS").last()
        self.assertIsNone(asiento_cobro)
        
        # Verificar Movimiento Cta Cte
        mov = MovimientoCuentaCorriente.objects.last()
        self.assertEqual(mov.monto, 1000)
