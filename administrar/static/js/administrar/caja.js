//====================================
// CAJA.JS – GESTIÓN DE CAJA
//====================================

console.log("💰 [Caja] Archivo caja.js cargado correctamente");

// ====================================
// VARIABLES GLOBALES
// ====================================
let paginaActual = 1;
let registrosPorPagina = 10;
let totalMovimientos = 0;

// ====================================
// INICIALIZACIÓN
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    cargarMovimientos();
    actualizarSaldo();

    // Event Listeners
    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('btnNuevoMovimiento').addEventListener('click', abrirModalNuevo);
    document.getElementById('btnGuardarMovimiento').addEventListener('click', guardarMovimiento);
    document.getElementById('btnCierreCaja').addEventListener('click', realizarCierre);
    document.getElementById('selectorRegistros').addEventListener('change', cambiarRegistrosPorPagina);

    // Apertura Logic
    const btnApertura = document.getElementById('btnAperturaCaja');
    if (btnApertura) btnApertura.addEventListener('click', abrirModalApertura);

    document.getElementById('btnConfirmarApertura').addEventListener('click', realizarApertura);
});

// ====================================
// CARGAR MOVIMIENTOS
// ====================================
function cargarMovimientos() {
    const params = new URLSearchParams({
        page: paginaActual,
        per_page: registrosPorPagina,
        fecha_desde: document.getElementById('filtroFechaDesde').value,
        fecha_hasta: document.getElementById('filtroFechaHasta').value,
        tipo: document.getElementById('filtroTipo').value,
        busqueda: document.getElementById('filtroBusqueda')?.value || '',
    });

    fetch(`/api/caja/movimientos/?${params}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            totalMovimientos = data.total;
            renderizarMovimientos(data.movimientos);
            renderizarPaginacion(data.total_pages);
            document.getElementById('contadorRegistros').textContent =
                `Mostrando ${data.movimientos.length} de ${data.total} movimientos`;

            // Actualizar saldo
            document.getElementById('saldoActual').textContent =
                `$${formatearNumero(data.saldo_actual)}`;
        })
        .catch(err => {
            console.error('Error cargando movimientos:', err);
            Swal.fire('Error', 'No se pudieron cargar los movimientos: ' + err.message, 'error');
        });
}

// ====================================
// RENDERIZAR MOVIMIENTOS
// ====================================
function renderizarMovimientos(movimientos) {
    const tbody = document.getElementById('tbodyMovimientos');

    if (movimientos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-cash-stack" style="font-size: 3rem;"></i>
                    <p class="mt-2">No se encontraron movimientos</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = movimientos.map(m => `
        <tr>
            <td>${m.fecha}</td>
            <td>${m.descripcion}</td>
            <td>
                <span class="badge ${m.tipo === 'Ingreso' ? 'bg-success' : 'bg-danger'}">
                    ${m.tipo}
                </span>
            </td>
            <td class="fw-bold">$${formatearNumero(m.monto)}</td>
            <td>${m.usuario}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-warning" onclick="editarMovimiento(${m.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="eliminarMovimiento(${m.id})" title="Eliminar">
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
    const container = document.getElementById('paginacionMovimientos');

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
    cargarMovimientos();
}

function cambiarRegistrosPorPagina() {
    registrosPorPagina = parseInt(document.getElementById('selectorRegistros').value);
    paginaActual = 1;
    cargarMovimientos();
}

// ====================================
// FILTROS
// ====================================
function aplicarFiltros() {
    paginaActual = 1;
    cargarMovimientos();
}

function limpiarFiltros() {
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('filtroTipo').value = '';
    if (document.getElementById('filtroBusqueda')) {
        document.getElementById('filtroBusqueda').value = '';
    }
    aplicarFiltros();
}

// ====================================
// MODAL NUEVO / EDITAR
// ====================================
function abrirModalNuevo() {
    document.getElementById('formMovimiento').reset();
    document.getElementById('movimientoId').value = '';
    document.querySelector('#modalMovimiento .modal-title').textContent = 'Nuevo Movimiento de Caja';

    const modalElement = document.getElementById('modalMovimiento');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function editarMovimiento(id) {
    // Cargar datos del movimiento
    fetch(`/api/caja/movimiento/${id}/`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
                return;
            }

            // Llenar el formulario
            document.getElementById('movimientoId').value = data.id;
            document.getElementById('tipo').value = data.tipo;
            document.getElementById('descripcion').value = data.descripcion;
            document.getElementById('monto').value = data.monto;

            // Cambiar título del modal
            document.querySelector('#modalMovimiento .modal-title').textContent = 'Editar Movimiento de Caja';

            // Abrir modal
            const modalElement = document.getElementById('modalMovimiento');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        })
        .catch(err => {
            console.error('Error cargando movimiento:', err);
            Swal.fire('Error', 'No se pudo cargar el movimiento', 'error');
        });
}

function guardarMovimiento() {
    const form = document.getElementById('formMovimiento');
    const id = document.getElementById('movimientoId').value;

    const data = {
        tipo: form.tipo.value,
        descripcion: form.descripcion.value,
        monto: parseFloat(form.monto.value),
    };

    const url = id ? `/api/caja/movimiento/${id}/editar/` : '/api/caja/movimiento/crear/';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
            } else {
                const modalElement = document.getElementById('modalMovimiento');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();

                Swal.fire('Guardado', data.message, 'success');
                cargarMovimientos();
                actualizarSaldo();
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Error al guardar el movimiento', 'error');
        });
}

