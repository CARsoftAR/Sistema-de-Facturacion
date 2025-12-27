// ==========================================
// GESTIÓN DE CUENTAS CORRIENTES - PROVEEDORES
// ==========================================

// --- LISTADO DE CUENTAS ---

function cargarCuentas() {
    const inputBuscar = document.getElementById('inputBuscar');
    const selectFiltro = document.getElementById('selectFiltroSaldo');
    const tbody = document.getElementById('tbodyCuentas');

    if (!tbody) return;

    const q = inputBuscar ? inputBuscar.value : '';
    const filtro = selectFiltro ? selectFiltro.value : 'todos';

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-danger" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';

    fetch(`/api/ctacte/proveedores/listar/?q=${q}&filtro=${filtro}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                renderTablaCuentas(data.proveedores);
            } else {
                alert('Error al cargar proveedores: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error de conexión</td></tr>';
        });
}

function renderTablaCuentas(proveedores) {
    const tbody = document.getElementById('tbodyCuentas');
    tbody.innerHTML = '';

    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron proveedores</td></tr>';
        return;
    }

    proveedores.forEach(p => {
        let estadoClass = 'text-success';
        let estadoText = 'Al Día';

        // En proveedores, saldo > 0 es deuda nuestra (Pasivo)
        if (p.saldo_actual > 0) {
            estadoClass = 'text-danger';
            estadoText = 'Deuda';
        } else if (p.saldo_actual < 0) {
            estadoClass = 'text-primary';
            estadoText = 'A Favor';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-bold text-dark">${p.nombre}</td>
            <td>${p.cuit || '-'}</td>
            <td>${p.telefono || '-'}</td>
            <td class="text-end pe-4 fw-bold ${estadoClass}">$ ${p.saldo_actual.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td><span class="badge bg-light border ${estadoClass}">${estadoText}</span></td>
            <td class="text-end pe-4">
                <a href="/ctacte/proveedores/${p.id}/" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-eye"></i> Ver Detalle
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Event Listeners Listado
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tablaCuentas')) {
        cargarCuentas();
        document.getElementById('inputBuscar').addEventListener('keyup', cargarCuentas);
        document.getElementById('selectFiltroSaldo').addEventListener('change', cargarCuentas);
    }
});


// --- DETALLE DE CUENTA ---

let proveedorId = null;

function cargarDetalleProveedor() {
    proveedorId = document.getElementById('proveedorId').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const tbody = document.getElementById('tbodyMovimientos');

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5">Cargando movimientos...</td></tr>';

    fetch(`/api/ctacte/proveedores/${proveedorId}/movimientos/?desde=${fechaDesde}&hasta=${fechaHasta}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                // Actualizar Header
                document.getElementById('proveedorNombre').textContent = data.proveedor.nombre;
                document.getElementById('proveedorInfo').textContent = `CUIT: ${data.proveedor.cuit || '-'} | Tel: ${data.proveedor.telefono || '-'}`;

                const saldo = data.proveedor.saldo_actual;
                document.getElementById('saldoActual').textContent = `$ ${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

                let estadoText = 'Al Día';
                if (saldo > 0) estadoText = 'Deuda Pendiente';
                if (saldo < 0) estadoText = 'Saldo a Favor';
                document.getElementById('estadoCuenta').textContent = estadoText;

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
        let debe = '-'; // Pagos (Baja Deuda)
        let haber = '-'; // Facturas (Sube Deuda)

        // En Pasivos:
        // HABER = Aumenta Deuda (Factura Compra)
        // DEBE = Disminuye Deuda (Pago)

        if (m.tipo === 'DEBE') {
            debe = `$ ${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        } else {
            haber = `$ ${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">${m.fecha}</td>
            <td><span class="badge bg-light text-dark border">${m.tipo}</span></td>
            <td>${m.descripcion}</td>
            <td class="text-end text-success fw-bold">${debe}</td> <!-- Verde porque pagamos (bueno) -->
            <td class="text-end text-danger fw-bold">${haber}</td> <!-- Rojo porque debemos mas -->
            <td class="text-end pe-4 fw-bold">$ ${m.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- NUEVO MOVIMIENTO ---

let modalMovimiento = null;

function abrirModalMovimiento(tipo) {
    // Tipo: DEBE (Pago) o HABER (Factura/Ajuste)
    document.getElementById('formMovimiento').reset();
    document.getElementById('movTipo').value = tipo;
    document.getElementById('movFecha').valueAsDate = new Date();

    const titulo = tipo === 'DEBE' ? 'Registrar PAGO (Debe)' : 'Registrar Ajuste / Factura (Haber)';
    document.getElementById('modalTitulo').textContent = titulo;

    // Pasivo: 
    // Haber = Aumenta Deuda
    // Debe = Disminuye Deuda
    const info = tipo === 'DEBE'
        ? 'Este movimiento <b>restará</b> al saldo (disminuye deuda con proveedor).'
        : 'Este movimiento <b>sumará</b> al saldo (aumenta deuda con proveedor).';
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
        proveedor_id: proveedorId,
        tipo: tipo,
        fecha: fecha,
        monto: monto,
        descripcion: descripcion,
        impactar_caja: impactoCaja
    };

    fetch('/api/ctacte/proveedores/nuevo/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(r => r.json())
        .then(resp => {
            if (resp.ok) {
                modalMovimiento.hide();
                cargarDetalleProveedor();
            } else {
                alert('Error: ' + resp.error);
            }
        });
}

function cargarMovimientos() {
    cargarDetalleProveedor();
}
