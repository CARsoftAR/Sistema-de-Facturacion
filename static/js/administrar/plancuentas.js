let cuentasCache = []; // Para guardar las cuentas y usar en el select de padres
let cuentasOriginales = []; // Todas las cuentas sin filtrar
let cuentasFiltradas = []; // Cuentas después de aplicar filtros
let modalCuenta;

// Configuración de paginación
let paginaActual = 1;
let itemsPorPagina = 10;

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar modal
    const modalElement = document.getElementById('modalCuenta');
    if (modalElement) {
        modalCuenta = new bootstrap.Modal(modalElement);
    }

    // Event listeners
    const btnNuevaCuenta = document.getElementById('btnNuevaCuenta');
    if (btnNuevaCuenta) {
        btnNuevaCuenta.addEventListener('click', abrirModalCuenta);
    }

    const btnGuardarCuenta = document.getElementById('btnGuardarCuenta');
    if (btnGuardarCuenta) {
        btnGuardarCuenta.addEventListener('click', guardarCuenta);
    }

    // Filtros
    document.getElementById('filtroTexto').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroImputable').addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('itemsPorPagina').addEventListener('change', function () {
        itemsPorPagina = parseInt(this.value);
        paginaActual = 1;
        renderizarPaginado();
    });

    // Cargar plan de cuentas
    cargarPlanCuentas();
});

function cargarPlanCuentas() {
    fetch('/api/contabilidad/plan-cuentas/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Aplanar el árbol para trabajar con lista plana
                cuentasOriginales = aplanarArbolCompleto(data.cuentas);
                cuentasFiltradas = [...cuentasOriginales];
                cuentasCache = [...cuentasOriginales];

                cargarSelectPadres();
                renderizarPaginado();
            } else {
                mostrarError('Error al cargar plan de cuentas: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error al cargar el plan de cuentas. ' + error);
        });
}

function aplanarArbolCompleto(nodos, resultado = []) {
    nodos.forEach(nodo => {
        resultado.push({
            id: nodo.id,
            codigo: nodo.codigo,
            nombre: nodo.nombre,
            tipo: nodo.tipo,
            imputable: nodo.imputable,
            nivel: nodo.nivel,
            padre_id: nodo.padre_id
        });
        if (nodo.hijos && nodo.hijos.length > 0) {
            aplanarArbolCompleto(nodo.hijos, resultado);
        }
    });
    return resultado;
}

function aplicarFiltros() {
    const textoFiltro = document.getElementById('filtroTexto').value.toLowerCase();
    const tipoFiltro = document.getElementById('filtroTipo').value;
    const imputableFiltro = document.getElementById('filtroImputable').value;

    cuentasFiltradas = cuentasOriginales.filter(cuenta => {
        // Filtro de texto
        const coincideTexto = !textoFiltro ||
            cuenta.codigo.toLowerCase().includes(textoFiltro) ||
            cuenta.nombre.toLowerCase().includes(textoFiltro);

        // Filtro de tipo
        const coincideTipo = !tipoFiltro || cuenta.tipo === tipoFiltro;

        // Filtro de imputable
        let coincideImputable = true;
        if (imputableFiltro === 'true') {
            coincideImputable = cuenta.imputable === true;
        } else if (imputableFiltro === 'false') {
            coincideImputable = cuenta.imputable === false;
        }

        return coincideTexto && coincideTipo && coincideImputable;
    });

    paginaActual = 1;
    renderizarPaginado();
}

function limpiarFiltros() {
    document.getElementById('filtroTexto').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroImputable').value = '';
    aplicarFiltros();
}

function renderizarPaginado() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const cuentasPagina = cuentasFiltradas.slice(inicio, fin);

    renderizarCuentas(cuentasPagina);
    actualizarInfoPaginacion();
    renderizarControlesPaginacion();
}

