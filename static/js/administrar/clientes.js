document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // VERIFICACIÓN DE DEPENDENCIAS
    // ==========================================
    if (typeof bootstrap === 'undefined') {
        console.error("Bootstrap no está cargado.");
        return;
    }

    // Verificar que todos los elementos existen
    const modalElement = document.getElementById('modalCliente');
    const formCliente = document.getElementById('formCliente');
    const btnGuardar = document.getElementById('btnGuardarCliente');
    const tbody = document.getElementById('tbodyClientes');
    const inputBusqueda = document.getElementById('filtroBusqueda');
    const btnNuevoCliente = document.getElementById('btnNuevoCliente');

    if (!modalElement) {
        console.error("No se encontró el elemento modalCliente");
        return;
    }

    if (!btnNuevoCliente) {
        console.error("No se encontró el botón Nuevo Cliente");
        return;
    }

    // ==========================================
    // VARIABLES GLOBALES
    // ==========================================
    const modalCliente = new bootstrap.Modal(modalElement);
    let clientesCache = [];

    // Mapeo de listas de precios
    const listasPrecios = {
        '1': 'Efectivo / Contado',
        '2': 'Cuenta Corriente',
        '3': 'Tarjeta',
        '4': 'Mayorista'
    };

    // Paginación
    let paginaActual = 1;
    let registrosPorPagina = 10;
    let clientesFiltrados = [];

    // Listener Paginación
    const selectorRegistros = document.getElementById('selectorRegistros');
    if (selectorRegistros) {
        selectorRegistros.addEventListener('change', function () {
            registrosPorPagina = parseInt(this.value);
            paginaActual = 1;
            renderizarTabla(clientesFiltrados);
        });
    }

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    cargarClientes();

    // Event Listeners
    btnNuevoCliente.addEventListener('click', abrirModalNuevo);
    btnGuardar.addEventListener('click', guardarCliente);
    inputBusqueda.addEventListener('input', filtrarClientes);
    document.getElementById('filtroCondicion').addEventListener('change', filtrarClientes);
    document.getElementById('filtroEstado').addEventListener('change', filtrarClientes);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    // Toggle campos Cta Cte
    const tieneCta = document.getElementById('tiene_ctacte');
    if (tieneCta) {
        tieneCta.addEventListener('change', function () {
            const fields = document.querySelectorAll('.ctacte-field');
            fields.forEach(f => {
                if (this.checked) {
                    f.classList.remove('d-none');
                } else {
                    f.classList.add('d-none');
                }
            });
        });
    }

    // Navegación con Enter entre inputs
    formCliente.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            const focusableElements = Array.from(formCliente.querySelectorAll(
                'input:not([type="hidden"]):not([type="checkbox"]), select, textarea'
            )).filter(el => !el.disabled && el.offsetParent !== null);

            const currentIndex = focusableElements.indexOf(document.activeElement);

            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            }
        }
    });

    // ==========================================
    // FUNCIONES CRUD
    // ==========================================

    async function cargarClientes() {
        mostrarLoading();
        try {
            const response = await fetch('/api/clientes/buscar/?q=');
            const data = await response.json();

            clientesCache = data;
            renderizarTabla(data);

        } catch (error) {
            console.error("Error cargando clientes:", error);
            Swal.fire("Error", "No se pudieron cargar los clientes", "error");
        }
    }

    async function guardarCliente() {
        if (!formCliente.checkValidity()) {
            formCliente.reportValidity();
            return;
        }

        const id = document.getElementById('clienteId').value;
        const url = id ? `/api/clientes/${id}/editar/` : '/api/clientes/nuevo/';
        const formData = new FormData(formCliente);

        // Checkbox fix
        if (!document.getElementById('tiene_ctacte').checked) formData.append('tiene_ctacte', 'off');
        if (!document.getElementById('permitir_superar_limite').checked) formData.append('permitir_superar_limite', 'off');
        if (!document.getElementById('activo').checked) formData.append('activo', 'off');

        try {
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.ok) {
                modalCliente.hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado',
                    text: 'El cliente se guardó correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarClientes();
            } else {
                let msg = "Error al guardar";
                if (result.errors) {
                    msg = Object.values(result.errors).join("<br>");
                } else if (result.error) {
                    msg = result.error;
                }
                Swal.fire("Atención", msg, "warning");
            }

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error inesperado", "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar Cliente';
        }
    }

    window.editarCliente = async function (id) {
        try {
            const response = await fetch(`/api/clientes/${id}/`);
            const data = await response.json();

            if (data.error) {
                Swal.fire("Error", data.error, "error");
                return;
            }

            llenarFormulario(data);
            modalCliente.show();
            document.getElementById('modalClienteTitle').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Cliente';

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar el cliente", "error");
        }
    }

    window.eliminarCliente = function (id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/clientes/${id}/eliminar/`, { method: 'POST' });
                    const data = await response.json();

                    if (data.ok) {
                        Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
                        cargarClientes();
                    } else {
                        Swal.fire('Error', data.error || 'No se pudo eliminar', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Error de conexión', 'error');
                }
            }
        });
    }

    // ==========================================
    // FUNCIONES AUXILIARES
    // ==========================================

    function abrirModalNuevo() {
        formCliente.reset();
        document.getElementById('clienteId').value = "";
        document.getElementById('modalClienteTitle').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i> Nuevo Cliente';

        // Reset visibilidad campos
        document.querySelectorAll('.ctacte-field').forEach(f => f.classList.add('d-none'));

        modalCliente.show();
    }

    function llenarFormulario(data) {
        document.getElementById('clienteId').value = data.id;
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('tipo_cliente').value = data.tipo_cliente || 'P';
        document.getElementById('cuit').value = data.cuit || '';
        document.getElementById('domicilio').value = data.domicilio || '';

        document.getElementById('condicion_fiscal').value = data.condicion_fiscal || 'CF';
        document.getElementById('tipo_factura_preferida').value = data.tipo_factura_preferida || 'B';

        document.getElementById('telefono').value = data.telefono || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('contacto_nombre').value = data.contacto_nombre || '';
        document.getElementById('contacto_telefono').value = data.contacto_telefono || '';
        document.getElementById('contacto_email').value = data.contacto_email || '';

        document.getElementById('lista_precio').value = data.lista_precio || '1';
        document.getElementById('descuento_predeterminado').value = data.descuento_predeterminado || 0;

        document.getElementById('tiene_ctacte').checked = data.tiene_ctacte || false;
        document.getElementById('limite_credito').value = data.limite_credito || 0;
        document.getElementById('permitir_superar_limite').checked = data.permitir_superar_limite || false;

        document.getElementById('notas').value = data.notas || '';
        document.getElementById('activo').checked = data.activo !== false;

        // Trigger change
        document.getElementById('tiene_ctacte').dispatchEvent(new Event('change'));
    }

    function renderizarTabla(lista) {
        clientesFiltrados = lista;
        const totalPaginas = Math.ceil(lista.length / registrosPorPagina);

        // Ajustar página actual si es necesario
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            paginaActual = totalPaginas;
        }
        if (paginaActual < 1) {
            paginaActual = 1;
        }

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron clientes</td></tr>`;
            document.getElementById('contadorRegistros').innerText = `Mostrando 0 clientes`;
            renderizarPaginacion(0, 0);
            return;
        }

        // Calcular índices para la página actual
        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const clientesPagina = lista.slice(inicio, fin);

        clientesPagina.forEach(c => {
            const listaPrecioNombre = listasPrecios[c.lista_precio] || `Lista ${c.lista_precio}`;

            const row = `
                <tr>
                    <td class="ps-4">
                        <div class="fw-bold text-dark">${c.nombre}</div>
                        <small class="text-muted">${c.condicion_fiscal_display || ''}</small>
                    </td>
                    <td>
                        ${c.cuit ? `<span class="badge bg-light text-dark border">${c.cuit}</span>` : '<span class="text-muted">-</span>'}
                    </td>
                    <td>
                        <span class="badge bg-info text-dark">${listaPrecioNombre}</span>
                    </td>
                    <td>
                        ${c.telefono || '<span class="text-muted small">Sin teléfono</span>'}
                    </td>
                    <td>
                        <span class="fw-bold text-success">$ 0.00</span>
                    </td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarCliente(${c.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${c.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        document.getElementById('contadorRegistros').innerText = `Mostrando ${inicio + 1}-${Math.min(fin, lista.length)} de ${lista.length} clientes`;
        renderizarPaginacion(lista.length, totalPaginas);
    }

    function filtrarClientes() {
        const busqueda = inputBusqueda.value.toLowerCase();
        const condicion = document.getElementById('filtroCondicion').value;
        const estado = document.getElementById('filtroEstado').value;

        const filtrados = clientesCache.filter(c => {
            const matchBusqueda = !busqueda ||
                c.nombre.toLowerCase().includes(busqueda) ||
                (c.cuit && c.cuit.includes(busqueda));

            const matchCondicion = !condicion || c.condicion_fiscal === condicion;
            const matchEstado = estado === 'todos' ||
                (estado === 'activos' && c.activo) ||
                (estado === 'inactivos' && !c.activo);

            return matchBusqueda && matchCondicion && matchEstado;
        });

        renderizarTabla(filtrados);
    }

    function limpiarFiltros() {
        inputBusqueda.value = "";
        document.getElementById('filtroCondicion').value = "";
        document.getElementById('filtroEstado').value = "todos";
        paginaActual = 1;
        renderizarTabla(clientesCache);
    }

    function mostrarLoading() {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Cargando...</p></td></tr>`;
    }

    function renderizarPaginacion(totalRegistros, totalPaginas) {
        const paginacionContainer = document.getElementById('paginacionClientes');

        if (!paginacionContainer || totalPaginas <= 1) {
            if (paginacionContainer) paginacionContainer.innerHTML = '';
            return;
        }

        let html = '<nav><ul class="pagination pagination-sm mb-0 justify-content-center">';

        // Botón anterior
        html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>`;

        // Páginas
        const rango = 2;
        let inicio = Math.max(1, paginaActual - rango);
        let fin = Math.min(totalPaginas, paginaActual + rango);

        if (inicio > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(1); return false;">1</a></li>`;
            if (inicio > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = inicio; i <= fin; i++) {
            html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>`;
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">${totalPaginas}</a></li>`;
        }

        // Botón siguiente
        html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>`;

        html += '</ul></nav>';
        paginacionContainer.innerHTML = html;
    }

    window.cambiarPagina = function (nuevaPagina) {
        paginaActual = nuevaPagina;
        renderizarTabla(clientesFiltrados);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

});
