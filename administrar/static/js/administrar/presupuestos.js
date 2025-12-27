document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("tbodyPresupuestos");
    const filtroBusqueda = document.getElementById("filtroBusqueda");
    const filtroEstado = document.getElementById("filtroEstado");
    const btnLimpiar = document.getElementById("btnLimpiarFiltros");
    const selectorRegistros = document.getElementById("selectorRegistros");

    let currentPage = 1;

    // Cargar al inicio
    cargarPresupuestos();

    // Eventos
    filtroBusqueda.addEventListener("input", () => { currentPage = 1; cargarPresupuestos(); });
    filtroEstado.addEventListener("change", () => { currentPage = 1; cargarPresupuestos(); });
    selectorRegistros.addEventListener("change", () => { currentPage = 1; cargarPresupuestos(); });
    btnLimpiar.addEventListener("click", () => {
        filtroBusqueda.value = "";
        filtroEstado.value = "PENDIENTE";
        currentPage = 1;
        cargarPresupuestos();
    });

    function cargarPresupuestos() {
        const q = filtroBusqueda.value;
        const estado = filtroEstado.value;
        const perPage = selectorRegistros.value;

        const url = `/api/presupuestos/listar/?page=${currentPage}&per_page=${perPage}&q=${encodeURIComponent(q)}&estado=${estado}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                renderTable(data.data);
                actualizarPaginacion(data);
            })
            .catch(err => console.error("Error:", err));
    }

    function renderTable(lista) {
        tableBody.innerHTML = "";

        if (!lista || lista.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No se encontraron presupuestos.</td></tr>`;
            return;
        }

        lista.forEach(p => {
            const tr = document.createElement("tr");

            // Botones de acción
            let acciones = `
                <a href="/presupuesto/pdf/${p.id}/" target="_blank" class="btn btn-sm btn-outline-secondary" title="Imprimir PDF">
                    <i class="bi bi-printer"></i>
                </a>
            `;

            if (p.estado === 'PENDIENTE') {
                acciones += `
                    <a href="/presupuesto/editar/${p.id}/" class="btn btn-sm btn-primary ms-1" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-success ms-1" title="Convertir en Venta" onclick="convertirVenta(${p.id})">
                        <i class="bi bi-cart-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" title="Cancelar" onclick="cancelarPresupuesto(${p.id})">
                        <i class="bi bi-x"></i>
                    </button>
                `;
            }

            tr.innerHTML = `
                <td class="ps-4 fw-bold">#${p.id}</td>
                <td>${p.fecha}</td>
                <td>${p.cliente}</td>
                <td>${p.vencimiento}</td>
                <td class="fw-bold">$${p.total}</td>
                <td><span class="badge bg-${getColorEstado(p.estado)}">${p.estado}</span></td>
                <td class="text-end pe-4">
                    ${acciones}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function getColorEstado(estado) {
        switch (estado) {
            case 'PENDIENTE': return 'warning text-dark';
            case 'APROBADO': return 'success';
            case 'VENCIDO': return 'danger';
            case 'CANCELADO': return 'secondary';
            default: return 'primary';
        }
    }

    function actualizarPaginacion(data) {
        document.getElementById("contadorRegistros").innerText = `Mostrando ${data.data.length} de ${data.total}`;
        // Implementar paginación real si es necesario
    }

    // Exponer funciones globales
    window.convertirVenta = function (id) {
        Swal.fire({
            title: '¿Convertir en Venta?',
            text: "Esto generará una venta, descontará stock y marcará el presupuesto como aprobado.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            confirmButtonText: 'Sí, convertir'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/presupuesto/convertir/${id}/`, { method: "POST" })
                    .then(res => res.json())
                    .then(data => {
                        if (data.ok) {
                            Swal.fire('¡Convertido!', `Se generó la Venta #${data.venta_id}`, 'success');
                            cargarPresupuestos();
                        } else {
                            Swal.fire('Error', data.error, 'error');
                        }
                    })
                    .catch(err => Swal.fire('Error', 'Hubo un problema de conexión', 'error'));
            }
        });
    };

    window.cancelarPresupuesto = function (id) {
        if (!confirm("¿Cancelar este presupuesto?")) return;

        fetch(`/api/presupuesto/cancelar/${id}/`, { method: "POST" })
            .then(res => res.json())
            .then(data => {
                if (data.ok) cargarPresupuestos();
                else alert(data.error);
            });
    };

});
