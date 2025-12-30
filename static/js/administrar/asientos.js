let asientosOriginales = [];
let asientosFiltrados = [];
let ejerciciosDisponibles = [];
let cuentasDisponibles = [];
let modalAsiento;
let movimientos = [];

// Configuración de paginación
let paginaActual = 1;
let itemsPorPagina = 5;

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar modal
    const modalElement = document.getElementById('modalAsiento');
    if (modalElement) {
        modalAsiento = new bootstrap.Modal(modalElement);
    }

    // Event listeners
    const btnNuevoAsiento = document.getElementById('btnNuevoAsiento');
    if (btnNuevoAsiento) {
        btnNuevoAsiento.addEventListener('click', abrirModalAsiento);
    }

    const btnGuardarAsiento = document.getElementById('btnGuardarAsiento');
    if (btnGuardarAsiento) {
        btnGuardarAsiento.addEventListener('click', guardarAsiento);
    }

    const btnAgregarMovimiento = document.getElementById('btnAgregarMovimiento');
    if (btnAgregarMovimiento) {
        btnAgregarMovimiento.addEventListener('click', agregarMovimiento);
    }

    // Filtros
    document.getElementById('filtroTexto').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroEjercicio').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroFechaDesde').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroFechaHasta').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroMes').addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('itemsPorPagina').addEventListener('change', function () {
        itemsPorPagina = parseInt(this.value);
        paginaActual = 1;
        renderizarPaginado();
    });

    // Cargar datos
    cargarEjercicios();
    cargarCuentas();
    cargarAsientos();
});

function cargarEjercicios() {
    fetch('/api/contabilidad/ejercicios/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                ejerciciosDisponibles = data.ejercicios;
                llenarSelectEjercicios();

                // Check for URL param to pre-filter
                const urlParams = new URLSearchParams(window.location.search);
                const ejercicioId = urlParams.get('ejercicio_id');
                if (ejercicioId) {
                    const select = document.getElementById('filtroEjercicio');
                    if (select.querySelector(`option[value="${ejercicioId}"]`)) {
                        select.value = ejercicioId;
                        console.log("Pre-filtering by ejercicio_id:", ejercicioId);
                        aplicarFiltros();
                    }
                }
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
            }
        })
        .catch(error => console.error('Error:', error));
}

function aplanarArbol(nodos, resultado = []) {
    nodos.forEach(nodo => {
        // Solo agregar cuentas imputables
        if (nodo.imputable) {
            resultado.push({
                id: nodo.id,
                codigo: nodo.codigo,
                nombre: nodo.nombre,
                nivel: nodo.nivel
            });
        }
        if (nodo.hijos && nodo.hijos.length > 0) {
            aplanarArbol(nodo.hijos, resultado);
        }
    });
    return resultado;
}

function llenarSelectEjercicios() {
    const selectFiltro = document.getElementById('filtroEjercicio');
    const selectModal = document.getElementById('ejercicio_id');

    ejerciciosDisponibles.forEach(e => {
        const option = `<option value="${e.id}">${e.descripcion}</option>`;
        selectFiltro.innerHTML += option;
        if (!e.cerrado) {
            selectModal.innerHTML += option;
        }
    });
}

function cargarAsientos() {
    fetch('/api/contabilidad/asientos/')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                asientosOriginales = data.asientos;
                asientosFiltrados = [...asientosOriginales];
                renderizarPaginado();
            } else {
                mostrarError('Error al cargar asientos: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error al cargar los asientos. ' + error);
        });
}