function renderizarCuentas(cuentas) {
    const contenedor = document.getElementById('arbolCuentas');

    if (cuentas.length === 0) {
        contenedor.innerHTML = '<div class="text-center py-5 text-muted">No se encontraron cuentas con los filtros aplicados.</div>';
        return;
    }

    let html = '<div class="list-group list-group-flush">';
    cuentas.forEach(cuenta => {
        const padding = (cuenta.nivel - 1) * 30;
        const esImputable = cuenta.imputable ?
            '<span class="badge bg-success ms-2">Imputable</span>' :
            '<span class="badge bg-secondary ms-2">Rubro</span>';
        const tipoBadge = `<span class="badge bg-light text-dark border ms-1">${cuenta.tipo}</span>`;

        html += `
            <div class="cuenta-item d-flex justify-content-between align-items-center" style="padding-left: ${padding + 12}px;">
                <div>
                    <span class="fw-bold text-primary">${cuenta.codigo}</span>
                    <span class="ms-2">${cuenta.nombre}</span>
                    ${esImputable}
                    ${tipoBadge}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary btn-action me-1" onclick="editarCuenta(${cuenta.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarCuenta(${cuenta.id}, '${cuenta.nombre.replace(/'/g, "\\'")}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    contenedor.innerHTML = html;
}

function actualizarInfoPaginacion() {
    const inicio = (paginaActual - 1) * itemsPorPagina + 1;
    const fin = Math.min(inicio + itemsPorPagina - 1, cuentasFiltradas.length);

    document.getElementById('rangoInicio').textContent = cuentasFiltradas.length > 0 ? inicio : 0;
    document.getElementById('rangoFin').textContent = fin;
    document.getElementById('cuentasTotales').textContent = cuentasFiltradas.length;
}

function renderizarControlesPaginacion() {
    const totalPaginas = Math.ceil(cuentasFiltradas.length / itemsPorPagina);
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
    const totalPaginas = Math.ceil(cuentasFiltradas.length / itemsPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    paginaActual = nuevaPagina;
    renderizarPaginado();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarError(mensaje) {
    const contenedor = document.getElementById('arbolCuentas');
    contenedor.innerHTML = `<div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> ${mensaje}
    </div>`;
}

function cargarSelectPadres() {
    const select = document.getElementById('padreId');
    if (!select) return;

    const valorActual = select.value;

    select.innerHTML = '<option value="">-- Ninguna (Cuenta Raíz) --</option>';

    cuentasCache.forEach(cuenta => {
        const espacios = '&nbsp;'.repeat((cuenta.nivel - 1) * 4);
        select.innerHTML += `<option value="${cuenta.id}">${espacios}${cuenta.codigo} - ${cuenta.nombre}</option>`;
    });

    if (valorActual) select.value = valorActual;
}

// ==========================================
// CRUD
// ==========================================

function abrirModalCuenta() {
    if (!modalCuenta) {
        console.error('Modal no inicializado');
        return;
    }

    document.getElementById('formCuenta').reset();
    document.getElementById('cuentaId').value = '';
    document.getElementById('modalCuentaTitle').innerText = 'Nueva Cuenta';

    modalCuenta.show();
}

function editarCuenta(id) {
    const cuenta = cuentasOriginales.find(c => c.id === id);
    if (cuenta) {
        document.getElementById('cuentaId').value = cuenta.id;
        document.getElementById('codigo').value = cuenta.codigo;
        document.getElementById('nombre').value = cuenta.nombre;
        document.getElementById('tipo').value = cuenta.tipo;
        document.getElementById('imputable').checked = cuenta.imputable;
        document.getElementById('padreId').value = cuenta.padre_id || '';

        document.getElementById('modalCuentaTitle').innerText = 'Editar Cuenta';
        modalCuenta.show();
    }
}

function guardarCuenta() {
    const id = document.getElementById('cuentaId').value;
    const esEdicion = !!id;

    const data = {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        tipo: document.getElementById('tipo').value,
        imputable: document.getElementById('imputable').checked,
        padre_id: document.getElementById('padreId').value || null,
        nivel: 1
    };

    // Calcular nivel aproximado
    if (data.padre_id) {
        const padre = cuentasCache.find(c => c.id == data.padre_id);
        if (padre) data.nivel = padre.nivel + 1;
    }

    const url = esEdicion
        ? `/api/contabilidad/plan-cuentas/${id}/editar/`
        : '/api/contabilidad/plan-cuentas/crear/';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                modalCuenta.hide();
                cargarPlanCuentas();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function eliminarCuenta(id, nombre) {
    if (!confirm(`¿Está seguro de eliminar la cuenta "${nombre}"?`)) return;

    fetch(`/api/contabilidad/plan-cuentas/${id}/eliminar/`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                cargarPlanCuentas();
            } else {
                alert('Error: ' + (data.error || data.mensaje));
            }
        })
        .catch(error => console.error('Error:', error));
}
