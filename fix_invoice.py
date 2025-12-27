
content = r"""{% load static %}
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura {{ venta.id }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #95a5a6;
            --accent-color: #3498db;
            --text-color: #2c3e50;
            --border-color: #ecf0f1;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            color: var(--text-color);
            background: #525659;
            /* Fondo gris para visualización en pantalla */
        }

        .page {
            background: white;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 20px auto;
            position: relative;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        header {
            margin-bottom: 30px;
        }

        .header-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            align-items: start;
        }

        .company-logo img {
            max-width: 200px;
            max-height: 80px;
        }

        .invoice-title {
            text-align: right;
        }

        .invoice-title h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .invoice-details {
            text-align: right;
            font-size: 11px;
            color: var(--secondary-color);
        }

        /* Info Sections */
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .info-box h3 {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--secondary-color);
            margin-bottom: 8px;
            font-weight: 600;
        }

        .info-box p {
            margin-bottom: 3px;
            line-height: 1.4;
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        th {
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid var(--border-color);
            color: var(--secondary-color);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
        }

        td {
            padding: 12px 10px;
            border-bottom: 1px solid var(--border-color);
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        /* Totals */
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }

        .totals-table {
            width: 300px;
        }

        .totals-table td {
            padding: 8px 10px;
            border: none;
        }

        .totals-table .total-row td {
            border-top: 2px solid var(--primary-color);
            font-weight: 700;
            font-size: 14px;
            padding-top: 15px;
        }

        /* Footer */
        footer {
            position: absolute;
            bottom: 20mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 10px;
        }

        @media print {
            body {
                background: white;
            }

            .page {
                margin: 0;
                box-shadow: none;
                width: auto;
                height: auto;
                page-break-after: always;
            }
        }

        /* Custom Template CSS */
        {{ template.css|safe }}
    </style>
</head>

<body>

    <div class="page">
        <!-- Custom Header HTML -->
        {% if template.header_html %}
        <div class="custom-header mb-4">
            {{ template.header_html|safe }}
        </div>
        {% else %}
        <!-- Default Header -->
        <header>
            <div class="header-grid">
                <div class="company-info">
                    {% if template.logo %}
                    <div class="company-logo mb-3">
                        <img src="{{ template.logo.url }}" alt="Logo">
                    </div>
                    {% endif %}
                    <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 5px;">{{ empresa.nombre }}</h2>
                    <p>{{ empresa.direccion }}</p>
                    <p>CUIT: {{ empresa.cuit }}</p>
                </div>

                <div class="invoice-title">
                    <h1>FACTURA</h1>
                    <div class="invoice-details">
                        <p><strong>N°:</strong> {{ venta.id }}</p>
                        <p><strong>Fecha:</strong> {{ venta.fecha|date:"d/m/Y" }}</p>
                    </div>
                </div>
            </div>

            <!-- Client Info -->
            <div class="info-section">
                <div class="info-box">
                    <h3>Facturar a:</h3>
                    <p><strong>{{ cliente.nombre }}</strong></p>
                    <p>{{ cliente.domicilio }}</p>
                    <p>{{ cliente.localidad.nombre }}</p>
                    <p>CUIT: {{ cliente.cuit }}</p>
                </div>
                <div class="info-box text-right">
                    <h3>Enviar a:</h3>
                    <p>{{ cliente.domicilio }}</p>
                    <p>{{ cliente.localidad.nombre }}</p>
                </div>
            </div>
        </header>
        {% endif %}

        <!-- Items Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 10%;">Cód.</th>
                    <th style="width: 50%;">Descripción</th>
                    <th class="text-center" style="width: 10%;">Cant.</th>
                    <th class="text-right" style="width: 15%;">Precio Unit.</th>
                    <th class="text-right" style="width: 15%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {% for item in detalles %}
                <tr>
                    <td>{{ item.producto.codigo }}</td>
                    <td>{{ item.producto.descripcion }}</td>
                    <td class="text-center">{{ item.cantidad }}</td>
                    <td class="text-right">${{ item.precio_unitario|floatformat:2 }}</td>
                    <td class="text-right">${{ item.subtotal|floatformat:2 }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal</td>
                    <td class="text-right">${{ venta.total|floatformat:2 }}</td>
                </tr>
                <tr>
                    <td>IVA (21%)</td>
                    <td class="text-right">$0.00</td> <!-- Ajustar según lógica impositiva -->
                </tr>
                <tr class="total-row">
                    <td>Total</td>
                    <td class="text-right">${{ venta.total|floatformat:2 }}</td>
                </tr>
            </table>
        </div>

        <!-- Custom Footer HTML -->
        {% if template.footer_html %}
        <div class="custom-footer mt-4">
            {{ template.footer_html|safe }}
        </div>
        {% else %}
        <!-- Default Footer -->
        <footer>
            <p>Gracias por su compra.</p>
            <p style="margin-top: 5px; font-size: 9px;">Comprobante generado electrónicamente.</p>
        </footer>
        {% endif %}
    </div>

    <script>
        // Pass Django context to JS
        var isPreview = "{{ is_preview|yesno:'true,false' }}" === "true";

        // Auto-print if not in preview mode
        if (!isPreview) {
            window.onload = function () {
                // window.print();
            }
        }
    </script>
</body>

</html>
"""

import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\templates\administrar\invoice_a4.html"

try:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully wrote to {file_path}")
except Exception as e:
    print(f"Error writing file: {e}")
