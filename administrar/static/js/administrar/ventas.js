/******************************************************************************
 * MÓDULO VENTAS – NUEVA VENTA
 * ventas.js
 *****************************************************************************/

document.addEventListener("DOMContentLoaded", function () {

    const urlVentas = "/ventas/";  // ajustable o pasado desde template

    // ===========================
    // CSRF helper
    // ===========================
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie("csrftoken");

    // ===========================
    // REFERENCIAS DOM
    // ===========================
    const inputCliente = document.getElementById("buscar_cliente");
    const listaClientes = document.getElementById("lista_clientes");
    const inputClienteId = document.getElementById("cliente_id");
    const inputListaPrecioCl = document.getElementById("lista_precio_cliente");
    const infoCuit = document.getElementById("info_cuit");
    const infoCF = document.getElementById("info_cf");
    const infoLista = document.getElementById("info_lista");

    const inputProducto = document.getElementById("buscar_producto");
    const listaSugerencias = document.getElementById("lista_sugerencias");
    const inputCantidad = document.getElementById("cantidad");
    const btnAgregar = document.getElementById("btnAgregar");
    const tbodyItems = document.querySelector("#tabla_items tbody");

    const inputSubtotal = document.getElementById("total_subtotal");
    const inputDescuento = document.getElementById("total_descuento");
    const inputTotal = document.getElementById("total_general");

    const selectMedioPago = document.getElementById("medio_pago");
    const inputMontoPago = document.getElementById("monto_pago");
    const inputVuelto = document.getElementById("vuelto");

    const btnConfirmar = document.getElementById("btnConfirmarVenta");

    // ===========================
    // ESTADO
    // ===========================
    let clienteSeleccionadoId = null;
    let productoSeleccionado = null;
    let itemsVenta = [];

    // ===========================
    // AUTOCOMPLETE CLIENTES
    // ===========================
    let timeoutCliente = null;

    if (inputCliente && listaClientes) {
        inputCliente.addEventListener("input", () => {
            const q = inputCliente.value.trim();

            if (q.length < 2) {
                listaClientes.innerHTML = "";
                listaClientes.style.display = "none";
                return;
            }

            clearTimeout(timeoutCliente);
            timeoutCliente = setTimeout(() => {
                fetch(`/api/clientes/buscar/?q=${encodeURIComponent(q)}`)
                    .then(res => res.json())
                    .then(data => {
                        listaClientes.innerHTML = "";

                        if (!data || data.length === 0) {
                            listaClientes.style.display = "none";
                            return;
                        }

                        data.forEach(c => {
                            const btn = document.createElement("button");
                            btn.type = "button";
                            btn.className = "list-group-item list-group-item-action";
                            btn.innerHTML = `
                                <div class="fw-bold">${c.nombre}</div>
                                <small>${c.cuit || ""} — ${c.condicion_fiscal}</small>
                            `;
                            btn.addEventListener("click", () => seleccionarCliente(c));
                            listaClientes.appendChild(btn);
                        });

                        listaClientes.style.display = "block";
                    })
                    .catch(err => console.error("Error buscando clientes:", err));
            }, 250);
        });

        document.addEventListener("click", (ev) => {
            if (!inputCliente.contains(ev.target) && !listaClientes.contains(ev.target)) {
                listaClientes.style.display = "none";
            }
        });
    }

    function seleccionarCliente(c) {
        clienteSeleccionadoId = c.id;
        inputCliente.value = c.nombre;
        inputClienteId.value = c.id;
        inputListaPrecioCl.value = c.lista_precios || "1";

        infoCuit.value = c.cuit || "";
        infoCF.value = c.condicion_fiscal || "";
        infoLista.value = c.lista_precios ? `Lista ${c.lista_precios}` : "";

        listaClientes.style.display = "none";
        listaClientes.innerHTML = "";
    }

    // ===========================
    // AUTOCOMPLETE PRODUCTOS
    // ===========================
    let timeoutProducto = null;

    if (inputProducto && listaSugerencias) {
        inputProducto.addEventListener("input", () => {
            const q = inputProducto.value.trim();

            if (q.length < 1) {
                listaSugerencias.innerHTML = "";
                listaSugerencias.style.display = "none";
                productoSeleccionado = null;
                return;
            }

            clearTimeout(timeoutProducto);
            timeoutProducto = setTimeout(() => {
                fetch(`/api/buscar_productos/?q=${encodeURIComponent(q)}`)
                    .then(res => res.json())
                    .then(data => {
                        listaSugerencias.innerHTML = "";

                        if (!data || data.length === 0) {
                            listaSugerencias.style.display = "none";
                            return;
                        }

                        data.forEach(p => {
                            const btn = document.createElement("button");
                            btn.type = "button";
                            btn.className = "list-group-item list-group-item-action";
                            btn.innerHTML = `
                                <div class="fw-bold">${p.codigo} - ${p.descripcion}</div>
                                <small>Stock: ${p.stock} | $${p.precio_efectivo}</small>
                            `;
                            btn.addEventListener("click", () => seleccionarProducto(p));
                            listaSugerencias.appendChild(btn);
                        });

                        listaSugerencias.style.display = "block";
                    })
                    .catch(err => console.error("Error buscando productos:", err));
            }, 250);
        });

        document.addEventListener("click", (ev) => {
            if (!inputProducto.contains(ev.target) && !listaSugerencias.contains(ev.target)) {
                listaSugerencias.style.display = "none";
            }
        });
    }

    function seleccionarProducto(p) {
        productoSeleccionado = p;
        inputProducto.value = `${p.codigo} - ${p.descripcion}`;
        listaSugerencias.innerHTML = "";
        listaSugerencias.style.display = "none";
    }

    // ===========================
    // AGREGAR ÍTEM
    // ===========================
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {

            if (!productoSeleccionado) {
                alert("Primero seleccioná un producto de la lista.");
                return;
            }

            let cantidad = parseFloat(inputCantidad.value || "0");
            if (isNaN(cantidad) || cantidad <= 0) {
                alert("Cantidad inválida.");
                return;
            }

            const listaPrecio = inputListaPrecioCl.value || "1";

            fetch(`/api/producto_info/${productoSeleccionado.id}/${listaPrecio}/`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert("Error: " + data.error);
                        return;
                    }

                    const stock = parseFloat(data.stock_actual || "0");
                    if (cantidad > stock) {
                        if (!confirm(`Stock disponible: ${stock}. ¿Agregar igual?`)) {
                            return;
                        }
                    }

                    const precio = parseFloat(data.precio || "0");
                    const subtotal = precio * cantidad;

                    const item = {
                        id: productoSeleccionado.id,
                        descripcion: data.descripcion,
                        cantidad: cantidad,
                        precio: precio,
                        subtotal: subtotal
                    };

                    itemsVenta.push(item);
                    productoSeleccionado = null;
                    inputProducto.value = "";
                    inputCantidad.value = "1";

                    renderTablaItems();
                    recalcularTotales();
                })
                .catch(err => {
                    console.error("Error obteniendo info producto:", err);
                    alert("No se pudo obtener la info del producto.");
                });
        });
    }

    function renderTablaItems() {
        if (!tbodyItems) return;

        tbodyItems.innerHTML = "";

        itemsVenta.forEach((item, index) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${item.descripcion}</td>
                <td class="text-end">${item.cantidad}</td>
                <td class="text-end">$ ${item.precio.toFixed(2)}</td>
                <td class="text-end">$ ${item.subtotal.toFixed(2)}</td>
                <td class="text-center">
                    <button type="button"
                            class="btn btn-sm btn-danger"
                            data-index="${index}">
                        🗑
                    </button>
                </td>
            `;

            tbodyItems.appendChild(tr);
        });
    }

    if (tbodyItems) {
        tbodyItems.addEventListener("click", (ev) => {
            const btn = ev.target.closest("button[data-index]");
            if (!btn) return;

            const idx = parseInt(btn.getAttribute("data-index"));
            if (isNaN(idx)) return;

            itemsVenta.splice(idx, 1);
            renderTablaItems();
            recalcularTotales();
        });
    }

    // ===========================
    // TOTALES + VUELTO
    // ===========================
    function recalcularTotales() {
        let subtotal = 0;

        itemsVenta.forEach(it => {
            subtotal += it.subtotal;
        });

        inputSubtotal.value = subtotal.toFixed(2);
        inputDescuento.value = "0.00";
        inputTotal.value = subtotal.toFixed(2);

        recalcularVuelto();
    }

    function recalcularVuelto() {
        const total = parseFloat(inputTotal.value || "0");
        const pagado = parseFloat(inputMontoPago.value || "0");

        let vuelto = 0;
        if (selectMedioPago.value === "EFECTIVO" && pagado > total) {
            vuelto = pagado - total;
        }

        inputVuelto.value = vuelto.toFixed(2);
    }

    if (inputMontoPago) {
        inputMontoPago.addEventListener("input", recalcularVuelto);
    }
    if (selectMedioPago) {
        selectMedioPago.addEventListener("change", recalcularVuelto);
    }

    // ===========================
    // GUARDAR VENTA
    // ===========================
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {

            if (itemsVenta.length === 0) {
                alert("No hay productos en la venta.");
                return;
            }

            const totalGeneral = parseFloat(inputTotal.value || "0");
            if (totalGeneral <= 0) {
                alert("El total debe ser mayor a cero.");
                return;
            }

            const medioPago = selectMedioPago.value;
            const montoPago = parseFloat(inputMontoPago.value || "0");

            if (medioPago === "EFECTIVO" && montoPago < totalGeneral) {
                if (!confirm("El monto recibido es menor al total. ¿Continuar igual?")) {
                    return;
                }
            }

            const payload = {
                cliente_id: clienteSeleccionadoId,
                medio_pago: medioPago,
                monto_pago: montoPago,
                total_general: totalGeneral,
                items: itemsVenta
            };

            fetch("/api/venta/guardar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert("Error al guardar la venta: " + data.error);
                        return;
                    }

                    alert("Venta guardada correctamente. Nro: " + data.venta_id);
                    window.location.href = urlVentas;
                })
                .catch(err => {
                    console.error("Error al guardar venta:", err);
                    alert("No se pudo guardar la venta.");
                });

        });
    }

    // ===========================
    // LISTADO DE VENTAS
    // ===========================
    const tbodyVentas = document.getElementById("tbodyVentas");
    if (tbodyVentas) {
        cargarVentas();
    }

    function cargarVentas() {
        fetch("/api/ventas/listar/")
            .then(res => res.json())
            .then(data => {
                if (!data.ok) {
                    console.error("Error cargando ventas:", data.error);
                    return;
                }
                renderTablaVentas(data.data);
            })
            .catch(err => console.error("Error fetch ventas:", err));
    }

    function renderTablaVentas(ventas) {
        tbodyVentas.innerHTML = "";
        ventas.forEach(v => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-4 fw-bold">#${v.id}</td>
                <td>${v.fecha}</td>
                <td>${v.cliente}</td>
                <td>${v.tipo_comprobante || "-"}</td>
                <td class="fw-bold">$${v.total.toFixed(2)}</td>
                <td><span class="badge bg-${v.estado === 'Emitida' ? 'success' : 'secondary'}">${v.estado}</span></td>
                <td class="text-end pe-4">
                    <a href="/invoice/print/${v.id}/" target="_blank" class="btn btn-sm btn-outline-primary" title="Imprimir Factura">
                        <i class="bi bi-printer"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" title="Anular" onclick="anularVenta(${v.id})">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </td>
            `;
            tbodyVentas.appendChild(tr);
        });
    }

    window.anularVenta = function (id) {
        if (!confirm("¿Estás seguro de anular esta venta?")) return;
        // Implementar anulación...
        alert("Función de anular pendiente de implementación.");
    };

    console.log("ventas.js cargado");
});

