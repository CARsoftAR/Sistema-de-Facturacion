/* =====================================================
   PROVEEDORES – JS
===================================================== */

// Crear proveedor
document.getElementById("formNuevoProveedor")?.addEventListener("submit", function(e){
    e.preventDefault();

    fetch("/api/proveedores/nuevo/", {
        method: "POST",
        body: new FormData(this)
    })
    .then(r => r.json())
    .then(d => {
        if (d.error) return alert(d.error);

        alert("Proveedor creado correctamente.");
        location.reload();
    });
});


// Cargar datos al editar
function editarProveedor(id) {

    fetch(`/api/proveedores/${id}/`)
        .then(r => r.json())
        .then(p => {

            document.getElementById("editProveedor_id").value = p.id;
            document.getElementById("editProveedor_nombre").value = p.nombre;
            document.getElementById("editProveedor_cuit").value = p.cuit;
            document.getElementById("editProveedor_direccion").value = p.direccion;
            document.getElementById("editProveedor_telefono").value = p.telefono;
            document.getElementById("editProveedor_email").value = p.email;
            document.getElementById("editProveedor_notas").value = p.notas;

        });
}


// Guardar cambios
document.getElementById("formEditarProveedor")?.addEventListener("submit", function(e){
    e.preventDefault();

    fetch("/api/proveedores/editar/", {
        method: "POST",
        body: new FormData(this)
    })
    .then(r => r.json())
    .then(d => {
        if (d.error) return alert(d.error);

        alert("Proveedor actualizado correctamente.");
        location.reload();
    });
});
