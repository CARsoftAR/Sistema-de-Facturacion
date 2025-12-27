//====================================
// PEDIDOS.JS – GESTIÓN MODERNA DE PEDIDOS
//====================================

console.log("📦 [Pedidos] Archivo pedidos.js cargado correctamente");

// ====================================
// VARIABLES GLOBALES
// ====================================
let paginaActual = 1;
let registrosPorPagina = 10;
let totalPedidos = 0;
let pedidoActual = null;
let productoSeleccionado = null;
let timeoutProducto = null;

// Modales
const modalPedido = new bootstrap.Modal(document.getElementById('modalPedido'));
const modalEstado = new bootstrap.Modal(document.getElementById('modalEstado'));

// ====================================
// INICIALIZACIÓN
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    // Leer parámetros de URL para filtros iniciales
    const urlParams = new URLSearchParams(window.location.search);
    const estadoParam = urlParams.get('estado');

    // Si viene el parámetro estado desde el dashboard, aplicarlo
    if (estadoParam) {
        const estados = estadoParam.split(',');
        // Si son múltiples estados, seleccionar el primero o dejar vacío para mostrar todos
        if (estados.length === 1) {
            document.getElementById('filtroEstado').value = estados[0];
        } else {
            // Para múltiples estados (PENDIENTE,PREPARACION,LISTO), no seleccionar ninguno
            // pero el filtro se aplicará en el backend
            document.getElementById('filtroEstado').value = '';
        }
    }

    cargarClientes();
    cargarPedidos();

    // Event Listeners
    document.getElementById('btnNuevoPedido').addEventListener('click', abrirModalNuevo);
    document.getElementById('btnGuardarPedido').addEventListener('click', guardarPedido);
    document.getElementById('btnGuardarEstado').addEventListener('click', guardarEstado);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    // Filtros
    document.getElementById('filtroBusqueda').addEventListener('input', debounce(aplicarFiltros, 500));
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroCliente').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroFechaDesde').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroFechaHasta').addEventListener('change', aplicarFiltros);
    document.getElementById('selectorRegistros').addEventListener('change', cambiarRegistrosPorPagina);
});

// ====================================
// CARGAR CLIENTES
// ====================================
function cargarClientes() {
    fetch('/api/clientes/buscar/')
        .then(r => r.json())
        .then(clientes => {
            const selectCliente = document.getElementById('pedido_cliente');
            const filtroCliente = document.getElementById('filtroCliente');

            selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
            filtroCliente.innerHTML = '<option value="">Todos los clientes</option>';

            clientes.forEach(c => {
                // Agregar opción con data-lista-precio para el select del modal
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.nombre;
                option.setAttribute('data-lista-precio', c.lista_precios || '1');
                selectCliente.appendChild(option);

                // Agregar opción para el filtro
                filtroCliente.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
            });
        })
        .catch(err => console.error('Error cargando clientes:', err));
}

// ====================================
// CARGAR PEDIDOS
// ====================================
let cargaInicial = true; // Flag para saber si es la primera carga

function cargarPedidos() {
    // Obtener estado del filtro
    let estadoFiltro = document.getElementById('filtroEstado').value;

    // Solo usar parámetro de URL en la primera carga
    if (cargaInicial && !estadoFiltro) {
        const urlParams = new URLSearchParams(window.location.search);
        const estadoParam = urlParams.get('estado');
        if (estadoParam) {
            estadoFiltro = estadoParam; // Puede ser "PENDIENTE,PREPARACION,LISTO"
        }
        cargaInicial = false; // Marcar que ya no es la primera carga
    }

    const params = new URLSearchParams({
        page: paginaActual,
        per_page: registrosPorPagina,
        busqueda: document.getElementById('filtroBusqueda').value,
        estado: estadoFiltro,
        cliente: document.getElementById('filtroCliente').value,
        fecha_desde: document.getElementById('filtroFechaDesde').value,
        fecha_hasta: document.getElementById('filtroFechaHasta').value,
    });

    fetch(`/api/pedidos/lista/?${params}`)
        .then(r => r.json())
        .then(data => {
            totalPedidos = data.total;
            renderizarPedidos(data.pedidos);
            renderizarPaginacion(data.total_pages);
            actualizarContador(data.total);
        })
        .catch(err => {
            console.error('Error cargando pedidos:', err);
            Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
        });
}

