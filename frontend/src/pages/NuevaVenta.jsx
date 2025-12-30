import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, User, ShoppingCart, CreditCard, DollarSign, FileText, X, Check, Banknote } from 'lucide-react';

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

// Lista de bancos argentinos
const BANCOS_ARGENTINOS = [
    "Banco de la Nación Argentina",
    "Banco de la Provincia de Buenos Aires",
    "Banco Ciudad de Buenos Aires",
    "Banco Santander Argentina",
    "Banco Galicia",
    "Banco BBVA Argentina",
    "Banco Macro",
    "Banco HSBC Argentina",
    "Banco Credicoop",
    "Banco Patagonia",
    "Banco ICBC Argentina",
    "Banco Supervielle",
    "Banco Comafi",
    "Banco Hipotecario",
    "Banco Itaú Argentina",
    "Banco Columbia",
    "Banco del Sol",
    "Banco Piano",
    "Banco CMF",
    "Banco Mariva",
    "Banco Voii",
    "Banco de Valores",
    "Banco Municipal de Rosario",
    "Nuevo Banco de Santa Fe",
    "Nuevo Banco de Entre Ríos",
    "Banco de Córdoba",
    "Banco de San Juan",
    "Banco de La Pampa",
    "Banco de Corrientes",
    "Banco del Chubut",
    "Banco de Formosa",
    "Banco de Santa Cruz",
    "Banco de Tierra del Fuego",
];

