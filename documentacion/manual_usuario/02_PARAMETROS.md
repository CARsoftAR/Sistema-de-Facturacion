# Capítulo 02: Parámetros y Configuración ⚙️

Antes de empezar a vender, es vital que el sistema sepa quién eres y cómo quieres trabajar. Los **Parámetros** definen el comportamiento global del software.

## 1. Datos de la Empresa
En la sección de "Mi Empresa", debes configurar tus datos básicos. 

![Configuración de Datos de la Empresa y Logo](/static/manual/empresa_preview.png)

*   **Razón Social y CUIT:** Esenciales para que las facturas sean legales.
*   **Condición ante el IVA:** Responsable Inscripto, Monotributista o IVA Exento. Esto define qué tipo de facturas (A, B o C) emitirá el sistema.
*   **Logo:** Sube tu logo en alta resolución para que aparezca en tus facturas PDF y presupuestos.

## 2. Configuración de Puntos de Venta
El sistema puede manejar múltiples "sucursales" o computadoras facturando. Aquí activas la facturación electrónica.

![Gestión de Puntos de Venta y Certificados AFIP](/static/manual/puntos_venta_preview.png)

*   **Punto de Venta AFIP:** Es el número (ej: 00001) que te asigna AFIP para facturar electrónicamente.
*   **Certificados Digitales:** Aquí se cargan los archivos `.key` y `.crt` obtenidos de la web de AFIP. Sin esto, el sistema no podrá obtener el CAE.

## 3. Preferencias de Operación
Aquí puedes personalizar cómo funciona el sistema para que se adapte a tu forma de trabajo.

![Opciones de Configuración y Preferencias Globales](/static/manual/preferencias_preview.png)

*   **Redondeo de Precios:** Configura si quieres que los precios terminen en .00 para evitar el manejo de monedas pequeñas.
*   **Actualización de Precios:** Activa o desactiva la subida automática de precios cuando cargues una compra con nuevo costo.
*   **Alertas de Stock:** Define si el sistema debe bloquear una venta si no hay stock, o si solo debe avisar.

## 4. Usuarios y Permisos
Seguridad ante todo. Crea cuentas individuales para cada empleado y define qué pueden hacer.

![Administración de Usuarios y Perfiles de Acceso](/static/manual/usuarios_preview.png)

*   **Cajero:** Solo ventas y caja. No ve costos ni utilidad.
*   **Stock:** Solo carga de facturas de compra y conteo de mercadería.
*   **Administrador:** Acceso total a configuración y reportes contables.

## 💡 Consejos para Principiantes
*   **Primer paso:** Lo primero que debes hacer al recibir el sistema es verificar que tu CUIT y condición de IVA sean correctos.
*   **Backups:** Verifica en la sección de "Backups" que la **Ruta de Backups Locales** sea correcta. El sistema guardará las copias de seguridad únicamente en la carpeta que tú le asignes.
*   **Seguridad:** Nunca compartas tu contraseña de Administrador. Si necesitas ayuda técnica, crea un usuario temporal.
