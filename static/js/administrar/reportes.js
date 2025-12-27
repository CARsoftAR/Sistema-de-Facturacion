// Variables globales para los gráficos
let chartPrincipal = null;
let chartSecundario = null;

document.addEventListener('DOMContentLoaded', () => {
    // Cargar ventas por defecto al iniciar
    loadVentas();
});

function actualizarTodo() {
    // Detectar tab activa
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        activeTab.click(); // Recargar tab actual
    }
}

function getFechasParams() {
    const desde = document.getElementById('fechaDesde').value;
    const hasta = document.getElementById('fechaHasta').value;
    let params = [];
    if (desde) params.push(`fecha_desde=${desde}`);
    if (hasta) params.push(`fecha_hasta=${hasta}`);
    return params.length > 0 ? '?' + params.join('&') : '';
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

// ==========================================
// VENTAS
// ==========================================
async function loadVentas() {
    const url = API_URLS.ventas + getFechasParams();

    try {
        const response = await fetch(url, { credentials: 'same-origin' });
        const data = await response.json();

        if (data.ok) {
            // KPIs
            document.getElementById('ventasTotal').innerText = formatCurrency(data.total_ventas);
            document.getElementById('ventasCantidad').innerText = data.cantidad_ventas;
            document.getElementById('ventasPromedio').innerText = formatCurrency(data.promedio_venta);

            // Gráfico Principal: Evolución Ventas
            renderChartVentas(data.ventas_por_mes);

            // Gráfico Secundario: Métodos de Pago
            renderChartMetodosPago(data.metodos_pago);

            // Renderizar Top Productos
            renderTopProductos(data.top_productos);

            // Renderizar Top Clientes
            renderTopClientes(data.top_clientes);
        }
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

function renderChartVentas(datos) {
    const ctx = document.getElementById('chartVentas').getContext('2d');

    if (chartPrincipal) chartPrincipal.destroy();

    const labels = datos.map(d => d.mes);
    const values = datos.map(d => d.total);

    chartPrincipal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: values,
                backgroundColor: '#0d6efd',
                borderColor: '#0b5ed7',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (val) => '$' + val }
                }
            }
        }
    });
}

