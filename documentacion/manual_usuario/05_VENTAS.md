# Capítulo 05: Ventas y Facturación 🧾

El módulo de **Ventas** es el motor de tu negocio. Aquí registras la salida de mercadería y el ingreso de dinero, cumpliendo con las normativas fiscales de AFIP de forma automática.

![Interfaz de Nueva Venta - Carga de Items](/static/manual/ventas_preview.png)

## 1. El Proceso de Venta Paso a Paso

### A. Identificación del Cliente
* Al abrir la pantalla, el sistema selecciona por defecto a **Consumidor Final**.
* Si el cliente requiere factura "A" o compra en **Cuenta Corriente**, búscalo por nombre o CUIT.
* El sistema ajustará automáticamente los precios según la lista asignada a ese cliente (Efectivo, Cta. Cte., Mayorista, etc.).

### B. Carga de Productos
* **Lector de Barras:** Simplemente dispara sobre el código y el producto se añade a la lista.
* **Búsqueda Manual:** Escribe el nombre o código en el buscador superior.
* **Cantidades:** Puedes modificar la cantidad directamente en la grilla. El sistema te alertará si el stock es insuficiente (si está configurada la validación).

### C. Facturación Fiscal (AFIP)
* Si el sistema tiene los certificados configurados, al confirmar se solicitará el CAE (Código de Autorización Electrónico) automáticamente.
* Puedes elegir emitir **Factura, Ticket o Nota de Venta interna** según la configuración del punto de venta.

## 2. Medios de Pago y su Impacto

Al hacer clic en **"Finalizar Venta"**, se abrirá el modal de pagos. Es crucial elegir el medio correcto:

| Medio de Pago | Impacto Contable e Impositivo | Impacto en Tesorería |
| :--- | :--- | :--- |
| **Efectivo** | Registra Venta e IVA. | Suma dinero a la **Caja Diaria** abierta. |
| **Tarjeta** | Registra Venta e IVA. | Genera un cupón de tarjeta por cobrar (Banco). |
| **Cta. Cte.** | Registra Venta e IVA. | **No entra dinero.** Aumenta la deuda del cliente en su ficha. |
| **Cheque** | Registra Venta e IVA. | El cheque entra a la **Cartera de Valores** (listo para depositar). |

## 3. Impacto Automático "Detrás de Escena"

Cada vez que confirmas una venta, el sistema realiza estas tareas por ti:

1.  **Stock:** Resta las cantidades vendidas de tu inventario en tiempo real.
2.  **Caja:** Si hubo efectivo, actualiza el saldo de tu caja para el arqueo de fin de día.
3.  **Contabilidad:** Genera un **Asiento Contable** automático. No necesitas saber contabilidad; el sistema registra el ingreso (Debe), la venta (Haber), el IVA (Haber) y el costo de la mercadería vendida (CMV).
4.  **Historial:** Registra el movimiento en la ficha del cliente para que sepas qué y cuándo compró por última vez.

## 💡 Consejos para Principiantes
* **F4:** Usa este atajo de teclado para ir rápido al campo de código de barras.
* **Consumidor Final:** Las ventas a consumidor final por montos elevados requieren identificar al cliente según normativa de AFIP; el sistema te avisará si es necesario.
* **Facturas Pendientes:** Si una factura falla por error de AFIP (ej. servidor caído), quedará pendiente para que la re-intentes más tarde sin perder los datos cargados.