function eliminarMovimiento(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/caja/movimiento/${id}/eliminar/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.error) {
                        Swal.fire('Error', data.error, 'error');
                    } else {
                        Swal.fire('Eliminado', data.message, 'success');
                        cargarMovimientos();
                        actualizarSaldo();
                    }
                });
        }
    });
}

// ====================================
// SALDO ACTUAL
// ====================================
function actualizarSaldo() {
    fetch('/api/caja/saldo/')
        .then(r => r.json())
        .then(data => {
            document.getElementById('saldoActual').textContent = `$${formatearNumero(data.saldo)}`;
        })
        .catch(err => console.error('Error actualizando saldo:', err));
}

// ====================================
// APERTURA DE CAJA
// ====================================
function abrirModalApertura() {
    document.getElementById('formApertura').reset();
    const modalEl = document.getElementById('modalApertura');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function realizarApertura() {
    const monto = document.getElementById('montoApertura').value;
    if (!monto) return Swal.fire('Error', 'Ingrese un monto inicial', 'warning');

    fetch('/api/caja/apertura/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ monto: parseFloat(monto) })
    })
        .then(r => r.json())
        .then(data => {

            if (data.ok) {
                const modalEl = document.getElementById('modalApertura');
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.hide();
                Swal.fire('Éxito', 'Caja abierta correctamente', 'success');
                cargarMovimientos();
                actualizarSaldo();
            } else {
                Swal.fire('Error', data.error, 'error');
            }
        })
        .catch(err => Swal.fire('Error', 'Error de conexión', 'error'));
}

// ====================================
// CIERRE DE CAJA
// ====================================
function realizarCierre() {
    // 1. Obtener saldo actual del sistema para mostrar sugerencia (opcional, o ciegamente)
    // Aquí pedimos input directo al usuario

    Swal.fire({
        title: 'Cierre de Caja (Arqueo)',
        text: 'Por favor, ingresá el dinero físico que hay en caja:',
        input: 'number',
        inputAttributes: {
            min: 0,
            step: 0.01
        },
        showCancelButton: true,
        confirmButtonText: 'Cerrar Caja',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: (monto) => {
            if (!monto) {
                Swal.showValidationMessage('Debes ingresar un monto');
                return false;
            }
            // Enviar al backend
            return fetch('/api/caja/cierre/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ monto_real: monto })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText)
                    }
                    return response.json()
                })
                .catch(error => {
                    Swal.showValidationMessage(
                        `Request failed: ${error}`
                    )
                })
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            const data = result.value;
            if (data.ok) {
                let mensajeDiferencia = '';
                if (data.diferencia !== 0) {
                    const color = data.diferencia > 0 ? 'green' : 'red';
                    const tipo = data.diferencia > 0 ? 'Sobrante' : 'Faltante';
                    mensajeDiferencia = `<p style="color:${color}"><strong>${tipo}:</strong> $${formatearNumero(Math.abs(data.diferencia))}</p>`;
                }

                Swal.fire({
                    title: 'Cierre Exitoso',
                    html: `
                        <div class="text-start">
                             <p><strong>Fecha:</strong> ${data.fecha}</p>
                             <p><strong>Saldo Final:</strong> $${formatearNumero(data.saldo_total)}</p>
                             ${mensajeDiferencia}
                             <hr>
                             <p><strong>Ingresos Día:</strong> $${formatearNumero(data.ingresos_dia)}</p>
                             <p><strong>Egresos Día:</strong> $${formatearNumero(data.egresos_dia)}</p>
                        </div>
                    `,
                    icon: 'success'
                });
                cargarMovimientos();
                actualizarSaldo();
            } else {
                Swal.fire('Error', data.error || 'Ocurrió un error', 'error');
            }
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

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numero);
}
