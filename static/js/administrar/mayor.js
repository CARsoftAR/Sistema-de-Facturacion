let ejerciciosDisponibles = [];
let cuentasDisponibles = [];
let movimientosData = [];

// Paginación
let paginaActual = 1;
let itemsPorPagina = 20;

document.addEventListener('DOMContentLoaded', function () {
    // Event listeners
    document.getElementById('btnConsultarMayor').addEventListener('click', consultarMayor);
    document.getElementById('btnExportarMayor').addEventListener('click', exportarMayor);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('itemsPorPagina').addEventListener('change', function () {
        itemsPorPagina = parseInt(this.value);
        paginaActual = 1;
        renderizarPaginado();
    });

    // Cargar datos iniciales
    cargarEjercicios();
    cargarCuentas();
});

function cargarEjercicios() {
    fetch('/api/contabilidad/ejercicios/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                ejerciciosDisponibles = data.ejercicios;
                llenarSelectEjercicios();
            }
        })
        .catch(error => console.error('Error:', error));
}

function cargarCuentas() {
    fetch('/api/contabilidad/plan-cuentas/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cuentasDisponibles = aplanarArbol(data.cuentas);
                llenarSelectCuentas();
            }
        })
        .catch(error => console.error('Error:', error));
}

function aplanarArbol(nodos, resultado = []) {
    nodos.forEach(nodo => {
        resultado.push({
            id: nodo.id,
            codigo: nodo.codigo,
            nombre: nodo.nombre,
            tipo: nodo.tipo,
            nivel: nodo.nivel,
            imputable: nodo.imputable
        });
        if (nodo.hijos && nodo.hijos.length > 0) {
            aplanarArbol(nodo.hijos, resultado);
        }
    });
    return resultado;
}

function llenarSelectEjercicios() {
    const select = document.getElementById('filtroEjercicio');

    ejerciciosDisponibles.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = e.descripcion;
        select.appendChild(option);
    });
}

function llenarSelectCuentas() {
    const select = document.getElementById('filtroCuenta');

    cuentasDisponibles.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        const indent = '&nbsp;'.repeat((c.nivel - 1) * 4);
        option.innerHTML = `${indent}${c.codigo} - ${c.nombre}`;
        option.textContent = `${c.codigo} - ${c.nombre}`;
        select.appendChild(option);
    });
}

function consultarMayor() {
    const cuentaId = document.getElementById('filtroCuenta').value;

    if (!cuentaId) {
        alert('Debe seleccionar una cuenta contable');
        return;
    }

    const params = new URLSearchParams({
        cuenta_id: cuentaId,
        ejercicio_id: document.getElementById('filtroEjercicio').value || '',
        fecha_desde: document.getElementById('filtroFechaDesde').value || '',
        fecha_hasta: document.getElementById('filtroFechaHasta').value || ''
    });

    // Mostrar loading
    const tbody = document.querySelector('#tablaMayor tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2">Consultando movimientos...</p>
            </td>
        </tr>
    `;

    fetch(`/api/contabilidad/mayor/?${params}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al consultar el mayor');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                movimientosData = data.movimientos;
                mostrarInfoCuenta(data.cuenta);
                mostrarResumen(data.resumen);
                paginaActual = 1;
                renderizarPaginado();
            } else {
                mostrarError('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error al consultar el libro mayor: ' + error.message);
        });
}

function mostrarInfoCuenta(cuenta) {
    if (!cuenta) {
        console.warn("No se recibió información de la cuenta");
        return;
    }
    console.log("Renderizando info de cuenta:", cuenta);

    document.getElementById('infoCuenta').style.display = 'block';
    document.getElementById('cuentaCodigo').textContent = cuenta.codigo || '-';
    document.getElementById('cuentaNombre').textContent = cuenta.nombre || '-';
    document.getElementById('cuentaTipo').textContent = cuenta.tipo || '';
    document.getElementById('cuentaNivel').textContent = cuenta.nivel || '';
}

function mostrarResumen(resumen) {
    document.getElementById('resumenMayor').style.display = 'flex';
    document.getElementById('saldoInicial').textContent = '$' + formatearNumero(resumen.saldo_inicial);
    document.getElementById('totalDebe').textContent = '$' + formatearNumero(resumen.total_debe);
    document.getElementById('totalHaber').textContent = '$' + formatearNumero(resumen.total_haber);
    document.getElementById('saldoFinal').textContent = '$' + formatearNumero(resumen.saldo_final);
    document.getElementById('saldoActual').textContent = '$' + formatearNumero(resumen.saldo_final);

    const tipoSaldo = resumen.saldo_final >= 0 ? 'Deudor' : 'Acreedor';
    document.getElementById('tipoSaldo').textContent = tipoSaldo;
}

function renderizarPaginado() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const movimientosPagina = movimientosData.slice(inicio, fin);

    renderizarMovimientos(movimientosPagina);
    actualizarInfoPaginacion();
    renderizarControlesPaginacion();

    if (movimientosData.length > 0) {
        document.getElementById('paginacionContainer').style.display = 'flex';
    }
}

