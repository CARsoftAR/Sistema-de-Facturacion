# Capítulo 06: Compras y Recepción 🚚

El módulo de **Compras** te permite gestionar el abastecimiento de mercadería, controlar lo que le debes a tus proveedores y mantener tus costos actualizados.

## 1. El Ciclo de Compra

Existen dos formas principales de cargar una compra en el sistema:

### A. La Orden de Compra (Pedido al Proveedor)
Se utiliza cuando quieres dejar registrado qué le pediste al proveedor pero la mercadería aún no llegó.
* **Estado PENDIENTE:** No afecta el stock ni la contabilidad.
* Sirve para controlar que, cuando llegue el camión, te traigan exactamente lo pedido.

### B. La Compra Directa (Recepción)
Se utiliza cuando ya tienes la factura del proveedor y la mercadería frente a ti.
* Se activa encendiendo el botón **"RECIBIR AHORA ON"** en la pantalla de compra.
* Al confirmar, el sistema asume que la mercadería ya entró al depósito.

## 2. Impacto Lógico al Confirmar una Compra

Cuando marcas una compra como **Recibida** (o confirmas con "Recibir Ahora"), ocurren 3 cosas críticas:

1.  **Ingreso de Stock:** Las cantidades cargadas se suman a tu inventario.
2.  **Actualización de Costos:** El sistema toma el precio que pagaste y actualiza el **Costo** del producto en su ficha. 
    * *Tip:* Si tienes activada la configuración de "Actualización Automática de Precios", el sistema subirá tus precios de venta para mantener tu margen de ganancia si el costo subió.
3.  **Contabilidad:** Genera el asiento de compra (Mercadería + IVA a Proveedores/Caja).

## 3. Formas de Pago a Proveedores

| Medio | Impacto en tu Negocio |
| :--- | :--- |
| **Efectivo** | Sale dinero de tu **Caja Diaria**. Baja tu disponibilidad. |
| **Cta. Cte.** | No sale dinero hoy. Se genera una deuda con el proveedor que verás en el módulo de **Cuentas Corrientes**. |
| **Cheque Propio** | Registra la entrega de un cheque de tu chequera. Deberás conciliarlo luego con el banco. |
| **Cheque de Tercero** | Endosas un cheque que te dio un cliente y se lo entregas al proveedor. Sale de tu cartera de valores. |

## 💡 Consejos para Principiantes
* **Nro. de Comprobante:** Asegúrate de cargar el número de factura real del proveedor para poder buscarla fácilmente si hay un reclamo.
* **IVA:** Verifica si el precio que cargas es "Neto" o "Final". Puedes usar el botón **IVA ON/OFF** para que el sistema haga los cálculos por ti.
* **Proveedores Nuevos:** Puedes crear un proveedor "al vuelo" si aún no lo tienes cargado, para no interrumpir el proceso de compra.
