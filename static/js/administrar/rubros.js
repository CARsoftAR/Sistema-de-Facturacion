document.addEventListener("DOMContentLoaded", function () {

    if (typeof bootstrap === 'undefined') {
        console.error("Bootstrap no está cargado.");
        return;
    }

    const modalElement = document.getElementById('modalRubro');
    const formRubro = document.getElementById('formRubro');
    const btnGuardar = document.getElementById('btnGuardarRubro');
    const tbody = document.getElementById('tbodyRubros');
    const btnNuevoRubro = document.getElementById('btnNuevoRubro');
    const inputBusqueda = document.getElementById('filtroBusqueda');
    const selectorRegistros = document.getElementById('selectorRegistros');

    // Variables de paginación
    let rubrosCache = [];
    let paginaActual = 1;
    let registrosPorPagina = 10;

    if (!modalElement || !formRubro || !btnGuardar || !tbody || !btnNuevoRubro) {
        console.error("Faltan elementos necesarios en el DOM");
        return;
    }

    const modalRubro = new bootstrap.Modal(modalElement);

    // --- INICIALIZACIÓN ---
    cargarRubros();

    // --- EVENTOS ---
    btnNuevoRubro.addEventListener('click', abrirModalNuevo);
    btnGuardar.addEventListener('click', guardarRubro);
    inputBusqueda.addEventListener('input', () => {
        paginaActual = 1;
        renderizarTabla();
    });
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    if (selectorRegistros) {
        selectorRegistros.addEventListener('change', function () {
            registrosPorPagina = parseInt(this.value);
            paginaActual = 1;
            renderizarTabla();
        });
    }

    formRubro.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const focusableElements = Array.from(formRubro.querySelectorAll(
                'input:not([type="hidden"]), textarea'
            )).filter(el => !el.disabled);
            const currentIndex = focusableElements.indexOf(document.activeElement);
            if (currentIndex === focusableElements.length - 1) {
                guardarRubro();
            } else if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            }
        }
    });

    // --- FUNCIONES ---

    async function cargarRubros() {
        mostrarLoading();
        try {
            const response = await fetch('/api/rubros/listar/');
            const result = await response.json();

            rubrosCache = result.data || [];
            renderizarTabla();

        } catch (error) {
            console.error("Error cargando rubros:", error);
            Swal.fire("Error", "No se pudieron cargar los rubros", "error");
        }
    }

    async function guardarRubro() {
        if (!formRubro.checkValidity()) {
            formRubro.reportValidity();
            return;
        }

        const id = document.getElementById('rubroId').value;
        const url = '/api/rubros/guardar/';
        const formData = new FormData(formRubro);

        try {
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            });

            const result = await response.json();

            if (result.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado',
                    text: 'El rubro se guardó correctamente',
                    timer: 800,
                    showConfirmButton: false
                });

                cargarRubros();

                if (!id) {
                    setTimeout(() => {
                        formRubro.reset();
                        document.getElementById('rubroId').value = "";
                        document.getElementById('nombre').focus();
                    }, 850);
                } else {
                    modalRubro.hide();
                }
            } else {
                let msg = "Error al guardar";
                if (result.error) {
                    msg = result.error;
                }
                Swal.fire("Atención", msg, "warning");
            }

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error inesperado", "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar Rubro';
        }
    }

    window.editarRubro = async function (id) {
        try {
            const response = await fetch(`/api/rubros/${id}/`);
            const data = await response.json();

            if (data.error) {
                Swal.fire("Error", data.error, "error");
                return;
            }

            llenarFormulario(data);
            modalRubro.show();
            document.getElementById('modalRubroTitle').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Rubro';

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar el rubro", "error");
        }
    }

    window.eliminarRubro = function (id) {
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
                    const response = await fetch(`/api/rubros/${id}/eliminar/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    });
                    const data = await response.json();

                    if (data.success || data.ok) {
                        Swal.fire('Eliminado', 'El rubro ha sido eliminado.', 'success');
                        cargarRubros();
                    } else {
                        Swal.fire('Error', data.error || 'No se pudo eliminar', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Error de conexión', 'error');
                }
            }
        });
    }

    function abrirModalNuevo() {
        formRubro.reset();
        document.getElementById('rubroId').value = "";
        document.getElementById('modalRubroTitle').innerHTML = '<i class="bi bi-tags me-2"></i> Nuevo Rubro';
        modalRubro.show();

        setTimeout(() => {
            document.getElementById('nombre').focus();
        }, 300);
    }

    function llenarFormulario(data) {
        document.getElementById('rubroId').value = data.id;
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('descripcion').value = data.descripcion || '';
    }

    function renderizarTabla() {
        const busqueda = inputBusqueda.value.toLowerCase();

        // Filtrar
        const filtrados = rubrosCache.filter(r => {
            return r.nombre.toLowerCase().includes(busqueda) ||
                (r.descripcion && r.descripcion.toLowerCase().includes(busqueda));
        });

        // Paginar
        const totalRegistros = filtrados.length;
        const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

        if (paginaActual > totalPaginas) paginaActual = 1;

        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const datosPagina = filtrados.slice(inicio, fin);

        tbody.innerHTML = "";

        if (datosPagina.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No se encontraron rubros</td></tr>`;
            document.getElementById('contadorRegistros').innerText = `Mostrando 0 rubros`;
            renderizarPaginacion(0);
            return;
        }

        datosPagina.forEach(r => {
            const row = `
                <tr>
                    <td class="ps-4">
                        <div class="fw-bold text-dark">${r.nombre}</div>
                    </td>
                    <td>
                        <small class="text-muted">${r.descripcion || '-'}</small>
                    </td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarRubro(${r.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarRubro(${r.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        document.getElementById('contadorRegistros').innerText = `Mostrando ${inicio + 1} a ${Math.min(fin, totalRegistros)} de ${totalRegistros} rubros`;
        renderizarPaginacion(totalPaginas);
    }

    function renderizarPaginacion(totalPaginas) {
        const paginacionContainer = document.getElementById('paginacionRubros');
        if (!paginacionContainer) return;

        paginacionContainer.innerHTML = "";

        if (totalPaginas <= 1) return;

        // Botón Anterior
        const btnPrev = document.createElement('li');
        btnPrev.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
        btnPrev.innerHTML = `<a class="page-link" href="#" aria-label="Anterior"><span aria-hidden="true">&laquo;</span></a>`;
        btnPrev.onclick = (e) => {
            e.preventDefault();
            if (paginaActual > 1) {
                paginaActual--;
                renderizarTabla();
            }
        };
        paginacionContainer.appendChild(btnPrev);

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = (e) => {
                e.preventDefault();
                paginaActual = i;
                renderizarTabla();
            };
            paginacionContainer.appendChild(li);
        }

        // Botón Siguiente
        const btnNext = document.createElement('li');
        btnNext.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
        btnNext.innerHTML = `<a class="page-link" href="#" aria-label="Siguiente"><span aria-hidden="true">&raquo;</span></a>`;
        btnNext.onclick = (e) => {
            e.preventDefault();
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarTabla();
            }
        };
        paginacionContainer.appendChild(btnNext);
    }

    function limpiarFiltros() {
        inputBusqueda.value = "";
        paginaActual = 1;
        renderizarTabla();
    }

    function mostrarLoading() {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Cargando...</p></td></tr>`;
    }

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

});
