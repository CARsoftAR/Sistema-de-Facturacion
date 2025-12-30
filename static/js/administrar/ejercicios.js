let ejerciciosOriginales = [];
let ejerciciosFiltrados = [];
let modalEjercicio;

// Configuración de paginación
let paginaActual = 1;
let itemsPorPagina = 5;

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar modal
    const modalElement = document.getElementById('modalEjercicio');
    if (modalElement) {
        modalEjercicio = new bootstrap.Modal(modalElement);
    }

    // Event listeners
    const btnNuevoEjercicio = document.getElementById('btnNuevoEjercicio');
    if (btnNuevoEjercicio) {
        btnNuevoEjercicio.addEventListener('click', abrirModalEjercicio);
    }

    const btnGuardarEjercicio = document.getElementById('btnGuardarEjercicio');
    if (btnGuardarEjercicio) {
        btnGuardarEjercicio.addEventListener('click', guardarEjercicio);
    }

    // Filtros
    document.getElementById('filtroTexto').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroAnio').addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('itemsPorPagina').addEventListener('change', function () {
        itemsPorPagina = parseInt(this.value);
        paginaActual = 1;
        renderizarPaginado();
    });

    // Cargar ejercicios
    cargarEjercicios();
});

function cargarEjercicios() {
    fetch('/api/contabilidad/ejercicios/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                ejerciciosOriginales = data.ejercicios;
                ejerciciosFiltrados = [...ejerciciosOriginales];
                cargarFiltroAnios();
                renderizarPaginado();
            } else {
                mostrarError('Error al cargar ejercicios: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error al cargar los ejercicios. ' + error);
        });
}

function cargarFiltroAnios() {
    const anios = new Set();
    ejerciciosOriginales.forEach(e => {
        const anio = new Date(e.fecha_inicio).getFullYear();
        anios.add(anio);
    });

    const select = document.getElementById('filtroAnio');
    const opcionActual = select.value;
    select.innerHTML = '<option value="">Todos</option>';

    Array.from(anios).sort((a, b) => b - a).forEach(anio => {
        select.innerHTML += `<option value="${anio}">${anio}</option>`;
    });

    if (opcionActual) select.value = opcionActual;
}

function aplicarFiltros() {
    const textoFiltro = document.getElementById('filtroTexto').value.toLowerCase();
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const anioFiltro = document.getElementById('filtroAnio').value;

    ejerciciosFiltrados = ejerciciosOriginales.filter(ejercicio => {
        // Filtro de texto
        const coincideTexto = !textoFiltro ||
            ejercicio.descripcion.toLowerCase().includes(textoFiltro);

        // Filtro de estado
        let coincideEstado = true;
        if (estadoFiltro === 'abierto') {
            coincideEstado = !ejercicio.cerrado;
        } else if (estadoFiltro === 'cerrado') {
            coincideEstado = ejercicio.cerrado;
        }

        // Filtro de año
        const coincideAnio = !anioFiltro ||
            new Date(ejercicio.fecha_inicio).getFullYear().toString() === anioFiltro;

        return coincideTexto && coincideEstado && coincideAnio;
    });

    paginaActual = 1;
    renderizarPaginado();
}

function limpiarFiltros() {
    document.getElementById('filtroTexto').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroAnio').value = '';
    aplicarFiltros();
}

function renderizarPaginado() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const ejerciciosPagina = ejerciciosFiltrados.slice(inicio, fin);

    renderizarTabla(ejerciciosPagina);
    actualizarInfoPaginacion();
    renderizarControlesPaginacion();
}

