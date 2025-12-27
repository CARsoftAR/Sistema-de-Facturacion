document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // VERIFICACIÓN DE DEPENDENCIAS
    // ==========================================
    if (typeof bootstrap === 'undefined') {
        console.error("Bootstrap no está cargado.");
        return;
    }

    // Elementos DOM
    const modalElement = document.getElementById('modalMarca');
    const formMarca = document.getElementById('formMarca');
    const btnGuardar = document.getElementById('btnGuardarMarca');
    const tbody = document.getElementById('tbodyMarcas');
    const btnNuevaMarca = document.getElementById('btnNuevaMarca');
    const inputBusqueda = document.getElementById('filtroBusqueda');
    const selectorRegistros = document.getElementById('selectorRegistros');

    if (!modalElement || !formMarca || !btnGuardar || !tbody) {
        console.error("Faltan elementos necesarios en el DOM");
        return;
    }

    // ==========================================
    // VARIABLES GLOBALES
    // ==========================================
    const modalMarca = new bootstrap.Modal(modalElement);
    let marcasCache = [];

    // Paginación
    let paginaActual = 1;
    let registrosPorPagina = 10;
    let marcasFiltradas = [];

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    cargarMarcas();

    // Event Listeners
    btnNuevaMarca.addEventListener('click', abrirModalNuevo);
    btnGuardar.addEventListener('click', guardarMarca);
    inputBusqueda.addEventListener('input', filtrarMarcas);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    if (selectorRegistros) {
        selectorRegistros.addEventListener('change', function () {
            registrosPorPagina = parseInt(this.value);
            paginaActual = 1;
            renderizarTabla(marcasFiltradas);
        });
    }

    // Navegación con Enter
    formMarca.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const focusableElements = Array.from(formMarca.querySelectorAll(
                'input:not([type="hidden"]), select, textarea'
            )).filter(el => !el.disabled && el.offsetParent !== null);

            const currentIndex = focusableElements.indexOf(document.activeElement);
            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            } else if (currentIndex === focusableElements.length - 1) {
                // Si es el último campo, guardar
                guardarMarca();
            }
        }
    });

    // Foco al abrir modal
    modalElement.addEventListener('shown.bs.modal', function () {
        document.getElementById('nombre').focus();
    });

    // ==========================================
    // FUNCIONES DE CARGA
    // ==========================================

    async function cargarMarcas() {
        mostrarLoading();
        try {
            const response = await fetch('/api/marcas/listar/');
            const result = await response.json();
            // La API devuelve { data: [...] } o directamente [...]
            marcasCache = result.data || result;

            filtrarMarcas();

        } catch (error) {
            console.error("Error cargando marcas:", error);
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error al cargar marcas</td></tr>`;
        }
    }

    // ==========================================
    // FUNCIONES CRUD
    // ==========================================

    async function guardarMarca() {
        if (!formMarca.checkValidity()) {
            formMarca.classList.add('was-validated');
            return;
        }

        const id = document.getElementById('marcaId').value;
        const url = '/api/marcas/guardar/';
        const formData = {
            id: id,
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value
        };

        try {
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.ok || result.id) {
                // Si es edición, cerrar modal. Si es nuevo, limpiar y dejar abierto para carga rápida?
                // El usuario prefiere carga rápida.
                // Pero en rubros decidimos cerrar modal.
                // Voy a cerrar modal para ser consistente, pero el foco volverá al botón nuevo.
                // O mejor: Limpiar form y poner foco en nombre para seguir cargando si es NUEVO.

                if (!id) { // Es nuevo
                    Swal.fire({
                        icon: 'success',
                        title: 'Guardado',
                        text: 'Marca guardada correctamente',
                        timer: 1000,
                        showConfirmButton: false
                    });
                    formMarca.reset();
                    formMarca.classList.remove('was-validated');
                    document.getElementById('marcaId').value = "";
                    setTimeout(() => document.getElementById('nombre').focus(), 300);
                } else { // Es edición
                    modalMarca.hide();
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Marca actualizada correctamente',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }

                cargarMarcas();
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
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar';
        }
    }

    window.editarMarca = async function (id) {
        try {
            const response = await fetch(`/api/marcas/${id}/`);
            const data = await response.json();

            if (data.error) {
                Swal.fire("Error", data.error, "error");
                return;
            }

            document.getElementById('marcaId').value = data.id;
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('descripcion').value = data.descripcion || '';

            modalMarca.show();
            document.getElementById('modalMarcaTitle').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Marca';

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar la marca", "error");
        }
    }

    window.eliminarMarca = function (id) {
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
                    const response = await fetch(`/api/marcas/${id}/eliminar/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });
                    const data = await response.json();

                    if (data.ok) {
                        Swal.fire('Eliminado', 'La marca ha sido eliminada.', 'success');
                        cargarMarcas();
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

    function abrirModalNuevo() {
        formMarca.reset();
        formMarca.classList.remove('was-validated');
        document.getElementById('marcaId').value = "";
        document.getElementById('modalMarcaTitle').innerHTML = '<i class="bi bi-tag-fill me-2"></i> Nueva Marca';

        modalMarca.show();
    }

    function renderizarTabla(lista) {
        marcasFiltradas = lista;
        const totalPaginas = Math.ceil(lista.length / registrosPorPagina);

        if (paginaActual > totalPaginas && totalPaginas > 0) paginaActual = totalPaginas;
        if (paginaActual < 1) paginaActual = 1;

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No se encontraron marcas</td></tr>`;
            document.getElementById('contadorRegistros').innerText = `Mostrando 0 marcas`;
            renderizarPaginacion(0, 0);
            return;
        }

        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const pagina = lista.slice(inicio, fin);

        pagina.forEach(m => {
            const row = `
                <tr>
                    <td class="ps-4 fw-bold text-dark">${m.nombre}</td>
                    <td class="text-muted">${m.descripcion || '-'}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarMarca(${m.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarMarca(${m.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        document.getElementById('contadorRegistros').innerText = `Mostrando ${inicio + 1}-${Math.min(fin, lista.length)} de ${lista.length} marcas`;
        renderizarPaginacion(lista.length, totalPaginas);
    }

    function renderizarPaginacion(totalRegistros, totalPaginas) {
        const container = document.getElementById('paginacionMarcas');
        if (!container || totalPaginas < 1) {
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
        renderizarTabla(marcasFiltradas);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function filtrarMarcas() {
        const q = inputBusqueda.value.toLowerCase();

        const filtrados = marcasCache.filter(m => {
            return (m.nombre && m.nombre.toLowerCase().includes(q)) ||
                (m.descripcion && m.descripcion.toLowerCase().includes(q));
        });

        paginaActual = 1;
        renderizarTabla(filtrados);
    }

    function limpiarFiltros() {
        inputBusqueda.value = "";
        paginaActual = 1;
        renderizarTabla(marcasCache);
    }

    function mostrarLoading() {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Cargando...</p></td></tr>`;
    }

});
