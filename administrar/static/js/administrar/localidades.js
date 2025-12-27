document.addEventListener("DOMContentLoaded", () => {

    console.log("Localidades JS listo.");

    // ======================================================
    // Helpers
    // ======================================================
    function getCSRFToken() {
        const input = document.querySelector("input[name='csrfmiddlewaretoken']");
        if (input) return input.value;

        const name = "csrftoken=";
        const parts = document.cookie.split(";");
        for (let c of parts) {
            c = c.trim();
            if (c.startsWith(name)) {
                return c.substring(name.length);
            }
        }
        return "";
    }

    // ======================================================
    // DataTable (igual Rubros)
    // ======================================================
    const tablaEl = document.getElementById("tablaLocalidadesDT");
    let tabla = null;

    if (tablaEl && window.$ && $.fn.DataTable) {
        tabla = $("#tablaLocalidadesDT").DataTable({
            pageLength: 10,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            }
        });
    }

    // ======================================================
    // Modal / Form
    // ======================================================
    const form         = document.getElementById("formLocalidad");
    const modalEl      = document.getElementById("modalLocalidad");
    const modal        = modalEl ? new bootstrap.Modal(modalEl) : null;

    const modalDelEl   = document.getElementById("modalEliminarLocalidad");
    const modalDel     = modalDelEl ? new bootstrap.Modal(modalDelEl) : null;

    const btnNuevo     = document.getElementById("btnNuevaLocalidad");
    const btnGuardar   = document.getElementById("btnGuardarLocalidad");
    const btnConfDel   = document.getElementById("btnConfirmarEliminar");

    const errNombre    = document.getElementById("errNombre");
    const errCP        = document.getElementById("errCodigoPostal");

    const inputId      = form ? form.querySelector("input[name='id']") : null;
    const inputNombre  = form ? form.querySelector("input[name='nombre']") : null;
    const inputCP      = form ? form.querySelector("input[name='codigo_postal']") : null;

    let localidadAEliminar = null;

    function limpiarErrores() {
        if (errNombre) errNombre.innerText = "";
        if (errCP) errCP.innerText = "";
    }

    // ======================================================
    // NUEVA LOCALIDAD
    // ======================================================
    if (btnNuevo && form && modal) {
        btnNuevo.addEventListener("click", () => {
            form.reset();
            if (inputId) inputId.value = "";
            limpiarErrores();

            const title = modalEl.querySelector(".modal-title");
            if (title) title.textContent = "Nueva Localidad";

            modal.show();

            setTimeout(() => {
                if (inputNombre) inputNombre.focus();
            }, 150);
        });
    }

    // ======================================================
    // EDITAR LOCALIDAD
    // ======================================================
    document.querySelectorAll(".btnEditar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            if (!id || !form || !modal) return;

            fetch(`/api/localidades/${id}/`)
                .then(r => r.json())
                .then(data => {
                    if (inputId)     inputId.value = data.id;
                    if (inputNombre) inputNombre.value = data.nombre || "";
                    if (inputCP)     inputCP.value = data.codigo_postal || "";

                    limpiarErrores();

                    const title = modalEl.querySelector(".modal-title");
                    if (title) title.textContent = "Editar Localidad";

                    modal.show();

                    setTimeout(() => {
                        if (inputNombre) inputNombre.focus();
                    }, 150);
                })
                .catch(err => {
                    console.error("Error al obtener localidad:", err);
                    alert("No se pudo cargar la localidad.");
                });
        });
    });

    // ======================================================
    // GUARDAR (Nuevo / Editar)
    //  - NO cierra el modal
    //  - Enter en Código Postal también guarda
    // ======================================================
    function guardarLocalidad() {
        if (!form) return;

        limpiarErrores();

        const id          = inputId ? (inputId.value || null) : null;
        const nombre      = (inputNombre?.value || "").trim();
        const codigoPostal = (inputCP?.value || "").trim();

        let hayError = false;

        if (!nombre) {
            if (errNombre) errNombre.innerText = "El nombre es obligatorio.";
            hayError = true;
        }

        if (!codigoPostal) {
            if (errCP) errCP.innerText = "El código postal es obligatorio.";
            hayError = true;
        }

        if (hayError) {
            if (!nombre && inputNombre) inputNombre.focus();
            else if (!codigoPostal && inputCP) inputCP.focus();
            return;
        }

        const payload = {
            id: id,
            nombre: nombre,
            codigo_postal: codigoPostal
        };

        fetch("/api/localidades/guardar/", {
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
                        errNombre.innerText = Array.isArray(data.errors.nombre)
                            ? data.errors.nombre[0]
                            : data.errors.nombre;
                    }
                    if (data.errors.codigo_postal && errCP) {
                        errCP.innerText = Array.isArray(data.errors.codigo_postal)
                            ? data.errors.codigo_postal[0]
                            : data.errors.codigo_postal;
                    }
                    return;
                }

                if (data.error) {
                    alert(data.error);
                    return;
                }

                // ====== ÉXITO ======
                // NO cerramos el modal.
                // Limpiamos el formulario y volvemos al campo Nombre.
                form.reset();
                if (inputId) inputId.value = "";
                limpiarErrores();

                if (inputNombre) {
                    setTimeout(() => inputNombre.focus(), 100);
                }

                // Para ver el registro nuevo en la tabla, por ahora recargás
                // la página cuando quieras; aquí no recargamos para que el
                // modal siga abierto.
            })
            .catch(err => {
                console.error("Error al guardar localidad:", err);
                alert("Error inesperado al guardar la localidad.");
            });
    }

    if (btnGuardar && form) {
        btnGuardar.addEventListener("click", (e) => {
            e.preventDefault();
            guardarLocalidad();
        });
    }

    // Enter → pasa de Nombre a Código Postal / o guarda
    if (inputNombre) {
        inputNombre.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (inputCP) inputCP.focus();
            }
        });
    }

    if (inputCP) {
        inputCP.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                guardarLocalidad();
            }
        });
    }

    // ======================================================
    // ELIMINAR LOCALIDAD (con modal rojo)
    // ======================================================
    document.querySelectorAll(".btnEliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            if (!id || !modalDel) return;
            localidadAEliminar = id;
            modalDel.show();
        });
    });

    if (btnConfDel && modalDel) {
        btnConfDel.addEventListener("click", () => {
            if (!localidadAEliminar) return;

            fetch(`/api/localidades/${localidadAEliminar}/eliminar/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken()
                }
            })
                .then(async r => {
                    const data = await r.json().catch(() => ({}));
                    return { ok: r.ok, data };
                })
                .then(({ ok, data }) => {
                    if (!ok && data.error) {
                        alert(data.error);
                        return;
                    }
                    // aquí sí recargamos página para refrescar la tabla
                    window.location.reload();
                })
                .catch(err => {
                    console.error("Error al eliminar localidad:", err);
                    alert("Error al eliminar localidad.");
                });
        });
    }

});
