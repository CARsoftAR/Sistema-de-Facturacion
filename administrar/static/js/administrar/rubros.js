document.addEventListener("DOMContentLoaded", () => {

    // ============================
    //  FORM + MODAL
    // ============================
    const form = document.getElementById("formRubro");
    const modalEl = document.getElementById("modalRubro");
    const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

    const btnNuevo = document.getElementById("btnNuevoRubro");
    const btnGuardar = document.getElementById("btnGuardarRubro");
    const errNombre = document.getElementById("errNombre");

    const inputNombre = form.querySelector("input[name='nombre']");
    const inputDescripcion = form.querySelector("textarea[name='descripcion']");

    // ============================
    //  EVITAR SUBMIT POR ENTER
    // ============================
    form.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });

    // ============================
    //  HELPERS
    // ============================
    function getCSRFToken() {
        const input = document.querySelector("input[name='csrfmiddlewaretoken']");
        if (input) return input.value;

        const name = "csrftoken=";
        const parts = document.cookie.split(";");
        for (let c of parts) {
            c = c.trim();
            if (c.startsWith(name)) return c.substring(name.length);
        }
        return "";
    }

    function limpiarErrores() {
        errNombre.innerText = "";
    }

    function enfocarNombre() {
        setTimeout(() => inputNombre.focus(), 150);
    }

    // ============================
    //  DATATABLE
    // ============================
    if (window.$ && $.fn.DataTable) {
        $("#tablaRubrosDT").DataTable({
            pageLength: 10,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            }
        });
    }

    // ============================
    //  NUEVO RUBRO
    // ============================
    btnNuevo.addEventListener("click", () => {
        form.reset();
        form.id.value = "";
        limpiarErrores();
        modal.show();
        enfocarNombre();
    });

    // ============================
    //  EDITAR RUBRO
    // ============================
    document.querySelectorAll(".btnEditar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;

            fetch(`/api/rubros/${id}/`)
                .then(r => r.json())
                .then(data => {
                    form.id.value = data.id;
                    form.nombre.value = data.nombre;
                    form.descripcion.value = data.descripcion;
                    limpiarErrores();
                    modal.show();
                    enfocarNombre();
                });
        });
    });

    // ============================
    //  GUARDAR RUBRO
    // ============================
    function guardarRubro() {
        limpiarErrores();

        const payload = {
            id: form.id.value || null,
            nombre: form.nombre.value.trim(),
            descripcion: form.descripcion.value.trim()
        };

        if (!payload.nombre) {
            errNombre.innerText = "El nombre es obligatorio.";
            inputNombre.focus();
            return;
        }

        fetch("/api/rubros/guardar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data.errors) {
                errNombre.innerText = data.errors.nombre?.[0] || "";
                return;
            }

            modal.hide();
            setTimeout(() => location.reload(), 300);
        });
    }

    btnGuardar.addEventListener("click", guardarRubro);

    // ============================
    //  ENTER → SIGUIENTE / GUARDAR
    // ============================
    inputNombre.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputDescripcion.focus();
        }
    });

    inputDescripcion.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            guardarRubro();
        }
    });

    // ============================
    //  ELIMINAR
    // ============================
    document.querySelectorAll(".btnEliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!confirm("¿Eliminar rubro?")) return;

            fetch(`/api/rubros/${btn.dataset.id}/eliminar/`, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFToken() }
            })
            .then(() => location.reload());
        });
    });

});