function aplicarFiltros() {
    const textoFiltro = document.getElementById('filtroTexto').value.toLowerCase();
    const ejercicioFiltro = document.getElementById('filtroEjercicio').value;
    const fechaDesde = document.getElementById('filtroFechaDesde').value;
    const fechaHasta = document.getElementById('filtroFechaHasta').value;
    const mesFiltro = document.getElementById('filtroMes').value;

    asientosFiltrados = asientosOriginales.filter(asiento => {
        const coincideTexto = !textoFiltro ||
            asiento.numero.toString().includes(textoFiltro) ||
            asiento.descripcion.toLowerCase().includes(textoFiltro);

        const coincideEjercicio = !ejercicioFiltro ||
            (asiento.ejercicio_id && asiento.ejercicio_id.toString() === ejercicioFiltro);

        const coincideFechaDesde = !fechaDesde || asiento.fecha >= fechaDesde;
        const coincideFechaHasta = !fechaHasta || asiento.fecha <= fechaHasta;

        let coincideMes = true;
        if (mesFiltro) {
            const mesAsiento = new Date(asiento.fecha).getMonth() + 1;
            coincideMes = mesAsiento.toString() === mesFiltro;
        }

        return coincideTexto && coincideEjercicio && coincideFechaDesde &&
            coincideFechaHasta && coincideMes;
    });

    paginaActual = 1;
    renderizarPaginado();
}

function limpiarFiltros() {
    document.getElementById('filtroTexto').value = '';
    document.getElementById('filtroEjercicio').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('filtroMes').value = '';
    aplicarFiltros();
}

function renderizarPaginado() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const asientosPagina = asientosFiltrados.slice(inicio, fin);

    renderizarTabla(asientosPagina);
    actualizarInfoPaginacion();
    renderizarControlesPaginacion();
}

