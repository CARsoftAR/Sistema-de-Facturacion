document.addEventListener("DOMContentLoaded", () => {

    console.log("Unidades JS cargado");

    const form          = document.getElementById("formUnidad");
    const modalEl       = document.getElementById("modalUnidad");
    const modal         = modalEl ? new bootstrap.Modal(modalEl) : null;

    const btnNuevo      = document.getElementById("btnNuevaUnidad");
    const btnGuardar    = document.getElementById("btnGuardarUnidad");
    const errNombre     = document.getElementById("errNombre");

    const inputId          = form ? form.querySelector("input[name='id']") : null;
    const inputNombre      = form ? form.querySelector("input[name='nombre']") : null;
    const inputDescripcion = form ? form.querySelector("textarea[name='descripcion']") : null;

    const alertBox      = document.getElementById("alertUnidadGuardada");

    const modalDelEl    = document.getElementById("modalEliminarUnidad");
    const modalEliminar = modalDelEl ? new bootstrap.Modal(modalDelEl) : null;
    const btnConfDel    = document.getElementById("btnConfirmarEliminarUnidad");

    // DataTable
    const tablaEl = document.getElementById("tablaUnidadesDT");
    let tabla = null;

    if (tablaEl && window.$ && $.fn.DataTable) {
        tabla = $("#tablaUnidadesDT").DataTable({
            pageLength: 10,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            }
        });
    }

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

    function mostrarGuardado() {
        if (!alertBox) return;
        alertBox.classList.remove("d-none");
        setTimeout(() => alertBox.classList.add("d-none"), 2000);
    }

    function enfocarNombre() {
        setTimeout(() => {
            if (inputNombre) inputNombre.focus();
        }, 150);
    }

    if (form) {
        form.addEventListener("keydown", e => {
            if (e.key === "Enter") e.preventDefault();
        });
    }

    // NUEVA
    if (btnNuevo && form && modal) {
        btnNuevo.addEventListener("click", () => {
            form.reset();
            if (inputId) inputId.value = "";
            limpiarErrores();
            modal.show();
            enfocarNombre();
        });
    }

    // EDITAR (delegación)
    document.addEventListener("click", e => {
        const btn = e.target.closest(".btnEditar");
        if (!btn || !form || !modal) return;

        const id = btn.dataset.id;
        if (!id) return;

        fetch(`/api/unidades/${id}/`)
            .then(r => r.json())
            .then(data => {
                if (inputId)          inputId.value          = data.id;
                if (inputNombre)      inputNombre.value      = data.nombre || "";
                if (inputDescripcion) inputDescripcion.value = data.descripcion || "";
                limpiarErrores();
                modal.show();
                enfocarNombre();
            })
            .catch(err => {
                console.error("Error al obtener unidad:", err);
                alert("No se pudo cargar la unidad.");
            });
    });

    // GUARDAR
    function guardarUnidad() {
        if (!form) return;

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

        fetch("/api/unidades/guardar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify(payload)
        })
        .then(async r => {
            const data = await r.json().catch(() => ({}));
            console.log("Respuesta guardar unidad:", data);
            return { ok: r.ok, data };
        })
        .then(({ ok, data }) => {

            if (!ok && data.errors) {
                if (data.errors.nombre && errNombre) {
                    const msg = Array.isArray(data.errors.nombre)
                        ? data.errors.nombre[0]
                        : data.errors.nombre;
                    errNombre.innerText = msg;
                }
                return;
            }

            if (data.error) {
                alert(data.error);
                return;
            }

            mostrarGuardado();

            const nuevoId = data.id;

            // actualizar DataTable sin recargar
            if (tabla) {
                if (!id) {
                    tabla.row.add([
                        nombre,
                        descripcion,
                        `
                        <button class="btn btn-warning btn-sm btnEditar" data-id="${nuevoId}">Editar</button>
                        <button class="btn btn-danger btn-sm btnEliminar" data-id="${nuevoId}">Eliminar</button>
                        `
                    ]).draw(false);
                    if (inputId) inputId.value = nuevoId;
                } else {
                    const btn = document.querySelector(`.btnEditar[data-id="${id}"]`);
                    if (btn) {
                        const fila = btn.closest("tr");
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
                setTimeout(() => location.reload(), 300);
            }

            // si es alta nueva, dejo el formulario limpio para seguir cargando
            if (!id) {
                form.reset();
                if (inputId) inputId.value = "";
            }
            enfocarNombre();
        })
        .catch(err => {
            console.error("Error al guardar unidad:", err);
            alert("Error inesperado al guardar la unidad.");
        });
    }

    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarUnidad);
    }

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
                guardarUnidad();
            }
        });
    }

    // ELIMINAR
    let unidadAEliminar = null;

    document.addEventListener("click", e => {
        const btn = e.target.closest(".btnEliminar");
        if (!btn) return;
        unidadAEliminar = btn.dataset.id || null;
        if (unidadAEliminar && modalEliminar) {
            modalEliminar.show();
        }
    });

    if (btnConfDel && modalEliminar) {
        btnConfDel.addEventListener("click", () => {
            if (!unidadAEliminar) return;

            fetch(`/api/unidades/${unidadAEliminar}/eliminar/`, {
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

                if (tabla) {
                    const btn = document.querySelector(`.btnEliminar[data-id="${unidadAEliminar}"]`);
                    if (btn) {
                        const fila = btn.closest("tr");
                        tabla.row(fila).remove().draw(false);
                    }
                } else {
                    setTimeout(() => location.reload(), 300);
                }

                unidadAEliminar = null;
            })
            .catch(err => {
                console.error("Error al eliminar unidad:", err);
                alert("Error inesperado al eliminar la unidad.");
            });
        });
    }

});
