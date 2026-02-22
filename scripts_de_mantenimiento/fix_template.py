import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\templates\administrar\comprobantes\imprimir_remito.html"

# The corrected content - FULL FILE
content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Remito {{ remito.numero_formateado }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; color: #000; }
        @page { size: A4; margin: 1cm; }
        .container { width: 100%; max-width: 210mm; margin: 0 auto; }
        .w-100 { width: 100%; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .align-center { align-items: center; }
        .border { border: 1px solid #000; }
        .border-bottom { border-bottom: 1px solid #000; }
        .border-top { border-top: 1px solid #000; }
        .border-right { border-right: 1px solid #000; }
        .p-1 { padding: 5px; }
        .p-2 { padding: 10px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .no-border { border: none !important; }
        .header { position: relative; height: 150px; margin-bottom: 10px; }
        .logo-area { width: 40%; float: left; }
        .logo-area img { max-width: 200px; max-height: 80px; }
        .company-details { clear: both; font-size: 10px; line-height: 1.4; }
        .remito-box { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: 60px; height: 60px; border: 1px solid #000; text-align: center; background: #fff; z-index: 10; }
        .remito-letter { font-size: 36px; font-weight: bold; line-height: 40px; }
        .remito-code { font-size: 9px; }
        .invoice-details { width: 45%; float: right; text-align: left; padding-left: 20px; border-left: 1px solid #000; height: 100%; }
        .remito-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .remito-number { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
        .section-box { border: 1px solid #000; margin-bottom: 5px; padding: 5px 10px; border-radius: 5px; }
        .client-info { display: flex; justify-content: space-between; }
        .client-col { flex: 1; }
        .info-row { margin-bottom: 3px; }
        .label { font-weight: bold; width: 80px; display: inline-block; }
        .transport-strip { border: 1px solid #000; margin-bottom: 5px; border-radius: 5px; display: flex; justify-content: space-between; padding: 5px 10px; }
        .grid-strip { display: flex; border: 1px solid #000; border-radius: 5px; margin-bottom: 5px; overflow: hidden; }
        .grid-cell { border-right: 1px solid #000; padding: 2px 5px; flex: 1; text-align: center; }
        .grid-cell:last-child { border-right: none; }
        .grid-header { font-weight: bold; background-color: #e0e0e0; border-bottom: 1px solid #000; }
        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #000; border-radius: 5px; margin-bottom: 20px; min-height: 300px; }
        .items-table th { border-bottom: 1px solid #000; border-right: 1px solid #000; background-color: #e0e0e0; padding: 5px; text-align: center; }
        .items-table td { border-right: 1px solid #000; padding: 5px; vertical-align: top; }
        .items-table th:last-child, .items-table td:last-child { border-right: none; }
        .footer-signatures { margin-top: 50px; display: flex; justify-content: space-around; }
        .signature-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
        @media print { .no-print { display: none; } body { padding: 0; } .container { border: nonebox; } }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 10px;">
        <button onclick="window.print()">IMPRIMIR</button>
        <button onclick="window.close()">CERRAR</button>
    </div>

    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <!-- Left: Logo & Company -->
            <div class="logo-area">
                {% if empresa.logo %}
                <img src="{{ empresa.logo.url }}" alt="Logo">
                {% else %}
                <h1>{{ empresa.nombre }}</h1>
                {% endif %}
                
                <div class="company-details" style="margin-top: 10px;">
                    <div class="bold">Razn Social: {{ empresa.nombre }}</div>
                    <div>{{ empresa.direccion }}</div>
                    <div>Telfono: {{ empresa.telefono }}</div>
                    <div>Email: {{ empresa.email }}</div>
                </div>
            </div>

            <!-- Center: R Box -->
            <div class="remito-box">
                <div class="remito-letter">R</div>
                <div class="remito-code">COD.091</div>
            </div>

            <!-- Right: Remito Details -->
            <div class="invoice-details">
                <div class="remito-title">REMITO</div>
                <div class="remito-code" style="margin-bottom: 5px;">DOC. NO VALIDO COMO FACTURA</div>
                <div class="remito-number">Nro: {{ remito.numero_formateado }}</div>
                
                <div class="info-row"><span class="label" style="width:110px;">Fecha de Emisin:</span> {{ remito.fecha|date:"d/m/Y" }}</div>
                <div class="info-row"><span class="label" style="width:110px;">CUIT:</span> {{ empresa.cuit }}</div>
                <div class="info-row"><span class="label" style="width:110px;">Ingresos Brutos:</span> {{ empresa.iibb }}</div>
                <div class="info-row"><span class="label" style="width:110px;">Inicio Activ.:</span> {{ empresa.inicio_actividades|date:"m/Y" }}</div>
                <div class="info-row"><span class="label" style="width:110px;">IVA:</span> {{ empresa.get_condicion_fiscal_display }}</div>
            </div>
        </div>

        <!-- CLIENT INFO -->
        <div class="section-box">
            <div class="client-info">
                <div class="client-col">
                    <div class="info-row"><span class="label">Seor(es):</span> {{ remito.cliente.nombre }}</div>
                    <div class="info-row"><span class="label">Domicilio:</span> {{ remito.direccion_entrega|default:remito.cliente.domicilio }}</div>
                    <div class="info-row"><span class="label">Localidad:</span> {{ remito.cliente.localidad.nombre }}</div>
                    <div class="info-row"><span class="label">C.U.I.T.:</span> {{ remito.cliente.cuit }}</div>
                    <div class="info-row"><span class="label">IVA:</span> {{ remito.cliente.get_condicion_fiscal_display }}</div>
                </div>
                <div class="client-col text-right">
                    <div class="info-row"><span class="label">Provincia:</span> {{ remito.cliente.provincia.nombre }}</div>
                </div>
            </div>
        </div>

        <!-- TRANSPORT INFO -->
        <div class="transport-strip">
            <div style="flex: 2;">
                <span class="label" style="width:140px;">Empresa transportista:</span> {{ remito.transportista|default:"a cargo del Cliente" }}
            </div>
            <div style="flex: 1;">
                <span class="label">C.U.I.T.:</span> {{ remito.cuit_transportista }}
            </div>
        </div>
        
        <!-- GRID STRIP 1: OCM, ALCANCE, ETC -->
        <div class="grid-strip">
            <div class="grid-cell">
                <div class="grid-header">O.C.M.</div>
                <div>{{ remito.ocm }}</div>
            </div>
            <div class="grid-cell">
                <div class="grid-header">ARTICULO</div>
                <div><!-- ??? Maybe Product Code? --></div>
            </div>
            <div class="grid-cell">
                <div class="grid-header">ALCANCE</div>
                <div>{{ remito.alcance }}</div>
            </div>
            <div class="grid-cell" style="flex: 2;">
                <div class="grid-header">DENOMINACIONES Y CAPACIDAD</div>
                <div>{{ remito.denominacion }}</div>
            </div>
        </div>
        
        <!-- GRID STRIP 2: PROYECTO, OC, ETC -->
        <div class="grid-strip">
            <div class="grid-cell">
                <div class="grid-header">PROYECTO</div>
                <div>{{ remito.proyecto }}</div>
            </div>
            <div class="grid-cell" style="flex: 1.5;">
                <div class="grid-header">ORDEN DE COMPRA</div>
                <div>{{ remito.orden_compra }}</div>
            </div>
            <div class="grid-cell">
                <div class="grid-header">PEDIDO INTERNO</div>
                <div>{{ remito.pedido_interno }}</div>
            </div>
            <div class="grid-cell">
                <div class="grid-header">M.A.Q.</div>
                <div>{{ remito.maq }}</div>
            </div>
            <div class="grid-cell">
                <div class="grid-header">MATERIAL</div>
                <div>{{ remito.material }}</div>
            </div>
        </div>

        <!-- ITEMS TABLE -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 15%;">CANTIDAD</th>
                    <th style="width: 60%;">DETALLE</th>
                    <th style="width: 25%;">ARTICULO</th>
                </tr>
            </thead>
            <tbody>
                {% for item in remito.detalles.all %}
                <tr>
                    <td class="text-center">{{ item.cantidad }}</td>
                    <td>{{ item.producto.descripcion }} - {{ item.producto.descripcion_larga|default:"" }}</td>
                    <td class="text-center">{{ item.producto.codigo }}</td>
                </tr>
                {% endfor %}
                <!-- Fill empty rows if needed for visual height? -->
                {% for i in "12345" %} <!-- simple hack for spacing if loop is empty or short -->
                <tr><td style="height: 20px;">&nbsp;</td><td></td><td></td></tr>
                {% endfor %}
            </tbody>
        </table>

        <!-- FOOTER -->
        <div class="footer-signatures">
            <div class="signature-line">
                Recib Conforme
            </div>
            <div class="signature-line">
                Aclaracin
            </div>
        </div>
    </div>
</body>
</html>"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Re-wrote {file_path} successfully.")