// ====================================
// RENDERIZAR PEDIDOS
// ====================================
function renderizarPedidos(pedidos) {
    const tbody = document.getElementById('tbodyPedidos');

    if (pedidos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-2">No se encontraron pedidos</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pedidos.map(p => `
        <tr>
            <td class="ps-4 fw-bold">#${p.id}</td>
            <td>${p.fecha}</td>
            <td>${p.cliente_nombre}</td>
            <td><span class="badge bg-secondary">${p.num_items} items</span></td>
            <td class="fw-bold text-success">$${formatearNumero(p.total)}</td>
            <td>${getBadgeEstado(p.estado, p.estado_display)}</td>
            <td class="text-end pe-4">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" onclick="verDetalle(${p.id})" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${!p.venta_id ? `
                        <button class="btn btn-outline-primary" onclick="editarPedido(${p.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="facturarPedido(${p.id}, '${p.cliente_nombre}')" title="Facturar">
                            <i class="bi bi-receipt"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-warning" onclick="cambiarEstado(${p.id}, '${p.cliente_nombre}')" title="Cambiar estado">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    ${!p.venta_id ? `
                        <button class="btn btn-outline-danger" onclick="eliminarPedido(${p.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// ====================================
// BADGE ESTADO
// ====================================
function getBadgeEstado(estado, display) {
    const colores = {
        'PENDIENTE': 'warning',
        'PREPARACION': 'info',
        'LISTO': 'primary',
        'FACTURADO': 'success',
        'ANULADO': 'danger'
    };
    return `<span class="badge bg-${colores[estado] || 'secondary'}">${display}</span>`;
}

// ====================================
// ABRIR MODAL NUEVO
// ====================================
function abrirModalNuevo() {
    document.getElementById('formPedido').reset();
    document.getElementById('pedido_id').value = '';
    document.getElementById('modalPedidoTitle').innerHTML = '<i class="bi bi-clipboard-plus"></i> Nuevo Pedido';
    document.getElementById('tbodyDetalles').innerHTML = '';
    document.getElementById('pedidoTotal').textContent = '$0.00';
    pedidoActual = null;
    productoSeleccionado = null;

    // Configurar autocomplete de productos
    configurarAutocompleteProductos();

    modalPedido.show();

    // Focus en el input de producto
    setTimeout(() => {
        document.getElementById('input_producto_codigo').focus();
    }, 300);
}

// ====================================
// EDITAR PEDIDO
// ====================================
async function editarPedido(id) {
    try {
        const response = await fetch(`/api/pedidos/${id}/`);
        const pedido = await response.json();

        document.getElementById('pedido_id').value = pedido.id;
        document.getElementById('pedido_cliente').value = pedido.cliente_id;
        document.getElementById('pedido_observaciones').value = pedido.observaciones;
        document.getElementById('modalPedidoTitle').innerHTML = `<i class="bi bi-pencil"></i> Editar Pedido #${pedido.id}`;

        // Cargar detalles
        const tbody = document.getElementById('tbodyDetalles');
        tbody.innerHTML = '';

        pedido.detalles.forEach(det => {
            agregarProductoATabla(
                det.producto_id,
                `${det.producto_codigo} - ${det.producto_descripcion}`,
                det.cantidad,
                det.precio_unitario
            );
        });

        calcularTotales();
        pedidoActual = pedido;
        configurarAutocompleteProductos();
        modalPedido.show();

    } catch (err) {
        console.error('Error cargando pedido:', err);
        Swal.fire('Error', 'No se pudo cargar el pedido', 'error');
    }
}

// ====================================
// CONFIGURAR AUTOCOMPLETE PRODUCTOS
// ====================================
function configurarAutocompleteProductos() {
    const inputCodigo = document.getElementById('input_producto_codigo');
    const inputCantidad = document.getElementById('input_producto_cantidad');
    const btnAgregar = document.getElementById('btnAgregarProductoDetalle');
    const listaSugerencias = document.getElementById('lista_productos_sugerencias');

    // Limpiar listeners anteriores clonando elementos
    const newInputCodigo = inputCodigo.cloneNode(true);
    inputCodigo.parentNode.replaceChild(newInputCodigo, inputCodigo);

    const newInputCantidad = inputCantidad.cloneNode(true);
    inputCantidad.parentNode.replaceChild(newInputCantidad, inputCantidad);

    const newBtnAgregar = btnAgregar.cloneNode(true);
    btnAgregar.parentNode.replaceChild(newBtnAgregar, btnAgregar);

    // Referencias actualizadas
    const inputCodigoActual = document.getElementById('input_producto_codigo');
    const inputCantidadActual = document.getElementById('input_producto_cantidad');
    const btnAgregarActual = document.getElementById('btnAgregarProductoDetalle');

    // Autocomplete en input de código
    inputCodigoActual.addEventListener('input', () => {
        const q = inputCodigoActual.value.trim();

        if (q.length < 1) {
            listaSugerencias.innerHTML = '';
            listaSugerencias.style.display = 'none';
            productoSeleccionado = null;
            return;
        }

        clearTimeout(timeoutProducto);
        timeoutProducto = setTimeout(() => {
            fetch(`/api/buscar_productos/?q=${encodeURIComponent(q)}`)
                .then(r => r.json())
                .then(productos => {
                    listaSugerencias.innerHTML = '';

                    if (!productos || productos.length === 0) {
                        listaSugerencias.style.display = 'none';
                        return;
                    }

                    productos.forEach(p => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'list-group-item list-group-item-action';
                        btn.innerHTML = `
                            <div class="fw-bold">${p.codigo} - ${p.descripcion}</div>
                            <small>Stock: ${p.stock} | $${formatearNumero(p.precio_efectivo)}</small>
                        `;
                        btn.addEventListener('click', () => seleccionarProducto(p));
                        listaSugerencias.appendChild(btn);
                    });

                    listaSugerencias.style.display = 'block';
                })
                .catch(err => console.error('Error buscando productos:', err));
        }, 250);
    });

    // ENTER en código -> ir a cantidad
    inputCodigoActual.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Si hay un producto seleccionado, ir a cantidad
            if (productoSeleccionado) {
                inputCantidadActual.focus();
                inputCantidadActual.select();
            }
            // Si solo hay un resultado en sugerencias, seleccionarlo
            else if (listaSugerencias.children.length === 1) {
                listaSugerencias.children[0].click();
            }
        }
    });

    // ENTER en cantidad -> agregar producto
    inputCantidadActual.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAgregarActual.click();
        }
    });

    // Click en agregar
    btnAgregarActual.addEventListener('click', () => {
        if (!productoSeleccionado) {
            Swal.fire('Error', 'Primero seleccione un producto de la lista', 'error');
            return;
        }

        const cantidad = parseFloat(inputCantidadActual.value) || 1;
        if (cantidad <= 0) {
            Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
            return;
        }

        // Obtener cliente seleccionado y su lista de precios
        const selectCliente = document.getElementById('pedido_cliente');
        const clienteId = selectCliente.value;

        if (!clienteId) {
            Swal.fire('Error', 'Primero seleccione un cliente', 'error');
            return;
        }

        // Obtener lista de precios del cliente desde el option seleccionado
        const selectedOption = selectCliente.options[selectCliente.selectedIndex];
        const listaPrecio = selectedOption.getAttribute('data-lista-precio') || '1';

        // Obtener precio del producto según la lista del cliente
        // Obtener precio del producto según la lista del cliente
        fetch(`/api/producto_info/${productoSeleccionado.id}/${listaPrecio}/`)
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    Swal.fire('Error', data.error, 'error');
                    return;
                }

                const precio = parseFloat(data.precio_seleccionado || 0);

                // Agregar a la tabla con el precio correcto
                agregarProductoATabla(
                    productoSeleccionado.id,
                    `${productoSeleccionado.codigo} - ${productoSeleccionado.descripcion}`,
                    cantidad,
                    precio
                );

                // Limpiar y volver al input de código
                inputCodigoActual.value = '';
                inputCantidadActual.value = '1';
                productoSeleccionado = null;
                listaSugerencias.innerHTML = '';
                listaSugerencias.style.display = 'none';
                inputCodigoActual.focus();
            })
            .catch(err => {
                console.error('Error obteniendo precio:', err);
                Swal.fire('Error', 'No se pudo obtener el precio del producto', 'error');
            });
    });

    // Cerrar sugerencias al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!inputCodigoActual.contains(e.target) && !listaSugerencias.contains(e.target)) {
            listaSugerencias.style.display = 'none';
        }
    });
}

