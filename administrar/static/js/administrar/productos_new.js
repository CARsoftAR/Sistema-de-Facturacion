//====================================
// PRODUCTOS.JS – GESTIÓN DE PRODUCTOS
//====================================

console.log("📦 [Productos] Archivo productos.js cargado correctamente v20 (Modal Fix)");

// ====================================
// VARIABLES GLOBALES
// ====================================
let paginaActual = 1;
let registrosPorPagina = 10;
let totalProductos = 0;
let cargaInicial = true;
let modalProductoInstance = null;

// ====================================
// INICIALIZACIÓN
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    // Leer parámetros de URL para filtros iniciales
    const urlParams = new URLSearchParams(window.location.search);
    const stockParam = urlParams.get('stock');

    if (stockParam === 'bajo') {
        document.getElementById('filtroStock').value = 'stock_bajo';
    }

    cargarCombosFiltros();
    cargarProductos();

    // Event Listeners Filtros
    document.getElementById('filtroDescripcion').addEventListener('input', debounce(aplicarFiltros, 500));
    document.getElementById('filtroCodigo').addEventListener('input', debounce(aplicarFiltros, 500));
    document.getElementById('filtroRubro').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroMarca').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroStock').addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('selectorRegistros').addEventListener('change', cambiarRegistrosPorPagina);

    // Botones Header
    // Botones Header
    const btnNuevo = document.getElementById('btnNuevoProducto');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', abrirModalNuevo);
    } else {
        console.error('[ERROR] btnNuevoProducto not found');
    }

    const btnImprimir = document.getElementById('btnImprimirProductos');
    if (btnImprimir) btnImprimir.addEventListener('click', imprimirProductos);

    const btnExcel = document.getElementById('btnExportarExcel');
    if (btnExcel) btnExcel.addEventListener('click', exportarExcel);

    const btnPDF = document.getElementById('btnExportarPDF');
    if (btnPDF) btnPDF.addEventListener('click', exportarPDF);

    // Botón Guardar Modal
    document.getElementById('btnGuardarProducto').addEventListener('click', guardarProducto);

    // Configurar evento del modal para cargar combos cuando se muestra
    const modalElement = document.getElementById('modalProducto');
    if (modalElement) {
        modalElement.addEventListener('shown.bs.modal', function () {
            console.log('[DEBUG] Modal shown event fired');
            // Verificar que los selects existen
            const rubroSelect = document.getElementById('rubro');
            const marcaSelect = document.getElementById('marca');
            const proveedorSelect = document.getElementById('proveedor');

            console.log('[DEBUG] Rubro select exists:', !!rubroSelect);
            console.log('[DEBUG] Marca select exists:', !!marcaSelect);
            console.log('[DEBUG] Proveedor select exists:', !!proveedorSelect);

            if (rubroSelect && marcaSelect && proveedorSelect) {
                console.log('[DEBUG] All selects found, calling cargarCombosModal');
                cargarCombosModal();
            } else {
                console.error('[ERROR] Some selects not found!');
            }
        });
    }
});

// ====================================
// CARGAR COMBOS FILTROS
// ====================================
function cargarCombosFiltros() {
    // Cargar Rubros
    fetch('/api/rubros/listar/')
        .then(r => r.json())
        .then(data => {
            const rubros = data.data || data;
            const select = document.getElementById('filtroRubro');
            rubros.forEach(r => {
                select.innerHTML += `<option value="${r.id}">${r.nombre}</option>`;
            });
        });

    // Cargar Marcas
    fetch('/api/marcas/listar/')
        .then(r => r.json())
        .then(data => {
            const marcas = data.data || data;
            const select = document.getElementById('filtroMarca');
            marcas.forEach(m => {
                select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
            });
        });
}

