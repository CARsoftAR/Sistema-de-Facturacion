import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, User, ShoppingCart, CreditCard, DollarSign, FileText, Check, X } from 'lucide-react';
import { BtnSave } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';
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

// Lista de bancos argentinos
const BANCOS_ARGENTINOS = [
    "Banco de la Nación Argentina", "Banco de la Provincia de Buenos Aires", "Banco Ciudad de Buenos Aires",
    "Banco Santander Argentina", "Banco Galicia", "Banco BBVA Argentina", "Banco Macro", "Banco HSBC Argentina",
    "Banco Credicoop", "Banco Patagonia", "Banco ICBC Argentina", "Banco Supervielle", "Banco Comafi",
    "Banco Hipotecario", "Banco Itaú Argentina", "Banco Columbia", "Banco del Sol", "Banco Piano",
    "Banco CMF", "Banco Mariva", "Banco Voii", "Banco de Valores", "Banco Municipal de Rosario",
    "Nuevo Banco de Santa Fe", "Nuevo Banco de Entre Ríos", "Banco de Córdoba", "Banco de San Juan",
    "Banco de La Pampa", "Banco de Corrientes", "Banco del Chubut", "Banco de Formosa", "Banco de Santa Cruz",
    "Banco de Tierra del Fuego"
];