const NuevaVenta = () => {
    // ==================== STATE ====================
    const [cliente, setCliente] = useState(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
    const [sugerenciaClienteActiva, setSugerenciaClienteActiva] = useState(0);

    // Campos de entrada de producto
    const [inputCodigo, setInputCodigo] = useState('');
    const [inputProducto, setInputProducto] = useState('');
    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputPrecio, setInputPrecio] = useState('');

    // Autocompletado de código
    const [codigosSugeridos, setCodigosSugeridos] = useState([]);
    const [mostrarSugerenciasCodigo, setMostrarSugerenciasCodigo] = useState(false);
    const [sugerenciaCodigoActiva, setSugerenciaCodigoActiva] = useState(0);

    const [productosSugeridos, setProductosSugeridos] = useState([]);
    const [mostrarSugerenciasProducto, setMostrarSugerenciasProducto] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [sugerenciaActiva, setSugerenciaActiva] = useState(0);

    const [items, setItems] = useState([]);
    const [medioPago, setMedioPago] = useState('EFECTIVO');
    const [generarRemito, setGenerarRemito] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // Modal de pago
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [montoPago, setMontoPago] = useState('');
    const [datosTarjeta, setDatosTarjeta] = useState({ ultimos4: '', cuotas: '1' });
    const [datosCheque, setDatosCheque] = useState({ banco: '', numero: '', fechaVto: '' });

    // Autocompletado de bancos
    const [bancosSugeridos, setBancosSugeridos] = useState([]);
    const [mostrarSugerenciasBanco, setMostrarSugerenciasBanco] = useState(false);
    const [sugerenciaBancoActiva, setSugerenciaBancoActiva] = useState(0);
    const bancoListRef = useRef(null);

    // Referencias
    const codigoRef = useRef(null);
    const productoRef = useRef(null);
    const cantidadRef = useRef(null);
    const clienteInputRef = useRef(null);
    const montoPagoRef = useRef(null);

    // Referencias para scroll automático en listas
    const clienteListRef = useRef(null);
    const codigoListRef = useRef(null);
    const productoListRef = useRef(null);

    // ==================== BUSCAR CLIENTE ====================
    useEffect(() => {
        if (busquedaCliente.length < 2) {
            setClientesSugeridos([]);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/clientes/buscar/?q=${encodeURIComponent(busquedaCliente)}`)
                .then(res => res.json())
                .then(data => {
                    setClientesSugeridos(data.data || []);
                    setMostrarSugerenciasCliente(true);
                    setSugerenciaClienteActiva(0);
                })
                .catch(() => setClientesSugeridos([]));
        }, 300);
        return () => clearTimeout(timer);
    }, [busquedaCliente]);

    // ==================== BUSCAR POR CÓDIGO (autocompletado) ====================
    useEffect(() => {
        if (inputCodigo.length < 1) {
            setCodigosSugeridos([]);
            setMostrarSugerenciasCodigo(false);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/productos/buscar/?q=${encodeURIComponent(inputCodigo)}`)
                .then(res => res.json())
                .then(data => {
                    setCodigosSugeridos(data.data || []);
                    setMostrarSugerenciasCodigo(true);
                    setSugerenciaCodigoActiva(0);
                })
                .catch(() => setCodigosSugeridos([]));
        }, 150);
        return () => clearTimeout(timer);
    }, [inputCodigo]);

    // ==================== BUSCAR PRODUCTO POR NOMBRE ====================
    useEffect(() => {
        if (inputProducto.length < 2) {
            setProductosSugeridos([]);
            setMostrarSugerenciasProducto(false);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/productos/buscar/?q=${encodeURIComponent(inputProducto)}`)
                .then(res => res.json())
                .then(data => {
                    setProductosSugeridos(data.data || []);
                    setMostrarSugerenciasProducto(true);
                    setSugerenciaActiva(0);
                })
                .catch(() => setProductosSugeridos([]));
        }, 200);
        return () => clearTimeout(timer);
    }, [inputProducto]);

    // ==================== OBTENER INICIALES ====================
    const getInitials = (nombre) => {
        if (!nombre) return '?';
        const palabras = nombre.trim().split(/\s+/);
        if (palabras.length >= 2) {
            return (palabras[0][0] + palabras[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    // ==================== SELECCIONAR CLIENTE ====================
    const seleccionarCliente = (c) => {
        setCliente(c);
        setBusquedaCliente('');
        setMostrarSugerenciasCliente(false);
        setClientesSugeridos([]);
        setTimeout(() => codigoRef.current?.focus(), 100);
    };

    // ==================== MANEJO DE TECLAS - CLIENTE ====================
    const handleClienteKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(sugerenciaClienteActiva + 1, clientesSugeridos.length - 1);
            setSugerenciaClienteActiva(newIndex);
            // Scroll al item
            const item = clienteListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaClienteActiva - 1, 0);
            setSugerenciaClienteActiva(newIndex);
            const item = clienteListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (clientesSugeridos.length > 0) {
                seleccionarCliente(clientesSugeridos[sugerenciaClienteActiva]);
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasCliente(false);
        }
    };

    // ==================== SELECCIONAR PRODUCTO ====================
    const seleccionarProducto = (producto) => {
        const precio = medioPago === 'TARJETA' ? producto.precio_tarjeta : producto.precio_efectivo;
        setProductoSeleccionado(producto);
        setInputCodigo(producto.codigo);
        setInputProducto(producto.descripcion);
        setInputPrecio(precio.toString());
        setMostrarSugerenciasProducto(false);
        setMostrarSugerenciasCodigo(false);
        setProductosSugeridos([]);
        setCodigosSugeridos([]);
        setTimeout(() => cantidadRef.current?.select(), 50);
    };

    // ==================== AGREGAR PRODUCTO A LA LISTA ====================
    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;

        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || productoSeleccionado.precio_efectivo;

        const existe = items.find(i => i.id === productoSeleccionado.id);
        if (existe) {
            setItems(items.map(i =>
                i.id === productoSeleccionado.id
                    ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * i.precio }
                    : i
            ));
        } else {
            setItems([...items, {
                id: productoSeleccionado.id,
                codigo: productoSeleccionado.codigo,
                descripcion: productoSeleccionado.descripcion,
                precio: precio,
                cantidad: cantidad,
                subtotal: cantidad * precio,
                stock: productoSeleccionado.stock
            }]);
        }

        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const limpiarCamposEntrada = () => {
        setInputCodigo('');
        setInputProducto('');
        setInputCantidad('1');
        setInputPrecio('');
        setProductoSeleccionado(null);
        setProductosSugeridos([]);
        setCodigosSugeridos([]);
        setMostrarSugerenciasProducto(false);
        setMostrarSugerenciasCodigo(false);
    };

    // ==================== MANEJO DE TECLAS - CÓDIGO ====================
    const handleCodigoKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(sugerenciaCodigoActiva + 1, codigosSugeridos.length - 1);
            setSugerenciaCodigoActiva(newIndex);
            const item = codigoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaCodigoActiva - 1, 0);
            setSugerenciaCodigoActiva(newIndex);
            const item = codigoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasCodigo && codigosSugeridos.length > 0) {
                seleccionarProducto(codigosSugeridos[sugerenciaCodigoActiva]);
            } else if (!inputCodigo.trim()) {
                productoRef.current?.focus();
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasCodigo(false);
        }
    };

    const handleProductoKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(sugerenciaActiva + 1, productosSugeridos.length - 1);
            setSugerenciaActiva(newIndex);
            const item = productoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaActiva - 1, 0);
            setSugerenciaActiva(newIndex);
            const item = productoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasProducto && productosSugeridos.length > 0) {
                seleccionarProducto(productosSugeridos[sugerenciaActiva]);
            } else if (productoSeleccionado) {
                cantidadRef.current?.select();
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasProducto(false);
        }
    };

    const handleCantidadKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarProductoALista();
        }
    };

    // ==================== MODIFICAR CANTIDAD EN LISTA ====================
    const cambiarCantidad = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
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
    const vuelto = parseFloat(montoPago || 0) - totalGeneral;

    // ==================== ABRIR MODAL DE PAGO ====================
    const abrirModalPago = () => {
        if (items.length === 0) {
            setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un producto.' });
            return;
        }
        setMontoPago('');
        setDatosTarjeta({ ultimos4: '', cuotas: '1' });
        setDatosCheque({ banco: '', numero: '', fechaVto: '' });
        setMostrarModalPago(true);
        setTimeout(() => montoPagoRef.current?.focus(), 100);
    };

    // ==================== GUARDAR VENTA ====================
    const guardarVenta = async () => {
        setGuardando(true);
        setMensaje(null);

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
                        subtotal: i.subtotal
                    })),
                    total_general: totalGeneral,
                    medio_pago: medioPago,
                    generar_remito: generarRemito,
                    datos_pago: {
                        monto_recibido: parseFloat(montoPago) || totalGeneral,
                        vuelto: medioPago === 'EFECTIVO' ? Math.max(0, vuelto) : 0,
                        tarjeta: datosTarjeta,
                        cheque: datosCheque
                    }
                })
            });

            const data = await response.json();

            if (data.ok) {
                setMostrarModalPago(false);
                setMensaje({ tipo: 'success', texto: `Venta #${data.venta_id} registrada correctamente.` });
                setCliente(null);
                setItems([]);
                setGenerarRemito(false);
                limpiarCamposEntrada();
            } else {
                setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar la venta.' });
            }
        } catch (err) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Intente nuevamente.' });
        } finally {
            setGuardando(false);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="mb-4 flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">Nueva Venta</h1>
                <p className="text-slate-500 text-sm">Registrar una nueva operación de venta</p>
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`mb-4 p-3 rounded-lg flex-shrink-0 ${mensaje.tipo === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Layout principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* =============== COLUMNA IZQUIERDA =============== */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-auto">
                    {/* Cliente */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="text-slate-400" size={18} />
                            <h2 className="font-semibold text-slate-700 text-sm">Cliente</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                ref={clienteInputRef}
                                type="text"
                                placeholder="Buscar cliente..."
                                value={busquedaCliente}
                                onChange={(e) => setBusquedaCliente(e.target.value)}
                                onKeyDown={handleClienteKeyDown}
                                onFocus={() => clientesSugeridos.length > 0 && setMostrarSugerenciasCliente(true)}
                                onBlur={() => setTimeout(() => setMostrarSugerenciasCliente(false), 200)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                            />
                            {mostrarSugerenciasCliente && clientesSugeridos.length > 0 && (
                                <div ref={clienteListRef} className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {clientesSugeridos.map((c, idx) => (
                                        <div
                                            key={c.id}
                                            onClick={() => seleccionarCliente(c)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${idx === sugerenciaClienteActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="font-medium text-slate-800 text-sm">{c.nombre}</div>
                                            <div className="text-xs text-slate-500">{c.cuit || 'Sin CUIT'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {cliente ? (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    {/* Avatar con iniciales */}
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {getInitials(cliente.nombre)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{cliente.nombre}</p>
                                        <p className="text-xs text-slate-500">{cliente.cuit || 'Sin CUIT'}</p>
                                    </div>
                                    <button onClick={() => setCliente(null)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-3 text-xs text-slate-400 italic">Consumidor Final</p>
                        )}
                    </div>

                    {/* Medio de Pago */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="text-slate-400" size={18} />
                            <h2 className="font-semibold text-slate-700 text-sm">Pago</h2>
                        </div>
                        <div className="space-y-1">
                            {[
                                { value: 'EFECTIVO', label: 'Efectivo', icon: DollarSign },
                                { value: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
                                { value: 'CTACTE', label: 'Cta. Cte.', icon: FileText },
                                { value: 'CHEQUE', label: 'Cheque', icon: Banknote },
                            ].map(({ value, label, icon: Icon }) => (
                                <label key={value} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all text-sm ${medioPago === value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <input type="radio" name="medioPago" value={value} checked={medioPago === value} onChange={(e) => setMedioPago(e.target.value)} className="hidden" />
                                    <Icon size={16} className={medioPago === value ? 'text-blue-600' : 'text-slate-400'} />
                                    <span className={medioPago === value ? 'text-blue-700 font-medium' : 'text-slate-600'}>{label}</span>
                                </label>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-sm">
                            <input type="checkbox" checked={generarRemito} onChange={(e) => setGenerarRemito(e.target.checked)} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                            <span className="text-slate-600">Generar Remito</span>
                        </label>
                    </div>
                </div>

                {/* =============== COLUMNA DERECHA - PRODUCTOS =============== */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0">

                        {/* Header + Entrada */}
                        <div className="p-4 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <ShoppingCart className="text-slate-400" size={18} />
                                <h2 className="font-semibold text-slate-700 text-sm">Productos</h2>
                            </div>

                            {/* Fila de entrada */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                                {/* Código con autocompletado */}
                                <div className="col-span-2 relative">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Código</label>
                                    <input
                                        ref={codigoRef}
                                        type="text"
                                        value={inputCodigo}
                                        onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                        onKeyDown={handleCodigoKeyDown}
                                        onBlur={() => setTimeout(() => setMostrarSugerenciasCodigo(false), 200)}
                                        placeholder="Código"
                                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm uppercase"
                                    />
                                    {/* Sugerencias de código */}
                                    {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                        <div ref={codigoListRef} className="absolute z-20 w-64 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {codigosSugeridos.map((p, idx) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => seleccionarProducto(p)}
                                                    className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${idx === sugerenciaCodigoActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex justify-between">
                                                        <span className="font-mono text-sm font-bold text-blue-600">{p.codigo}</span>
                                                        <span className="text-xs text-green-600">${p.precio_efectivo.toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-600 truncate">{p.descripcion}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Producto */}
                                <div className="col-span-5 relative">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Producto</label>
                                    <input
                                        ref={productoRef}
                                        type="text"
                                        value={inputProducto}
                                        onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                        onKeyDown={handleProductoKeyDown}
                                        onBlur={() => setTimeout(() => setMostrarSugerenciasProducto(false), 200)}
                                        placeholder="Buscar..."
                                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                    />
                                    {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                        <div ref={productoListRef} className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {productosSugeridos.map((p, idx) => (
                                                <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 flex justify-between items-center ${idx === sugerenciaActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                                    <div>
                                                        <div className="font-medium text-slate-800 text-sm">{p.descripcion}</div>
                                                        <div className="text-xs text-slate-500">{p.codigo} • Stock: {p.stock}</div>
                                                    </div>
                                                    <div className="text-sm font-semibold text-green-600">${p.precio_efectivo.toLocaleString('es-AR')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Cant.</label>
                                    <input ref={cantidadRef} type="number" min="1" value={inputCantidad} onChange={(e) => setInputCantidad(e.target.value)} onKeyDown={handleCantidadKeyDown} className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm text-center" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Precio</label>
                                    <input type="text" value={inputPrecio ? `$${parseFloat(inputPrecio).toLocaleString('es-AR')}` : ''} readOnly placeholder="$0" className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-slate-100 text-sm text-right text-slate-600" />
                                </div>

                                <div className="col-span-1">
                                    <button onClick={agregarProductoALista} disabled={!productoSeleccionado} className={`w-full py-2 rounded-lg flex items-center justify-center transition-all ${productoSeleccionado ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabla - ALTURA FIJA CON SCROLL */}
                        <div className="flex-1 overflow-auto min-h-0">
                            {items.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr className="border-b border-slate-200 text-left">
                                            <th className="px-4 py-2 text-slate-600 font-medium text-xs">Código</th>
                                            <th className="px-4 py-2 text-slate-600 font-medium text-xs">Producto</th>
                                            <th className="px-4 py-2 text-slate-600 font-medium text-xs text-center">Cant.</th>
                                            <th className="px-4 py-2 text-slate-600 font-medium text-xs text-right">Precio</th>
                                            <th className="px-4 py-2 text-slate-600 font-medium text-xs text-right">Subtotal</th>
                                            <th className="px-4 py-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-2 text-slate-500 font-mono text-xs">{item.codigo}</td>
                                                <td className="px-4 py-2 font-medium text-slate-800 text-sm">{item.descripcion}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs">-</button>
                                                        <span className="w-8 text-center font-medium text-sm">{item.cantidad}</span>
                                                        <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs">+</button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-right text-slate-600 text-sm">${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-2 text-right font-semibold text-slate-800 text-sm">${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-2"><button onClick={() => eliminarItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <div className="text-center">
                                        <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Sin productos</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Total - FIJO ABAJO */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500">Total a Pagar</p>
                                    <p className="text-2xl font-bold text-slate-800">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <button onClick={abrirModalPago} disabled={items.length === 0} className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all text-sm ${items.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}>
                                    Registrar Venta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== MODAL DE PAGO ==================== */}
            {mostrarModalPago && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Confirmar Pago</h3>
                            <button onClick={() => setMostrarModalPago(false)} className="hover:bg-white/20 rounded-full p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Total */}
                            <div className="bg-slate-100 rounded-lg p-4 mb-6">
                                <p className="text-sm text-slate-500">Total de la Venta</p>
                                <p className="text-3xl font-bold text-slate-800">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>

                            {/* Campos según medio de pago */}
                            {medioPago === 'EFECTIVO' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">¿Con cuánto abona?</label>
                                        <input
                                            ref={montoPagoRef}
                                            type="number"
                                            value={montoPago}
                                            onChange={(e) => setMontoPago(e.target.value)}
                                            placeholder="Ingrese monto..."
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {montoPago && parseFloat(montoPago) >= totalGeneral && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-sm text-green-700">Vuelto a entregar:</p>
                                            <p className="text-2xl font-bold text-green-600">${vuelto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    )}
                                    {montoPago && parseFloat(montoPago) < totalGeneral && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-sm text-red-700">Monto insuficiente. Faltan:</p>
                                            <p className="text-xl font-bold text-red-600">${Math.abs(vuelto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {medioPago === 'TARJETA' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Últimos 4 dígitos</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={datosTarjeta.ultimos4}
                                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, ultimos4: e.target.value })}
                                            placeholder="0000"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cuotas</label>
                                        <select
                                            value={datosTarjeta.cuotas}
                                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cuotas: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {[1, 3, 6, 12, 18].map(c => <option key={c} value={c}>{c} cuota{c > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {medioPago === 'CHEQUE' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
                                        <input
                                            type="text"
                                            value={datosCheque.banco}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                setDatosCheque({ ...datosCheque, banco: valor });
                                                if (valor.length >= 1) {
                                                    const filtrados = BANCOS_ARGENTINOS.filter(b =>
                                                        b.toLowerCase().includes(valor.toLowerCase())
                                                    );
                                                    setBancosSugeridos(filtrados);
                                                    setMostrarSugerenciasBanco(filtrados.length > 0);
                                                    setSugerenciaBancoActiva(0);
                                                } else {
                                                    setBancosSugeridos([]);
                                                    setMostrarSugerenciasBanco(false);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'ArrowDown') {
                                                    e.preventDefault();
                                                    const newIndex = Math.min(sugerenciaBancoActiva + 1, bancosSugeridos.length - 1);
                                                    setSugerenciaBancoActiva(newIndex);
                                                    bancoListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
                                                } else if (e.key === 'ArrowUp') {
                                                    e.preventDefault();
                                                    const newIndex = Math.max(sugerenciaBancoActiva - 1, 0);
                                                    setSugerenciaBancoActiva(newIndex);
                                                    bancoListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
                                                } else if (e.key === 'Enter' && mostrarSugerenciasBanco && bancosSugeridos.length > 0) {
                                                    e.preventDefault();
                                                    setDatosCheque({ ...datosCheque, banco: bancosSugeridos[sugerenciaBancoActiva] });
                                                    setMostrarSugerenciasBanco(false);
                                                } else if (e.key === 'Escape') {
                                                    setMostrarSugerenciasBanco(false);
                                                }
                                            }}
                                            onBlur={() => setTimeout(() => setMostrarSugerenciasBanco(false), 200)}
                                            placeholder="Buscar banco..."
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        {mostrarSugerenciasBanco && bancosSugeridos.length > 0 && (
                                            <div ref={bancoListRef} className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {bancosSugeridos.map((banco, idx) => (
                                                    <div
                                                        key={banco}
                                                        onClick={() => {
                                                            setDatosCheque({ ...datosCheque, banco: banco });
                                                            setMostrarSugerenciasBanco(false);
                                                        }}
                                                        className={`px-4 py-2 cursor-pointer text-sm ${idx === sugerenciaBancoActiva ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}
                                                    >
                                                        {banco}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cheque</label>
                                        <input
                                            type="text"
                                            value={datosCheque.numero}
                                            onChange={(e) => setDatosCheque({ ...datosCheque, numero: e.target.value })}
                                            placeholder="Número"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Vencimiento</label>
                                        <input
                                            type="date"
                                            value={datosCheque.fechaVto}
                                            onChange={(e) => setDatosCheque({ ...datosCheque, fechaVto: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {medioPago === 'CTACTE' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-amber-800">
                                        Se cargará a la cuenta corriente del cliente: <strong>{cliente?.nombre || 'Consumidor Final'}</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="px-6 py-4 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setMostrarModalPago(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardarVenta}
                                disabled={guardando || (medioPago === 'EFECTIVO' && (!montoPago || parseFloat(montoPago) < totalGeneral))}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${guardando || (medioPago === 'EFECTIVO' && (!montoPago || parseFloat(montoPago) < totalGeneral))
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                <Check size={18} />
                                {guardando ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevaVenta;