function seleccionarProducto(p) {
    productoSeleccionado = p;
    const inputCodigo = document.getElementById('input_producto_codigo');
    inputCodigo.value = `${p.codigo} - ${p.descripcion}`;
    document.getElementById('lista_productos_sugerencias').style.display = 'none';
    document.getElementById('input_producto_cantidad').focus();
    document.getElementById('input_producto_cantidad').select();
}

// ====================================
// AGREGAR PRODUCTO A TABLA
// ====================================
function agregarProductoATabla(productoId, productoNombre, cantidad, precio) {
    const tbody = document.getElementById('tbodyDetalles');

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            ${productoNombre}
            <input type="hidden" class="producto-id" value="${productoId}">
            <input type="hidden" class="producto-nombre" value="${productoNombre}">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm detalle-cantidad" 
                min="0.01" step="0.01" value="${cantidad}" 
                onchange="calcularTotales()">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm detalle-precio" 
                min="0" step="0.01" value="${precio}" 
                onchange="calcularTotales()">
        </td>
        <td>
            <input type="text" class="form-control form-control-sm detalle-subtotal" 
                value="$${formatearNumero(cantidad * precio)}" readonly>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="eliminarDetalle(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(tr);
    calcularTotales();
}

// ====================================
// ELIMINAR DETALLE
// ====================================
function eliminarDetalle(btn) {
    btn.closest('tr').remove();
    calcularTotales();
}

