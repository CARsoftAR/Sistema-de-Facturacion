
function inicializarCambioContrasena() {
    const form = document.getElementById('formCambioContrasena');
    if (!form) return;

    const nuevaContrasena = document.getElementById('nuevaContrasena');
    const confirmarContrasena = document.getElementById('confirmarContrasena');

    // Validación en tiempo real
    if (nuevaContrasena) {
        nuevaContrasena.addEventListener('input', function () {
            validarFortalezaContrasena(this.value);
        });
    }

    if (confirmarContrasena) {
        confirmarContrasena.addEventListener('input', function () {
            validarCoincidenciaContrasena();
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        cambiarContrasena();
    });
}

function validarFortalezaContrasena(password) {
    const indicador = document.getElementById('indicadorFortaleza');
    if (!indicador) return;

    let fortaleza = 0;
    let mensaje = '';
    let clase = '';

    if (password.length >= 6) fortaleza++;
    if (password.length >= 10) fortaleza++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) fortaleza++;
    if (/\d/.test(password)) fortaleza++;
    if (/[^a-zA-Z0-9]/.test(password)) fortaleza++;

    if (fortaleza <= 2) {
        mensaje = 'Débil';
        clase = 'text-danger';
    } else if (fortaleza <= 3) {
        mensaje = 'Media';
        clase = 'text-warning';
    } else {
        mensaje = 'Fuerte';
        clase = 'text-success';
    }

    indicador.textContent = `Fortaleza: ${mensaje}`;
    indicador.className = `small ${clase}`;
}

function validarCoincidenciaContrasena() {
    const nueva = document.getElementById('nuevaContrasena');
    const confirmar = document.getElementById('confirmarContrasena');
    const indicador = document.getElementById('indicadorCoincidencia');

    if (!nueva || !confirmar || !indicador) return;

    if (confirmar.value === '') {
        indicador.textContent = '';
        return;
    }

    if (nueva.value === confirmar.value) {
        indicador.textContent = '✓ Las contraseñas coinciden';
        indicador.className = 'small text-success';
    } else {
        indicador.textContent = '✗ Las contraseñas no coinciden';
        indicador.className = 'small text-danger';
    }
}

function cambiarContrasena() {
    const contrasenaActual = document.getElementById('contrasenaActual').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;

    // Validaciones
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
        mostrarMensaje('error', 'Por favor complete todos los campos');
        return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
        mostrarMensaje('error', 'Las contraseñas no coinciden');
        return;
    }

    if (nuevaContrasena.length < 6) {
        mostrarMensaje('error', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Enviar petición
    fetch('/api/seguridad/cambiar-contrasena/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            contrasena_actual: contrasenaActual,
            nueva_contrasena: nuevaContrasena,
            confirmar_contrasena: confirmarContrasena
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                mostrarMensaje('success', 'Contraseña actualizada correctamente');
                document.getElementById('formCambioContrasena').reset();
                document.getElementById('indicadorFortaleza').textContent = '';
                document.getElementById('indicadorCoincidencia').textContent = '';
            } else {
                mostrarMensaje('error', data.error || 'Error al cambiar la contraseña');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error de conexión');
        });
}

// =========================================
// HISTORIAL DE LOGIN
// =========================================

let paginaActualLogin = 1;
const porPaginaLogin = 20;

function cargarHistorialLogin(pagina = 1) {
    paginaActualLogin = pagina;

    const filtroUsuario = document.getElementById('filtroUsuarioLogin')?.value || '';
    const filtroEstado = document.getElementById('filtroEstadoLogin')?.value || '';

    const params = new URLSearchParams({
        page: pagina,
        per_page: porPaginaLogin,
        username: filtroUsuario,
        success: filtroEstado
    });

    fetch(`/api/seguridad/historial-login/?${params}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                mostrarHistorialLogin(data.data);
                actualizarPaginacionLogin(data.current_page, data.pages, data.total);
            }
        })
        .catch(error => console.error('Error:', error));
}

function mostrarHistorialLogin(logins) {
    const tbody = document.getElementById('tablaHistorialLogin');
    if (!tbody) return;

    if (logins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay registros</td></tr>';
        return;
    }

    tbody.innerHTML = logins.map(login => `
        <tr>
            <td>${login.username}</td>
            <td>${login.ip_address}</td>
            <td>${login.timestamp}</td>
            <td>
                <span class="badge ${login.success ? 'bg-success' : 'bg-danger'}">
                    ${login.success ? 'Éxito' : 'Fallido'}
                </span>
            </td>
        </tr>
    `).join('');
}

function actualizarPaginacionLogin(paginaActual, totalPaginas, totalRegistros) {
    const paginacion = document.getElementById('paginacionLogin');
    if (!paginacion) return;

    let html = `<div class="d-flex justify-content-between align-items-center">`;
    html += `<small class="text-muted">Mostrando ${totalRegistros} registros</small>`;
    html += `<nav><ul class="pagination pagination-sm mb-0">`;

    // Botón anterior
    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cargarHistorialLogin(${paginaActual - 1}); return false;">Anterior</a>
    </li>`;

    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
            html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cargarHistorialLogin(${i}); return false;">${i}</a>
            </li>`;
        } else if (i === paginaActual - 3 || i === paginaActual + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Botón siguiente
    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cargarHistorialLogin(${paginaActual + 1}); return false;">Siguiente</a>
    </li>`;

    html += `</ul></nav></div>`;
    paginacion.innerHTML = html;
}

// =========================================
// SESIONES ACTIVAS
// =========================================

function cargarSesionesActivas() {
    fetch('/api/seguridad/sesiones-activas/')
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                mostrarSesionesActivas(data.data);
            }
        })
        .catch(error => console.error('Error:', error));
}

