import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\templates\administrar\comprobantes\detalle_remito.html"

# The corrected content - FULL FILE
content = """{% extends 'administrar/base.html' %}
{% load static %}

{% block content %}
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Detalle de Remito {{ remito.numero_formateado }}</h1>
        <div>
            <a href="{% url 'imprimir_remito' remito.id %}" class="btn btn-sm btn-secondary shadow-sm" target="_blank">
                <i class="fas fa-print fa-sm text-white-50"></i> Imprimir
            </a>
            <a href="{% url 'lista_remitos' %}" class="btn btn-sm btn-primary shadow-sm">
                <i class="fas fa-arrow-left fa-sm text-white-50"></i> Volver
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-4">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Información General</h6>
                </div>
                <div class="card-body">
                    <p><strong>Fecha:</strong> {{ remito.fecha|date:"d/m/Y H:i" }}</p>
                    <p><strong>Cliente:</strong> {{ remito.cliente.nombre }}</p>
                    <p><strong>Dirección:</strong> {{ remito.direccion_entrega }}</p>
                    <p><strong>Estado:</strong>
                        <span class="badge bg-{% if remito.estado == 'ENTREGADO' %}success{% elif remito.estado == 'ANULADO' %}danger{% else %}warning{% endif %}">
                            {{ remito.estado }}
                        </span>
                    </p>
                    {% if remito.venta_asociada %}
                    <p><strong>Venta Asociada:</strong>
                        <a href="{% url 'detalle_venta' remito.venta_asociada.id %}">
                            Factura {{ remito.venta_asociada.tipo_comprobante }} {{ remito.venta_asociada.numero_factura_formateado }}
                        </a>
                    </p>
                    {% endif %}
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Items del Remito</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {% for item in remito.detalles.all %}
                                <tr>
                                    <td>{{ item.producto.descripcion }}</td>
                                    <td>{{ item.cantidad }}</td>
                                </tr>
                                {% endfor %}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Re-wrote {file_path} successfully.")