function renderizarTabla(asientos) {
    const tbody = document.getElementById('tablaAsientos');

    if (asientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No se encontraron asientos con los filtros aplicados.</td></tr>';
        return;
    }

    let html = '';
    asientos.forEach(a => {
        const ejercicio = ejerciciosDisponibles.find(e => e.id === a.ejercicio_id);
        const ejercicioNombre = ejercicio ? ejercicio.descripcion : 'N/A';

        html += `
            <tr>
                <td class="fw-bold">${a.numero}</td>
                <td>${formatearFecha(a.fecha)}</td>
                <td>${a.descripcion}</td>
                <td><span class="badge bg-info">${ejercicioNombre}</span></td>
                <td class="text-end text-success fw-bold">$${formatearNumero(a.total_debe)}</td>
                <td class="text-end text-danger fw-bold">$${formatearNumero(a.total_haber)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="verAsiento(${a.id})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarAsiento(${a.id}, ${a.numero})" title="Eliminar">
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

    try {
        // Intentar parseo manual seguro para formato YYYY-MM-DD...
        // Tomamos los primeros 10 caracteres
        let datePart = fechaStr.substring(0, 10);

        // Verificamos si cumple patrón YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            let parts = datePart.split('-'); // [YYYY, MM, DD]
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        // Fallback a objeto Date
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return fechaStr; // Retornar original si falla
        return fecha.toLocaleDateString('es-AR');
    } catch (e) {
        console.error("Error formateando fecha:", fechaStr, e);
        return fechaStr;
    }
}

function formatearNumero(numero) {
    return parseFloat(numero || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function actualizarInfoPaginacion() {
    const inicio = (paginaActual - 1) * itemsPorPagina + 1;
    const fin = Math.min(inicio + itemsPorPagina - 1, asientosFiltrados.length);

    document.getElementById('rangoInicio').textContent = asientosFiltrados.length > 0 ? inicio : 0;
    document.getElementById('rangoFin').textContent = fin;
    document.getElementById('asientosTotales').textContent = asientosFiltrados.length;
}

function renderizarControlesPaginacion() {
    const totalPaginas = Math.ceil(asientosFiltrados.length / itemsPorPagina);
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
    const totalPaginas = Math.ceil(asientosFiltrados.length / itemsPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    paginaActual = nuevaPagina;
    renderizarPaginado();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarError(mensaje) {
    const tbody = document.getElementById('tablaAsientos');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="alert alert-danger mb-0">${mensaje}</div></td></tr>`;
}

// ==========================================
// CRUD ASIENTOS
// ==========================================

function abrirModalAsiento() {
    if (!modalAsiento) return;

    document.getElementById('formAsiento').reset();
    document.getElementById('asientoId').value = '';
    document.getElementById('modalAsientoTitle').innerText = 'Nuevo Asiento';
    document.getElementById('fecha').valueAsDate = new Date();

    // Obtener próximo número
    obtenerProximoNumero();

    // Habilitar edición
    alternarEdicion(true);

    // Limpiar movimientos e inicializar con 1 línea
    movimientos = [];
    agregarMovimiento();
    renderizarMovimientos();

    // Intentar pre-seleccionar ejercicio vigente
    const hoy = new Date().toISOString().split('T')[0];
    const ejercicioVigente = ejerciciosDisponibles.find(e =>
        !e.cerrado && e.fecha_inicio <= hoy && e.fecha_fin >= hoy
    );
    if (ejercicioVigente) {
        document.getElementById('ejercicio_id').value = ejercicioVigente.id;
    }

    modalAsiento.show();
}

function obtenerProximoNumero() {
    const maxNumero = asientosOriginales.length > 0
        ? Math.max(...asientosOriginales.map(a => a.numero))
        : 0;
    document.getElementById('numero').value = maxNumero + 1;
}

function agregarMovimiento() {
    movimientos.push({
        cuenta_id: '',
        debe: 0,
        haber: 0
    });
    renderizarMovimientos();
}

// ==========================================
// FILA DE MOVIMIENTO
// ==========================================

function renderizarMovimientos(soloLectura = false) {
    const tbody = document.getElementById('tablaMovimientos');

    if (movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay movimientos.</td></tr>';
        actualizarTotales();
        return;
    }

    tbody.innerHTML = '';
    movimientos.forEach((mov, index) => {
        const tr = document.createElement('tr');

        let selectHtml = '';
        if (soloLectura) {
            const cuenta = cuentasDisponibles.find(c => c.id == mov.cuenta_id);
            const nombreCuenta = cuenta ? `${cuenta.codigo} - ${cuenta.nombre}` : 'Cuenta no encontrada';
            selectHtml = `<input type="text" class="form-control form-control-sm" value="${nombreCuenta}" disabled>`;
        } else {
            const cuenta = cuentasDisponibles.find(c => c.id == mov.cuenta_id);
            const valCuenta = cuenta ? `${cuenta.codigo} - ${cuenta.nombre}` : '';

            // Input búsqueda + Hidden ID + Lista Sugerencias
            selectHtml = `
                 <div class="position-relative">
                    <input type="text" class="form-control form-control-sm busqueda-cuenta" 
                           placeholder="Buscar cuenta..."
                           value="${valCuenta}" 
                           data-index="${index}"
                           autocomplete="off">
                    <input type="hidden" value="${mov.cuenta_id || ''}" id="cuenta_id_${index}">
                    
                    <div class="list-group position-absolute w-100 shadow-sm sugerencias-cuenta" 
                         id="sugerencias_${index}" 
                         style="z-index: 1000; display:none; max-height: 200px; overflow-y: auto;">
                    </div>
                 </div>
             `;
        }

        tr.innerHTML = `
            <td>
                ${selectHtml}
            </td>
            <td>
                <input type="number" class="form-control form-control-sm text-end input-debe" ${soloLectura ? 'disabled' : ''}
                       id="debe_${index}"
                       value="${mov.debe}" step="0.01" min="0"
                       onchange="actualizarMovimiento(${index}, 'debe', this.value)">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm text-end input-haber" ${soloLectura ? 'disabled' : ''}
                       id="haber_${index}"
                       value="${mov.haber}" step="0.01" min="0"
                       onchange="actualizarMovimiento(${index}, 'haber', this.value)">
            </td>
            <td class="text-center">
                ${!soloLectura ? `
                <button type="button" class="btn btn-sm btn-danger" onclick="eliminarMovimiento(${index})" tabindex="-1">
                    <i class="bi bi-trash"></i>
                </button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);

        // Agregar listeners para el autocomplete
        if (!soloLectura) {
            setupAutocompleteCuenta(index);
        }
    });

    actualizarTotales();
}

function setupAutocompleteCuenta(index) {
    const input = document.querySelector(`.busqueda-cuenta[data-index="${index}"]`);
    const lista = document.getElementById(`sugerencias_${index}`);
    const hidden = document.getElementById(`cuenta_id_${index}`);
    let selectedIdx = -1;

    // Mostrar todos al hacer click si está vacío
    input.addEventListener('focus', () => {
        filtrarYMostrar(index, input.value, true);
    });

    input.addEventListener('input', () => {
        movimientos[index].cuenta_id = ''; // Reset si escribe
        hidden.value = '';
        filtrarYMostrar(index, input.value);
    });

    input.addEventListener('keydown', (e) => {
        const items = lista.querySelectorAll('button');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
            highlightItem(items, selectedIdx);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = Math.max(selectedIdx - 1, 0);
            highlightItem(items, selectedIdx);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIdx >= 0 && items[selectedIdx]) {
                items[selectedIdx].click();
            } else {
                // Si no hay selección pero hay un solo item, seleccionar ese
                if (items.length === 1) items[0].click();
                // Si no, pasar foco al Debe
                else document.getElementById(`debe_${index}`).focus();
            }
        } else if (e.key === 'Tab') {
            lista.style.display = 'none';
        }
    });

    // Ocultar al clickear fuera
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !lista.contains(e.target)) {
            lista.style.display = 'none';
        }
    });
}

