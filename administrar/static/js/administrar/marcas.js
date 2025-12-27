document.addEventListener("DOMContentLoaded", () => {

    console.log("Marcas JS cargado");

    // --------------------------------------------------
    //  Referencias base
    // --------------------------------------------------
    const form          = document.getElementById("formMarca");
    const modalEl       = document.getElementById("modalMarca");
    const modalOkEl     = document.getElementById("modalMarcaOk");      // modal de éxito (si existe)
    const modalDelEl    = document.getElementById("modalEliminarMarca"); // modal eliminar

    if (!form || !modalEl) {
        console.warn("No se encontró formMarca o modalMarca en el DOM.");
        return;
    }

    const modal         = new bootstrap.Modal(modalEl);
    const modalOk       = modalOkEl  ? new bootstrap.Modal(modalOkEl,  { backdrop: false }) : null;
    const modalEliminar = modalDelEl ? new bootstrap.Modal(modalDelEl) : null;

    const btnNuevo      = document.getElementById("btnNuevoMarca");
    const btnGuardar    = document.getElementById("btnGuardarMarca");
    const btnConfDel    = document.getElementById("btnConfirmarEliminarMarca");
    const errNombre     = document.getElementById("errNombre");

    const inputId          = form.querySelector("input[name='id']");
    const inputNombre      = form.querySelector("input[name='nombre']");
    const inputDescripcion = form.querySelector("textarea[name='descripcion']");

    // --------------------------------------------------
    //  DataTable
    // --------------------------------------------------
    const tablaEl = document.getElementById("tablaMarcasDT");
    let tabla = null;

    if (tablaEl && window.$ && $.fn.DataTable) {
        tabla = $("#tablaMarcasDT").DataTable({
            pageLength: 10,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            }
        });
    }

    // --------------------------------------------------
    //  Helpers
    // --------------------------------------------------
    function getCSRFToken() {
        const input = document.querySelector("input[name='csrfmiddlewaretoken']");
        if (input) return input.value;

        const name = "csrftoken=";
        const cookie = document.cookie
            .split(";")
            .map(c => c.trim())
            .find(c => c.startsWith(name));
        return cookie ? cookie.substring(name.length) : "";
    }

    function limpiarErrores() {
        if (errNombre) errNombre.innerText = "";
        if (inputNombre) inputNombre.classList.remove("is-invalid");
    }

    function enfocarNombre() {
        setTimeout(() => {
            if (inputNombre) inputNombre.focus();
        }, 150);
    }

    function mostrarOk() {
        if (!modalOk) return;
        modalOk.show();
        setTimeout(() => modalOk.hide(), 2000);
    }

    // evitar submit por Enter dentro del form
    form.addEventListener("keydown", e => {
        if (e.key === "Enter") e.preventDefault();
    });

    // --------------------------------------------------
    //  NUEVA MARCA
    // --------------------------------------------------
    if (btnNuevo) {
        btnNuevo.addEventListener("click", () => {
            form.reset();
            if (inputId) inputId.value = "";
            limpiarErrores();

            const title = modalEl.querySelector(".modal-title");
            if (title) title.textContent = "Nueva Marca";

            modal.show();
            enfocarNombre();
        });
    }

    // --------------------------------------------------
    //  EDITAR (delegación)
    // --------------------------------------------------
    document.addEventListener("click", e => {
        const btn = e.target.closest(".btnEditar");
        if (!btn) return;

        const id = btn.dataset.id;
        if (!id) return;

        fetch(`/api/marcas/${id}/`)
            .then(r => r.json())
            .then(data => {
                if (inputId)          inputId.value          = data.id;
                if (inputNombre)      inputNombre.value      = data.nombre || "";
                if (inputDescripcion) inputDescripcion.value = data.descripcion || "";

                limpiarErrores();

                const title = modalEl.querySelector(".modal-title");
                if (title) title.textContent = "Editar Marca";

                modal.show();
                enfocarNombre();
            })
            .catch(err => {
                console.error("Error al obtener marca:", err);
                alert("No se pudo cargar la marca.");
            });
    });

    // --------------------------------------------------
    //  GUARDAR (Nuevo / Editar)
    // --------------------------------------------------
    function guardarMarca() {

        limpiarErrores();

        const id          = inputId ? (inputId.value || null) : null;
        const nombre      = (inputNombre?.value || "").trim();
        const descripcion = (inputDescripcion?.value || "").trim();

        if (!nombre) {
            if (errNombre) errNombre.innerText = "El nombre es obligatorio.";
            if (inputNombre) {
                inputNombre.classList.add("is-invalid");
                inputNombre.focus();
            }
            return;
        }

        const payload = { id, nombre, descripcion };

        fetch("/api/marcas/guardar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify(payload)
        })
        .then(async r => {
            const data = await r.json().catch(() => ({}));
            return { ok: r.ok, data };
        })
        .then(({ ok, data }) => {

            if (!ok && data.errors) {
                if (data.errors.nombre && errNombre) {
                    const msg = Array.isArray(data.errors.nombre)
                        ? data.errors.nombre[0]
                        : data.errors.nombre;
                    errNombre.innerText = msg;
                    if (inputNombre) {
                        inputNombre.classList.add("is-invalid");
                        inputNombre.focus();
                    }
                }
                return;
            }

            if (data.error) {
                alert(data.error);
                return;
            }

            mostrarOk();

            // Actualizar tabla sin recargar
            const nuevoId = data.id;

            if (tabla) {
                if (!id) {
                    // NUEVA MARCA → agregar fila
                    tabla.row.add([
                        nombre,
                        descripcion,
                        `
                        <button class="btn btn-warning btn-sm btnEditar" data-id="${nuevoId}">Editar</button>
                        <button class="btn btn-danger btn-sm btnEliminar" data-id="${nuevoId}">Eliminar</button>
                        `
                    ]).draw(false);
                } else {
                    // EDICIÓN → actualizar fila existente
                    const btnEdit = document.querySelector(`.btnEditar[data-id="${id}"]`);
                    if (btnEdit) {
                        const fila = btnEdit.closest("tr");
                        tabla.row(fila).data([
                            nombre,
                            descripcion,
                            `
                            <button class="btn btn-warning btn-sm btnEditar" data-id="${id}">Editar</button>
                            <button class="btn btn-danger btn-sm btnEliminar" data-id="${id}">Eliminar</button>
                            `
                        ]).draw(false);
                    }
                }
            } else {
                // fallback: si no está DataTable
                setTimeout(() => location.reload(), 400);
            }

            // Modo "alta rápida": si era nueva, limpio para cargar otra
            if (!id) {
                form.reset();
                if (inputId) inputId.value = "";
            }

            enfocarNombre();
        })
        .catch(err => {
            console.error("Error al guardar marca:", err);
            alert("Error inesperado al guardar la marca.");
        });
    }

    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarMarca);
    }

    // ENTER → siguiente campo / guardar
    if (inputNombre) {
        inputNombre.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (inputDescripcion) inputDescripcion.focus();
            }
        });
    }

    if (inputDescripcion) {
        inputDescripcion.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                guardarMarca();
            }
        });
    }

    // --------------------------------------------------
    //  ELIMINAR — SOLO MODAL, SIN confirm()
    // --------------------------------------------------
    let marcaAEliminar = null;

    // abrir modal de confirmación
    document.addEventListener("click", e => {
        const btn = e.target.closest(".btnEliminar");
        if (!btn) return;

        marcaAEliminar = btn.dataset.id || null;
        if (marcaAEliminar && modalEliminar) {
            modalEliminar.show();
        }
    });

    // confirmar eliminación
    if (btnConfDel && modalEliminar) {
        btnConfDel.addEventListener("click", () => {

            if (!marcaAEliminar) return;

            fetch(`/api/marcas/${marcaAEliminar}/eliminar/`, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFToken() }
            })
            .then(async r => {
                const data = await r.json().catch(() => ({}));
                return { ok: r.ok, data };
            })
            .then(({ ok, data }) => {
                if (!ok || data.error) {
                    alert(data.error || "No se pudo eliminar.");
                    return;
                }

                modalEliminar.hide();

                // quitar fila de la tabla
                if (tabla) {
                    const btn = document.querySelector(`.btnEliminar[data-id="${marcaAEliminar}"]`);
                    if (btn) {
                        const fila = btn.closest("tr");
                        tabla.row(fila).remove().draw(false);
                    }
                } else {
                    setTimeout(() => location.reload(), 400);
                }

                marcaAEliminar = null;
            })
            .catch(err => {
                console.error("Error al eliminar marca:", err);
                alert("Error inesperado al eliminar la marca.");
            });

        });
    }

});
