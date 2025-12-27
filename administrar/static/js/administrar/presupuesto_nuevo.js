/******************************************************************************
 * MÓDULO PRESUPUESTOS – NUEVO PRESUPUESTO
 * presupuesto_nuevo.js
 *****************************************************************************/

document.addEventListener("DOMContentLoaded", function () {

    const urlPresupuestos = "/presupuestos/";  // URL de la lista de presupuestos

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

    const inputValidez = document.getElementById("validez");
    const inputObservaciones = document.getElementById("observaciones");
    const inputTotal = document.getElementById("total_general");

    const btnGuardar = document.getElementById("btnGuardarPresupuesto");

    // ===========================
    // ESTADO
    // ===========================
    let clienteSeleccionadoId = null;
    let productoSeleccionado = null;
    let itemsPresupuesto = [];

    // ===========================
    // INICIALIZACIÓN (EDICIÓN)
    // ===========================
    if (window.INITIAL_CLIENTE) {
        seleccionarCliente(window.INITIAL_CLIENTE);
    }
    if (window.INITIAL_ITEMS && window.INITIAL_ITEMS.length > 0) {
        itemsPresupuesto = window.INITIAL_ITEMS;
        renderTablaItems();
        recalcularTotales();
    }

    // ===========================
    // AUTOCOMPLETE GENÉRICO
    // ===========================
    function setupAutocomplete(input, listContainer, apiPath, onSelect, nextFocusInput = null) {
        let timeout = null;
        let currentFocus = -1;

        input.addEventListener("input", function () {
            const q = this.value.trim();
            currentFocus = -1;

            if (q.length < 1) {
                if (apiPath.includes('clientes') && q.length < 2) {
                    listContainer.innerHTML = "";
                    listContainer.style.display = "none";
                    return;
                }
                if (apiPath.includes('productos') && q.length < 1) {
                    listContainer.innerHTML = "";
                    listContainer.style.display = "none";
                    return;
                }
            }

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                fetch(`${apiPath}?q=${encodeURIComponent(q)}`)
                    .then(res => res.json())
                    .then(data => {
                        listContainer.innerHTML = "";
                        const resultados = data.data || data;

                        if (!resultados || resultados.length === 0) {
                            listContainer.style.display = "none";
                            return;
                        }

                        // Limitar a 50 resultados para performance
                        resultados.slice(0, 50).forEach((item, index) => {
                            const btn = document.createElement("button");
                            btn.type = "button";
                            btn.className = "list-group-item list-group-item-action";
                            // Renderizado custom segun tipo
                            if (item.codigo) { // Producto
                                // Adaptador precio
                                if (!item.precio && item.precios) item.precio = item.precios[1];
                                if (!item.precio_efectivo) item.precio_efectivo = item.precio;

                                btn.innerHTML = `
                                    <div class="fw-bold">${item.codigo} - ${item.descripcion}</div>
                                    <small>Stock: ${item.stock} | $${item.precio_efectivo}</small>
                                `;
                            } else { // Cliente
                                btn.innerHTML = `
                                    <div class="fw-bold">${item.nombre}</div>
                                    <small>${item.cuit || ""} — ${item.condicion_fiscal}</small>
                                `;
                            }

                            btn.addEventListener("click", () => {
                                onSelect(item);
                                if (nextFocusInput) nextFocusInput.focus();
                            });
                            listContainer.appendChild(btn);
                        });

                        listContainer.style.display = "block";
                    })
                    .catch(err => console.error("Error autocomplete:", err));
            }, 250);
        });

        // Navegación x Teclado
        input.addEventListener("keydown", function (e) {
            let items = listContainer.getElementsByTagName("button");
            // Nota: Si listContainer está oculto, items pueden existir pero no visibles.
            if (listContainer.style.display === "none") return;

            if (e.key === "ArrowDown") {
                currentFocus++;
                addActive(items);
            } else if (e.key === "ArrowUp") {
                currentFocus--;
                addActive(items);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (items[currentFocus]) items[currentFocus].click();
                } else if (items.length === 1) {
                    // Si hay solo 1 resultado, seleccionar
                    items[0].click();
                } else if (items.length > 0) {
                    // Si hay lista pero no seleccionó nada, seleccionamos el primero (UX rápida)
                    items[0].click();
                }
            }
        });

        function addActive(items) {
            if (!items) return false;
            removeActive(items);
            if (currentFocus >= items.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = items.length - 1;

            items[currentFocus].classList.add("active");
            // Scroll into view
            items[currentFocus].scrollIntoView({ block: "nearest" });
        }

        function removeActive(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove("active");
            }
        }

        document.addEventListener("click", (ev) => {
            if (!input.contains(ev.target) && !listContainer.contains(ev.target)) {
                listContainer.style.display = "none";
            }
        });
    }

    // ===========================
    // INICIALIZAR SEARCH - CLIENTES
    // ===========================
    if (inputCliente && listaClientes) {
        setupAutocomplete(
            inputCliente,
            listaClientes,
            "/api/clientes/buscar/",
            seleccionarCliente,
            inputProducto // Foco al producto al seleccionar
        );
    }

    // ===========================
    // INICIALIZAR SEARCH - PRODUCTOS
    // ===========================
    if (inputProducto && listaSugerencias) {
        setupAutocomplete(
            inputProducto,
            listaSugerencias,
            "/api/buscar_productos/",
            seleccionarProducto,
            inputCantidad // Foco a cantidad (o boton agregar?)
        );
    }

    function seleccionarCliente(c) {
        clienteSeleccionadoId = c.id;
        inputCliente.value = c.nombre;
        inputClienteId.value = c.id;
        // API devuelve 'lista_precio' (singular)
        inputListaPrecioCl.value = c.lista_precio || "1";

        infoCuit.value = c.cuit || "";
        infoCF.value = c.condicion_fiscal || "";
        infoLista.value = c.lista_precio ? `Lista ${c.lista_precio}` : "Lista 1";

        listaClientes.style.display = "none";
        listaClientes.innerHTML = "";
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

                    // En presupuesto NO validamos stock estricto, pero podemos avisar
                    // const stock = parseFloat(data.stock_actual || "0");
                    // if (cantidad > stock) ... (Opcional, pero usuario pidio NO descontar stock aun)

                    // API devuelve 'precio_seleccionado'
                    const precio = parseFloat(data.precio_seleccionado || "0");
                    const subtotal = precio * cantidad;

                    const item = {
                        id: productoSeleccionado.id,
                        descripcion: data.descripcion,
                        cantidad: cantidad,
                        precio: precio,
                        subtotal: subtotal
                    };

                    itemsPresupuesto.push(item);
                    productoSeleccionado = null;
                    inputProducto.value = "";
                    inputCantidad.value = "1";

                    renderTablaItems();
                    recalcularTotales();

                    // Volver foco a producto para carga rapida
                    setTimeout(() => inputProducto.focus(), 100);
                })
                .catch(err => {
                    console.error("Error obteniendo info producto:", err);
                    alert("No se pudo obtener la info del producto.");
                });
        });
    }

    // ===========================
    // ENTER EN CANTIDAD -> AGREGAR
    // ===========================
    if (inputCantidad && btnAgregar) {
        inputCantidad.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btnAgregar.click();
            }
        });
    }

    function renderTablaItems() {
        if (!tbodyItems) return;

        tbodyItems.innerHTML = "";

        itemsPresupuesto.forEach((item, index) => {
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

            itemsPresupuesto.splice(idx, 1);
            renderTablaItems();
            recalcularTotales();
        });
    }

    // ===========================
    // TOTALES
    // ===========================
    function recalcularTotales() {
        let subtotal = 0;

        itemsPresupuesto.forEach(it => {
            subtotal += it.subtotal;
        });

        if (inputTotal) {
            inputTotal.value = subtotal.toFixed(2);
        }
    }

    // ===========================
    // GUARDAR PRESUPUESTO
    // ===========================
    if (btnGuardar) {
        btnGuardar.addEventListener("click", () => {

            if (itemsPresupuesto.length === 0) {
                alert("No hay productos en el presupuesto.");
                return;
            }

            // Validar cliente? Quizás opcional para presupuesto anonimo, pero mejor obligar
            if (!clienteSeleccionadoId) {
                if (!confirm("No seleccionaste cliente. ¿Guardar como 'Consumidor Final'?")) return;
            }

            const totalGeneral = parseFloat(inputTotal.value || "0");
            const validez = parseInt(inputValidez.value || "15");
            const observaciones = inputObservaciones.value;

            const presupuestoId = document.getElementById("presupuesto_id") ? document.getElementById("presupuesto_id").value : "";

            const payload = {
                id: presupuestoId, // Si existe, es edicion
                cliente_id: clienteSeleccionadoId, // puede ser null
                validez: validez,
                observaciones: observaciones,
                total: totalGeneral,
                items: itemsPresupuesto
            };

            fetch("/api/presupuesto/guardar/", {
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
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: "Error al guardar presupuesto: " + data.error
                        });
                        return;
                    }

                    Swal.fire({
                        icon: 'success',
                        title: '¡Guardado!',
                        text: "Presupuesto guardado correctamente. Nro: " + data.presupuesto_id,
                        confirmButtonText: 'Aceptar'
                    }).then((result) => {
                        window.location.href = urlPresupuestos;
                    });
                })
                .catch(err => {
                    console.error("Error al guardar presupuesto:", err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: "No se pudo guardar el presupuesto."
                    });
                });

        });
    }

    console.log("presupuesto_nuevo.js cargado");
});
