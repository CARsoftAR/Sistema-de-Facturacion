document.addEventListener("DOMContentLoaded", () => {

    const modalEl = document.getElementById("modalCliente");
    const modal = new bootstrap.Modal(modalEl);

    const form = document.getElementById("formCliente");
    const tabla = document.getElementById("tabla_clientes");

    const btnNuevo = document.getElementById("btnNuevoCliente");

    const id = document.getElementById("cliente_id");
    const nombre = document.getElementById("cli_nombre");
    const cuit = document.getElementById("cli_cuit");
    const cf = document.getElementById("cli_cf");
    const lista = document.getElementById("cli_lista");
    const cta = document.getElementById("cli_ctacte");
    const tituloModal = document.getElementById("tituloModalCliente");

    // =====================================================
    // NUEVO CLIENTE
    // =====================================================
    btnNuevo.addEventListener("click", () => {
        form.reset();
        id.value = "";
        tituloModal.innerText = "Nuevo Cliente";
        modal.show();
    });

    // =====================================================
    // GUARDAR
    // =====================================================
    form.addEventListener("submit", e => {
        e.preventDefault();

        const datos = new FormData(form);

        fetch("/api/clientes/guardar/", {
            method: "POST",
            body: datos,
        })
        .then(r => r.json())
        .then(resp => {

            if (!resp.ok) {
                Swal.fire("Error", resp.error || "No se pudo guardar", "error");
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Guardado",
                timer: 1200,
                showConfirmButton: false
            });

            modal.hide();
            location.reload();
        });
    });

    // =====================================================
    // EDITAR
    // =====================================================
    tabla.querySelectorAll(".btnEditar").forEach(btn => {
        btn.onclick = () => {
            const rowId = btn.dataset.id;

            fetch(`/api/clientes/${rowId}/`)
            .then(r => r.json())
            .then(c => {
                id.value = c.id;
                nombre.value = c.nombre;
                cuit.value = c.cuit;
                cf.value = c.condicion_fiscal;
                lista.value = c.lista_precio;
                cta.value = c.tiene_ctacte ? "1" : "0";

                tituloModal.innerText = "Editar Cliente";
                modal.show();
            });
        };
    });

    // =====================================================
    // ELIMINAR
    // =====================================================
    tabla.querySelectorAll(".btnEliminar").forEach(btn => {
        btn.onclick = () => {

            Swal.fire({
                icon: "warning",
                title: "¿Eliminar cliente?",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            })
            .then(res => {
                if (!res.isConfirmed) return;

                fetch(`/api/clientes/${btn.dataset.id}/eliminar/`, {
                    method: "POST",
                })
                .then(r => r.json())
                .then(resp => {
                    if (resp.ok) {
                        Swal.fire("Eliminado", "", "success");
                        location.reload();
                    }
                });
            });

        };
    });

});