// ====================================
// CALCULAR TOTALES
// ====================================
function calcularTotales() {
    const tbody = document.getElementById('tbodyDetalles');
    let total = 0;

    Array.from(tbody.children).forEach(tr => {
        const cantidad = parseFloat(tr.querySelector('.detalle-cantidad').value) || 0;
        const precio = parseFloat(tr.querySelector('.detalle-precio').value) || 0;
        const subtotal = cantidad * precio;

        tr.querySelector('.detalle-subtotal').value = '$' + formatearNumero(subtotal);
        total += subtotal;
    });

    document.getElementById('pedidoTotal').textContent = '$' + formatearNumero(total);
}

// ====================================
// GUARDAR PEDIDO
// ====================================
async function guardarPedido() {
    const pedidoId = document.getElementById('pedido_id').value;
    const clienteId = document.getElementById('pedido_cliente').value;
    const observaciones = document.getElementById('pedido_observaciones').value;

    if (!clienteId) {
        Swal.fire('Error', 'Debe seleccionar un cliente', 'error');
        return;
    }

    // Obtener detalles
    const tbody = document.getElementById('tbodyDetalles');
    const detalles = [];

    Array.from(tbody.children).forEach(tr => {
        const productoId = tr.querySelector('.producto-id').value;
        const cantidad = parseFloat(tr.querySelector('.detalle-cantidad').value) || 0;
        const precio = parseFloat(tr.querySelector('.detalle-precio').value) || 0;

        if (productoId && cantidad > 0) {
            detalles.push({
                producto_id: parseInt(productoId),
                cantidad: cantidad,
                precio_unitario: precio
            });
        }
    });

    if (detalles.length === 0) {
        Swal.fire('Error', 'Debe agregar al menos un producto', 'error');
        return;
    }

    const data = {
        cliente_id: parseInt(clienteId),
        observaciones: observaciones,
        detalles: detalles
    };

    const url = pedidoId ? `/api/pedidos/editar/${pedidoId}/` : '/api/pedidos/crear/';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.ok) {
            Swal.fire('Éxito', result.message, 'success');
            modalPedido.hide();
            cargarPedidos();
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (err) {
        console.error('Error guardando pedido:', err);
        Swal.fire('Error', 'No se pudo guardar el pedido', 'error');
    }
}

// ====================================
// CAMBIAR ESTADO
// ====================================
function cambiarEstado(id, clienteNombre) {
    document.getElementById('estado_pedido_id').value = id;
    document.getElementById('estado_pedido_numero').textContent = id;
    document.getElementById('estado_pedido_cliente').textContent = clienteNombre;
    modalEstado.show();
}

async function guardarEstado() {
    const id = document.getElementById('estado_pedido_id').value;
    const nuevoEstado = document.getElementById('estado_pedido_select').value;

    try {
        const response = await fetch(`/api/pedidos/estado/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        const result = await response.json();

        if (result.ok) {
            Swal.fire('Éxito', result.message, 'success');
            modalEstado.hide();
            cargarPedidos();
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (err) {
        console.error('Error cambiando estado:', err);
        Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
    }
}

// ====================================
// ELIMINAR PEDIDO
// ====================================
function eliminarPedido(id) {
    Swal.fire({
        title: '¿Eliminar pedido?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/pedidos/eliminar/${id}/`, {
                    method: 'POST'
                });

                const data = await response.json();

                if (data.ok) {
                    Swal.fire('Eliminado', data.message, 'success');
                    cargarPedidos();
                } else {
                    Swal.fire('Error', data.error, 'error');
                }
            } catch (err) {
                console.error('Error eliminando pedido:', err);
                Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
            }
        }
    });
}

