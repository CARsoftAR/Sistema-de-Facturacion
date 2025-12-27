// ==========================================
// GESTIÓN DE CUENTAS CORRIENTES - CLIENTES
// ==========================================

// --- LISTADO DE CUENTAS ---

function cargarCuentas() {
    const inputBuscar = document.getElementById('inputBuscar');
    const selectFiltro = document.getElementById('selectFiltroSaldo');
    const tbody = document.getElementById('tbodyCuentas');

    if (!tbody) return; // Estamos en otra pantalla

    const q = inputBuscar ? inputBuscar.value : '';
    const filtro = selectFiltro ? selectFiltro.value : 'todos';

    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';

    fetch(`/api/ctacte/clientes/listar/?q=${q}&filtro=${filtro}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                renderTablaCuentas(data.clientes);
            } else {
                alert('Error al cargar cuentas: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error de conexión</td></tr>';
        });
}

function renderTablaCuentas(clientes) {
    const tbody = document.getElementById('tbodyCuentas');
    tbody.innerHTML = '';

    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No se encontraron clientes</td></tr>';
        return;
    }

    clientes.forEach(c => {
        let estadoClass = 'text-success';
        let estadoText = 'Al Día';

        if (c.saldo_actual > 0) {
            estadoClass = 'text-danger';
            estadoText = 'Deuda';
        } else if (c.saldo_actual < 0) {
            estadoClass = 'text-primary';
            estadoText = 'A Favor';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-bold text-primary">${c.nombre}</td>
            <td>${c.cuit || '-'}</td>
            <td>${c.telefono || '-'}</td>
            <td class="text-end">$ ${c.limite_credito.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td class="text-end pe-4 fw-bold ${estadoClass}">$ ${c.saldo_actual.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td><span class="badge bg-light border ${estadoClass}">${estadoText}</span></td>
            <td class="text-end pe-4">
                <a href="/ctacte/clientes/${c.id}/" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i> Ver Detalle
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Event Listeners para Listado
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tablaCuentas')) {
        cargarCuentas();

        document.getElementById('inputBuscar').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') cargarCuentas();
        });
        document.getElementById('selectFiltroSaldo').addEventListener('change', cargarCuentas);
    }
});


// --- DETALLE DE CUENTA ---

let clienteId = null;

function cargarDetalleCliente() {
    clienteId = document.getElementById('clienteId').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const tbody = document.getElementById('tbodyMovimientos');

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5">Cargando movimientos...</td></tr>';

    fetch(`/api/ctacte/clientes/${clienteId}/movimientos/?desde=${fechaDesde}&hasta=${fechaHasta}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                // Actualizar Header
                document.getElementById('clienteNombre').textContent = data.cliente.nombre;
                document.getElementById('clienteInfo').textContent = `CUIT: ${data.cliente.cuit || '-'} | Tel: ${data.cliente.telefono || '-'}`;

                const saldo = data.cliente.saldo_actual;
                document.getElementById('saldoActual').textContent = `$ ${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

                let estadoText = 'Al Día';
                if (saldo > 0) estadoText = 'Con Deuda';
                if (saldo < 0) estadoText = 'Saldo a Favor';
                document.getElementById('estadoCuenta').textContent = estadoText;

                document.getElementById('limiteCredito').textContent = `Límite: $ ${data.cliente.limite_credito.toLocaleString('es-AR')}`;

                renderMovimientos(data.movimientos);
            } else {
                alert('Error: ' + data.error);
            }
        });
}

function renderMovimientos(movimientos) {
    const tbody = document.getElementById('tbodyMovimientos');
    tbody.innerHTML = '';

    if (movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay movimientos en este período</td></tr>';
        return;
    }

    movimientos.forEach(m => {
        let debe = '-';
        let haber = '-';
        let colorMonto = '';

        if (m.tipo === 'DEBE') {
            debe = `$ ${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
            colorMonto = 'text-danger'; // Aumenta deuda
        } else {
            haber = `$ ${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
            colorMonto = 'text-success'; // Disminuye deuda
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">${m.fecha}</td>
            <td><span class="badge bg-light text-dark border">${m.tipo}</span></td>
            <td>${m.descripcion}</td>
            <td class="text-end text-danger fw-bold">${debe}</td>
            <td class="text-end text-success fw-bold">${haber}</td>
            <td class="text-end pe-4 fw-bold">$ ${m.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- NUEVO MOVIMIENTO ---

let modalMovimiento = null;

function abrirModalMovimiento(tipo) {
    // Tipo: DEBE (Nota Debito) o HABER (Cobro)
    document.getElementById('formMovimiento').reset();
    document.getElementById('movTipo').value = tipo;

    // Setear fecha hoy
    document.getElementById('movFecha').valueAsDate = new Date();

    const titulo = tipo === 'HABER' ? 'Registrar Cobro (Haber)' : 'Registrar Débito / Ajuste (Debe)';
    document.getElementById('modalTitulo').textContent = titulo;

    const info = tipo === 'HABER'
        ? 'Este movimiento <b>restará</b> al saldo del cliente (disminuye deuda).'
        : 'Este movimiento <b>sumará</b> al saldo del cliente (aumenta deuda).';
    document.getElementById('movInfoSaldo').innerHTML = info;

    if (!modalMovimiento) modalMovimiento = new bootstrap.Modal(document.getElementById('modalMovimiento'));
    modalMovimiento.show();
}

function guardarMovimiento() {
    const tipo = document.getElementById('movTipo').value;
    const fecha = document.getElementById('movFecha').value;
    const monto = parseFloat(document.getElementById('movMonto').value);
    const descripcion = document.getElementById('movDescripcion').value;

    if (!monto || monto <= 0 || !descripcion) {
        alert('Complete todos los campos correctamente');
        return;
    }

    const impactoCaja = document.getElementById('checkCaja').checked;

    const data = {
        cliente_id: clienteId,
        tipo: tipo,
        fecha: fecha,
        monto: monto,
        descripcion: descripcion,
        impactar_caja: impactoCaja
    };

    fetch('/api/ctacte/clientes/nuevo/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(r => r.json())
        .then(resp => {
            if (resp.ok) {
                modalMovimiento.hide();
                cargarDetalleCliente(); // Recargar todo
            } else {
                alert('Error: ' + resp.error);
            }
        });
}

function cargarMovimientos() {
    cargarDetalleCliente();
}