function renderChartMetodosPago(datos) {
    const ctx = document.getElementById('chartMetodosPago').getContext('2d');

    if (chartSecundario) chartSecundario.destroy();

    const labels = datos.map(d => d.metodo);
    const values = datos.map(d => d.total);

    chartSecundario = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#198754', '#0dcaf0', '#ffc107', '#dc3545', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderTopProductos(productos) {
    const tbody = document.getElementById('topProductosBody');
    if (!tbody) return;

    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">No hay datos disponibles</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td class="text-truncate" style="max-width: 250px;" title="${p.nombre}">${p.nombre}</td>
            <td class="text-end">${p.cantidad}</td>
            <td class="text-end fw-bold text-primary">${formatCurrency(p.importe)}</td>
        </tr>
    `).join('');
}

function renderTopClientes(clientes) {
    const tbody = document.getElementById('topClientesBody');
    if (!tbody) return;

    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">No hay datos disponibles</td></tr>';
        return;
    }

    tbody.innerHTML = clientes.map(c => `
        <tr>
            <td class="text-truncate" style="max-width: 250px;" title="${c.nombre}">${c.nombre}</td>
            <td class="text-end">${c.cantidad}</td>
            <td class="text-end fw-bold text-success">${formatCurrency(c.total)}</td>
        </tr>
    `).join('');
}

// ==========================================
// COMPRAS
// ==========================================
async function loadCompras() {
    const container = document.getElementById('tabCompras');
    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

    const url = API_URLS.compras + getFechasParams();

    try {
        const response = await fetch(url, { credentials: 'same-origin' });
        const data = await response.json();

        if (data.ok) {
            let html = `
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm border-start border-danger border-4">
                            <div class="card-body">
                                <h6 class="text-muted text-uppercase mb-1">Total Compras</h6>
                                <h3 class="fw-bold text-danger mb-0">${formatCurrency(data.total_compras)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white"><h5 class="mb-0">Evolución de Compras</h5></div>
                    <div class="card-body">
                         <canvas id="chartCompras" height="100"></canvas>
                    </div>
                </div>
                
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white"><h5 class="mb-0">Top Proveedores</h5></div>
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead><tr><th>Proveedor</th><th class="text-end">Total</th><th class="text-end">Compras</th></tr></thead>
                            <tbody>
                                ${data.top_proveedores.map(p => `
                                    <tr>
                                        <td>${p.nombre}</td>
                                        <td class="text-end fw-bold text-danger">${formatCurrency(p.total)}</td>
                                        <td class="text-end">${p.cantidad}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            container.innerHTML = html;


            // Render Chart Compras
            setTimeout(() => {
                const ctx = document.getElementById('chartCompras');
                if (ctx) {
                    // Destroy existing chart if it exists
                    const existingChart = Chart.getChart(ctx);
                    if (existingChart) {
                        existingChart.destroy();
                    }

                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: data.compras_por_mes.map(d => d.mes),
                            datasets: [{
                                label: 'Compras ($)',
                                data: data.compras_por_mes.map(d => d.total),
                                backgroundColor: '#dc3545',
                                borderColor: '#b02a37',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: (val) => '$' + val.toLocaleString()
                                    }
                                }
                            }
                        }
                    });
                }
            }, 100);
        }
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error cargando compras: ${error.message}</div>`;
    }
}

// ==========================================
// CAJA
// ==========================================
async function loadCaja() {
    const container = document.getElementById('tabCaja');
    const url = API_URLS.caja + getFechasParams();

    try {
        const response = await fetch(url, { credentials: 'same-origin' });
        const data = await response.json();

        if (data.ok) {
            let html = `
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm border-start border-success border-4">
                            <div class="card-body">
                                <h6 class="text-muted text-uppercase mb-1">Total Ingresos</h6>
                                <h3 class="fw-bold text-success mb-0">${formatCurrency(data.ingresos_total)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm border-start border-danger border-4">
                            <div class="card-body">
                                <h6 class="text-muted text-uppercase mb-1">Total Egresos</h6>
                                <h3 class="fw-bold text-danger mb-0">${formatCurrency(data.egresos_total)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm border-start border-primary border-4">
                            <div class="card-body">
                                <h6 class="text-muted text-uppercase mb-1">Balance</h6>
                                <h3 class="fw-bold text-primary mb-0">${formatCurrency(data.balance)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                 <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white"><h5 class="mb-0">Flujo de Caja Mensual</h5></div>
                    <div class="card-body">
                         <canvas id="chartCaja" height="100"></canvas>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            // Render Chart Caja
            setTimeout(() => {
                const ctx = document.getElementById('chartCaja');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: data.movimientos_por_mes.map(d => d.mes),
                            datasets: [
                                {
                                    label: 'Ingresos',
                                    data: data.movimientos_por_mes.map(d => d.ingresos),
                                    backgroundColor: '#198754'
                                },
                                {
                                    label: 'Egresos',
                                    data: data.movimientos_por_mes.map(d => d.egresos),
                                    backgroundColor: '#dc3545'
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: (val) => '$' + val.toLocaleString()
                                    }
                                }
                            }
                        }
                    });
                }
            }, 100);
        }
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error cargando caja</div>`;
    }
}

// ==========================================
// STOCK
// ==========================================
async function loadStock() {
    const container = document.getElementById('tabStock');
    const url = API_URLS.stock;

    try {
        const response = await fetch(url, { credentials: 'same-origin' });
        const data = await response.json();

        if (data.ok) {
            let html = `
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm border-start border-warning border-4">
                            <div class="card-body">
                                <h6 class="text-muted text-uppercase mb-1">Valorización Total Inventario</h6>
                                <h3 class="fw-bold text-warning mb-0">${formatCurrency(data.valorizacion_total)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm border-start border-info border-4">
                            <div class="card-body">
                                <h6 class="text-muted text-uppercase mb-1">Total Productos</h6>
                                <h3 class="fw-bold text-info mb-0">${data.total_productos}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-white text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> Stock Bajo</div>
                             <div class="table-responsive">
                                <table class="table table-sm table-hover mb-0">
                                    <thead><tr><th>Producto</th><th class="text-end">Stock</th><th class="text-end">Min</th></tr></thead>
                                    <tbody>
                                        ${data.productos_stock_bajo.map(p => `
                                            <tr>
                                                <td class="text-truncate" style="max-width: 200px;">${p.descripcion}</td>
                                                <td class="text-end text-danger fw-bold">${p.stock_actual}</td>
                                                <td class="text-end text-muted">${p.stock_minimo}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                     <div class="col-md-6">
                         <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-white fw-bold">Distribución por Rubro ($)</div>
                            <div class="card-body">
                                <canvas id="chartStockRubros"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            setTimeout(() => {
                const ctx = document.getElementById('chartStockRubros');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: data.distribucion_rubros.map(d => d.rubro),
                            datasets: [{
                                data: data.distribucion_rubros.map(d => d.valorización),
                                backgroundColor: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0']
                            }]
                        },
                        options: {
                            plugins: {
                                legend: { position: 'right' }
                            }
                        }
                    });
                }
            }, 100);
        }
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error cargando stock</div>`;
    }
}

function exportarPDF() {
    window.print();
}

function exportarExcel() {
    const params = getFechasParams(); // Devuelve ?fecha_desde=...&fecha_hasta=...
    const url = API_URLS.exportar + params;
    window.location.href = url;
}