const NuevaVenta = () => {
    // ==================== STATE & REFS ====================
    // 1. REFS FIRST
    const codigoRef = useRef(null);
    const clienteInputRef = useRef(null);
    const clienteListRef = useRef(null);
    const cantidadRef = useRef(null);
    const bancoListRef = useRef(null);

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
    const [mensaje, setMensaje] = useState(null);

    // Modal de pago state
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [montoPago, setMontoPago] = useState('');
    const [datosTarjeta, setDatosTarjeta] = useState({ ultimos4: '', cuotas: '1' });
    const [datosCheque, setDatosCheque] = useState({ banco: '', numero: '', fechaVto: '' });

    // Alertas y Sugerencias
    const [alertaStock, setAlertaStock] = useState(null);
    const [bancosSugeridos, setBancosSugeridos] = useState([]);
    const [mostrarSugerenciasBanco, setMostrarSugerenciasBanco] = useState(false);
    const [sugerenciaBancoActiva, setSugerenciaBancoActiva] = useState(0);

    // Configuración
    const [cargandoConfig, setCargandoConfig] = useState(true);
    const [config, setConfig] = useState({ auto_foco_codigo_barras: false, discriminar_iva_ventas: false });

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
            // Focus quantity safe check
            setTimeout(() => cantidadRef.current?.select(), 50);
        }
    });

    // ==================== EFFECTS ====================
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/obtener/');
                const data = await response.json();
                setConfig({
                    auto_foco_codigo_barras: data.auto_foco_codigo_barras || false,
                    discriminar_iva_ventas: data.discriminar_iva_ventas || false,
                    habilita_remitos: data.habilita_remitos || false
                });
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
            if (config.auto_foco_codigo_barras) {
                setTimeout(() => codigoRef.current?.focus(), 100);
            } else {
                setTimeout(() => clienteInputRef.current?.focus(), 100);
            }
        }
    }, [cargandoConfig, config]);

    // Buscar Bancos
    useEffect(() => {
        const busqueda = datosCheque.banco;
        if (!busqueda || busqueda.length < 2) {
            setBancosSugeridos([]);
            setMostrarSugerenciasBanco(false);
            return;
        }
        const resultados = BANCOS_ARGENTINOS.filter(b =>
            b.toLowerCase().includes(busqueda.toLowerCase())
        );
        setBancosSugeridos(resultados);
        setMostrarSugerenciasBanco(resultados.length > 0);
        setSugerenciaBancoActiva(0);
    }, [datosCheque.banco]);

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

        // Validar Stock
        if (productoSeleccionado.stock <= 0) {
            setAlertaStock({
                titulo: 'Producto sin Stock',
                mensaje: `El producto "${productoSeleccionado.descripcion}" no tiene stock disponible.`
            });
            return;
        }

        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || productoSeleccionado.precio_efectivo;

        // Validar cantidad
        const existe = items.find(i => i.id === productoSeleccionado.id);
        const cantidadTotal = existe ? existe.cantidad + cantidad : cantidad;

        if (cantidadTotal > productoSeleccionado.stock) {
            setAlertaStock({
                titulo: 'Stock Insuficiente',
                mensaje: `No se puede agregar esa cantidad. Stock disponible: ${productoSeleccionado.stock}`
            });
            return;
        }

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
                stock: productoSeleccionado.stock,
                iva_alicuota: productoSeleccionado.iva_alicuota || 21.0
            }]);
        }

        setMensaje(null);
        limpiarCamposEntrada();
        codigoRef.current?.focus();
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
    const vuelto = parseFloat(montoPago || 0) - totalGeneral;

    const abrirModalPago = () => {
        if (items.length === 0) {
            setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un producto.' });
            return;
        }
        setMontoPago(''); // Reset or set to total
        setDatosTarjeta({ ultimos4: '', cuotas: '1' });
        setDatosCheque({ banco: '', numero: '', fechaVto: '' });
        setMostrarModalPago(true);
    };

    const seleccionarBanco = (banco) => {
        setDatosCheque({ ...datosCheque, banco: banco });
        setMostrarSugerenciasBanco(false);
        setTimeout(() => {
            const el = document.querySelector('input[placeholder="Nº Cheque"]');
            if (el) el.focus();
        }, 50);
    };

    const handleBancoKeyDown = (e) => {
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
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasBanco && bancosSugeridos.length > 0) {
                seleccionarBanco(bancosSugeridos[sugerenciaBancoActiva]);
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasBanco(false);
        }
    };

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
                        subtotal: i.subtotal,
                        neto: discriminarIVA ? (i.subtotal / (1 + (i.iva_alicuota || 21) / 100)) : i.subtotal,
                        iva_amount: discriminarIVA ? (i.subtotal - (i.subtotal / (1 + (i.iva_alicuota || 21) / 100))) : 0,
                        discriminado: discriminarIVA
                    })),
                    total_general: totalGeneral,
                    medio_pago: medioPago,
                    generar_remito: generarRemito,
                    datos_pago: {
                        monto_recibido: parseFloat(montoPago) || totalGeneral,
                        vuelto: medioPago === 'EFECTIVO' ? Math.max(0, vuelto) : 0,
                        tarjeta: datosTarjeta,
                        cheque: datosCheque
                    },
                    discriminar_iva: discriminarIVA,
                    tipo_comprobante: discriminarIVA && cliente?.condicion_fiscal === 'RI' ? 'A' : 'B'
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
                setTimeout(() => clienteInputRef.current?.focus(), 100);
            } else {
                setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar la venta.' });
            }
        } catch (err) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Intente nuevamente.' });
        } finally {
            setGuardando(false);
        }
    };

    // ==================== UI PARTS ====================

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col fade-in">
            {/* Header */}
            <div className="mb-6 flex-shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" size={32} strokeWidth={2.5} />
                        Nueva Venta
                    </h1>
                    <p className="text-slate-500 font-medium ml-10">Registrar una nueva operación de venta</p>
                </div>
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`mb-4 p-4 rounded-xl flex-shrink-0 shadow-sm border-l-4 ${mensaje.tipo === 'success' ? 'bg-white border-green-500 text-green-800' : 'bg-white border-red-500 text-red-800'}`}>
                    <div className="flex items-center gap-3">
                        {mensaje.tipo === 'success' ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                        <span className="font-medium">{mensaje.texto}</span>
                    </div>
                </div>
            )}

            {/* Layout principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* CLOUMNA IZQUIERDA (CLIENTE / PROVEEDOR / INFO) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
                    {/* Cliente Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-shrink-0">
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

                    {/* Botones de Método de Pago y Opciones */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Método de Pago</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'EFECTIVO', label: 'Efectivo', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                                { value: 'TARJETA', label: 'Tarjeta', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                                { value: 'CTACTE', label: 'Cta. Cte.', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                                { value: 'CHEQUE', label: 'Cheque', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                            ].map(({ value, label, icon: Icon, color, bg, border }) => {
                                const active = medioPago === value;
                                return (
                                    <label key={value} className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${active ? `${border} ${bg}` : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                                        <input type="radio" name="medioPago" value={value} checked={active} onChange={(e) => setMedioPago(e.target.value)} className="hidden" />
                                        <Icon size={24} className={active ? color : 'text-slate-400'} />
                                        <span className={`font-semibold text-sm ${active ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
                                        {active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current text-slate-800"></div>}
                                    </label>
                                );
                            })}
                        </div>

                        {/* Opciones ocultas controladas por Parametros */}
                    </div>
                </div>

                {/* COLUMNA DERECHA (CARRITO) */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">
                        {/* Header carrito */}
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <ShoppingCart size={18} />
                                </div>
                                <h2 className="font-bold text-slate-700">Carrito de Compras</h2>
                            </div>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                {items.length} items
                            </span>
                        </div>

                        {/* Barra de Entrada de Productos */}
                        <div className="p-5 border-b border-slate-100 bg-white flex-shrink-0 z-20">
                            <div className="grid grid-cols-12 gap-3 items-end">
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
                                    <input ref={cantidadRef} type="number" min="1" value={inputCantidad} onChange={(e) => setInputCantidad(e.target.value)} onKeyDown={handleCantidadKeyDown} className="w-full px-2 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm text-center font-bold text-slate-800" />
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
                            {items.length > 0 ? (
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
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 p-10">
                                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <ShoppingCart size={48} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Tu carrito está vacío</h3>
                                    <p className="text-slate-400 max-w-xs text-center text-sm">Escanea un código de barras o busca un producto para comenzar la venta.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Total */}
                        <div className="p-5 bg-slate-900 text-white flex-shrink-0 mt-auto rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-between items-center">
                                {discriminarIVA ? (
                                    <div className="flex items-center gap-8">
                                        <div className="space-y-0.5">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subtotal Neto</p>
                                            <p className="text-xl font-bold text-slate-200">${(totalGeneral / 1.21).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="space-y-0.5 relative">
                                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-700"></div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">IVA (21%)</p>
                                            <p className="text-xl font-bold text-slate-200">${(totalGeneral - (totalGeneral / 1.21)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
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

                    </div>
                </div>

            </div>

            {/* ==================== SCREEN OVERLAY ALERT STOCK ==================== */}
            {alertaStock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-6 border border-slate-200">
                        <div className="mx-auto bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <X size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{alertaStock.titulo}</h3>
                        <p className="text-slate-600 mb-6">{alertaStock.mensaje}</p>
                        <button
                            onClick={cerrarAlertaStock}
                            className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== MODAL DE PAGO ==================== */}
            {mostrarModalPago && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-visible animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-6 relative overflow-hidden rounded-t-3xl">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl">Completar Pago</h3>
                                    <p className="text-blue-100 text-sm mt-1">{medioPago}</p>
                                </div>
                                <button onClick={() => setMostrarModalPago(false)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">Total a Pagar</p>
                                <p className="text-5xl font-black text-slate-800 tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>

                            {/* EFECTIVO */}
                            {medioPago === 'EFECTIVO' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Monto Recibido</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                autoFocus
                                                className="w-full pl-8 pr-4 py-3 text-lg font-bold border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800"
                                                placeholder={totalGeneral.toString()}
                                                value={montoPago}
                                                onChange={(e) => setMontoPago(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && guardarVenta()}
                                            />
                                        </div>
                                    </div>

                                    {parseFloat(montoPago) > totalGeneral && (
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                                            <span className="text-green-700 font-bold">Vuelto:</span>
                                            <span className="text-xl font-black text-green-700">${(parseFloat(montoPago) - totalGeneral).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TARJETA */}
                            {medioPago === 'TARJETA' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Últimos 4 dígitos</label>
                                        <input
                                            type="text"
                                            maxLength="4"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            placeholder="XXXX"
                                            value={datosTarjeta.ultimos4}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setDatosTarjeta({ ...datosTarjeta, ultimos4: val });
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && guardarVenta()}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Cuotas</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            value={datosTarjeta.cuotas}
                                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cuotas: e.target.value })}
                                        >
                                            <option value="1">1 Cuota</option>
                                            <option value="3">3 Cuotas</option>
                                            <option value="6">6 Cuotas</option>
                                            <option value="12">12 Cuotas</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* CHEQUE */}
                            {medioPago === 'CHEQUE' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Banco</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            placeholder="Buscar banco..."
                                            value={datosCheque.banco}
                                            onChange={(e) => setDatosCheque({ ...datosCheque, banco: e.target.value })}
                                            onFocus={() => setMostrarSugerenciasBanco(true)}
                                            onKeyDown={handleBancoKeyDown}
                                        />
                                        {mostrarSugerenciasBanco && bancosSugeridos.length > 0 && (
                                            <div ref={bancoListRef} className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {bancosSugeridos.map((b, idx) => (
                                                    <div
                                                        key={b}
                                                        className={`px-4 py-2 cursor-pointer ${idx === sugerenciaBancoActiva ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}
                                                        onClick={() => seleccionarBanco(b)}
                                                    >
                                                        {b}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Número de Cheque</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            placeholder="Nº Cheque"
                                            value={datosCheque.numero}
                                            onChange={(e) => setDatosCheque({ ...datosCheque, numero: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de Cobro</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            value={datosCheque.fechaVto}
                                            onChange={(e) => setDatosCheque({ ...datosCheque, fechaVto: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setMostrarModalPago(false)}
                                    className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarVenta}
                                    disabled={guardando}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {guardando ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Check size={20} strokeWidth={3} />
                                            Confirmar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevaVenta;