// ====================================
// VER DETALLE
// ====================================
async function verDetalle(id) {
    try {
        const response = await fetch(`/api/pedidos/${id}/`);
        const pedido = await response.json();

        const detallesHTML = pedido.detalles.map(d => `
            <tr>
                <td>${d.producto_codigo}</td>
                <td>${d.producto_descripcion}</td>
                <td class="text-center">${d.cantidad}</td>
                <td class="text-end">$${formatearNumero(d.precio_unitario)}</td>
                <td class="text-end fw-bold">$${formatearNumero(d.subtotal)}</td>
            </tr>
        `).join('');

        Swal.fire({
            title: `<i class="bi bi-clipboard-data text-primary"></i> Pedido #${pedido.id}`,
            html: `
                <div class="text-start">
                    <div class="card mb-3">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0"><i class="bi bi-person-circle"></i> Información del Cliente</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-1"><strong>Nombre:</strong> ${pedido.cliente_nombre}</p>
                            ${pedido.cliente_cuit ? `<p class="mb-1"><strong>CUIT:</strong> ${pedido.cliente_cuit}</p>` : ''}
                            ${pedido.cliente_telefono ? `<p class="mb-1"><strong>Teléfono:</strong> ${pedido.cliente_telefono}</p>` : ''}
                            ${pedido.cliente_email ? `<p class="mb-0"><strong>Email:</strong> ${pedido.cliente_email}</p>` : ''}
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0"><i class="bi bi-info-circle"></i> Información del Pedido</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-1"><strong>Fecha:</strong> ${pedido.fecha}</p>
                            <p class="mb-1"><strong>Estado:</strong> ${getBadgeEstado(pedido.estado, pedido.estado_display)}</p>
                            ${pedido.observaciones ? `<p class="mb-0"><strong>Observaciones:</strong> ${pedido.observaciones}</p>` : ''}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0"><i class="bi bi-cart"></i> Productos del Pedido</h6>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Código</th>
                                            <th>Producto</th>
                                            <th class="text-center">Cant.</th>
                                            <th class="text-end">Precio Unit.</th>
                                            <th class="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${detallesHTML}
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <th colspan="4" class="text-end">TOTAL:</th>
                                            <th class="text-end text-success">$${formatearNumero(pedido.total)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            width: '900px',
            confirmButtonText: '<i class="bi bi-x-circle"></i> Cerrar',
            confirmButtonColor: '#6c757d'
        });
    } catch (err) {
        console.error('Error cargando detalle:', err);
        Swal.fire('Error', 'No se pudo cargar el detalle del pedido', 'error');
    }
}

// ====================================
// PAGINACIÓN
// ====================================
function renderizarPaginacion(totalPaginas) {
    const container = document.getElementById('paginacionPedidos');

    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<nav><ul class="pagination pagination-sm mb-0">';

    // Anterior
    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">Anterior</a>
    </li>`;

    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
            html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>`;
        } else if (i === paginaActual - 3 || i === paginaActual + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    // Siguiente
    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">Siguiente</a>
    </li>`;

    html += '</ul></nav>';
    container.innerHTML = html;
}

function cambiarPagina(pagina) {
    paginaActual = pagina;
    cargarPedidos();
}

function cambiarRegistrosPorPagina() {
    registrosPorPagina = parseInt(document.getElementById('selectorRegistros').value);
    paginaActual = 1;
    cargarPedidos();
}

// ====================================
// FILTROS
// ====================================
function aplicarFiltros() {
    paginaActual = 1;
    cargarPedidos();
}

function limpiarFiltros() {
    document.getElementById('filtroBusqueda').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroCliente').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    aplicarFiltros();
}

// ====================================
// UTILIDADES
// ====================================
function formatearNumero(num) {
    return parseFloat(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function actualizarContador(total) {
    document.getElementById('contadorRegistros').textContent =
        `Mostrando ${total} pedido${total !== 1 ? 's' : ''}`;
}

// ====================================
// FACTURAR PEDIDO
// ====================================
async function facturarPedido(id, clienteNombre) {
    const result = await Swal.fire({
        title: '¿Facturar pedido?',
        html: `
            <p>Se creará una venta y se descontará el stock.</p>
            <p><strong>Cliente:</strong> ${clienteNombre}</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, facturar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/pedidos/facturar/${id}/`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.ok) {
                Swal.fire('Facturado', data.message, 'success');
                cargarPedidos();
            } else {
                Swal.fire('Error', data.error, 'error');
            }
        } catch (err) {
            console.error('Error facturando pedido:', err);
            Swal.fire('Error', 'No se pudo facturar el pedido', 'error');
        }
    }
}
