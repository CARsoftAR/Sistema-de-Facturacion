import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, User, ShoppingCart, CreditCard, DollarSign, FileText, Check, X } from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import { showWarningAlert, showSuccessAlert, showToast } from '../utils/alerts';
import { useProductSearch } from '../hooks/useProductSearch';
import PaymentModal from '../components/common/PaymentModal';
import Swal from 'sweetalert2';

// Obtener CSRF Token
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

const NuevaVenta = () => {
    const navigate = useNavigate();
    // ==================== STATE & REFS ====================
    // 1. REFS FIRST
    const codigoRef = useRef(null);
    const clienteInputRef = useRef(null);
    const clienteListRef = useRef(null);
    const cantidadRef = useRef(null);

    // 2. STATE NEXT
    const [cliente, setCliente] = useState(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
    const [sugerenciaClienteActiva, setSugerenciaClienteActiva] = useState(0);

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputPrecio, setInputPrecio] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [items, setItems] = useState([]);
    const [medioPago, setMedioPago] = useState('EFECTIVO');
    const [generarRemito, setGenerarRemito] = useState(false);
    const [discriminarIVA, setDiscriminarIVA] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Modal de pago state
    const [mostrarModalPago, setMostrarModalPago] = useState(false);

    // Configuración
    const [cargandoConfig, setCargandoConfig] = useState(true);
    const [config, setConfig] = useState({
        auto_foco_codigo_barras: false,
        discriminar_iva_ventas: false,
        comportamiento_codigo_barras: 'DEFAULT'
    });

    // ==================== PRODUCT SEARCH HOOK ====================
    const {
        inputCodigo, setInputCodigo,
        inputProducto, setInputProducto,
        codigosSugeridos, productosSugeridos,
        mostrarSugerenciasCodigo, mostrarSugerenciasProducto,
        sugerenciaCodigoActiva, sugerenciaActiva,
        codigoListRef,
        productoListRef,
        nextInputRef: productoRef,
        handleCodigoKeyDown, handleProductoKeyDown,
        handleCodigoBlur, handleProductoBlur,
        seleccionar: seleccionarProducto,
        limpiar: limpiarBusqueda
    } = useProductSearch({
        onSelect: (producto) => {
            const precio = medioPago === 'TARJETA' ? producto.precio_tarjeta : producto.precio_efectivo;
            setProductoSeleccionado(producto);
            setInputPrecio(precio.toString());
            setInputCantidad('1');

            if (config.comportamiento_codigo_barras === 'DIRECTO') {
                // Ingreso Rápido: Agregar inmediatamente
                setTimeout(() => {
                    handleAutoAdd(producto, 1, precio);
                }, 50);
            } else if (config.comportamiento_codigo_barras === 'CANTIDAD') {
                // Saltar a Cantidad
                setTimeout(() => cantidadRef.current?.select(), 50);
            }
        }
    });

    const handleAutoAdd = (producto, cantidad, precio) => {
        if (!producto) return;

        // Validar Stock
        if (producto.stock <= 0) {
            showWarningAlert('Producto sin Stock', `El producto "${producto.descripcion}" no tiene stock disponible.`);
            return;
        }

        const existe = items.find(i => i.id === producto.id);
        const cantidadTotal = existe ? existe.cantidad + cantidad : cantidad;

        if (cantidadTotal > producto.stock) {
            showWarningAlert('Stock Insuficiente', `No se puede agregar esa cantidad. Stock disponible: ${producto.stock}`);
            return;
        }

        if (existe) {
            setItems(prevItems => prevItems.map(i =>
                i.id === producto.id
                    ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * i.precio }
                    : i
            ));
        } else {
            setItems(prevItems => [...prevItems, {
                id: producto.id,
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                precio: precio,
                precio_efectivo: producto.precio_efectivo,
                precio_tarjeta: producto.precio_tarjeta,
                cantidad: cantidad,
                subtotal: cantidad * precio,
                stock: producto.stock,
                iva_alicuota: producto.iva_alicuota || 21.0
            }]);
        }

        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    // ==================== PRICE RECALCULATION ====================
    const recalcularPrecios = (nuevoMedio) => {
        setMedioPago(nuevoMedio);
        setItems(prevItems => prevItems.map(item => {
            // Actualizar el precio activo según el nuevo medio
            const nuevoPrecio = nuevoMedio === 'TARJETA' ? (item.precio_tarjeta || item.precio_efectivo) : item.precio_efectivo;
            return {
                ...item,
                precio: nuevoPrecio,
                subtotal: item.cantidad * nuevoPrecio
            };
        }));
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/obtener/');
                const data = await response.json();
                setConfig({
                    auto_foco_codigo_barras: data.auto_foco_codigo_barras || false,
                    comportamiento_codigo_barras: data.comportamiento_codigo_barras || 'DEFAULT',
                    discriminar_iva_ventas: data.discriminar_iva_ventas || false,
                    habilita_remitos: data.habilita_remitos || false
                });
                // Initialize local states from config
                setDiscriminarIVA(data.discriminar_iva_ventas || false);
                setGenerarRemito(data.habilita_remitos || false);
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setCargandoConfig(false);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (!cargandoConfig) {
            setDiscriminarIVA(config.discriminar_iva_ventas);
            setGenerarRemito(config.habilita_remitos);

            // Focus logic with better timing and fallbacks
            setTimeout(() => {
                if (config.auto_foco_codigo_barras) {
                    if (codigoRef.current) {
                        codigoRef.current.focus();
                    } else {
                        // Fallback if barcode ref is missing for some reason
                        clienteInputRef.current?.focus();
                    }
                } else {
                    if (clienteInputRef.current) {
                        clienteInputRef.current.focus();
                    }
                }
            }, 300); // Increased timeout to ensure DOM readiness
        }
    }, [cargandoConfig, config]);

    // Buscar Clientes
    useEffect(() => {
        if (!busquedaCliente || busquedaCliente.length < 2) {
            setClientesSugeridos([]);
            setMostrarSugerenciasCliente(false);
            return;
        }

        const fetchClientes = async () => {
            try {
                const response = await fetch(`/api/clientes/buscar/?q=${encodeURIComponent(busquedaCliente)}`);
                const data = await response.json();
                const listado = data.data || [];
                setClientesSugeridos(listado);
                setMostrarSugerenciasCliente(listado.length > 0);
                setSugerenciaClienteActiva(0);
            } catch (error) {
                console.error("Error buscando clientes:", error);
            }
        };

        const timer = setTimeout(fetchClientes, 300);
        return () => clearTimeout(timer);
    }, [busquedaCliente]);

    // ==================== HELPERS & HANDLERS ====================
    const getInitials = (nombre) => {
        if (!nombre) return '?';
        const palabras = nombre.trim().split(/\s+/);
        if (palabras.length >= 2) {
            return (palabras[0][0] + palabras[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    const seleccionarCliente = (c) => {
        setCliente(c);
        setBusquedaCliente('');
        setMostrarSugerenciasCliente(false);
        setClientesSugeridos([]);
        setTimeout(() => codigoRef.current?.focus(), 100);
    };

    const handleClienteKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(sugerenciaClienteActiva + 1, clientesSugeridos.length - 1);
            setSugerenciaClienteActiva(newIndex);
            clienteListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaClienteActiva - 1, 0);
            setSugerenciaClienteActiva(newIndex);
            clienteListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (clientesSugeridos.length > 0) {
                seleccionarCliente(clientesSugeridos[sugerenciaClienteActiva]);
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasCliente(false);
        }
    };

    const cerrarAlertaStock = () => {
        setAlertaStock(null);
        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;
        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || productoSeleccionado.precio_efectivo;
        handleAutoAdd(productoSeleccionado, cantidad, precio);
    };

    const limpiarCamposEntrada = () => {
        limpiarBusqueda();
        setInputCantidad('1');
        setInputPrecio('');
        setProductoSeleccionado(null);
    };

    const handleCantidadKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarProductoALista();
        }
    };

    const cambiarCantidad = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        // Check stock limit logic could go here too
        setItems(items.map(i =>
            i.id === id
                ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.precio }
                : i
        ));
    };

    const eliminarItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    const totalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);
    const totalNeto = items.reduce((acc, i) => {
        const alicuota = i.iva_alicuota || 21;
        return acc + (i.subtotal / (1 + (alicuota / 100)));
    }, 0);
    const totalIVA = totalGeneral - totalNeto;

    const abrirModalPago = () => {
        if (items.length === 0) {
            showWarningAlert('Atención', 'Debe agregar al menos un producto.');
            return;
        }
        setMostrarModalPago(true);
    };

    // Handler for PaymentModal
    const handleConfirmPayment = (paymentData) => {
        guardarVenta(paymentData);
    };

    const guardarVenta = async (paymentData) => {
        setGuardando(true);

        // Map PaymentModal data to existing backend structure
        const finalMedioPago = paymentData.metodo_pago;

        const datosPago = {
            monto_recibido: paymentData.monto,
            vuelto: paymentData.vuelto,
            tarjeta: {
                ultimos4: paymentData.tarjeta?.last4 || '',
                cuotas: paymentData.tarjeta?.installments || '1'
            },
            cheque: {
                banco: paymentData.cheque?.bank || '',
                numero: paymentData.cheque?.number || '',
                fechaVto: paymentData.cheque?.paymentDate || ''
            }
        };

        try {
            const response = await fetch('/api/ventas/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    cliente_id: cliente?.id || null,
                    items: items.map(i => ({
                        id: i.id,
                        cantidad: i.cantidad,
                        precio: i.precio,
                        subtotal: i.subtotal,
                        neto: discriminarIVA ? (i.subtotal / (1 + (i.iva_alicuota || 21) / 100)) : i.subtotal,
                        iva_amount: discriminarIVA ? (i.subtotal - (i.subtotal / (1 + (i.iva_alicuota || 21) / 100))) : 0,
                        discriminado: discriminarIVA
                    })),
                    total_general: totalGeneral + (paymentData.percepcion_iva || 0) + (paymentData.percepcion_iibb || 0),
                    medio_pago: finalMedioPago,
                    generar_remito: generarRemito,
                    datos_pago: datosPago,
                    percepcion_iva: paymentData.percepcion_iva || 0,
                    percepcion_iibb: paymentData.percepcion_iibb || 0,
                    discriminar_iva: discriminarIVA,
                    tipo_comprobante: (discriminarIVA || (paymentData.percepcion_iva > 0 || paymentData.percepcion_iibb > 0)) && cliente?.condicion_fiscal === 'RI' ? 'A' : 'B'
                })
            });

            const data = await response.json();

            if (data.ok) {
                setMostrarModalPago(false);
                setCliente(null);
                setItems([]);
                setGenerarRemito(false);
                limpiarCamposEntrada();

                showSuccessAlert(
                    'Venta Registrada',
                    `Venta #${data.venta_id} guardada con éxito.`,
                    undefined,
                    { timer: 2000, showConfirmButton: false }
                );

                setTimeout(() => clienteInputRef.current?.focus(), 100);
            } else {
                showWarningAlert('Error', data.error || 'Error al guardar la venta.');
            }
        } catch (err) {
            showWarningAlert('Error', 'Error de conexión. Intente nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    // ==================== UI PARTS ====================

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">


            {/* El mensaje de éxito/error ahora se muestra por SweetAlert modal */}

            {/* Layout principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* CLOUMNA IZQUIERDA (CLIENTE / PROVEEDOR / INFO) */}
                <div
                    className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* Header Interno: Back Button & Title Stacked */}
                    <div className="mb-6 flex-shrink-0">
                        <div className="mb-4">
                            <BtnBack onClick={() => navigate('/ventas')} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <ShoppingCart className="text-blue-600" size={32} strokeWidth={2.5} />
                            Nueva Venta
                        </h1>
                        <p className="text-slate-500 font-medium ml-10">Registrar una nueva operación de venta</p>
                    </div>
                    {/* Cliente Card */}
                    <style>
                        {`
                            .lg\\:col-span-4::-webkit-scrollbar {
                                display: none;
                            }
                        `}
                    </style>
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <User size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Cliente</h2>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                ref={clienteInputRef}
                                type="text"
                                placeholder="Buscar por nombre o DNI..."
                                value={busquedaCliente}
                                onChange={(e) => setBusquedaCliente(e.target.value)}
                                onKeyDown={handleClienteKeyDown}
                                onFocus={() => clientesSugeridos.length > 0 && setMostrarSugerenciasCliente(true)}
                                onBlur={() => setTimeout(() => setMostrarSugerenciasCliente(false), 200)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium"
                            />
                            {mostrarSugerenciasCliente && clientesSugeridos.length > 0 && (
                                <div ref={clienteListRef} className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                                    {clientesSugeridos.map((c, idx) => (
                                        <div
                                            key={c.id}
                                            onClick={() => seleccionarCliente(c)}
                                            className={`px-4 py-3 cursor-pointer border-b border-slate-50 flex items-center justify-between ${idx === sugerenciaClienteActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800">{c.nombre}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{c.cuit || 'Sin CUIT'}</div>
                                            </div>
                                            {idx === sugerenciaClienteActiva && <Check size={16} className="text-blue-500" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cliente ? (
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-start justify-between relative overflow-hidden">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center font-bold text-lg border border-blue-100">
                                        {getInitials(cliente.nombre)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-base">{cliente.nombre}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                            {cliente.cuit || 'Consumidor Final'}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setCliente(null)} className="text-slate-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-all relative z-10">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2 text-slate-400 px-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span className="text-sm font-medium">Consumidor Final seleccionado por defecto</span>
                            </div>
                        )}
                    </div>

                    {/* Opciones de Venta removidas (Ahora se manejan desde Parámetros) */}
                </div>

                {/* COLUMNA DERECHA (CARRITO) */}
                <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">

                    {/* Barra de Entrada de Productos */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex-shrink-0 z-20">
                        <div className="grid grid-cols-12 gap-4 items-end">
                            {/* Código */}
                            <div className="col-span-2 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">CÓDIGO</label>
                                <input
                                    ref={codigoRef}
                                    type="text"
                                    value={inputCodigo}
                                    onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                    onKeyDown={handleCodigoKeyDown}
                                    onBlur={handleCodigoBlur}
                                    placeholder="XXX"
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-mono text-sm uppercase text-center font-bold tracking-wide"
                                />
                                {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                    <div ref={codigoListRef} className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                                        {codigosSugeridos.map((p, idx) => (
                                            <div
                                                key={p.id}
                                                onClick={() => seleccionarProducto(p)}
                                                className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 ${idx === sugerenciaCodigoActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{p.codigo}</span>
                                                    <span className="text-sm font-bold text-green-600">${p.precio_efectivo.toLocaleString('es-AR')}</span>
                                                </div>
                                                <div className="text-xs text-slate-600 truncate">{p.descripcion}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Producto */}
                            <div className="col-span-6 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">PRODUCTO</label>
                                <input
                                    ref={productoRef}
                                    type="text"
                                    value={inputProducto}
                                    onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                    onKeyDown={handleProductoKeyDown}
                                    onBlur={handleProductoBlur}
                                    placeholder="Buscar producto por nombre..."
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm font-medium"
                                />
                                {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                    <div ref={productoListRef} className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                                        {productosSugeridos.map((p, idx) => (
                                            <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 flex justify-between items-center ${idx === sugerenciaActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="font-bold text-slate-700 text-sm truncate">{p.descripcion}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                        <span className="bg-slate-100 px-1.5 rounded font-mono text-slate-500">{p.codigo}</span>
                                                        {p.stock <= 5 ? <span className="text-amber-500 font-bold">¡Poco Stock: {p.stock}!</span> : <span>Stock: {p.stock}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-slate-800">${p.precio_efectivo.toLocaleString('es-AR')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">CANT.</label>
                                <input
                                    ref={cantidadRef}
                                    type="number"
                                    min="1"
                                    value={inputCantidad}
                                    onChange={(e) => setInputCantidad(e.target.value)}
                                    onKeyDown={handleCantidadKeyDown}
                                    disabled={!productoSeleccionado}
                                    title={!productoSeleccionado ? "Seleccione un producto primero" : "Cantidad"}
                                    className={`w-full px-2 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-center font-bold transition-colors ${!productoSeleccionado ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75' : 'bg-slate-50 text-slate-800'}`}
                                />
                            </div>

                            <div className="col-span-2">
                                <button onClick={agregarProductoALista} disabled={!productoSeleccionado} className={`w-full py-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm ${productoSeleccionado ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                                    <Plus size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Listado de Items con Scroll */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                <tr className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-6 py-3 text-left w-24">Código</th>
                                    <th className="px-6 py-3 text-left">Producto</th>
                                    <th className="px-6 py-3 text-center w-32">Cantidad</th>
                                    {discriminarIVA ? (
                                        <>
                                            <th className="px-6 py-3 text-right">Neto Unit.</th>
                                            <th className="px-6 py-3 text-center w-20">IVA</th>
                                            <th className="px-6 py-3 text-right">Total</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-3 text-right w-32">Precio</th>
                                            <th className="px-6 py-3 text-right w-32">Subtotal</th>
                                        </>
                                    )}
                                    <th className="px-6 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {items.map((item) => {
                                    const alicuota = item.iva_alicuota || 21.0;
                                    const netoUnitario = item.precio / (1 + alicuota / 100);

                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{item.codigo}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800">{item.descripcion}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center bg-slate-100 rounded-lg p-1 w-fit mx-auto">
                                                    <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-white hover:text-red-500 transition-colors disabled:opacity-50">-</button>
                                                    <span className="w-8 text-center font-bold text-slate-700 text-xs">{item.cantidad}</span>
                                                    <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-white hover:text-green-600 transition-colors">+</button>
                                                </div>
                                            </td>

                                            {discriminarIVA ? (
                                                <>
                                                    <td className="px-6 py-4 text-right text-slate-600 font-medium">
                                                        ${netoUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{alicuota}%</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                        ${item.subtotal.toLocaleString('es-AR')}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-right text-slate-600 font-medium">${item.precio.toLocaleString('es-AR')}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-800">${item.subtotal.toLocaleString('es-AR')}</td>
                                                </>
                                            )}

                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={discriminarIVA ? 7 : 5} className="py-10 text-center text-slate-400">
                                            Tu carrito de ventas está vacío
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Total */}
                    <div className="p-6 m-4 mb-8 rounded-3xl bg-slate-900 text-white flex justify-between items-center shadow-2xl ring-1 ring-white/10 flex-shrink-0 mt-auto">
                        {discriminarIVA ? (
                            <div className="flex items-center gap-8">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subtotal Neto</p>
                                    <p className="text-xl font-bold text-slate-200">${totalNeto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="space-y-0.5 relative">
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-700"></div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">IVA Estimado</p>
                                    <p className="text-xl font-bold text-slate-200">${totalIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-700"></div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-emerald-400 text-sm font-black uppercase tracking-wider">Total Final</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black tracking-tight text-emerald-400">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total a Cobrar</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-slate-400 font-light">ARS</span>
                                </div>
                            </div>
                        )}
                        <BtnSave
                            label="Confirmar Venta"
                            onClick={abrirModalPago}
                            disabled={items.length === 0}
                            className="px-8 py-4 rounded-xl font-bold text-lg"
                        />
                    </div>
                </div>

                {/* ==================== MODAL DE PAGO ==================== */}
                <PaymentModal
                    isOpen={mostrarModalPago}
                    onClose={() => setMostrarModalPago(false)}
                    onConfirm={handleConfirmPayment}
                    onMethodChange={recalcularPrecios}
                    total={totalGeneral}
                    mode="sale"
                    clientName={cliente?.nombre}
                    initialMethod={medioPago}
                />
            </div>
        </div>
    );
};

export default NuevaVenta;
