let ejerciciosDisponibles = [];
let balanceData = [];

document.addEventListener('DOMContentLoaded', function () {
    // Event listeners
    document.getElementById('btnGenerarBalance').addEventListener('click', generarBalance);
    document.getElementById('btnExportarExcel').addEventListener('click', exportarExcel);

    // Cargar ejercicios
    cargarEjercicios();
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

function llenarSelectEjercicios() {
    const select = document.getElementById('filtroEjercicio');

    ejerciciosDisponibles.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = e.descripcion;
        select.appendChild(option);
    });

    // Seleccionar el ejercicio más reciente abierto
    const ejercicioAbierto = ejerciciosDisponibles.find(e => !e.cerrado);
    if (ejercicioAbierto) {
        select.value = ejercicioAbierto.id;
        // Establecer fechas del ejercicio
        document.getElementById('filtroFechaDesde').value = ejercicioAbierto.fecha_inicio;
        document.getElementById('filtroFechaHasta').value = ejercicioAbierto.fecha_fin;
    }
}

function generarBalance() {
    const ejercicioId = document.getElementById('filtroEjercicio').value;

    if (!ejercicioId) {
        alert('Debe seleccionar un ejercicio contable');
        return;
    }

    const params = new URLSearchParams({
        ejercicio_id: ejercicioId,
        fecha_desde: document.getElementById('filtroFechaDesde').value || '',
        fecha_hasta: document.getElementById('filtroFechaHasta').value || '',
        nivel: document.getElementById('filtroNivel').value || '',
        solo_con_movimientos: document.getElementById('soloConMovimientos').checked,
        incluir_subtotales: document.getElementById('incluirSubtotales').checked
    });

    // Mostrar loading
    const tbody = document.querySelector('#tablaBalance tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2">Generando balance...</p>
            </td>
        </tr>
    `;

    fetch(`/api/contabilidad/balance/?${params}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al generar balance');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                balanceData = data.cuentas;
                renderizarBalance(data);
                mostrarResumen(data.totales);
            } else {
                mostrarError('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error al generar el balance: ' + error.message);
        });
}

function renderizarBalance(data) {
    const tbody = document.querySelector('#tablaBalance tbody');
    const incluirSubtotales = document.getElementById('incluirSubtotales').checked;

    if (data.cuentas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    No hay movimientos en el período seleccionado
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    let nivelActual = 0;

    data.cuentas.forEach((cuenta, index) => {
        // Agregar subtotales si cambia el nivel
        if (incluirSubtotales && cuenta.nivel < nivelActual) {
            // Aquí podrías agregar lógica de subtotales si lo deseas
        }

        nivelActual = cuenta.nivel;

        const claseNivel = `nivel-${cuenta.nivel}`;
        const saldoDeudor = cuenta.saldo > 0 ? cuenta.saldo : 0;
        const saldoAcreedor = cuenta.saldo < 0 ? Math.abs(cuenta.saldo) : 0;

        html += `
            <tr class="${claseNivel}">
                <td>${cuenta.codigo}</td>
                <td>${cuenta.nombre}</td>
                <td class="text-end text-success">${formatearNumero(cuenta.debe)}</td>
                <td class="text-end text-danger">${formatearNumero(cuenta.haber)}</td>
                <td class="text-end text-primary">${saldoDeudor > 0 ? formatearNumero(saldoDeudor) : '-'}</td>
                <td class="text-end text-info">${saldoAcreedor > 0 ? formatearNumero(saldoAcreedor) : '-'}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    // Mostrar footer con totales
    document.getElementById('footerBalance').style.display = 'table-footer-group';
    document.getElementById('footerDebe').textContent = '$' + formatearNumero(data.totales.total_debe);
    document.getElementById('footerHaber').textContent = '$' + formatearNumero(data.totales.total_haber);
    document.getElementById('footerSaldoDeudor').textContent = '$' + formatearNumero(data.totales.total_saldo_deudor);
    document.getElementById('footerSaldoAcreedor').textContent = '$' + formatearNumero(data.totales.total_saldo_acreedor);
}

function mostrarResumen(totales) {
    document.getElementById('resumenBalance').style.display = 'flex';
    document.getElementById('totalDebe').textContent = '$' + formatearNumero(totales.total_debe);
    document.getElementById('totalHaber').textContent = '$' + formatearNumero(totales.total_haber);
    document.getElementById('saldoDeudor').textContent = '$' + formatearNumero(totales.total_saldo_deudor);
    document.getElementById('saldoAcreedor').textContent = '$' + formatearNumero(totales.total_saldo_acreedor);
}

function formatearNumero(numero) {
    return parseFloat(numero || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function mostrarError(mensaje) {
    const tbody = document.querySelector('#tablaBalance tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="alert alert-danger mb-0">${mensaje}</div>
            </td>
        </tr>
    `;
}

function exportarExcel() {
    if (balanceData.length === 0) {
        alert('Debe generar el balance primero');
        return;
    }

    const ejercicioId = document.getElementById('filtroEjercicio').value;
    const params = new URLSearchParams({
        ejercicio_id: ejercicioId,
        fecha_desde: document.getElementById('filtroFechaDesde').value || '',
        fecha_hasta: document.getElementById('filtroFechaHasta').value || '',
        nivel: document.getElementById('filtroNivel').value || '',
        solo_con_movimientos: document.getElementById('soloConMovimientos').checked,
        incluir_subtotales: document.getElementById('incluirSubtotales').checked,
        formato: 'excel'
    });

    // Abrir en nueva ventana para descargar
    window.open(`/api/contabilidad/balance/exportar/?${params}`, '_blank');
}
