document.addEventListener("DOMContentLoaded", function () {

    const modalElement = document.getElementById('modalUsuario');
    const modalUsuario = new bootstrap.Modal(modalElement);
    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    const btnGuardarUsuario = document.getElementById('btnGuardarUsuario');
    const tbodyUsuarios = document.getElementById('tbodyUsuarios');
    const formUsuario = document.getElementById('formUsuario');

    let usuarioEditando = null;

    // Cargar usuarios al iniciar
    cargarUsuarios();

    // Evento: Nuevo Usuario
    btnNuevoUsuario.addEventListener('click', () => {
        usuarioEditando = null;
        formUsuario.reset();
        document.getElementById('usuarioId').value = '';
        document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
        document.getElementById('passwordHint').style.display = 'none';
        document.getElementById('password').required = true;

        // Resetear permisos
        document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(chk => {
            if (chk.id !== 'is_active' && chk.id !== 'is_staff') chk.checked = false;
        });
        document.getElementById('is_active').checked = true;
    });

    // Evento: Guardar Usuario
    btnGuardarUsuario.addEventListener('click', guardarUsuario);

    async function cargarUsuarios() {
        try {
            const response = await fetch('/api/usuarios/listar/');
            const result = await response.json();

            if (result.ok) {
                renderizarUsuarios(result.data);
            } else {
                Swal.fire('Error', result.error || 'No se pudieron cargar los usuarios', 'error');
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            Swal.fire('Error', 'Ocurrió un error al cargar los usuarios', 'error');
        }
    }

    function renderizarUsuarios(usuarios) {
        tbodyUsuarios.innerHTML = '';

        if (usuarios.length === 0) {
            tbodyUsuarios.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay usuarios registrados</td></tr>';
            return;
        }

        usuarios.forEach(u => {
            const estadoBadge = u.is_active
                ? '<span class="badge bg-success">Activo</span>'
                : '<span class="badge bg-secondary">Inactivo</span>';

            const rolBadge = u.rol === 'Administrador'
                ? '<span class="badge bg-primary">Administrador</span>'
                : u.rol === 'Vendedor'
                    ? '<span class="badge bg-info">Vendedor</span>'
                    : '<span class="badge bg-warning">Contador</span>';

            const ultimoAcceso = u.last_login || 'Nunca';

            const row = `
                <tr>
                    <td class="ps-4 fw-bold">${u.username}</td>
                    <td>${u.email || '-'}</td>
                    <td>${rolBadge}</td>
                    <td>${estadoBadge}</td>
                    <td>${ultimoAcceso}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarUsuario(${u.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario(${u.id}, '${u.username}')" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbodyUsuarios.innerHTML += row;
        });
    }

    window.editarUsuario = async function (id) {
        try {
            const response = await fetch(`/api/usuarios/${id}/`);
            const result = await response.json();

            if (result.ok) {
                const usuario = result.data;
                usuarioEditando = id;

                document.getElementById('usuarioId').value = usuario.id;
                document.getElementById('username').value = usuario.username;
                document.getElementById('email').value = usuario.email || '';
                document.getElementById('first_name').value = usuario.first_name || '';
                document.getElementById('last_name').value = usuario.last_name || '';
                document.getElementById('rol').value = usuario.rol || 'Vendedor';
                document.getElementById('is_active').checked = usuario.is_active;
                document.getElementById('is_staff').checked = usuario.is_staff;
                document.getElementById('password').value = '';
                document.getElementById('password').required = false;
                document.getElementById('passwordHint').style.display = 'inline';
                document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';

                // Cargar permisos
                const permisos = usuario.permisos || {};
                document.getElementById('permisoVentas').checked = permisos.ventas || false;
                document.getElementById('permisoCompras').checked = permisos.compras || false;
                document.getElementById('permisoProductos').checked = permisos.productos || false;
                document.getElementById('permisoClientes').checked = permisos.clientes || false;
                document.getElementById('permisoProveedores').checked = permisos.proveedores || false;
                document.getElementById('permisoCaja').checked = permisos.caja || false;
                document.getElementById('permisoContabilidad').checked = permisos.contabilidad || false;
                document.getElementById('permisoConfiguracion').checked = permisos.configuracion || false;
                document.getElementById('permisoUsuarios').checked = permisos.usuarios || false;
                document.getElementById('permisoReportes').checked = permisos.reportes || false;

                modalUsuario.show();
            } else {
                Swal.fire('Error', result.error || 'No se pudo cargar el usuario', 'error');
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            Swal.fire('Error', 'Ocurrió un error al cargar el usuario', 'error');
        }
    }

    window.eliminarUsuario = async function (id, username) {
        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
            text: `¿Estás seguro de eliminar al usuario "${username}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/usuarios/${id}/eliminar/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });

                const data = await response.json();

                if (data.ok) {
                    Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
                    cargarUsuarios();
                } else {
                    Swal.fire('Error', data.error || 'No se pudo eliminar el usuario', 'error');
                }
            } catch (error) {
                console.error('Error eliminando usuario:', error);
                Swal.fire('Error', 'Ocurrió un error al eliminar el usuario', 'error');
            }
        }
    }

    async function guardarUsuario() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value.trim();
        const first_name = document.getElementById('first_name').value.trim();
        const last_name = document.getElementById('last_name').value.trim();
        const rol = document.getElementById('rol').value;
        const is_active = document.getElementById('is_active').checked;
        const is_staff = document.getElementById('is_staff').checked;

        if (!username) {
            Swal.fire('Atención', 'El nombre de usuario es obligatorio', 'warning');
            return;
        }

        if (!usuarioEditando && !password) {
            Swal.fire('Atención', 'La contraseña es obligatoria para nuevos usuarios', 'warning');
            return;
        }

        if (password && password.length < 8) {
            Swal.fire('Atención', 'La contraseña debe tener al menos 8 caracteres', 'warning');
            return;
        }

        // Recopilar permisos
        const permisos = {
            ventas: document.getElementById('permisoVentas').checked,
            compras: document.getElementById('permisoCompras').checked,
            productos: document.getElementById('permisoProductos').checked,
            clientes: document.getElementById('permisoClientes').checked,
            proveedores: document.getElementById('permisoProveedores').checked,
            caja: document.getElementById('permisoCaja').checked,
            contabilidad: document.getElementById('permisoContabilidad').checked,
            configuracion: document.getElementById('permisoConfiguracion').checked,
            usuarios: document.getElementById('permisoUsuarios').checked,
            reportes: document.getElementById('permisoReportes').checked
        };

        const data = {
            username,
            email,
            first_name,
            last_name,
            rol,
            is_active,
            is_staff,
            permisos
        };

        if (password) {
            data.password = password;
        }

        try {
            btnGuardarUsuario.disabled = true;
            btnGuardarUsuario.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

            const url = usuarioEditando
                ? `/api/usuarios/${usuarioEditando}/editar/`
                : '/api/usuarios/crear/';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.ok) {
                Swal.fire('Éxito', usuarioEditando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente', 'success');
                modalUsuario.hide();
                cargarUsuarios();
                formUsuario.reset();
            } else {
                Swal.fire('Error', result.error || 'No se pudo guardar el usuario', 'error');
            }
        } catch (error) {
            console.error('Error guardando usuario:', error);
            Swal.fire('Error', 'Ocurrió un error al guardar el usuario', 'error');
        } finally {
            btnGuardarUsuario.disabled = false;
            btnGuardarUsuario.innerHTML = '<i class="bi bi-save"></i> Guardar';
        }
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

});