function filtrarYMostrar(index, texto, forceShow = false) {
    const lista = document.getElementById(`sugerencias_${index}`);

    // Filtrar cuentas (o mostrar primeras 5 si vacío)
    let resultados = [];
    if (!texto && forceShow) {
        resultados = cuentasDisponibles.slice(0, 5);
    } else {
        const busqueda = texto.toLowerCase();
        resultados = cuentasDisponibles.filter(c =>
            c.codigo.toLowerCase().includes(busqueda) ||
            c.nombre.toLowerCase().includes(busqueda)
        ).slice(0, 5); // Limite de 5 resultados
    }

    lista.innerHTML = '';
    if (resultados.length > 0) {
        resultados.forEach((c, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'list-group-item list-group-item-action py-1';
            btn.innerHTML = `<small class="fw-bold">${c.codigo}</small> <small>${c.nombre}</small>`;
            btn.addEventListener('click', () => seleccionarCuenta(index, c));
            lista.appendChild(btn);
        });
        lista.style.display = 'block';
    } else {
        lista.style.display = 'none';
    }
}

function highlightItem(items, idx) {
    items.forEach((item, i) => {
        if (i === idx) item.classList.add('active');
        else item.classList.remove('active');
    });
}

function seleccionarCuenta(index, cuenta) {
    movimientos[index].cuenta_id = cuenta.id;

    const input = document.querySelector(`.busqueda-cuenta[data-index="${index}"]`);
    const hidden = document.getElementById(`cuenta_id_${index}`);
    const lista = document.getElementById(`sugerencias_${index}`);

    input.value = `${cuenta.codigo} - ${cuenta.nombre}`;
    hidden.value = cuenta.id;
    lista.style.display = 'none';

    // Pasar foco al Debe
    document.getElementById(`debe_${index}`).focus();
}

function actualizarMovimiento(index, campo, valor) {
    // Si es cuenta_id ya se actualizó en seleccionarCuenta. 
    // Aquí solo manejamos debe/haber inputs numéricos
    if (campo !== 'cuenta_id') {
        movimientos[index][campo] = parseFloat(valor) || 0;

        // Si se ingresa en Debe, limpiar Haber y viceversa
        if (campo === 'debe' && parseFloat(valor) > 0) {
            movimientos[index].haber = 0;
            document.getElementById(`haber_${index}`).value = 0;
        } else if (campo === 'haber' && parseFloat(valor) > 0) {
            movimientos[index].debe = 0;
            document.getElementById(`debe_${index}`).value = 0;
        }

        actualizarTotales();
    }
}

