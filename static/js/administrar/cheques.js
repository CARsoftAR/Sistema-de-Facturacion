let chequesData = [];
let clientesData = [];

document.addEventListener('DOMContentLoaded', function () {
    cargarClientes();
    cargarCheques();

    // Event listeners
    document.getElementById('buscar').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });

    // Auto-filter on dropdown change
    document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);

    // Toggle Banco Select
    document.getElementById('estado').addEventListener('change', function () {
        const div = document.getElementById('divCuentaBanco');
        if (this.value === 'DEPOSITADO') {
            div.style.display = 'block';
            cargarCuentasBancarias();
        } else {
            div.style.display = 'none';
        }
    });
});

let cuentasBancariasLoaded = false;
function cargarCuentasBancarias() {
    if (cuentasBancariasLoaded) return;
    fetch('/api/bancos/listar/')
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                const sel = document.getElementById('cuenta_bancaria_id');
                sel.innerHTML = '<option value="">Seleccione Cuenta...</option>' +
                    data.cuentas.map(c => `<option value="${c.id}">${c.banco} (${c.alias})</option>`).join('');
                cuentasBancariasLoaded = true;
            }
        });
}

function cargarClientes() {
    fetch('/api/clientes/listar-simple/') // Asumo que existe esta API o similar
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                clientesData = data.clientes;
                const select = document.getElementById('cliente_id');
                select.innerHTML = '<option value="">Seleccione Cliente...</option>';
                data.clientes.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
                });
            }
        });
}

function cargarCheques() {
    const params = new URLSearchParams({
        q: document.getElementById('buscar').value,
        tipo: document.getElementById('filtroTipo').value,
        estado: document.getElementById('filtroEstado').value
    });

    fetch(`/api/cheques/listar/?${params}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                chequesData = data.cheques;
                renderizarTabla(data.cheques);
                actualizarKPIs(data.resumen);
            } else {
                alert('Error al cargar cheques: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function renderizarTabla(cheques) {
    const tbody = document.getElementById('listaCheques');
    tbody.innerHTML = '';

    if (cheques.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No se encontraron cheques</td></tr>';
        return;
    }

    cheques.forEach(c => {
        // Estilos según estado
        let badgeClass = 'bg-secondary';
        if (c.estado === 'CARTERA') badgeClass = 'bg-primary';
        if (c.estado === 'DEPOSITADO') badgeClass = 'bg-info';
        if (c.estado === 'COBRADO') badgeClass = 'bg-success';
        if (c.estado === 'RECHAZADO') badgeClass = 'bg-danger';

        const fechaPago = formatearFecha(c.fecha_pago);
        const monto = parseFloat(c.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 });

        // Origen/Destino display
        let origenDestino = c.cliente_nombre || c.firmante || '-';
        if (c.tipo === 'PROPIO') {
            origenDestino = 'A: ' + (c.destinatario || 'Portador');
        }

        tbody.innerHTML += `
            <tr>
                <td>${fechaPago}</td>
                <td>${c.banco}</td>
                <td class="fw-bold text-primary">${c.numero}</td>
                <td><small>${origenDestino}</small></td>
                <td class="text-end fw-bold">$${monto}</td>
                <td class="text-center"><span class="badge bg-light text-dark border">${c.tipo}</span></td>
                <td class="text-center"><span class="badge ${badgeClass}">${c.estado}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCheque(${c.id})"><i class="bi bi-pencil"></i></button>
                    ${c.estado !== 'ANULADO' ? `<button class="btn btn-sm btn-outline-danger" onclick="eliminarCheque(${c.id})"><i class="bi bi-trash"></i></button>` : ''}
                </td>
            </tr>
        `;
    });
}

function actualizarKPIs(resumen) {
    if (!resumen) return;
    document.getElementById('kpiCartera').textContent = '$' + formatearNumero(resumen.total_cartera);
    document.getElementById('kpiCarteraCount').textContent = resumen.cant_cartera + ' cheques';

    document.getElementById('kpiPropios').textContent = '$' + formatearNumero(resumen.total_propios);
    document.getElementById('kpiDepositados').textContent = '$' + formatearNumero(resumen.total_depositados);
    document.getElementById('kpiRechazados').textContent = '$' + formatearNumero(resumen.total_rechazados);
}

function aplicarFiltros() {
    cargarCheques();
}

function nuevoCheque() {
    document.getElementById('formCheque').reset();
    document.getElementById('chequeId').value = '';
    document.getElementById('modalTitulo').textContent = 'Nuevo Cheque';

    // Reset toggle
    document.getElementById('divCuentaBanco').style.display = 'none';

    // Default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_emision').value = today;
    document.getElementById('fecha_pago').value = today;

    new bootstrap.Modal(document.getElementById('modalCheque')).show();
}

function guardarCheque() {
    const id = document.getElementById('chequeId').value;
    const url = id ? `/api/cheques/${id}/editar/` : '/api/cheques/crear/';

    const estado = document.getElementById('estado').value;
    const cuentaId = document.getElementById('cuenta_bancaria_id').value;

    if (estado === 'DEPOSITADO' && !cuentaId) {
        return alert('Debe seleccionar una Cuenta Bancaria de destino.');
    }

    const data = {
        numero: document.getElementById('numero').value,
        banco: document.getElementById('banco').value,
        monto: document.getElementById('monto').value,
        tipo: document.getElementById('tipo').value,
        estado: estado,
        cuenta_bancaria_id: cuentaId,
        fecha_emision: document.getElementById('fecha_emision').value,
        fecha_pago: document.getElementById('fecha_pago').value,
        cliente_id: document.getElementById('cliente_id').value,
        firmante: document.getElementById('firmante').value,
        cuit_firmante: document.getElementById('cuit_firmante').value,
        destinatario: document.getElementById('destinatario').value,
        observaciones: document.getElementById('observaciones').value,
    };

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                bootstrap.Modal.getInstance(document.getElementById('modalCheque')).hide();
                cargarCheques();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => alert('Error de conexión'));
}

function editarCheque(id) {
    const cheque = chequesData.find(c => c.id === id);
    if (!cheque) return;

    document.getElementById('chequeId').value = cheque.id;
    document.getElementById('modalTitulo').textContent = 'Editar Cheque';

    document.getElementById('numero').value = cheque.numero;
    document.getElementById('banco').value = cheque.banco;
    document.getElementById('monto').value = cheque.monto;
    document.getElementById('tipo').value = cheque.tipo;
    document.getElementById('estado').value = cheque.estado;
    document.getElementById('fecha_emision').value = cheque.fecha_emision;
    document.getElementById('fecha_pago').value = cheque.fecha_pago;
    document.getElementById('cliente_id').value = cheque.cliente_id || '';
    document.getElementById('firmante').value = cheque.firmante || '';
    document.getElementById('cuit_firmante').value = cheque.cuit_firmante || '';
    document.getElementById('destinatario').value = cheque.destinatario || '';
    document.getElementById('observaciones').value = cheque.observaciones || '';

    new bootstrap.Modal(document.getElementById('modalCheque')).show();
}

function eliminarCheque(id) {
    if (!confirm('¿Está seguro de eliminar este cheque?')) return;

    fetch(`/api/cheques/${id}/eliminar/`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                cargarCheques();
            } else {
                alert('Error: ' + data.error);
            }
        });
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${anio}`;
}

function formatearNumero(num) {
    return parseFloat(num || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
}
