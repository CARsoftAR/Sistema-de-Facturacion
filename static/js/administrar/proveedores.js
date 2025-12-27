document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // VERIFICACIÓN DE DEPENDENCIAS
    // ==========================================
    if (typeof bootstrap === 'undefined') {
        console.error("Bootstrap no está cargado.");
        return;
    }

    // Elementos DOM
    const modalElement = document.getElementById('modalProveedor');
    const formProveedor = document.getElementById('formProveedor');
    const btnGuardar = document.getElementById('btnGuardarProveedor');
    const tbody = document.getElementById('tbodyProveedores');
    const btnNuevoProveedor = document.getElementById('btnNuevoProveedor');
    const inputBusqueda = document.getElementById('filtroBusqueda');
    const selectorRegistros = document.getElementById('selectorRegistros');

    // Selects de ubicación
    const selectProvincia = document.getElementById('provincia');
    const selectLocalidad = document.getElementById('localidad');

    if (!modalElement || !formProveedor || !btnGuardar || !tbody) {
        console.error("Faltan elementos necesarios en el DOM");
        return;
    }

    // ==========================================
    // VARIABLES GLOBALES
    // ==========================================
    const modalProveedor = new bootstrap.Modal(modalElement);
    let proveedoresCache = [];
    let localidadesCache = [];

    // Paginación
    let paginaActual = 1;
    let registrosPorPagina = 10;
    let proveedoresFiltrados = [];

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    cargarLocalidades(); // Cargar localidades para tenerlas listas
    cargarProveedores();

    // Event Listeners
    btnNuevoProveedor.addEventListener('click', abrirModalNuevo);
    btnGuardar.addEventListener('click', guardarProveedor);
    inputBusqueda.addEventListener('input', filtrarProveedores);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    if (selectorRegistros) {
        selectorRegistros.addEventListener('change', function () {
            registrosPorPagina = parseInt(this.value);
            paginaActual = 1;
            renderizarTabla(proveedoresFiltrados);
        });
    }

    // Dependencia Provincia -> Localidad
    if (selectProvincia && selectLocalidad) {
        selectProvincia.addEventListener('change', function () {
            actualizarSelectLocalidades(this.value);
        });
    }

    // Navegación con Enter
    formProveedor.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const focusableElements = Array.from(formProveedor.querySelectorAll(
                'input:not([type="hidden"]), select, textarea'
            )).filter(el => !el.disabled && el.offsetParent !== null);

            const currentIndex = focusableElements.indexOf(document.activeElement);
            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            } else if (currentIndex === focusableElements.length - 1) {
                // Si es el último campo, guardar
                guardarProveedor();
            }
        }
    });

    // ==========================================
    // FUNCIONES DE CARGA
    // ==========================================

    async function cargarLocalidades() {
        try {
            const response = await fetch('/api/localidades/listar/');
            const result = await response.json();
            localidadesCache = result.data || result;
        } catch (error) {
            console.error("Error cargando localidades:", error);
        }
    }

    function actualizarSelectLocalidades(provinciaId, localidadSeleccionadaId = null) {
        selectLocalidad.innerHTML = '<option value="">Seleccionar...</option>';
        selectLocalidad.disabled = false;

        // Nota: El modelo Localidad actual no tiene relación con Provincia, 
        // por lo que mostramos todas las localidades disponibles.
        localidadesCache.forEach(l => {
            const option = document.createElement('option');
            option.value = l.id;
            option.textContent = l.nombre;
            if (localidadSeleccionadaId && l.id == localidadSeleccionadaId) {
                option.selected = true;
            }
            selectLocalidad.appendChild(option);
        });
    }

    async function cargarProveedores() {
        mostrarLoading();
        try {
            const response = await fetch('/api/proveedores/lista/');
            const data = await response.json();
            proveedoresCache = data;
            filtrarProveedores();
        } catch (error) {
            console.error("Error cargando proveedores:", error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar proveedores</td></tr>`;
        }
    }

    // ==========================================
    // FUNCIONES CRUD
    // ==========================================

    async function guardarProveedor() {
        if (!formProveedor.checkValidity()) {
            formProveedor.classList.add('was-validated');
            return;
        }

        const id = document.getElementById('proveedorId').value;
        const url = id ? `/api/proveedores/${id}/editar/` : '/api/proveedores/nuevo/';
        const formData = new FormData(formProveedor);

        try {
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.ok || result.id) {
                modalProveedor.hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado',
                    text: 'El proveedor se guardó correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarProveedores();
            } else {
                let msg = result.error || "Error al guardar";
                if (result.errors) {
                    msg = Object.values(result.errors).flat().join("<br>");
                }
                Swal.fire("Atención", msg, "warning");
            }

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error inesperado", "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar Proveedor';
        }
    }

    window.editarProveedor = async function (id) {
        try {
            const response = await fetch(`/api/proveedores/${id}/`);
            const data = await response.json();

            if (data.error) {
                Swal.fire("Error", data.error, "error");
                return;
            }

            llenarFormulario(data);
            modalProveedor.show();
            document.getElementById('modalProveedorTitle').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Proveedor';

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar el proveedor", "error");
        }
    }

    window.eliminarProveedor = function (id) {
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
                    const response = await fetch(`/api/proveedores/${id}/eliminar/`, { method: 'POST' });
                    const data = await response.json();

                    if (data.ok) {
                        Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
                        cargarProveedores();
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
        formProveedor.reset();
        formProveedor.classList.remove('was-validated');
        document.getElementById('proveedorId').value = "";
        document.getElementById('modalProveedorTitle').innerHTML = '<i class="bi bi-building-add me-2"></i> Nuevo Proveedor';

        // Cargar todas las localidades
        actualizarSelectLocalidades(null);

        modalProveedor.show();

        // Foco en el primer campo
        setTimeout(() => document.getElementById('nombre').focus(), 500);
    }

    function llenarFormulario(data) {
        document.getElementById('proveedorId').value = data.id;
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('cuit').value = data.cuit || '';
        document.getElementById('telefono').value = data.telefono || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('direccion').value = data.direccion || '';
        document.getElementById('notas').value = data.notas || '';

        // Provincia y Localidad
        if (data.provincia) {
            selectProvincia.value = data.provincia;
            actualizarSelectLocalidades(data.provincia, data.localidad);
        } else {
            selectProvincia.value = "";
            actualizarSelectLocalidades(null);
        }
    }

    function renderizarTabla(lista) {
        proveedoresFiltrados = lista;
        const totalPaginas = Math.ceil(lista.length / registrosPorPagina);

        if (paginaActual > totalPaginas && totalPaginas > 0) paginaActual = totalPaginas;
        if (paginaActual < 1) paginaActual = 1;

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No se encontraron proveedores</td></tr>`;
            document.getElementById('contadorRegistros').innerText = `Mostrando 0 proveedores`;
            renderizarPaginacion(0, 0);
            return;
        }

        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const pagina = lista.slice(inicio, fin);

        pagina.forEach(p => {
            const row = `
                <tr>
                    <td class="ps-4">
                        <div class="fw-bold text-dark">${p.nombre}</div>
                        ${p.email ? `<small class="text-muted"><i class="bi bi-envelope"></i> ${p.email}</small>` : ''}
                    </td>
                    <td>${p.cuit || '-'}</td>
                    <td>${p.telefono || '-'}</td>
                    <td>
                        <small class="text-muted">${p.direccion || '-'}</small>
                    </td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProveedor(${p.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarProveedor(${p.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        document.getElementById('contadorRegistros').innerText = `Mostrando ${inicio + 1}-${Math.min(fin, lista.length)} de ${lista.length} proveedores`;
        renderizarPaginacion(lista.length, totalPaginas);
    }

    function renderizarPaginacion(totalRegistros, totalPaginas) {
        const container = document.getElementById('paginacionProveedores');
        if (!container || totalPaginas <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '<nav><ul class="pagination pagination-sm mb-0 justify-content-end">';

        // Prev
        html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;"><i class="bi bi-chevron-left"></i></a>
        </li>`;

        // Pages
        const rango = 2;
        let inicio = Math.max(1, paginaActual - rango);
        let fin = Math.min(totalPaginas, paginaActual + rango);

        if (inicio > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(1); return false;">1</a></li>`;
            if (inicio > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        for (let i = inicio; i <= fin; i++) {
            html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>`;
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">${totalPaginas}</a></li>`;
        }

        // Next
        html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;"><i class="bi bi-chevron-right"></i></a>
        </li>`;

        html += '</ul></nav>';
        container.innerHTML = html;
    }

    window.cambiarPagina = function (nuevaPagina) {
        paginaActual = nuevaPagina;
        renderizarTabla(proveedoresFiltrados);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function filtrarProveedores() {
        const q = inputBusqueda.value.toLowerCase();

        const filtrados = proveedoresCache.filter(p => {
            return (p.nombre && p.nombre.toLowerCase().includes(q)) ||
                (p.cuit && p.cuit.includes(q)) ||
                (p.telefono && p.telefono.includes(q)) ||
                (p.email && p.email.toLowerCase().includes(q));
        });

        paginaActual = 1;
        renderizarTabla(filtrados);
    }

    function limpiarFiltros() {
        inputBusqueda.value = "";
        paginaActual = 1;
        renderizarTabla(proveedoresCache);
    }

    function mostrarLoading() {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Cargando...</p></td></tr>`;
    }

});
