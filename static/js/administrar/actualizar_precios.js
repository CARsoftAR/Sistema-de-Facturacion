/**
 * actualizar_precios.js
 * Gestión de actualización masiva de precios
 */

document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // ELEMENTOS DEL DOM
    // ========================================
    const radioMonto = document.getElementById('radioMonto');
    const radioPorcentaje = document.getElementById('radioPorcentaje');
    const simboloValor = document.getElementById('simboloValor');
    const inputValor = document.getElementById('inputValor');
    const selectRubros = document.getElementById('selectRubros');
    const selectMarcas = document.getElementById('selectMarcas');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnAplicar = document.getElementById('btnAplicar');

    // Checkboxes de campos
    const checkCosto = document.getElementById('checkCosto');
    const checkEfectivo = document.getElementById('checkEfectivo');
    const checkTarjeta = document.getElementById('checkTarjeta');
    const checkCtaCte = document.getElementById('checkCtaCte');
    const checkLista4 = document.getElementById('checkLista4');

    // Búsqueda de productos
    const inputBuscarProducto = document.getElementById('inputBuscarProducto');
    const listaResultadosBusqueda = document.getElementById('listaResultadosBusqueda');
    const productosSeleccionadosDiv = document.getElementById('productosSeleccionados');

    // Array para almacenar productos seleccionados
    let productosSeleccionados = [];

    // ========================================
    // EVENT LISTENERS
    // ========================================

    // Cambiar símbolo según tipo de actualización
    radioMonto.addEventListener('change', function () {
        if (this.checked) {
            simboloValor.textContent = '$';
            inputValor.placeholder = 'Ej: 100 (aumenta $100)';
        }
    });

    radioPorcentaje.addEventListener('change', function () {
        if (this.checked) {
            simboloValor.textContent = '%';
            inputValor.placeholder = 'Ej: 15 (aumenta 15%)';
        }
    });

    // Botón limpiar
    btnLimpiar.addEventListener('click', limpiarFormulario);

    // Botón aplicar
    btnAplicar.addEventListener('click', aplicarCambios);

    // Búsqueda de productos
    let timeoutBusqueda;
    inputBuscarProducto.addEventListener('input', function () {
        clearTimeout(timeoutBusqueda);
        const query = this.value.trim();

        if (query.length < 2) {
            listaResultadosBusqueda.style.display = 'none';
            listaResultadosBusqueda.innerHTML = '';
            return;
        }

        timeoutBusqueda = setTimeout(() => buscarProductos(query), 300);
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function (e) {
        if (!inputBuscarProducto.contains(e.target) && !listaResultadosBusqueda.contains(e.target)) {
            listaResultadosBusqueda.style.display = 'none';
        }
    });

    // ========================================
    // FUNCIONES DE BÚSQUEDA
    // ========================================

    /**
     * Buscar productos
     */
    async function buscarProductos(query) {
        try {
            const response = await fetch(`/api/productos/buscar/?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            // El endpoint retorna {data: [...]}
            const productos = result.data || [];
            mostrarResultadosBusqueda(productos);
        } catch (error) {
            console.error('Error al buscar productos:', error);
        }
    }

    /**
     * Mostrar resultados de búsqueda
     */
    function mostrarResultadosBusqueda(productos) {
        listaResultadosBusqueda.innerHTML = '';

        if (productos.length === 0) {
            listaResultadosBusqueda.innerHTML = '<div class="list-group-item text-muted">No se encontraron productos</div>';
            listaResultadosBusqueda.style.display = 'block';
            return;
        }

        productos.forEach(producto => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${producto.codigo}</strong> - ${producto.descripcion}
                    </div>
                    <span class="badge bg-primary">Seleccionar</span>
                </div>
            `;

            item.addEventListener('click', function (e) {
                e.preventDefault();
                agregarProducto(producto);
                inputBuscarProducto.value = '';
                listaResultadosBusqueda.style.display = 'none';
            });

            listaResultadosBusqueda.appendChild(item);
        });

        listaResultadosBusqueda.style.display = 'block';
    }

    /**
     * Agregar producto a la lista
     */
    function agregarProducto(producto) {
        // Verificar si ya está agregado
        if (productosSeleccionados.find(p => p.id === producto.id)) {
            Swal.fire({
                icon: 'info',
                title: 'Producto ya agregado',
                text: 'Este producto ya está en la lista',
                confirmButtonColor: '#198754',
                timer: 2000
            });
            return;
        }

        productosSeleccionados.push(producto);
        renderizarProductosSeleccionados();
    }

    /**
     * Eliminar producto de la lista
     */
    function eliminarProducto(productoId) {
        productosSeleccionados = productosSeleccionados.filter(p => p.id !== productoId);
        renderizarProductosSeleccionados();
    }

    /**
     * Renderizar productos seleccionados
     */
    function renderizarProductosSeleccionados() {
        if (productosSeleccionados.length === 0) {
            productosSeleccionadosDiv.innerHTML = '';
            return;
        }

        let html = '<div class="alert alert-success"><strong>Productos seleccionados:</strong></div>';
        html += '<div class="d-flex flex-wrap gap-2">';

        productosSeleccionados.forEach(producto => {
            html += `
                <div class="badge bg-success p-2" style="font-size: 0.9rem;">
                    ${producto.codigo} - ${producto.descripcion}
                    <button type="button" class="btn-close btn-close-white ms-2" 
                            onclick="eliminarProducto(${producto.id})" 
                            style="font-size: 0.7rem;"></button>
                </div>
            `;
        });

        html += '</div>';
        productosSeleccionadosDiv.innerHTML = html;
    }

    // Hacer la función global para que funcione el onclick
    window.eliminarProducto = eliminarProducto;

    // ========================================
    // FUNCIONES PRINCIPALES
    // ========================================

    /**
     * Limpiar formulario
     */
    function limpiarFormulario() {
        radioMonto.checked = true;
        simboloValor.textContent = '$';
        inputValor.value = '';
        inputValor.placeholder = 'Ingrese el valor';

        // Limpiar selects
        selectRubros.selectedIndex = -1;
        selectMarcas.selectedIndex = -1;

        // Desmarcar checkboxes
        checkCosto.checked = false;
        checkEfectivo.checked = false;
        checkTarjeta.checked = false;
        checkCtaCte.checked = false;
        checkLista4.checked = false;

        // Limpiar productos seleccionados
        productosSeleccionados = [];
        renderizarProductosSeleccionados();
        inputBuscarProducto.value = '';
    }

    /**
     * Validar formulario
     */
    function validarFormulario() {
        // Validar valor
        const valor = parseFloat(inputValor.value);
        if (isNaN(valor) || inputValor.value.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: 'Debe ingresar un valor numérico válido',
                confirmButtonColor: '#198754'
            });
            return false;
        }

        // Validar que al menos un campo esté seleccionado
        const camposSeleccionados = obtenerCamposSeleccionados();
        if (camposSeleccionados.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: 'Debe seleccionar al menos un campo para actualizar',
                confirmButtonColor: '#198754'
            });
            return false;
        }

        return true;
    }

    /**
     * Obtener campos seleccionados
     */
    function obtenerCamposSeleccionados() {
        const campos = [];
        if (checkCosto.checked) campos.push('costo');
        if (checkEfectivo.checked) campos.push('precio_efectivo');
        if (checkTarjeta.checked) campos.push('precio_tarjeta');
        if (checkCtaCte.checked) campos.push('precio_ctacte');
        if (checkLista4.checked) campos.push('precio_lista4');
        return campos;
    }

    /**
     * Obtener rubros seleccionados
     */
    function obtenerRubrosSeleccionados() {
        const opciones = Array.from(selectRubros.selectedOptions);
        return opciones
            .filter(opt => opt.value !== '')
            .map(opt => parseInt(opt.value));
    }

    /**
     * Obtener marcas seleccionadas
     */
    function obtenerMarcasSeleccionadas() {
        const opciones = Array.from(selectMarcas.selectedOptions);
        return opciones
            .filter(opt => opt.value !== '')
            .map(opt => parseInt(opt.value));
    }

    /**
     * Aplicar cambios
     */
    async function aplicarCambios() {
        // Validar formulario
        if (!validarFormulario()) {
            return;
        }

        // Obtener datos del formulario
        const tipoActualizacion = radioMonto.checked ? 'MONTO' : 'PORCENTAJE';
        const valor = parseFloat(inputValor.value);
        const rubros = obtenerRubrosSeleccionados();
        const marcas = obtenerMarcasSeleccionadas();
        const campos = obtenerCamposSeleccionados();
        const productosIds = productosSeleccionados.map(p => p.id);

        // Construir mensaje de confirmación
        let mensaje = `<div class="text-start">`;
        mensaje += `<p><strong>Tipo:</strong> ${tipoActualizacion === 'MONTO' ? 'Monto Fijo' : 'Porcentaje'}</p>`;
        mensaje += `<p><strong>Valor:</strong> ${tipoActualizacion === 'MONTO' ? '$' : ''}${valor}${tipoActualizacion === 'PORCENTAJE' ? '%' : ''}</p>`;
        mensaje += `<p><strong>Campos:</strong> ${campos.join(', ')}</p>`;

        if (productosIds.length > 0) {
            mensaje += `<p><strong>Productos:</strong> ${productosIds.length} producto(s) seleccionado(s)</p>`;
        } else {
            if (rubros.length > 0) {
                const nombresRubros = Array.from(selectRubros.selectedOptions)
                    .filter(opt => opt.value !== '')
                    .map(opt => opt.text);
                mensaje += `<p><strong>Rubros:</strong> ${nombresRubros.join(', ')}</p>`;
            } else {
                mensaje += `<p><strong>Rubros:</strong> Todos</p>`;
            }

            if (marcas.length > 0) {
                const nombresMarcas = Array.from(selectMarcas.selectedOptions)
                    .filter(opt => opt.value !== '')
                    .map(opt => opt.text);
                mensaje += `<p><strong>Marcas:</strong> ${nombresMarcas.join(', ')}</p>`;
            } else {
                mensaje += `<p><strong>Marcas:</strong> Todas</p>`;
            }
        }

        mensaje += `</div>`;

        // Confirmar con el usuario
        const result = await Swal.fire({
            title: '¿Confirmar Actualización?',
            html: mensaje,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, aplicar',
            cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar'
        });

        if (!result.isConfirmed) {
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Actualizando precios...',
            html: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar petición al backend
        try {
            const requestData = {
                tipo_actualizacion: tipoActualizacion,
                valor: valor,
                rubros: rubros,
                marcas: marcas,
                campos: campos,
                productos: productosIds  // Agregar IDs de productos específicos
            };

            console.log('Enviando datos:', requestData);

            const response = await fetch('/api/precios/actualizar-masivo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualización Exitosa!',
                    html: `<p class="mb-0">${data.mensaje}</p>`,
                    confirmButtonColor: '#198754'
                }).then(() => {
                    // Limpiar formulario después de éxito
                    limpiarFormulario();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Ocurrió un error al actualizar los precios',
                    confirmButtonColor: '#198754'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor',
                confirmButtonColor: '#198754'
            });
        }
    }

    /**
     * Obtener cookie CSRF
     */
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
