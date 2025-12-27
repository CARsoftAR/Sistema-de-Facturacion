document.addEventListener("DOMContentLoaded", function () {

    // --- ELEMENTOS DEL DOM ---
    const modalElement = document.getElementById('modalNuevaOC');
    const modalNuevaOC = new bootstrap.Modal(modalElement);
    const btnNuevaOC = document.getElementById('btnNuevaOC');
    const btnGuardarOC = document.getElementById('btnGuardarOC');
    const inputBuscarProveedor = document.getElementById('inputBuscarProveedor');
    const proveedorIdHidden = document.getElementById('proveedorIdHidden');
    const proveedorResults = document.getElementById('proveedorAutocompleteResults');

    const tbodyOrdenes = document.getElementById('tbodyOrdenes');
    const tbodyCompras = document.getElementById('tbodyCompras');
    const tbodyDetalleOC = document.getElementById('tbodyDetalleOC');
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    const totalEstimadoLabel = document.getElementById('totalEstimado');

    let productosCache = [];
    let proveedoresCache = [];

    // --- INICIALIZACIÓN ---
    console.log("Iniciando compras.js v3 - Refactorizado");

    // Debug helper
    if (!modalElement) console.error("FATAL: No se encontró modalNuevaOC en el DOM");
    if (!inputBuscarProveedor) console.warn("WARN: No se encontró inputBuscarProveedor en el DOM");

    cargarDatosIniciales();
    cargarCompras();

    try {
        setupProveedorAutocomplete();
    } catch (e) {
        console.error("Error crítico en setupProveedorAutocomplete:", e);
    }

    // --- EVENTOS ---
    if (btnNuevaOC) {
        btnNuevaOC.addEventListener('click', abrirModalNuevaOC);
    } else {
        console.error("No se encontró botón btnNuevaOC");
    }

    if (btnGuardarOC) btnGuardarOC.addEventListener('click', guardarOrdenCompra);
    if (btnAgregarProducto) btnAgregarProducto.addEventListener('click', agregarFilaProducto);

    // --- FUNCIONES ---

    function setupProveedorAutocomplete() {
        if (!inputBuscarProveedor) return;

        let timeout = null;

        inputBuscarProveedor.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();

            if (query.length === 0) {
                if (proveedorResults) proveedorResults.style.display = 'none';
                return;
            }

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const filtrados = proveedoresCache.filter(p =>
                    p.nombre.toLowerCase().includes(query) ||
                    (p.cuit && p.cuit.includes(query))
                );

                if (filtrados.length === 0) {
                    if (proveedorResults) {
                        proveedorResults.innerHTML = '<div class="p-2 text-muted small">No encontrado</div>';
                        proveedorResults.style.display = 'block';
                    }
                } else {
                    let html = '';
                    filtrados.forEach(p => {
                        html += `
                            <div class="p-2 border-bottom autocomplete-item" style="cursor:pointer;" 
                                 data-id="${p.id}" data-nombre="${p.nombre}">
                                <div class="fw-bold">${p.nombre}</div>
                                <div class="text-muted small">${p.cuit || ''}</div>
                            </div>
                        `;
                    });

                    if (proveedorResults) {
                        proveedorResults.innerHTML = html;
                        proveedorResults.style.display = 'block';

                        // Click en item
                        proveedorResults.querySelectorAll('.autocomplete-item').forEach(item => {
                            item.addEventListener('click', function () {
                                inputBuscarProveedor.value = this.dataset.nombre;
                                if (proveedorIdHidden) proveedorIdHidden.value = this.dataset.id;
                                proveedorResults.style.display = 'none';

                                // Focus al primer producto
                                const firstProductInput = document.querySelector('#tbodyDetalleOC .input-buscar-producto');
                                if (firstProductInput) firstProductInput.focus();
                            });
                            item.addEventListener('mouseenter', function () {
                                // Resetear otros activos
                                proveedorResults.querySelectorAll('.active-selection').forEach(i => i.classList.remove('active-selection', 'bg-success', 'text-white'));
                                this.classList.add('active-selection', 'bg-success', 'text-white');
                            });
                            item.addEventListener('mouseleave', function () {
                                this.classList.remove('active-selection', 'bg-success', 'text-white');
                            });
                        });
                    }
                }
            }, 300);
        });

        // Cerrar al click afuera
        document.addEventListener('click', (e) => {
            if (proveedorResults && inputBuscarProveedor &&
                !inputBuscarProveedor.contains(e.target) &&
                !proveedorResults.contains(e.target)) {
                proveedorResults.style.display = 'none';
            }
        });

        // Activar navegación por teclado
        if (proveedorResults) {
            activarNavegacionTeclado(inputBuscarProveedor, proveedorResults, '.autocomplete-item');
        }

        // ENTER selecciona el ACTIVO o el primero
        inputBuscarProveedor.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const activeItem = proveedorResults.querySelector('.active-selection');
                if (activeItem && proveedorResults.style.display !== 'none') {
                    activeItem.click();
                } else {
                    const firstItem = proveedorResults.querySelector('.autocomplete-item');
                    if (firstItem && proveedorResults.style.display !== 'none') {
                        firstItem.click();
                    } else {
                        // Si no hay lista o no hay items, pasar foco directamente
                        const firstProductInput = document.querySelector('#tbodyDetalleOC .input-buscar-producto');
                        if (firstProductInput) firstProductInput.focus();
                    }
                }
            }
        });
    }

    async function cargarDatosIniciales() {
        try {
            // Cargar Proveedores
            const respProv = await fetch('/api/proveedores/lista/');
            proveedoresCache = await respProv.json();

            // Cargar Productos (para el select)
            const respProd = await fetch('/api/productos/lista/');
            const dataProd = await respProd.json();
            // La API devuelve un objeto con propiedad "productos"
            productosCache = dataProd.productos || dataProd.data || dataProd || [];

        } catch (error) {
            console.error("Error cargando datos iniciales:", error);
        }
    }

    async function cargarCompras() {
        try {
            const response = await fetch('/api/compras/listar/');
            const data = await response.json();

            renderizarOrdenes(data.ordenes);
            renderizarCompras(data.compras);

        } catch (error) {
            console.error("Error cargando compras:", error);
            const msgOrdenes = document.getElementById('msgOrdenes');
            const msgCompras = document.getElementById('msgCompras');
            if (msgOrdenes) msgOrdenes.innerText = "Error al cargar datos.";
            if (msgCompras) msgCompras.innerText = "Error al cargar datos.";
        }
    }

    function renderizarOrdenes(ordenes) {
        if (!tbodyOrdenes) return;
        tbodyOrdenes.innerHTML = "";

        const msgOrdenes = document.getElementById('msgOrdenes');

        if (!ordenes || ordenes.length === 0) {
            tbodyOrdenes.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No hay órdenes registradas</td></tr>`;
            if (msgOrdenes) msgOrdenes.innerText = "Mostrando 0 órdenes";
            return;
        }

        ordenes.forEach(o => {
            let badgeClass = "bg-secondary";
            if (o.estado === "PENDIENTE") badgeClass = "bg-warning text-dark";
            if (o.estado === "RECIBIDA") badgeClass = "bg-success";
            if (o.estado === "CANCELADA") badgeClass = "bg-danger";

            let acciones = `<span class="text-muted small">Sin acciones</span>`;

            if (o.estado === "PENDIENTE" || o.estado === "APROBADA") {
                acciones = `
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="recibirOrden(${o.id})" title="Recibir Mercadería">
                        <i class="bi bi-box-seam"></i> Recibir
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelarOrden(${o.id})" title="Cancelar Orden">
                        <i class="bi bi-x-circle"></i>
                    </button>
                `;
            }

            const row = `
                <tr>
                    <td class="ps-4 fw-bold">OC #${o.id}</td>
                    <td>${o.proveedor}</td>
                    <td>${o.fecha}</td>
                    <td><span class="badge ${badgeClass}">${o.estado}</span></td>
                    <td class="fw-bold text-success">$${parseFloat(o.total_estimado).toFixed(2)}</td>
                    <td class="text-end pe-4">${acciones}</td>
                </tr>
            `;
            tbodyOrdenes.innerHTML += row;
        });
        if (msgOrdenes) msgOrdenes.innerText = `Mostrando ${ordenes.length} órdenes`;
    }

    function renderizarCompras(compras) {
        if (!tbodyCompras) return;
        tbodyCompras.innerHTML = "";

        const msgCompras = document.getElementById('msgCompras');

        if (!compras || compras.length === 0) {
            tbodyCompras.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No hay compras registradas</td></tr>`;
            if (msgCompras) msgCompras.innerText = "Mostrando 0 compras";
            return;
        }

        compras.forEach(c => {
            let origenHtml = `<span class="badge bg-light text-dark border">${c.orden_origen}</span>`;

            if (c.orden_compra_id) {
                origenHtml = `<a href="javascript:void(0)" onclick="verDetalleOrden(${c.orden_compra_id})" class="badge bg-primary text-white text-decoration-none" title="Ver detalle de la orden">${c.orden_origen}</a>`;
            }

            const row = `
                <tr>
                    <td class="ps-4 fw-bold">#${c.id}</td>
                    <td>${c.proveedor}</td>
                    <td>${c.fecha}</td>
                    <td>${origenHtml}</td>
                    <td class="fw-bold">$${parseFloat(c.total).toFixed(2)}</td>
                    <td><span class="badge bg-success">${c.estado}</span></td>
                </tr>
            `;
            tbodyCompras.innerHTML += row;
        });
        if (msgCompras) msgCompras.innerText = `Mostrando ${compras.length} compras`;
    }

    window.verDetalleOrden = async function (id) {
        try {
            Swal.fire({
                title: '<i class="bi bi-arrow-repeat spin"></i> Cargando...',
                didOpen: () => { Swal.showLoading() }
            });

            const response = await fetch(`/api/compras/orden/${id}/detalle/`);
            if (!response.ok) throw new Error('Error al cargar detalle');

            const data = await response.json();

            // Determinar color del estado
            let estadoColor = '#6c757d';
            let estadoIcon = 'bi-circle-fill';
            if (data.estado === 'PENDIENTE') { estadoColor = '#ffc107'; estadoIcon = 'bi-clock-fill'; }
            if (data.estado === 'APROBADA') { estadoColor = '#0dcaf0'; estadoIcon = 'bi-check-circle-fill'; }
            if (data.estado === 'RECIBIDA') { estadoColor = '#198754'; estadoIcon = 'bi-check-all'; }
            if (data.estado === 'CANCELADA') { estadoColor = '#dc3545'; estadoIcon = 'bi-x-circle-fill'; }

            let itemsHtml = `
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <div style="max-height: 350px; overflow-y: auto;">`;

            data.items.forEach((i, index) => {
                itemsHtml += `
                    <div style="background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;" 
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16,185,129,0.15)';" 
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-2">
                                    <div style="width: 8px; height: 8px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin-right: 10px;"></div>
                                    <span style="font-weight: 600; color: #1f2937; font-size: 0.95rem;">${i.producto}</span>
                                </div>
                                <div class="d-flex gap-3 mt-2">
                                    <div>
                                        <span style="font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Cantidad</span>
                                        <div style="font-weight: 600; color: #10b981; font-size: 1.1rem;">${i.cantidad}</div>
                                    </div>
                                    <div>
                                        <span style="font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Precio Unit.</span>
                                        <div style="font-weight: 500; color: #4b5563;">$${parseFloat(i.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="text-end">
                                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 4px;">SUBTOTAL</div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">$${parseFloat(i.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    </div>`;
            });

            itemsHtml += `
                </div>
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; padding: 20px; margin-top: 16px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                    <div class="d-flex justify-content-between align-items-center">
                        <span style="color: white; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px;">TOTAL ESTIMADO</span>
                        <span style="color: white; font-size: 1.8rem; font-weight: 700;">$${parseFloat(data.total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>`;

            Swal.fire({
                title: `<div style="color: #1f2937; font-weight: 700; font-size: 1.5rem; margin-bottom: 8px;">
                    Orden de Compra <span style="color: #10b981;">#${data.id}</span>
                </div>`,
                html: `
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 24px; margin-bottom: 20px;">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div style="background: white; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                                    <div style="color: #10b981; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        <i class="bi bi-building"></i> Proveedor
                                    </div>
                                    <div style="color: #1f2937; font-size: 1.1rem; font-weight: 600;">${data.proveedor}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div style="background: white; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                                    <div style="color: #0ea5e9; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        <i class="bi bi-calendar3"></i> Fecha
                                    </div>
                                    <div style="color: #1f2937; font-size: 1.1rem; font-weight: 600;">${data.fecha}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div style="background: white; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                                    <div style="color: ${estadoColor}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        <i class="${estadoIcon}"></i> Estado
                                    </div>
                                    <div>
                                        <span style="background: ${estadoColor}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 0.9rem;">
                                            ${data.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div style="background: white; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                                    <div style="color: #6b7280; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        <i class="bi bi-chat-square-text"></i> Observaciones
                                    </div>
                                    <div style="color: #1f2937; font-size: 0.95rem;">${data.observaciones || '<em style="color: #9ca3af;">Sin observaciones</em>'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: left; margin-bottom: 12px;">
                        <h6 style="color: #374151; font-weight: 700; font-size: 1rem; margin: 0;">
                            <i class="bi bi-box-seam me-2" style="color: #10b981;"></i>Productos de la Orden
                        </h6>
                    </div>
                    ${itemsHtml}
                `,
                width: '850px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#10b981',
                customClass: {
                    popup: 'rounded-4',
                    confirmButton: 'px-5 py-2'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInDown animate__faster'
                }
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar el detalle de la orden",
                confirmButtonColor: '#dc3545'
            });
        }
    }

    function abrirModalNuevaOC() {
        // Resetear formulario
        const form = document.getElementById('formNuevaOC');
        if (form) form.reset();

        if (inputBuscarProveedor) inputBuscarProveedor.value = "";
        if (proveedorIdHidden) proveedorIdHidden.value = "";

        if (tbodyDetalleOC) tbodyDetalleOC.innerHTML = "";
        if (totalEstimadoLabel) totalEstimadoLabel.innerText = "$0.00";

        // Agregar una fila vacía por defecto
        agregarFilaProducto();

        // Si tenemos un input de búsqueda con valor residual, limpiarlo
        const inputsProd = document.querySelectorAll('.input-buscar-producto');
        inputsProd.forEach(inp => inp.value = "");

        modalNuevaOC.show();
    }

    function agregarFilaProducto() {
        if (!tbodyDetalleOC) return;

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="ps-3 position-relative">
                <input type="text" 
                       class="form-control form-control-sm input-buscar-producto" 
                       placeholder="Buscar producto..."
                       autocomplete="off">
                <input type="hidden" class="producto-id-hidden">
                <input type="hidden" class="producto-costo-hidden">
                <div class="autocomplete-results position-absolute w-100 bg-white border rounded shadow-sm" 
                     style="display:none; max-height:200px; overflow-y:auto; z-index:1000;">
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm input-cantidad" value="1" min="1" step="0.01">
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control input-precio" value="0" min="0" step="0.01">
                </div>
            </td>
            <td class="fw-bold text-end pe-3 subtotal-cell">$0.00</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-fila">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tbodyDetalleOC.appendChild(tr);

        // Event listeners para la fila
        const inputBuscar = tr.querySelector('.input-buscar-producto');
        const resultsDiv = tr.querySelector('.autocomplete-results');
        const productoIdHidden = tr.querySelector('.producto-id-hidden');
        const productoCostoHidden = tr.querySelector('.producto-costo-hidden');
        const inputCant = tr.querySelector('.input-cantidad');
        const inputPrecio = tr.querySelector('.input-precio');
        const btnEliminar = tr.querySelector('.btn-eliminar-fila');

        let busquedaTimeout = null;
        let productoSeleccionado = null;

        // Búsqueda en tiempo real
        inputBuscar.addEventListener('input', function () {
            const query = this.value.trim();

            if (query.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }

            clearTimeout(busquedaTimeout);
            busquedaTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/productos/buscar/?q=${encodeURIComponent(query)}`);
                    const result = await response.json();
                    const productos = result.data || [];

                    if (productos.length === 0) {
                        resultsDiv.innerHTML = '<div class="p-2 text-muted small">No se encontraron productos</div>';
                        resultsDiv.style.display = 'block';
                        return;
                    }

                    let html = '';
                    productos.forEach(p => {
                        html += `
                            <div class="autocomplete-item p-2 border-bottom" 
                                 style="cursor:pointer;"
                                 data-id="${p.id}"
                                 data-codigo="${p.codigo}"
                                 data-descripcion="${p.descripcion}"
                                 data-costo="${p.costo || 0}">
                                <div class="fw-bold small">${p.codigo} - ${p.descripcion}</div>
                                <div class="text-muted" style="font-size:0.75rem;">
                                    ${p.marca ? p.marca + ' | ' : ''}Stock: ${p.stock}
                                </div>
                            </div>
                        `;
                    });

                    resultsDiv.innerHTML = html;
                    resultsDiv.style.display = 'block';

                    // Eventos para cada resultado
                    resultsDiv.querySelectorAll('.autocomplete-item').forEach(item => {
                        item.addEventListener('mouseenter', function () {
                            resultsDiv.querySelectorAll('.active-selection').forEach(i => i.classList.remove('active-selection', 'bg-success', 'text-white'));
                            this.classList.add('active-selection', 'bg-success', 'text-white');
                        });
                        item.addEventListener('mouseleave', function () {
                            this.classList.remove('active-selection', 'bg-success', 'text-white');
                        });
                        item.addEventListener('click', function () {
                            const id = this.getAttribute('data-id');
                            const codigo = this.getAttribute('data-codigo');
                            const descripcion = this.getAttribute('data-descripcion');
                            const costo = this.getAttribute('data-costo');

                            inputBuscar.value = `${codigo} - ${descripcion}`;
                            productoIdHidden.value = id;
                            productoCostoHidden.value = costo;
                            productoSeleccionado = { id, codigo, descripcion, costo };

                            if (costo && parseFloat(costo) > 0) {
                                inputPrecio.value = costo;
                            }

                            resultsDiv.style.display = 'none';
                            calcularSubtotal(tr);

                            // Mover foco a cantidad
                            inputCant.focus();
                            inputCant.select();
                        });
                    });

                } catch (error) {
                    console.error('Error buscando productos:', error);
                    resultsDiv.innerHTML = '<div class="p-2 text-danger small">Error al buscar</div>';
                    resultsDiv.style.display = 'block';
                }
            }, 300);
        });

        // Activar navegación por teclado
        if (resultsDiv) {
            activarNavegacionTeclado(inputBuscar, resultsDiv, '.autocomplete-item');
        }

        // ENTER en input buscar -> seleccionar el primero
        inputBuscar.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const activeItem = resultsDiv.querySelector('.active-selection');
                if (activeItem && resultsDiv.style.display !== 'none') {
                    activeItem.click();
                } else {
                    const firstItem = resultsDiv.querySelector('.autocomplete-item');
                    if (firstItem && resultsDiv.style.display !== 'none') {
                        firstItem.click();
                    }
                }
            }
        });

        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', function (e) {
            if (!tr.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });

        // ENTER en cantidad -> mover a precio
        inputCant.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputPrecio.focus();
                inputPrecio.select();
            }
        });

        // ENTER en precio -> agregar nueva fila
        inputPrecio.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                agregarFilaProducto();
                // Dar tiempo para que se cree la fila y enfocar el input
                setTimeout(() => {
                    const nuevaFila = tbodyDetalleOC.lastElementChild;
                    if (nuevaFila) {
                        const nuevaInput = nuevaFila.querySelector('.input-buscar-producto');
                        if (nuevoInput) nuevoInput.focus();
                    }
                }, 100);
            }
        });

        inputCant.addEventListener('input', () => calcularSubtotal(tr));
        inputPrecio.addEventListener('input', () => calcularSubtotal(tr));
        btnEliminar.addEventListener('click', () => {
            tr.remove();
            calcularTotalGeneral();
        });
    }

    function calcularSubtotal(tr) {
        const cant = parseFloat(tr.querySelector('.input-cantidad').value) || 0;
        const precio = parseFloat(tr.querySelector('.input-precio').value) || 0;
        const subtotal = cant * precio;

        const subtotalCell = tr.querySelector('.subtotal-cell');
        if (subtotalCell) subtotalCell.innerText = `$${subtotal.toFixed(2)}`;

        calcularTotalGeneral();
    }

    function calcularTotalGeneral() {
        let total = 0;
        document.querySelectorAll('#tbodyDetalleOC tr').forEach(tr => {
            const cant = parseFloat(tr.querySelector('.input-cantidad').value) || 0;
            const precio = parseFloat(tr.querySelector('.input-precio').value) || 0;
            total += (cant * precio);
        });
        if (totalEstimadoLabel) totalEstimadoLabel.innerText = `$${total.toFixed(2)}`;
    }

    async function guardarOrdenCompra() {
        const proveedorId = document.getElementById('proveedorIdHidden') ? document.getElementById('proveedorIdHidden').value : null;
        const observaciones = document.getElementById('inputObservaciones') ? document.getElementById('inputObservaciones').value : '';

        if (!proveedorId) {
            Swal.fire("Atención", "Debe seleccionar un proveedor", "warning");
            return;
        }

        const items = [];
        let errorValidacion = false;

        document.querySelectorAll('#tbodyDetalleOC tr').forEach(tr => {
            const prodIdInput = tr.querySelector('.producto-id-hidden');
            const prodId = prodIdInput ? prodIdInput.value : null;

            const cantInput = tr.querySelector('.input-cantidad');
            const cant = cantInput ? parseFloat(cantInput.value) : 0;

            const precioInput = tr.querySelector('.input-precio');
            const precio = precioInput ? parseFloat(precioInput.value) : 0;

            if (prodId && cant > 0) {
                items.push({
                    producto_id: prodId,
                    cantidad: cant,
                    precio: precio
                });
            } else if (prodId) {
                errorValidacion = true;
            }
        });

        if (errorValidacion) {
            Swal.fire("Atención", "Revise las cantidades de los productos", "warning");
            return;
        }

        if (items.length === 0) {
            Swal.fire("Atención", "Debe agregar al menos un producto válido", "warning");
            return;
        }

        const data = {
            proveedor: proveedorId,
            observaciones: observaciones,
            items: items
        };

        try {
            btnGuardarOC.disabled = true;
            btnGuardarOC.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const response = await fetch('/api/compras/orden/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.ok) {
                Swal.fire("Éxito", "Orden de compra guardada correctamente", "success");
                modalNuevaOC.hide();
                cargarCompras();
            } else {
                Swal.fire("Error", result.error || "No se pudo guardar la orden", "error");
            }

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error inesperado", "error");
        } finally {
            btnGuardarOC.disabled = false;
            btnGuardarOC.innerHTML = '<i class="bi bi-save"></i> Guardar Orden';
        }
    }

    window.recibirOrden = function (id) {
        Swal.fire({
            title: '¿Recibir Mercadería?',
            html: `
                <p>Se generará una compra y se actualizará el stock.</p>
                <div class="text-start bg-light p-3 rounded">
                    <label class="form-label fw-bold">Forma de Pago:</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="medioPago" id="pagoContado" value="CONTADO" checked>
                        <label class="form-check-label" for="pagoContado">
                            Contado (Efectivo/Caja) - Resta de Caja
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="medioPago" id="pagoCtaCte" value="CTACTE">
                        <label class="form-check-label" for="pagoCtaCte">
                            Cuenta Corriente - Genera Deuda
                        </label>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, recibir',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return document.querySelector('input[name="medioPago"]:checked').value;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const medioPago = result.value;
                try {
                    const response = await fetch(`/api/compras/orden/${id}/recibir/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ medio_pago: medioPago })
                    });
                    const data = await response.json();

                    if (data.ok) {
                        Swal.fire("Recibido", "La mercadería ha sido ingresada al stock.", "success");
                        cargarCompras();
                    } else {
                        Swal.fire("Error", data.error || "No se pudo recibir la orden", "error");
                    }
                } catch (error) {
                    Swal.fire("Error", "Error de conexión", "error");
                }
            }
        });
    }

    window.cancelarOrden = function (id) {
        Swal.fire({
            title: '¿Cancelar Orden?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'Volver'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/compras/orden/${id}/cancelar/`, {
                        method: 'POST',
                        headers: { 'X-CSRFToken': getCookie('csrftoken') }
                    });
                    const data = await response.json();

                    if (data.ok) {
                        Swal.fire("Cancelada", "La orden ha sido cancelada.", "success");
                        cargarCompras();
                    } else {
                        Swal.fire("Error", data.error || "No se pudo cancelar", "error");
                    }
                } catch (error) {
                    Swal.fire("Error", "Error de conexión", "error");
                }
            }
        });
    }

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

    // --- NAVEGACIÓN POR TECLADO ---
    function activarNavegacionTeclado(input, lista, itemSelector = '.autocomplete-item') {
        input.addEventListener('keydown', function (e) {
            const items = lista.querySelectorAll(itemSelector);
            if (items.length === 0 || lista.style.display === 'none') return;

            // Usamos una clase "active-item" propia o de bootstrap para marcar
            // En compras.js usaremos 'bg-success' para verde
            let activeItem = lista.querySelector('.active-selection');
            let index = Array.from(items).indexOf(activeItem);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeItem) {
                    activeItem.classList.remove('active-selection', 'bg-success', 'text-white');
                    const nextIndex = (index + 1) < items.length ? index + 1 : 0;
                    items[nextIndex].classList.add('active-selection', 'bg-success', 'text-white');
                    items[nextIndex].scrollIntoView({ block: 'nearest' });
                } else {
                    items[0].classList.add('active-selection', 'bg-success', 'text-white');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeItem) {
                    activeItem.classList.remove('active-selection', 'bg-success', 'text-white');
                    const prevIndex = (index - 1) >= 0 ? index - 1 : items.length - 1;
                    items[prevIndex].classList.add('active-selection', 'bg-success', 'text-white');
                    items[prevIndex].scrollIntoView({ block: 'nearest' });
                } else {
                    items[items.length - 1].classList.add('active-selection', 'bg-success', 'text-white');
                }
            }
        });
    }

});