function renderizarTabla(ejercicios) {
    const tbody = document.getElementById('tablaEjercicios');

    if (ejercicios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron ejercicios con los filtros aplicados.</td></tr>';
        return;
    }

    let html = '';
    ejercicios.forEach(e => {
        const estadoBadge = e.cerrado
            ? '<span class="badge bg-danger">Cerrado</span>'
            : '<span class="badge bg-success">Abierto</span>';

        const duracion = calcularDuracion(e.fecha_inicio, e.fecha_fin);

        html += `
            <tr>
                <td><span class="fw-bold">${e.descripcion}</span></td>
                <td>${formatearFecha(e.fecha_inicio)}</td>
                <td>${formatearFecha(e.fecha_fin)}</td>
                <td>${duracion}</td>
                <td>${estadoBadge}</td>
                <td class="text-end">
                    <a href="/contabilidad/asientos/?ejercicio_id=${e.id}" class="btn btn-sm btn-outline-info me-1" title="Ver Asientos">
                        <i class="bi bi-list-check"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarEjercicio(${e.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarEjercicio(${e.id}, '${e.descripcion.replace(/'/g, "\\'")}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-AR');
}

function calcularDuracion(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    const meses = Math.round(dias / 30);

    if (meses >= 12) {
        const anios = Math.floor(meses / 12);
        return `${anios} año${anios > 1 ? 's' : ''}`;
    }
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
}

function actualizarInfoPaginacion() {
    const inicio = (paginaActual - 1) * itemsPorPagina + 1;
    const fin = Math.min(inicio + itemsPorPagina - 1, ejerciciosFiltrados.length);

    document.getElementById('rangoInicio').textContent = ejerciciosFiltrados.length > 0 ? inicio : 0;
    document.getElementById('rangoFin').textContent = fin;
    document.getElementById('ejerciciosTotales').textContent = ejerciciosFiltrados.length;
}

function renderizarControlesPaginacion() {
    const totalPaginas = Math.ceil(ejerciciosFiltrados.length / itemsPorPagina);
    const paginacion = document.getElementById('paginacion');

    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }

    let html = '';

    // Botón anterior
    html += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;

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
        html += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>
        `;
    }

    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">${totalPaginas}</a></li>`;
    }

    // Botón siguiente
    html += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;

    paginacion.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(ejerciciosFiltrados.length / itemsPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    paginaActual = nuevaPagina;
    renderizarPaginado();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarError(mensaje) {
    const tbody = document.getElementById('tablaEjercicios');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="alert alert-danger mb-0">${mensaje}</div></td></tr>`;
}

// ==========================================
// CRUD
// ==========================================

function abrirModalEjercicio() {
    if (!modalEjercicio) {
        console.error('Modal no inicializado');
        return;
    }

    document.getElementById('formEjercicio').reset();
    document.getElementById('ejercicioId').value = '';
    document.getElementById('modalEjercicioTitle').innerText = 'Nuevo Ejercicio';
    document.getElementById('cerrado').checked = false;

    modalEjercicio.show();
}

function editarEjercicio(id) {
    const ejercicio = ejerciciosOriginales.find(e => e.id === id);
    if (ejercicio) {
        document.getElementById('ejercicioId').value = ejercicio.id;
        document.getElementById('descripcion').value = ejercicio.descripcion;
        document.getElementById('fecha_inicio').value = ejercicio.fecha_inicio;
        document.getElementById('fecha_fin').value = ejercicio.fecha_fin;
        document.getElementById('cerrado').checked = ejercicio.cerrado;

        document.getElementById('modalEjercicioTitle').innerText = 'Editar Ejercicio';
        modalEjercicio.show();
    }
}

function guardarEjercicio() {
    const id = document.getElementById('ejercicioId').value;
    const esEdicion = !!id;

    const data = {
        descripcion: document.getElementById('descripcion').value,
        fecha_inicio: document.getElementById('fecha_inicio').value,
        fecha_fin: document.getElementById('fecha_fin').value,
        cerrado: document.getElementById('cerrado').checked
    };

    const url = esEdicion
        ? `/api/contabilidad/ejercicios/${id}/editar/`
        : '/api/contabilidad/ejercicios/crear/';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                modalEjercicio.hide();
                cargarEjercicios();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function eliminarEjercicio(id, descripcion) {
    if (!confirm(`¿Está seguro de eliminar el ejercicio "${descripcion}"?`)) return;

    fetch(`/api/contabilidad/ejercicios/${id}/eliminar/`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                cargarEjercicios();
            } else {
                alert('Error: ' + (data.error || data.mensaje));
            }
        })
        .catch(error => console.error('Error:', error));
}