function renderizarMovimientos(movimientos) {
    const tbody = document.querySelector('#tablaMayor tbody');

    if (movimientos.length === 0 && movimientosData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    No hay movimientos en el período seleccionado
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    movimientos.forEach(mov => {
        const claseSaldo = mov.saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo';

        html += `
            <tr>
                <td>${formatearFecha(mov.fecha)}</td>
                <td class="text-center">
                    <span class="badge bg-secondary">${mov.asiento_numero}</span>
                </td>
                <td>${mov.descripcion}</td>
                <td class="text-end text-success">${mov.debe > 0 ? '$' + formatearNumero(mov.debe) : '-'}</td>
                <td class="text-end text-danger">${mov.haber > 0 ? '$' + formatearNumero(mov.haber) : '-'}</td>
                <td class="text-end ${claseSaldo}">$${formatearNumero(Math.abs(mov.saldo))}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="verAsiento(${mov.asiento_id})" title="Ver asiento">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    // Tomar solo la parte de fecha si viene con hora
    let fecha = fechaStr;
    if (fecha.includes(' ')) {
        fecha = fecha.split(' ')[0];
    }

    // Parsear YYYY-MM-DD manualmente para evitar problemas de Timezone
    const partes = fecha.split('-');
    if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        return `${dia}/${mes}/${anio}`;
    }
    return fechaStr;
}

function formatearNumero(numero) {
    return parseFloat(numero || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function actualizarInfoPaginacion() {
    const inicio = (paginaActual - 1) * itemsPorPagina + 1;
    const fin = Math.min(inicio + itemsPorPagina - 1, movimientosData.length);

    document.getElementById('rangoInicio').textContent = movimientosData.length > 0 ? inicio : 0;
    document.getElementById('rangoFin').textContent = fin;
    document.getElementById('movimientosTotales').textContent = movimientosData.length;
}

function renderizarControlesPaginacion() {
    const totalPaginas = Math.ceil(movimientosData.length / itemsPorPagina);
    const paginacion = document.getElementById('paginacion');

    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }

    let html = '';
    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
            <i class="bi bi-chevron-left"></i>
        </a>
    </li>`;

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

    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
            <i class="bi bi-chevron-right"></i>
        </a>
    </li>`;

    paginacion.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(movimientosData.length / itemsPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    paginaActual = nuevaPagina;
    renderizarPaginado();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarError(mensaje) {
    const tbody = document.querySelector('#tablaMayor tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="alert alert-danger mb-0">${mensaje}</div>
            </td>
        </tr>
    `;
}

function limpiarFiltros() {
    document.getElementById('filtroCuenta').value = '';
    document.getElementById('filtroEjercicio').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';

    document.getElementById('infoCuenta').style.display = 'none';
    document.getElementById('resumenMayor').style.display = 'none';
    document.getElementById('paginacionContainer').style.display = 'none';

    const tbody = document.querySelector('#tablaMayor tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5 text-muted">
                <i class="bi bi-info-circle fs-3 d-block mb-2"></i>
                Seleccione una cuenta y haga clic en "Consultar"
            </td>
        </tr>
    `;
}

function exportarMayor() {
    const cuentaId = document.getElementById('filtroCuenta').value;

    if (!cuentaId || movimientosData.length === 0) {
        alert('Debe consultar el mayor primero');
        return;
    }

    const params = new URLSearchParams({
        cuenta_id: cuentaId,
        ejercicio_id: document.getElementById('filtroEjercicio').value || '',
        fecha_desde: document.getElementById('filtroFechaDesde').value || '',
        fecha_hasta: document.getElementById('filtroFechaHasta').value || ''
    });

    window.open(`/api/contabilidad/mayor/exportar/?${params}`, '_blank');
}

function verAsiento(asientoId) {
    if (!asientoId) return;

    fetch(`/api/contabilidad/asientos/${asientoId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                const asiento = data.asiento;

                // Llenar datos cabecera
                document.getElementById('modalAsientoNumero').textContent = asiento.numero;
                document.getElementById('modalAsientoFecha').textContent = formatearFecha(asiento.fecha);
                document.getElementById('modalAsientoDesc').textContent = asiento.descripcion;
                document.getElementById('modalAsientoOrigen').textContent = asiento.origen || 'MANUAL';

                // Llenar tabla items
                const tbody = document.getElementById('modalAsientoItems');
                let html = '';
                let totalDebe = 0;
                let totalHaber = 0;

                asiento.movimientos.forEach(item => {
                    totalDebe += item.debe;
                    totalHaber += item.haber;
                    html += `
                        <tr>
                            <td>
                                <span class="badge bg-light text-dark border me-1">${item.cuenta_codigo}</span>
                                ${item.cuenta_nombre}
                            </td>
                            <td class="text-end text-success">${item.debe > 0 ? '$' + formatearNumero(item.debe) : '-'}</td>
                            <td class="text-end text-danger">${item.haber > 0 ? '$' + formatearNumero(item.haber) : '-'}</td>
                        </tr>
                    `;
                });

                tbody.innerHTML = html;
                document.getElementById('modalTotalDebe').textContent = '$' + formatearNumero(totalDebe);
                document.getElementById('modalTotalHaber').textContent = '$' + formatearNumero(totalHaber);

                // Mostrar Modal
                const modalElement = document.getElementById('modalDetalleAsiento');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                alert('Error al cargar detalle: ' + (data.error || 'Desconocido'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar el asiento. Verifique la conexión.');
        });
}
