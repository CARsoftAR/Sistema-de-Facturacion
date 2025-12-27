document.addEventListener("DOMContentLoaded", function () {

    // --- ELEMENTOS DEL DOM ---
    const modalElement = document.getElementById('modalNuevaVenta');
    const modalNuevaVenta = new bootstrap.Modal(modalElement);
    const btnNuevaVenta = document.getElementById('btnNuevaVenta');
    const btnGuardarVenta = document.getElementById('btnGuardarVenta');
    const tbodyVentas = document.getElementById('tbodyVentas');
    const tbodyItems = document.getElementById('tbodyItems');
    const inputBusqueda = document.getElementById('filtroBusqueda');
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroComprobante = document.getElementById('filtroComprobante');
    const selectorRegistros = document.getElementById('selectorRegistros');

    // Variables de paginación
    let ventasCache = [];
    let paginaActual = 1;
    let registrosPorPagina = 10;
    let itemsVenta = [];
    let clienteSeleccionado = null;

    // --- INICIALIZACIÓN ---
    cargarVentas();

    // --- EVENTOS ---
    btnNuevaVenta.addEventListener('click', abrirModalNuevaVenta);
    btnGuardarVenta.addEventListener('click', guardarVenta);

    inputBusqueda.addEventListener('input', () => {
        paginaActual = 1;
        renderizarTabla();
    });

    filtroEstado.addEventListener('change', () => {
        paginaActual = 1;
        renderizarTabla();
    });

    filtroComprobante.addEventListener('change', () => {
        paginaActual = 1;
        renderizarTabla();
    });

    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    if (selectorRegistros) {
        selectorRegistros.addEventListener('change', function () {
            registrosPorPagina = parseInt(this.value);
            paginaActual = 1;
            renderizarTabla();
        });
    }

    // Autocomplete Cliente
    const buscarCliente = document.getElementById('buscarCliente');
    const listaClientes = document.getElementById('listaClientes');
    let timeoutCliente;

    buscarCliente.addEventListener('input', function () {
        clearTimeout(timeoutCliente);
        const query = this.value.trim();

        if (query.length < 2) {
            listaClientes.style.display = 'none';
            return;
        }

        timeoutCliente = setTimeout(async () => {
            try {
                const response = await fetch(`/api/clientes/buscar/?q=${encodeURIComponent(query)}`);
                const result = await response.json();
                mostrarSugerenciasClientes(result.data || []);
            } catch (error) {
                console.error("Error buscando clientes:", error);
            }
        }, 300);
    });

    // ENTER en búsqueda de cliente -> seleccionar primero y foco en producto
    buscarCliente.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const primerCliente = listaClientes.querySelector('.list-group-item.active') || listaClientes.querySelector('.list-group-item');
            if (primerCliente) {
                // Simular click
                primerCliente.click();
                // Foco a codigo de barras
                setTimeout(() => {
                    const codigoBarras = document.getElementById('codigoBarras');
                    if (codigoBarras) {
                        codigoBarras.focus();
                        codigoBarras.select();
                    }
                }, 100);
            }
        }
    });

    function mostrarSugerenciasClientes(clientes) {
        listaClientes.innerHTML = '';

        if (clientes.length === 0) {
            listaClientes.style.display = 'none';
            return;
        }

        clientes.forEach(c => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div><strong>${c.nombre}</strong><br><small class="text-muted">${c.cuit || 'Sin CUIT'}</small></div>
                    <div class="text-end"><small>${c.condicion_fiscal}</small></div>
                </div>
            `;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                seleccionarCliente(c);
            });
            listaClientes.appendChild(item);
        });

        listaClientes.style.display = 'block';
    }

    function seleccionarCliente(cliente) {
        clienteSeleccionado = cliente;
        buscarCliente.value = cliente.nombre;
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('infoCuit').value = cliente.cuit || '';
        document.getElementById('infoCondicion').value = cliente.condicion_fiscal;

        // Mapear lista de precios a nombre legible
        // Base de datos usa: "1"=Efectivo, "2"=Cta.Cte., "3"=Tarjeta, "4"=Mayorista
        const listaNombre = {
            '1': 'Efectivo',
            '2': 'Cta. Cte.',
            '3': 'Tarjeta',
            '4': 'Mayorista'
        };

        const listaValue = cliente.lista_precio || '1';
        document.getElementById('listaPrecioCliente').value = listaNombre[listaValue] || 'Efectivo';
        listaClientes.style.display = 'none';
    }

    // Campo Código de Barras
    const codigoBarras = document.getElementById('codigoBarras');
    const listaCodigos = document.getElementById('listaCodigos');
    const cantidadProducto = document.getElementById('cantidadProducto');
    let timeoutCodigo;

    // Autocomplete Código
    codigoBarras.addEventListener('input', function () {
        clearTimeout(timeoutCodigo);
        const query = this.value.trim();

        if (query.length < 2) {
            listaCodigos.style.display = 'none';
            return;
        }

        timeoutCodigo = setTimeout(async () => {
            // Usamos la misma API de buscar productos, que busca por codigo y nombre
            try {
                const response = await fetch(`/api/productos/buscar/?q=${encodeURIComponent(query)}`);
                const result = await response.json();
                mostrarSugerenciasCodigos(result.data || []);
            } catch (error) {
                console.error("Error buscando por código:", error);
            }
        }, 300);
    });

    function mostrarSugerenciasCodigos(productos) {
        listaCodigos.innerHTML = '';

        if (productos.length === 0) {
            listaCodigos.style.display = 'none';
            return;
        }

        productos.forEach(p => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.setAttribute('data-producto', JSON.stringify(p));
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${p.codigo || 'S/C'}</strong> - ${p.descripcion}
                    </div>
                </div>
            `;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                seleccionarProductoDesdeCodigo(p);
            });
            listaCodigos.appendChild(item);
        });

        listaCodigos.style.display = 'block';
    }

    function seleccionarProductoDesdeCodigo(producto) {
        // Rellenar input
        codigoBarras.value = producto.codigo;

        // Mostrar descripción en el campo de buscar producto para feedback visual
        const buscarProductoInput = document.getElementById('buscarProducto');
        if (buscarProductoInput) {
            buscarProductoInput.value = producto.descripcion;
        }

        // Guardar data
        cantidadProducto.dataset.productoData = JSON.stringify(producto);

        // Foco a cantidad
        listaCodigos.style.display = 'none';
        cantidadProducto.focus();
        cantidadProducto.select();
    }

    codigoBarras.addEventListener('keydown', async function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            // 1. Si hay sugerencias y el usuario presiona Enter, tomar la PRIMERA o la ACTIVA
            const primerSugerencia = listaCodigos.querySelector('.list-group-item.active') || listaCodigos.querySelector('.list-group-item');
            if (primerSugerencia && listaCodigos.style.display !== 'none') {
                const productoData = primerSugerencia.getAttribute('data-producto');
                if (productoData) {
                    seleccionarProductoDesdeCodigo(JSON.parse(productoData));
                    return;
                }
            }

            // 2. Si NO hay sugerencias visibles (ej. tipeó muy rapido o no hubo matches)
            // Intentar fetch directo si tiene texto
            const codigo = this.value.trim();
            if (codigo) {
                try {
                    const response = await fetch(`/api/productos/buscar/?q=${encodeURIComponent(codigo)}`);
                    const result = await response.json();
                    const productos = result.data || [];

                    if (productos.length > 0) {
                        // Encontramos algo -> Tomar el primero
                        seleccionarProductoDesdeCodigo(productos[0]);
                    } else {
                        // NO ENCONTRADO -> Pasar foco a "Buscar Producto"
                        // Limpiar lista por las dudas
                        listaCodigos.style.display = 'none';
                        const buscarProducto = document.getElementById('buscarProducto');
                        buscarProducto.focus();
                    }
                } catch (error) {
                    console.error("Error buscando:", error);
                }
            } else {
                // Si está vacío y da Enter -> Foco a Buscar Producto
                document.getElementById('buscarProducto').focus();
            }
        }
    });

    // Autocomplete Producto
    const buscarProducto = document.getElementById('buscarProducto');
    const listaProductos = document.getElementById('listaProductos');
    let timeoutProducto;

    buscarProducto.addEventListener('input', function () {
        clearTimeout(timeoutProducto);
        const query = this.value.trim();

        if (query.length < 2) {
            listaProductos.style.display = 'none';
            return;
        }

        timeoutProducto = setTimeout(async () => {
            try {
                const response = await fetch(`/api/productos/buscar/?q=${encodeURIComponent(query)}`);
                const result = await response.json();
                mostrarSugerenciasProductos(result.data || []);
            } catch (error) {
                console.error("Error buscando productos:", error);
            }
        }, 300);
    });

    // ENTER en búsqueda de producto -> ir a cantidad (sin agregar el producto todavía)
    buscarProducto.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const primerProducto = listaProductos.querySelector('.list-group-item.active') || listaProductos.querySelector('.list-group-item');
            if (primerProducto) {
                // Obtener el producto del atributo data
                const productoData = primerProducto.getAttribute('data-producto');
                if (productoData) {
                    const producto = JSON.parse(productoData);
                    // Actualizar el campo de búsqueda con la descripción completa
                    buscarProducto.value = producto.descripcion;
                    // Guardar temporalmente y mover a cantidad
                    cantidadProducto.dataset.productoData = productoData;
                    cantidadProducto.focus();
                    cantidadProducto.select();
                    // Ocultar la lista de sugerencias
                    listaProductos.style.display = 'none';
                }
            }
        }
    });

    function mostrarSugerenciasProductos(productos) {
        listaProductos.innerHTML = '';

        if (productos.length === 0) {
            listaProductos.style.display = 'none';
            return;
        }

        productos.forEach(p => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.setAttribute('data-producto', JSON.stringify(p));
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${p.descripcion}</strong><br>
                        <small class="text-muted">Código: ${p.codigo} | ${p.marca || ''} | Stock: ${p.stock}</small>
                    </div>
                    <div class="text-end">
                        <strong class="text-success">$${p.precio_efectivo.toFixed(2)}</strong>
                    </div>
                </div>
            `;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Actualizar el campo de búsqueda con la descripción completa
                buscarProducto.value = p.descripcion;
                // Guardar producto y mover a cantidad
                cantidadProducto.dataset.productoData = JSON.stringify(p);
                cantidadProducto.focus();
                cantidadProducto.select();
                listaProductos.style.display = 'none';
            });
            listaProductos.appendChild(item);
        });

        listaProductos.style.display = 'block';
    }

    // Botón Agregar - solo enfoca cantidad
    document.getElementById('btnAgregarProducto').addEventListener('click', function () {
        const inputCantidad = document.getElementById('cantidadProducto');
        inputCantidad.focus();
        inputCantidad.select();
    });

    // ENTER en cantidad -> agregar producto y volver a código
    cantidadProducto.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Si hay un producto guardado
            if (this.dataset.productoData) {
                const producto = JSON.parse(this.dataset.productoData);
                agregarProductoATabla(producto);
                // Limpiar datos temporales
                delete this.dataset.productoData;
                // Volver al código de barras
                codigoBarras.value = '';
                codigoBarras.focus();
            }
        }
    });

    function agregarProductoATabla(producto) {
        const cantidad = parseFloat(document.getElementById('cantidadProducto').value) || 1;

        // Verificar si ya existe
        const existe = itemsVenta.find(item => item.id === producto.id);

        if (existe) {
            // Si ya existe, sumar las cantidades
            const nuevaCantidad = existe.cantidad + cantidad;

            // Validar stock con la nueva cantidad
            if (nuevaCantidad > producto.stock) {
                Swal.fire("Stock insuficiente", `Solo hay ${producto.stock} unidades disponibles. Ya tienes ${existe.cantidad} en la venta.`, "warning");
                return;
            }

            // Actualizar cantidad y subtotal
            existe.cantidad = nuevaCantidad;
            existe.subtotal = nuevaCantidad * existe.precio;

            renderizarItems();
            calcularTotales();
        } else {
            // Validar stock para producto nuevo
            if (cantidad > producto.stock) {
                Swal.fire("Stock insuficiente", `Solo hay ${producto.stock} unidades disponibles`, "warning");
                return;
            }

            // Determinar precio según lista del cliente
            // "1"=Efectivo, "2"=Cta.Cte., "3"=Tarjeta, "4"=Mayorista
            const listaPrecio = clienteSeleccionado ? clienteSeleccionado.lista_precio : '1';
            const precio = (listaPrecio === '3') ? producto.precio_tarjeta : producto.precio_efectivo;
            const subtotal = cantidad * precio;

            itemsVenta.push({
                id: producto.id,
                descripcion: producto.descripcion,
                cantidad: cantidad,
                precio: precio,
                subtotal: subtotal,
                stock: producto.stock
            });

            renderizarItems();
            calcularTotales();
        }

        // Limpiar búsqueda
        buscarProducto.value = '';
        document.getElementById('cantidadProducto').value = 1;
        listaProductos.style.display = 'none';

        // Volver al código de barras para el siguiente escaneo
        codigoBarras.value = '';
        codigoBarras.focus();
    }

    function renderizarItems() {
        tbodyItems.innerHTML = '';

        if (itemsVenta.length === 0) {
            tbodyItems.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay productos agregados</td></tr>';
            return;
        }

        itemsVenta.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.descripcion}</td>
                <td class="text-center">
                    <input type="number" class="form-control form-control-sm text-center" 
                        value="${item.cantidad}" min="1" max="${item.stock}" 
                        onchange="actualizarCantidad(${index}, this.value)">
                </td>
                <td class="text-end">$${item.precio.toFixed(2)}</td>
                <td class="text-end fw-bold">$${item.subtotal.toFixed(2)}</td>
                <td class="text-center"><span class="badge bg-info">${item.stock}</span></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbodyItems.appendChild(tr);
        });
    }

    window.actualizarCantidad = function (index, nuevaCantidad) {
        const cantidad = parseFloat(nuevaCantidad);
        const item = itemsVenta[index];

        if (cantidad > item.stock) {
            Swal.fire("Stock insuficiente", `Solo hay ${item.stock} unidades disponibles`, "warning");
            renderizarItems();
            return;
        }

        if (cantidad <= 0) {
            eliminarItem(index);
            return;
        }

        item.cantidad = cantidad;
        item.subtotal = cantidad * item.precio;
        renderizarItems();
        calcularTotales();
    }

    window.eliminarItem = function (index) {
        itemsVenta.splice(index, 1);
        renderizarItems();
        calcularTotales();
    }

    function calcularTotales() {
        const subtotal = itemsVenta.reduce((sum, item) => sum + item.subtotal, 0);

        // Obtener descuento e interés
        const descuentoPct = parseFloat(document.getElementById('descuentoPorcentaje').value) || 0;
        const interesPct = parseFloat(document.getElementById('interesPorcentaje').value) || 0;

        // Calcular montos
        const descuentoMonto = subtotal * (descuentoPct / 100);
        const subtotalConDescuento = subtotal - descuentoMonto;
        const interesMonto = subtotalConDescuento * (interesPct / 100);
        const totalFinal = subtotalConDescuento + interesMonto;

        // Actualizar UI
        document.getElementById('totalSubtotal').innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById('descuentoMonto').value = `$${descuentoMonto.toFixed(2)}`;
        document.getElementById('interesMonto').value = `$${interesMonto.toFixed(2)}`;
        document.getElementById('totalGeneral').innerText = `$${totalFinal.toFixed(2)}`;
    }

    // Event listeners para descuento e interés
    document.getElementById('descuentoPorcentaje').addEventListener('input', calcularTotales);
    document.getElementById('interesPorcentaje').addEventListener('input', calcularTotales);

    // --- FUNCIONES PRINCIPALES ---

    async function cargarVentas() {
        mostrarLoading();
        try {
            const response = await fetch('/api/ventas/listar/');
            const result = await response.json();
            ventasCache = result.data || [];
            renderizarTabla();
        } catch (error) {
            console.error("Error cargando ventas:", error);
            Swal.fire("Error", "No se pudieron cargar las ventas", "error");
        }
    }

    function renderizarTabla() {
        const busqueda = inputBusqueda.value.toLowerCase();
        const estado = filtroEstado.value;
        const comprobante = filtroComprobante.value;

        // Filtrar
        const filtrados = ventasCache.filter(v => {
            const matchBusqueda = v.cliente.toLowerCase().includes(busqueda) ||
                v.id.toString().includes(busqueda);
            const matchEstado = !estado || v.estado === estado;
            const matchComprobante = !comprobante || v.tipo_comprobante === comprobante;
            return matchBusqueda && matchEstado && matchComprobante;
        });

        // Paginar
        const totalRegistros = filtrados.length;
        const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
        if (paginaActual > totalPaginas) paginaActual = 1;

        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const datosPagina = filtrados.slice(inicio, fin);

        tbodyVentas.innerHTML = "";

        if (datosPagina.length === 0) {
            tbodyVentas.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No se encontraron ventas</td></tr>`;
            document.getElementById('contadorRegistros').innerText = `Mostrando 0 ventas`;
            renderizarPaginacion(0);
            return;
        }

        datosPagina.forEach(v => {
            const badgeClass = v.estado === 'Emitida' ? 'bg-success' : 'bg-danger';
            const row = `
                <tr>
                    <td class="ps-4 fw-bold">#${v.id}</td>
                    <td>${v.fecha}</td>
                    <td>${v.cliente}</td>
                    <td><span class="badge bg-secondary">Tipo ${v.tipo_comprobante}</span></td>
                    <td class="fw-bold text-success">$${parseFloat(v.total).toFixed(2)}</td>
                    <td><span class="badge ${badgeClass}">${v.estado}</span></td>
                    <td class="text-end pe-4">
                        <a href="/invoice/print/${v.id}/" target="_blank" class="btn btn-sm btn-outline-primary me-1" title="Imprimir Factura">
                            <i class="bi bi-printer"></i>
                        </a>
                        <a href="/ventas/${v.id}/" class="btn btn-sm btn-outline-primary" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </a>
                    </td>
                </tr>
            `;
            tbodyVentas.innerHTML += row;
        });

        document.getElementById('contadorRegistros').innerText = `Mostrando ${inicio + 1} a ${Math.min(fin, totalRegistros)} de ${totalRegistros} ventas`;
        renderizarPaginacion(totalPaginas);
    }

    function renderizarPaginacion(totalPaginas) {
        const paginacionContainer = document.getElementById('paginacionVentas');
        if (!paginacionContainer) return;

        paginacionContainer.innerHTML = "";
        if (totalPaginas <= 1) return;

        const ul = document.createElement('ul');
        ul.className = 'pagination pagination-sm mb-0';

        // Botón Anterior
        const btnPrev = document.createElement('li');
        btnPrev.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
        btnPrev.innerHTML = `<a class="page-link" href="#"><span>&laquo;</span></a>`;
        btnPrev.onclick = (e) => {
            e.preventDefault();
            if (paginaActual > 1) {
                paginaActual--;
                renderizarTabla();
            }
        };
        ul.appendChild(btnPrev);

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = (e) => {
                e.preventDefault();
                paginaActual = i;
                renderizarTabla();
            };
            ul.appendChild(li);
        }

        // Botón Siguiente
        const btnNext = document.createElement('li');
        btnNext.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
        btnNext.innerHTML = `<a class="page-link" href="#"><span>&raquo;</span></a>`;
        btnNext.onclick = (e) => {
            e.preventDefault();
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarTabla();
            }
        };
        ul.appendChild(btnNext);

        paginacionContainer.appendChild(ul);
    }

    function abrirModalNuevaVenta() {
        // Resetear formulario
        document.getElementById('formNuevaVenta').reset();
        itemsVenta = [];
        clienteSeleccionado = null;
        document.getElementById('clienteId').value = '';
        document.getElementById('listaPrecioCliente').value = 'Efectivo';
        document.getElementById('descuentoPorcentaje').value = 0;
        document.getElementById('interesPorcentaje').value = 0;
        renderizarItems();
        calcularTotales();
        modalNuevaVenta.show();
        setTimeout(() => buscarCliente.focus(), 300);
    }

    async function guardarVenta() {
        if (itemsVenta.length === 0) {
            Swal.fire("Atención", "Debe agregar al menos un producto", "warning");
            return;
        }

        const subtotal = itemsVenta.reduce((sum, item) => sum + item.subtotal, 0);
        const descuentoPct = parseFloat(document.getElementById('descuentoPorcentaje').value) || 0;
        const interesPct = parseFloat(document.getElementById('interesPorcentaje').value) || 0;

        const descuentoMonto = subtotal * (descuentoPct / 100);
        const subtotalConDescuento = subtotal - descuentoMonto;
        const interesMonto = subtotalConDescuento * (interesPct / 100);
        const totalFinal = subtotalConDescuento + interesMonto;

        const data = {
            cliente_id: document.getElementById('clienteId').value || null,
            items: itemsVenta,
            total_general: totalFinal,
            descuento_porcentaje: descuentoPct,
            interes_porcentaje: interesPct,
            medio_pago: document.getElementById('medioPago').value,
            generar_remito: document.getElementById('generarRemitoAuto') ? document.getElementById('generarRemitoAuto').checked : false
        };
        console.log("Enviando venta. Generar Remito:", data.generar_remito); // DEBUG

        try {
            btnGuardarVenta.disabled = true;
            btnGuardarVenta.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const response = await fetch('/api/ventas/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.ok) {
                Swal.fire("Éxito", "Venta registrada correctamente", "success");
                modalNuevaVenta.hide();
                cargarVentas();
            } else {
                Swal.fire("Error", result.error || "No se pudo guardar la venta", "error");
            }

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error inesperado", "error");
        } finally {
            btnGuardarVenta.disabled = false;
            btnGuardarVenta.innerHTML = '<i class="bi bi-save"></i> Confirmar Venta';
        }
    }

    function limpiarFiltros() {
        inputBusqueda.value = "";
        filtroEstado.value = "Emitida";
        filtroComprobante.value = "";
        paginaActual = 1;
        renderizarTabla();
    }

    function mostrarLoading() {
        tbodyVentas.innerHTML = `<tr><td colspan="7" class="text-center py-5"><div class="spinner-border text-success"></div><p class="mt-2 text-muted">Cargando...</p></td></tr>`;
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

    // --- NAVEGACIÓN POR TECLADO EN LISTAS ---
    function activarNavegacionTeclado(input, lista) {
        input.addEventListener('keydown', function (e) {
            const items = lista.querySelectorAll('.list-group-item');
            if (items.length === 0 || lista.style.display === 'none') return;

            let activeItem = lista.querySelector('.list-group-item.active');
            let index = Array.from(items).indexOf(activeItem);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeItem) {
                    activeItem.classList.remove('active');
                    const nextIndex = (index + 1) < items.length ? index + 1 : 0;
                    items[nextIndex].classList.add('active');
                    items[nextIndex].scrollIntoView({ block: 'nearest' });
                } else {
                    items[0].classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeItem) {
                    activeItem.classList.remove('active');
                    const prevIndex = (index - 1) >= 0 ? index - 1 : items.length - 1;
                    items[prevIndex].classList.add('active');
                    items[prevIndex].scrollIntoView({ block: 'nearest' });
                } else {
                    items[items.length - 1].classList.add('active');
                }
            }
        });
    }

    // Activar navegación para los 3 campos de búsqueda
    activarNavegacionTeclado(document.getElementById('buscarCliente'), document.getElementById('listaClientes'));
    activarNavegacionTeclado(document.getElementById('codigoBarras'), document.getElementById('listaCodigos'));
    activarNavegacionTeclado(document.getElementById('buscarProducto'), document.getElementById('listaProductos'));

});
