import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, User, ShoppingCart, FileText, X, Check, ClipboardList, Save, AlertTriangle } from 'lucide-react';
import { BtnSave, BtnCancel } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';

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

const AutoFocusInput = ({ onKeyDownNext, ...props }) => {
    const inputRef = useRef(null);
    useLayoutEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            requestAnimationFrame(() => inputRef.current?.focus());
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, []);
    return <input ref={inputRef} {...props} />;
};

const NuevoPedido = () => {
    const navigate = useNavigate();

    // ==================== STATE ====================
    const [cliente, setCliente] = useState(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
    const [sugerenciaClienteActiva, setSugerenciaClienteActiva] = useState(0);

    // Campos de entrada de producto
    // ==================== PRODUCT SEARCH HOOK ====================
    const {
        inputCodigo, setInputCodigo,
        inputProducto, setInputProducto,
        codigosSugeridos, productosSugeridos,
        mostrarSugerenciasCodigo, mostrarSugerenciasProducto,
        sugerenciaCodigoActiva, sugerenciaActiva,
        codigoListRef, productoListRef,
        nextInputRef: productoRef,
        handleCodigoKeyDown, handleProductoKeyDown,
        handleCodigoBlur, handleProductoBlur,
        seleccionar: seleccionarProducto,
        limpiar: limpiarBusqueda
    } = useProductSearch({
        onSelect: (producto) => {
            setProductoSeleccionado(producto);
            setInputPrecio(producto.precio_efectivo.toString());
            setTimeout(() => cantidadRef.current?.select(), 50);
        }
    });

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputPrecio, setInputPrecio] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [items, setItems] = useState([]);
    const [observaciones, setObservaciones] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // Modal Stock Custom
    const [modalStockOpen, setModalStockOpen] = useState(false);
    const [productoPendiente, setProductoPendiente] = useState(null);

    // Referencias
    const codigoRef = useRef(null);
    // productoRef (from hook)
    const cantidadRef = useRef(null);
    const clienteInputRef = useRef(null);

    // Referencias para scroll automático en listas
    const clienteListRef = useRef(null);
    // codigoListRef (from hook)
    // productoListRef (from hook)

    // ==================== FOCUS INICIAL ====================
    useEffect(() => {
        setTimeout(() => clienteInputRef.current?.focus(), 100);
    }, []);

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

    // ==================== AGREGAR PRODUCTO A LA LISTA ====================
    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;

        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || productoSeleccionado.precio_efectivo;

        // Verificar stock
        const existe = items.find(i => i.id === productoSeleccionado.id);
        const cantidadTotal = existe ? existe.cantidad + cantidad : cantidad;

        if (cantidadTotal > productoSeleccionado.stock) {
            // Abrir Modal Stock Custom
            setProductoPendiente({
                producto: productoSeleccionado,
                cantidad,
                precio,
                existe
            });
            setModalStockOpen(true);
            return;
        }

        encolarProducto(productoSeleccionado, cantidad, precio, existe);
    };

    const encolarProducto = (prod, cant, prec, exist) => {
        if (exist) {
            setItems(items.map(i =>
                i.id === prod.id
                    ? { ...i, cantidad: i.cantidad + cant, subtotal: (i.cantidad + cant) * i.precio }
                    : i
            ));
        } else {
            setItems([...items, {
                id: prod.id,
                codigo: prod.codigo,
                descripcion: prod.descripcion,
                precio: prec,
                cantidad: cant,
                subtotal: cant * prec,
                stock: prod.stock
            }]);
        }

        setMensaje(null);
        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const confirmarAgregarStock = () => {
        if (productoPendiente) {
            encolarProducto(
                productoPendiente.producto,
                productoPendiente.cantidad,
                productoPendiente.precio,
                productoPendiente.existe
            );
        }
        setModalStockOpen(false);
        setProductoPendiente(null);
    };

    const cancelarAgregarStock = () => {
        setModalStockOpen(false);
        setProductoPendiente(null);
        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const limpiarCamposEntrada = () => {
        limpiarBusqueda();
        setInputCantidad('1');
        setInputPrecio('');
        setProductoSeleccionado(null);
    };

    // ==================== MANEJO DE TECLAS - CÓDIGO/PRODUCTO ====================
    // Handlers removed (handled by hook)

    const handleCantidadKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarProductoALista();
        }
    };

    // ==================== ACCIONES ITEM ====================
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

    // ==================== GUARDAR PEDIDO ====================
    const guardarPedido = async () => {
        if (items.length === 0) {
            setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un producto.' });
            return;
        }
        if (!cliente) {
            setMensaje({ tipo: 'error', texto: 'Debe seleccionar un cliente.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);

        try {
            const payload = {
                cliente_id: cliente.id,
                detalles: items.map(p => ({
                    producto_id: p.id,
                    cantidad: p.cantidad,
                    precio_unitario: p.precio
                })),
                observaciones: observaciones
            };

            const response = await fetch('/api/pedidos/crear/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.ok) {
                // Éxito
                setItems([]);
                setCliente(null);
                setObservaciones('');
                setMensaje({ tipo: 'success', texto: `Pedido #${data.id} creado correctamente.` });
                setTimeout(() => navigate('/pedidos'), 1500);
            } else {
                setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar el pedido.' });
            }
        } catch (err) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión.' });
        } finally {
            setGuardando(false);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col fade-in">
            {/* Header */}
            <div className="mb-6 flex-shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <ClipboardList className="text-blue-600" size={32} strokeWidth={2.5} />
                        Nuevo Pedido
                    </h1>
                    <p className="text-slate-500 font-medium ml-10">Registrar un nuevo pedido de cliente</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/pedidos')}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <div className="hidden md:block">
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                            Modo Pedido
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`mb-4 p-4 rounded-xl flex-shrink-0 shadow-sm border-l-4 ${mensaje.tipo === 'success'
                    ? 'bg-white border-green-500 text-green-800'
                    : 'bg-white border-red-500 text-red-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        {mensaje.tipo === 'success' ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                        <span className="font-medium">{mensaje.texto}</span>
                    </div>
                </div>
            )}

            {/* Layout principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* =============== COLUMNA IZQUIERDA (4 cols) =============== */}
                <div
                    className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>
                        {`
                            .lg\\:col-span-4::-webkit-scrollbar {
                                display: none;
                            }
                        `}
                    </style>

                    {/* Cliente Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex-shrink-0 group">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
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
                                <div ref={clienteListRef} className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden ring-1 ring-black/5">
                                    {clientesSugeridos.map((c, idx) => (
                                        <div
                                            key={c.id}
                                            onClick={() => seleccionarCliente(c)}
                                            className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 flex items-center justify-between ${idx === sugerenciaClienteActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800">{c.nombre}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{c.cuit || 'Sin CUIT'}</div>
                                            </div>
                                            {idx === sugerenciaClienteActiva && <div className="text-blue-500"><Check size={16} /></div>}
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
                                {/* Decoration */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2 text-slate-400 px-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span className="text-sm font-medium">Consumidor Final seleccionado por defecto</span>
                            </div>
                        )}
                    </div>

                    {/* Observaciones Card - Replaces Payment Methods */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex-shrink-0 group flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <FileText size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Observaciones</h2>
                        </div>
                        <textarea
                            className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm text-slate-700"
                            placeholder="Notas o detalles adicionales del pedido..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                    </div>

                </div>

                {/* =============== COLUMNA DERECHA (8 cols) - PRODUCTOS =============== */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">

                        {/* Header + Tooltip */}
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <ShoppingCart size={18} />
                                </div>
                                <h2 className="font-bold text-slate-700">Carrito de Pedido</h2>
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
                                    {/* Dropdown Código */}
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
                                    {/* Dropdown Producto */}
                                    {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                        <div ref={productoListRef} className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                                            {productosSugeridos.map((p, idx) => (
                                                <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 flex justify-between items-center ${idx === sugerenciaActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="font-bold text-slate-700 text-sm truncate">{p.descripcion}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                            <span className="bg-slate-100 px-1.5 rounded font-mono text-slate-500">{p.codigo}</span>
                                                            {p.stock <= 5 && <span className="text-amber-500 font-bold">¡Poco Stock: {p.stock}!</span>}
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
                                            <th className="px-6 py-3 text-right w-32">Precio</th>
                                            <th className="px-6 py-3 text-right w-32">Subtotal</th>
                                            <th className="px-6 py-3 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{item.codigo}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">{item.descripcion}</p>
                                                    {item.cantidad > item.stock && <p className="text-xs text-amber-600 flex items-center gap-1 mt-1"><AlertTriangle size={12} /> Supera Stock ({item.stock})</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center bg-slate-100 rounded-lg p-1 w-fit mx-auto">
                                                        <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-white hover:text-red-500 transition-colors disabled:opacity-50">-</button>
                                                        <span className="w-8 text-center font-bold text-slate-700 text-xs">{item.cantidad}</span>
                                                        <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-white hover:text-green-600 transition-colors">+</button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-600 font-medium">${item.precio.toLocaleString('es-AR')}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800">${item.subtotal.toLocaleString('es-AR')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 p-10">
                                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <ShoppingCart size={48} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Tu carrito está vacío</h3>
                                    <p className="text-slate-400 max-w-xs text-center text-sm">Escanea un código de barras o busca un producto para comenzar.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Total - DARK STYLE */}
                        <div className="p-5 bg-slate-900 text-white flex-shrink-0 mt-auto rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Estimado</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                        <span className="text-slate-400 font-light">ARS</span>
                                    </div>
                                </div>
                                <BtnSave
                                    label="Guardar Pedido"
                                    onClick={guardarPedido}
                                    loading={guardando}
                                    disabled={items.length === 0 || guardando}
                                    className="px-8 py-4 rounded-xl font-bold text-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal de Stock */}
            {modalStockOpen && productoPendiente && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Advertencia de Stock</h3>
                            <p className="text-slate-600 mb-6">
                                El producto <span className="font-bold text-slate-800">"{productoPendiente.producto.descripcion}"</span> no tiene stock suficiente.
                                <br />
                                <span className="text-sm mt-2 block bg-amber-50 text-amber-700 py-1 px-2 rounded-lg inline-block">
                                    Stock Disponible: {productoPendiente.producto.stock}
                                </span>
                            </p>

                            <div className="flex gap-3 w-full">
                                <BtnCancel
                                    onClick={cancelarAgregarStock}
                                    className="flex-1"
                                />
                                <BtnSave
                                    label="Agregar Igual"
                                    onClick={confirmarAgregarStock}
                                    className="flex-1 justify-center bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevoPedido;