function eliminarMovimiento(index) {
    movimientos.splice(index, 1);
    renderizarMovimientos();
}

function actualizarTotales() {
    const totalDebe = movimientos.reduce((sum, mov) => sum + (parseFloat(mov.debe) || 0), 0);
    const totalHaber = movimientos.reduce((sum, mov) => sum + (parseFloat(mov.haber) || 0), 0);

    document.getElementById('totalDebe').textContent = '$' + totalDebe.toFixed(2);
    document.getElementById('totalHaber').textContent = '$' + totalHaber.toFixed(2);

    const descuadrado = Math.abs(totalDebe - totalHaber) > 0.01;
    const filaDescuadre = document.getElementById('filaDescuadre');

    if (descuadrado) {
        filaDescuadre.classList.remove('d-none');
    } else {
        filaDescuadre.classList.add('d-none');
    }

    return !descuadrado;
}

function guardarAsiento() {
    if (movimientos.length < 2) {
        alert('Debe agregar al menos 2 movimientos (uno en Debe y otro en Haber)');
        return;
    }

    if (!actualizarTotales()) {
        alert('El asiento está descuadrado. El total del Debe debe ser igual al total del Haber.');
        return;
    }

    const data = {
        numero: parseInt(document.getElementById('numero').value),
        fecha: document.getElementById('fecha').value,
        descripcion: document.getElementById('descripcion').value,
        ejercicio_id: parseInt(document.getElementById('ejercicio_id').value),
        tipo: document.getElementById('tipo').value,
        movimientos: movimientos.filter(m => m.cuenta_id && (m.debe > 0 || m.haber > 0))
    };

    fetch('/api/contabilidad/asientos/crear/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                modalAsiento.hide();
                cargarAsientos();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function verAsiento(id) {
    fetch(`/api/contabilidad/asientos/${id}/`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                const asiento = data.asiento;

                // Configurar modal para SOLO LECTURA
                document.getElementById('formAsiento').reset();
                document.getElementById('asientoId').value = asiento.id;
                document.getElementById('modalAsientoTitle').innerText = `Asiento N° ${asiento.numero}`;

                document.getElementById('numero').value = asiento.numero;
                document.getElementById('fecha').value = formatearFechaInput(asiento.fecha);
                document.getElementById('descripcion').value = asiento.descripcion;
                document.getElementById('ejercicio_id').value = asiento.ejercicio_id;
                document.getElementById('tipo').value = asiento.tipo || 'MANUAL';

                // Deshabilitar campos
                alternarEdicion(false);

                // Cargar movimientos
                movimientos = asiento.movimientos.map(m => ({
                    cuenta_id: m.cuenta_id,
                    debe: m.debe,
                    haber: m.haber
                }));

                renderizarMovimientos(true); // true = solo lectura

                modalAsiento.show();
            } else {
                alert('Error al cargar detalle: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function alternarEdicion(habilitar) {
    const inputs = document.querySelectorAll('#formAsiento input, #formAsiento select, #formAsiento textarea');
    inputs.forEach(input => input.disabled = !habilitar);

    const btnGuardar = document.getElementById('btnGuardarAsiento');
    const btnAgregar = document.getElementById('btnAgregarMovimiento');

    if (btnGuardar) btnGuardar.style.display = habilitar ? 'block' : 'none';
    if (btnAgregar) btnAgregar.style.display = habilitar ? 'block' : 'none';
}

function formatearFechaInput(fechaStr) {
    if (!fechaStr) return '';
    // fechaStr viene como YYYY-MM-DD...
    return fechaStr.substring(0, 10);
}

function eliminarAsiento(id, numero) {
    if (!confirm(`¿Está seguro de eliminar el asiento N° ${numero}?`)) return;

    fetch(`/api/contabilidad/asientos/${id}/eliminar/`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                cargarAsientos();
            } else {
                alert('Error: ' + (data.error || data.mensaje));
            }
        })
        .catch(error => console.error('Error:', error));
}