// ====================================
// CARGAR PRODUCTOS
// ====================================
function cargarProductos() {
    const params = new URLSearchParams({
        page: paginaActual,
        per_page: registrosPorPagina,
        busqueda: document.getElementById('filtroDescripcion').value || document.getElementById('filtroCodigo').value,
        rubro: document.getElementById('filtroRubro').value,
        marca: document.getElementById('filtroMarca').value,
        stock: document.getElementById('filtroStock').value
    });

    fetch(`/api/productos/lista/?${params}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            totalProductos = data.total;
            renderizarProductos(data.productos);
            renderizarPaginacion(data.total_pages);
            document.getElementById('contadorRegistros').textContent = `Mostrando ${data.productos.length} de ${data.total} productos`;
        })
        .catch(err => {
            console.error('Error cargando productos:', err);
            Swal.fire('Error', 'No se pudieron cargar los productos: ' + err.message, 'error');
        });
}

// ====================================
// RENDERIZAR PRODUCTOS
// ====================================
function renderizarProductos(productos) {
    const tbody = document.getElementById('tbodyProductos');

    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-box-seam" style="font-size: 3rem;"></i>
                    <p class="mt-2">No se encontraron productos</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td class="ps-4 fw-bold">${p.codigo}</td>
            <td>${p.descripcion}</td>
            <td>${p.marca}</td>
            <td>${p.rubro}</td>
            <td>
                <span class="badge ${p.stock <= 10 ? 'bg-danger' : (p.stock > 0 ? 'bg-success' : 'bg-secondary')}">
                    ${p.stock}
                </span>
            </td>
            <td class="fw-bold">$${formatearNumero(p.precio_efectivo)}</td>
            <td class="text-end pe-4">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editarProducto(${p.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="eliminarProducto(${p.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ====================================
// PAGINACIÓN
// ====================================
function renderizarPaginacion(totalPaginas) {
    const container = document.getElementById('paginacionProductos');

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
    cargarProductos();
}

function cambiarRegistrosPorPagina() {
    registrosPorPagina = parseInt(document.getElementById('selectorRegistros').value);
    paginaActual = 1;
    cargarProductos();
}

// ====================================
// FILTROS
// ====================================
function aplicarFiltros() {
    paginaActual = 1;
    cargarProductos();
}

function limpiarFiltros() {
    document.getElementById('filtroDescripcion').value = '';
    document.getElementById('filtroCodigo').value = '';
    document.getElementById('filtroRubro').value = '';
    document.getElementById('filtroMarca').value = '';
    document.getElementById('filtroStock').value = 'todos';
    aplicarFiltros();
}

// ====================================
// EXPORTAR
// ====================================
function imprimirProductos() {
    window.print();
}

function exportarExcel() {
    let table = document.getElementById("tablaProductos");
    let html = table.outerHTML;
    let url = 'data:application/vnd.ms-excel,' + escape(html);
    let link = document.createElement("a");
    link.href = url;
    link.download = "productos.xls";
    link.click();
}

function exportarPDF() {
    window.print();
}

// ====================================
// MODAL NUEVO / EDITAR
// ====================================
function abrirModalNuevo() {
    console.log('[DEBUG] abrirModalNuevo called');

    try {
        // Resetear formulario
        const form = document.getElementById('formProducto');
        if (form) {
            form.reset();
            console.log('[DEBUG] Form reset');
        } else {
            console.warn('[WARN] formProducto not found');
        }

        const idField = document.getElementById('productoId');
        if (idField) {
            idField.value = '';
            console.log('[DEBUG] Product ID cleared');
        }

        const titleElement = document.querySelector('#modalProducto .modal-title');
        if (titleElement) {
            titleElement.textContent = 'Nuevo Producto';
            console.log('[DEBUG] Title set');
        }

        // Mostrar el modal
        const modalElement = document.getElementById('modalProducto');
        if (!modalElement) {
            console.error('[ERROR] modalProducto element not found in DOM');
            Swal.fire('Error', 'No se encontró el modal de productos', 'error');
            return;
        }

        if (typeof bootstrap === 'undefined') {
            console.error('[ERROR] Bootstrap is not defined');
            Swal.fire('Error', 'Bootstrap no está cargado', 'error');
            return;
        }

        if (!modalProductoInstance) {
            console.log('[DEBUG] Creating new bootstrap.Modal instance');
            modalProductoInstance = new bootstrap.Modal(modalElement);
        }

        console.log('[DEBUG] Calling modal.show()');
        modalProductoInstance.show();

    } catch (err) {
        console.error('[ERROR] in abrirModalNuevo:', err);
        Swal.fire('Error', 'Ocurrió un error al abrir el modal: ' + err.message, 'error');
    }
}

function editarProducto(id) {
    fetch(`/api/productos/${id}/`)
        .then(r => r.json())
        .then(p => {
            const form = document.getElementById('formProducto');
            const idField = document.getElementById('productoId');
            if (idField) idField.value = p.id;

            form.codigo.value = p.codigo;
            form.descripcion.value = p.descripcion;
            form.descripcion_larga.value = p.descripcion_larga || '';

            form.stock.value = p.stock;
            form.stock_minimo.value = p.stock_minimo;
            form.stock_maximo.value = p.stock_maximo;

            form.costo.value = p.costo;
            form.precio_efectivo.value = p.precio_efectivo;
            form.precio_tarjeta.value = p.precio_tarjeta;
            form.precio_ctacte.value = p.precio_ctacte;
            form.precio_lista4.value = p.precio_lista4;

            document.querySelector('#modalProducto .modal-title').textContent = 'Editar Producto';
            cargarCombosModal(p.rubro_id, p.marca_id, p.proveedor_id);

            const modalElement = document.getElementById('modalProducto');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        });
}

function cargarCombosModal(rubroId = null, marcaId = null, proveedorId = null) {
    console.log('[DEBUG] cargarCombosModal called with:', { rubroId, marcaId, proveedorId });

    // Rubros
    fetch('/api/rubros/listar/')
        .then(r => r.json())
        .then(data => {
            console.log('[DEBUG] Rubros data received:', data);
            const rubros = data.data || data;
            const sel = document.getElementById('rubro');
            if (!sel) {
                console.error('[ERROR] Rubro select not found!');
                return;
            }
            sel.innerHTML = '<option value="">(ninguno)</option>';
            rubros.forEach(x => {
                sel.innerHTML += `<option value="${x.id}" ${x.id == rubroId ? 'selected' : ''}>${x.nombre}</option>`;
            });
            console.log('[DEBUG] Rubros loaded, count:', rubros.length);
        })
        .catch(err => console.error('[ERROR] Loading rubros:', err));

    // Marcas
    fetch('/api/marcas/listar/')
        .then(r => r.json())
        .then(data => {
            console.log('[DEBUG] Marcas data received:', data);
            const marcas = data.data || data;
            const sel = document.getElementById('marca');
            if (!sel) {
                console.error('[ERROR] Marca select not found!');
                return;
            }
            sel.innerHTML = '<option value="">(ninguna)</option>';
            marcas.forEach(x => {
                sel.innerHTML += `<option value="${x.id}" ${x.id == marcaId ? 'selected' : ''}>${x.nombre}</option>`;
            });
            console.log('[DEBUG] Marcas loaded, count:', marcas.length);
        })
        .catch(err => console.error('[ERROR] Loading marcas:', err));

    // Proveedores
    fetch('/api/proveedores/lista/')
        .then(r => r.json())
        .then(data => {
            console.log('[DEBUG] Proveedores data received:', data);
            const proveedores = data;
            const sel = document.getElementById('proveedor');
            if (!sel) {
                console.error('[ERROR] Proveedor select not found!');
                return;
            }
            sel.innerHTML = '<option value="">(ninguno)</option>';
            proveedores.forEach(x => {
                sel.innerHTML += `<option value="${x.id}" ${x.id == proveedorId ? 'selected' : ''}>${x.nombre}</option>`;
            });
            console.log('[DEBUG] Proveedores loaded, count:', proveedores.length);
        })
        .catch(err => console.error('[ERROR] Loading proveedores:', err));
}

function guardarProducto() {
    const form = document.getElementById('formProducto');
    const fd = new FormData(form);
    const id = fd.get('id');
    const url = id ? `/api/productos/${id}/editar/` : '/api/productos/nuevo/';

    fetch(url, {
        method: 'POST',
        body: fd,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
            } else {
                const modalElement = document.getElementById('modalProducto');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();

                Swal.fire('Guardado', 'Producto guardado correctamente', 'success');
                cargarProductos();
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Error al guardar el producto', 'error');
        });
}

function eliminarProducto(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/productos/${id}/eliminar/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.error) {
                        Swal.fire('Error', data.error, 'error');
                    } else {
                        Swal.fire('Eliminado', 'Producto eliminado', 'success');
                        cargarProductos();
                    }
                });
        }
    });
}

// ====================================
// UTILIDADES
// ====================================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numero);
}