function mostrarSesionesActivas(sesiones) {
    const tbody = document.getElementById('tablaSesionesActivas');
    if (!tbody) return;

    if (sesiones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay sesiones activas</td></tr>';
        return;
    }

    tbody.innerHTML = sesiones.map(sesion => `
        <tr>
            <td>${sesion.username}</td>
            <td>${sesion.ip_address}</td>
            <td>${sesion.login_time}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="cerrarSesion(${sesion.id}, '${sesion.username}')">
                    <i class="bi bi-x-circle"></i> Cerrar Sesión
                </button>
            </td>
        </tr>
    `).join('');
}

function cerrarSesion(sessionId, username) {
    if (!confirm(`¿Estás seguro de cerrar la sesión de ${username}?`)) {
        return;
    }

    fetch(`/api/seguridad/cerrar-sesion/${sessionId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                mostrarMensaje('success', 'Sesión cerrada correctamente');
                cargarSesionesActivas();
            } else {
                mostrarMensaje('error', data.error || 'Error al cerrar la sesión');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error de conexión');
        });
}

// =========================================
// BITÁCORA DE ACTIVIDADES
// =========================================

let paginaActualBitacora = 1;
const porPaginaBitacora = 20;

function cargarBitacoraActividades(pagina = 1) {
    paginaActualBitacora = pagina;

    const filtroUsuario = document.getElementById('filtroUsuarioBitacora')?.value || '';
    const filtroModulo = document.getElementById('filtroModuloBitacora')?.value || '';
    const filtroAccion = document.getElementById('filtroAccionBitacora')?.value || '';

    const params = new URLSearchParams({
        page: pagina,
        per_page: porPaginaBitacora,
        username: filtroUsuario,
        module: filtroModulo,
        action_type: filtroAccion
    });

    fetch(`/api/seguridad/bitacora/?${params}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                mostrarBitacoraActividades(data.data);
                actualizarPaginacionBitacora(data.current_page, data.pages, data.total);
            }
        })
        .catch(error => console.error('Error:', error));
}

function mostrarBitacoraActividades(actividades) {
    const tbody = document.getElementById('tablaBitacoraActividades');
    if (!tbody) return;

    if (actividades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay actividades registradas</td></tr>';
        return;
    }

    tbody.innerHTML = actividades.map(act => {
        const icono = obtenerIconoAccion(act.action_type);
        return `
            <tr>
                <td>${act.timestamp}</td>
                <td>${act.username}</td>
                <td><i class="${icono}"></i> ${act.description}</td>
                <td><small class="text-muted">${act.module_display}</small></td>
            </tr>
        `;
    }).join('');
}

function obtenerIconoAccion(actionType) {
    const iconos = {
        'CREATE': 'bi bi-plus-circle text-success',
        'UPDATE': 'bi bi-pencil-square text-primary',
        'DELETE': 'bi bi-trash text-danger',
        'LOGIN': 'bi bi-box-arrow-in-right text-info',
        'LOGOUT': 'bi bi-box-arrow-right text-secondary',
        'PASSWORD_CHANGE': 'bi bi-key text-warning',
        'SESSION_CLOSE': 'bi bi-x-circle text-danger',
        'OTHER': 'bi bi-info-circle text-muted'
    };
    return iconos[actionType] || iconos['OTHER'];
}

function actualizarPaginacionBitacora(paginaActual, totalPaginas, totalRegistros) {
    const paginacion = document.getElementById('paginacionBitacora');
    if (!paginacion) return;

    let html = `<div class="d-flex justify-content-between align-items-center">`;
    html += `<small class="text-muted">Mostrando ${totalRegistros} registros</small>`;
    html += `<nav><ul class="pagination pagination-sm mb-0">`;

    // Botón anterior
    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cargarBitacoraActividades(${paginaActual - 1}); return false;">Anterior</a>
    </li>`;

    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
            html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cargarBitacoraActividades(${i}); return false;">${i}</a>
            </li>`;
        } else if (i === paginaActual - 3 || i === paginaActual + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Botón siguiente
    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cargarBitacoraActividades(${paginaActual + 1}); return false;">Siguiente</a>
    </li>`;

    html += `</ul></nav></div>`;
    paginacion.innerHTML = html;
}

// =========================================
// UTILIDADES
// =========================================

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

function mostrarMensaje(tipo, mensaje) {
    const contenedor = document.getElementById('mensajesSeguridad');
    if (!contenedor) {
        alert(mensaje);
        return;
    }

    const clases = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };

    const alerta = document.createElement('div');
    alerta.className = `alert ${clases[tipo] || 'alert-info'} alert-dismissible fade show`;
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    contenedor.appendChild(alerta);

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        alerta.remove();
    }, 5000);
}
