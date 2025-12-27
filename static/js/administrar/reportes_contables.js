let ejerciciosDisponibles = [];
let modalProgreso;

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar modal
    const modalElement = document.getElementById('modalProgreso');
    if (modalElement) {
        modalProgreso = new bootstrap.Modal(modalElement);
    }

    // Cargar ejercicios
    cargarEjercicios();

    // Event listener para cambio de ejercicio
    document.getElementById('reporteEjercicio').addEventListener('change', function () {
        const ejercicioId = this.value;
        if (ejercicioId) {
            const ejercicio = ejerciciosDisponibles.find(e => e.id == ejercicioId);
            if (ejercicio) {
                document.getElementById('reporteFechaDesde').value = ejercicio.fecha_inicio;
                document.getElementById('reporteFechaHasta').value = ejercicio.fecha_fin;
            }
        }
    });
});

function cargarEjercicios() {
    fetch('/api/contabilidad/ejercicios/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                ejerciciosDisponibles = data.ejercicios;
                llenarSelectEjercicios();
            }
        })
        .catch(error => console.error('Error:', error));
}

function llenarSelectEjercicios() {
    const select = document.getElementById('reporteEjercicio');

    ejerciciosDisponibles.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = e.descripcion;
        select.appendChild(option);
    });

    // Seleccionar el ejercicio más reciente abierto
    const ejercicioAbierto = ejerciciosDisponibles.find(e => !e.cerrado);
    if (ejercicioAbierto) {
        select.value = ejercicioAbierto.id;
        document.getElementById('reporteFechaDesde').value = ejercicioAbierto.fecha_inicio;
        document.getElementById('reporteFechaHasta').value = ejercicioAbierto.fecha_fin;
    }
}

function obtenerParametrosComunes() {
    const ejercicioId = document.getElementById('reporteEjercicio').value;

    if (!ejercicioId) {
        alert('Debe seleccionar un ejercicio contable');
        return null;
    }

    return {
        ejercicio_id: ejercicioId,
        fecha_desde: document.getElementById('reporteFechaDesde').value,
        fecha_hasta: document.getElementById('reporteFechaHasta').value,
        formato: document.getElementById('reporteFormato').value
    };
}

function mostrarProgreso(mensaje) {
    document.getElementById('mensajeProgreso').textContent = mensaje;
    modalProgreso.show();
}

function ocultarProgreso() {
    if (modalProgreso) {
        modalProgreso.hide();
    }

    // Fallback forzado para asegurar que se cierre
    setTimeout(() => {
        const modalElement = document.getElementById('modalProgreso');
        const backdrops = document.querySelectorAll('.modal-backdrop');

        if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            modalElement.removeAttribute('role');
        }

        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }, 500);
}

// ==========================================
// GENERADORES DE REPORTES
// ==========================================

function generarLibroDiario() {
    const params = obtenerParametrosComunes();
    if (!params) return;

    mostrarProgreso('Generando Libro Diario...');

    const queryString = new URLSearchParams(params).toString();

    fetch(`/api/contabilidad/reportes/libro-diario/?${queryString}`)
        .then(async response => {
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Error al generar el reporte');
            }
            return response.blob();
        })
        .then(blob => {
            descargarArchivo(blob, `libro_diario_${params.ejercicio_id}.${params.formato === 'pdf' ? 'pdf' : 'xlsx'}`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al generar el reporte: ' + error.message);
        })
        .finally(() => {
            ocultarProgreso();
        });
}

function generarEstadoResultados() {
    const params = obtenerParametrosComunes();
    if (!params) return;

    mostrarProgreso('Generando Estado de Resultados...');

    const queryString = new URLSearchParams(params).toString();

    fetch(`/api/contabilidad/reportes/estado-resultados/?${queryString}`)
        .then(async response => {
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Error al generar el reporte');
            }
            return response.blob();
        })
        .then(blob => {
            descargarArchivo(blob, `estado_resultados_${params.ejercicio_id}.xlsx`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al generar el reporte: ' + error.message);
        })
        .finally(() => {
            ocultarProgreso();
        });
}

function generarBalanceGeneral() {
    const params = obtenerParametrosComunes();
    if (!params) return;

    mostrarProgreso('Generando Balance General...');

    const queryString = new URLSearchParams(params).toString();

    fetch(`/api/contabilidad/reportes/balance-general/?${queryString}`)
        .then(async response => {
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Error al generar el reporte');
            }
            return response.blob();
        })
        .then(blob => {
            descargarArchivo(blob, `balance_general_${params.ejercicio_id}.xlsx`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al generar el reporte: ' + error.message);
        })
        .finally(() => {
            ocultarProgreso();
        });
}

function generarResumenEjercicio() {
    const params = obtenerParametrosComunes();
    if (!params) return;

    mostrarProgreso('Generando Resumen del Ejercicio...');

    const queryString = new URLSearchParams(params).toString();

    fetch(`/api/contabilidad/reportes/resumen-ejercicio/?${queryString}`)
        .then(async response => {
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Error al generar el reporte');
            }
            return response.blob();
        })
        .then(blob => {
            descargarArchivo(blob, `resumen_ejercicio_${params.ejercicio_id}.xlsx`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al generar el reporte: ' + error.message);
        })
        .finally(() => {
            ocultarProgreso();
        });
}

function descargarArchivo(blob, nombreArchivo) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
