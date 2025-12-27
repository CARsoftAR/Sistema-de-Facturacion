import json
from django.test import TestCase, Client
from django.urls import reverse
from .models import Cliente, Producto, Venta, DetalleVenta, MovimientoCaja, Marca, Rubro

class VentaTestCase(TestCase):
    def setUp(self):
        # Setup basic data
        self.marca = Marca.objects.create(nombre="Marca Test")
        self.rubro = Rubro.objects.create(nombre="Rubro Test")
        
        self.producto = Producto.objects.create(
            codigo="PROD001",
            descripcion="Producto Test",
            marca=self.marca,
            rubro=self.rubro,
            stock=100,
            precio_efectivo=100.00,
            precio_tarjeta=110.00,
            precio_ctacte=120.00
        )
        
        self.cliente = Cliente.objects.create(
            nombre="Cliente Test",
            cuit="20123456789",
            condicion_fiscal="CF"
        )
        
        self.url = reverse('venta_guardar')

    def test_venta_efectivo_descuenta_stock_y_caja(self):
        """
        Test que verifica:
        1. Creación de Venta y Detalle.
        2. Descuento de Stock.
        3. Ingreso en Caja.
        """
        items = [
            {
                "id": self.producto.id,
                "cantidad": 10,
                "precio": 100.00,
                "subtotal": 1000.00
            }
        ]
        
        data = {
            "cliente_id": self.cliente.id,
            "items_json": json.dumps(items),
            "total_general": 1000.00,
            "medio_pago": "EFECTIVO",
            "monto_pago": 1000.00
        }
        
        # Ejecutar POST
        response = self.client.post(self.url, data)
        
        # Verificar redirección (éxito)
        self.assertEqual(response.status_code, 302)
        
        # 1. Verificar Venta
        self.assertEqual(Venta.objects.count(), 1)
        venta = Venta.objects.first()
        self.assertEqual(venta.total, 1000.00)
        self.assertEqual(venta.cliente, self.cliente)
        
        # 2. Verificar Detalle
        self.assertEqual(DetalleVenta.objects.count(), 1)
        detalle = DetalleVenta.objects.first()
        self.assertEqual(detalle.producto, self.producto)
        self.assertEqual(detalle.cantidad, 10)
        
        # 3. Verificar Stock
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 90) # 100 - 10
        
        # 4. Verificar Caja
        self.assertEqual(MovimientoCaja.objects.count(), 1)
        caja = MovimientoCaja.objects.first()
        self.assertEqual(caja.monto, 1000.00)
        self.assertEqual(caja.tipo, "Ingreso")

    def test_venta_sin_stock_suficiente(self):
        """
        Verificar que la venta falla si no hay stock suficiente.
        """
        items = [
            {
                "id": self.producto.id,
                "cantidad": 200, # Más que el stock (100)
                "precio": 100.00,
                "subtotal": 20000.00
            }
        ]
        
        data = {
            "cliente_id": self.cliente.id,
            "items_json": json.dumps(items),
            "total_general": 20000.00,
            "medio_pago": "EFECTIVO"
        }
        
        # Ejecutar POST
        self.client.post(self.url, data)
        
        # Verificar que NO se creó la venta
        self.assertEqual(Venta.objects.count(), 0)
        
        # Verificar que el stock NO cambió
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 100)
