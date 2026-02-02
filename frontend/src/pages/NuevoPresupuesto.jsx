import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Trash2, User, ShoppingCart, FileText, X, Check,
    Zap, ArrowLeft, Target, ChevronRight, LayoutGrid, Activity, Package,
    BadgePercent, Ban, ClipboardList, Save, AlertTriangle, Briefcase, Clock, MessageSquare
} from 'lucide-react';
import { BtnSave, BtnCancel, BtnBack } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';
import { cn } from '../utils/cn';
import { showWarningAlert, showSuccessAlert, showConfirmationAlert } from '../utils/alerts';

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

const NuevoPresupuesto = () => {
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
            const precioStr = producto.precio_efectivo.toString();
            setInputPrecio(precioStr);
            setInputCantidad('1');

            if (config.comportamiento_codigo_barras === 'DIRECTO') {
                // Ingreso Rápido: Agregar inmediatamente
                setTimeout(() => {
                    handleAutoAdd(producto, 1, parseFloat(precioStr));
                }, 50);
            } else if (config.comportamiento_codigo_barras === 'CANTIDAD') {
                // Saltar a Cantidad
                setTimeout(() => cantidadRef.current?.select(), 50);
            }
        }
    });

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputPrecio, setInputPrecio] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [items, setItems] = useState([]);
    const [observaciones, setObservaciones] = useState('');
    const [validez, setValidez] = useState(15);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [cargandoConfig, setCargandoConfig] = useState(true);
    const [config, setConfig] = useState({
        auto_foco_codigo_barras: false,
        comportamiento_codigo_barras: 'DEFAULT'
    });

    // Referencias
    const codigoRef = useRef(null);
    const cantidadRef = useRef(null);
    const clienteInputRef = useRef(null);
    const clienteListRef = useRef(null);

    // ==================== CONFIGURACIÓN ====================
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/obtener/');
                const data = await response.json();
                setConfig({
                    auto_foco_codigo_barras: data.auto_foco_codigo_barras || false,
                    comportamiento_codigo_barras: data.comportamiento_codigo_barras || 'DEFAULT'
                });
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setCargandoConfig(false);
            }
        };
        fetchConfig();

        // Verificar si venimos de un clon
        const params = new URLSearchParams(window.location.search);
        if (params.get('clon') === 'true') {
            const saved = localStorage.getItem('clone_presupuesto');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.cliente && data.cliente.id) setCliente(data.cliente);
                    if (data.items) setItems(data.items);
                    if (data.observaciones) setObservaciones(data.observaciones);
                    localStorage.removeItem('clone_presupuesto');
                    showSuccessAlert('Presupuesto Duplicado', 'Se han cargado los ítems del presupuesto anterior.');
                } catch (e) {
                    console.error("Error al cargar clon:", e);
                }
            }
        }
    }, []);

    // ==================== FOCUS INICIAL ====================
    useEffect(() => {
        if (!cargandoConfig) {
            setTimeout(() => {
                if (config.auto_foco_codigo_barras) {
                    codigoRef.current?.focus();
                } else {
                    clienteInputRef.current?.focus();
                }
            }, 300);
        }
    }, [cargandoConfig, config]);

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
    const handleAutoAdd = (producto, cantidad, precio) => {
        if (!producto) return;
        encolarProducto(producto, cantidad, precio);
    };

    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;

        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || productoSeleccionado.precio_efectivo;

        encolarProducto(productoSeleccionado, cantidad, precio);
    };

    const encolarProducto = (prod, cant, prec) => {
        const existe = items.find(i => i.id === prod.id);

        if (existe) {
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
    const totalNeto = totalGeneral / 1.21;
    const totalIVA = totalGeneral - totalNeto;

    const guardarPresupuesto = async () => {
        if (items.length === 0) {
            showWarningAlert('Carrito Vacío', 'Debe agregar al menos un producto.');
            return;
        }

        setGuardando(true);

        try {
            const payload = {
                cliente_id: cliente ? cliente.id : null,
                items: items.map(p => ({
                    id: p.id,
                    descripcion: p.descripcion,
                    cantidad: p.cantidad,
                    precio: p.precio,
                    subtotal: p.subtotal
                })),
                total: totalGeneral,
                validez: validez,
                observaciones: observaciones
            };

            const response = await fetch('/api/presupuesto/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.ok) {
                showSuccessAlert('Presupuesto Guardado', `Operación #${data.presupuesto_id || ''} procesada con éxito.`);
                setItems([]);
                setCliente(null);
                setObservaciones('');
                setTimeout(() => navigate('/presupuestos'), 1500);
            } else {
                showWarningAlert('Error', data.error || 'Error al guardar el presupuesto.');
            }
        } catch (err) {
            showWarningAlert('Error', 'Error de conexión.');
        } finally {
            setGuardando(false);
        }
    };

    const cancelarPresupuesto = () => {
        showConfirmationAlert(
            '¿Cancelar Presupuesto?',
            'Se borrarán todos los items cargados actualmente.',
            'SÍ, CANCELAR',
            'danger',
            { cancelText: 'NO, VOLVER' }
        ).then((result) => {
            if (result.isConfirmed) {
                setItems([]);
                setCliente(null);
                setObservaciones('');
                limpiarCamposEntrada();
                showSuccessAlert('Presupuesto Cancelado', 'Se ha reiniciado el formulario.');
            }
        });
    };

    return (
        <div className="p-3 lg:p-4 max-w-[1900px] mx-auto space-y-3 animate-in fade-in duration-500 h-full bg-slate-50 flex flex-col overflow-hidden relative">

            {/* Top Bar - Ultra High Z-Index for Cliente Search */}
            <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-neutral-200 shadow-sm flex-shrink-0 relative z-[200]">
                <div className="flex items-center gap-3 pr-4 border-r border-neutral-100">
                    <button
                        onClick={() => navigate('/presupuestos')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all font-black text-[10px] shadow-lg shadow-red-500/20 uppercase tracking-widest group"
                    >
                        <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                        Volver
                    </button>
                    <h1 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-2 m-0 uppercase">
                        Presupuesto <Briefcase size={14} className="text-blue-600" />
                    </h1>
                </div>

                {/* Cliente Selector */}
                <div className="flex-1 max-w-sm relative overflow-visible">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            ref={clienteInputRef}
                            type="text"
                            placeholder="Buscar Cliente..."
                            value={busquedaCliente}
                            onChange={(e) => setBusquedaCliente(e.target.value)}
                            onKeyDown={handleClienteKeyDown}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold"
                        />
                    </div>
                    {mostrarSugerenciasCliente && clientesSugeridos.length > 0 && (
                        <div ref={clienteListRef} className="absolute z-[300] top-full left-0 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-2xl p-1 animate-in slide-in-from-top-2">
                            {clientesSugeridos.map((c, idx) => (
                                <div key={c.id} onClick={() => seleccionarCliente(c)} className={cn("px-4 py-3 cursor-pointer rounded-lg text-xs font-bold transition-all", idx === sugerenciaClienteActiva ? "bg-primary-600 text-white shadow-lg translate-x-1" : "hover:bg-neutral-50")}>
                                    <div className="flex justify-between items-center">
                                        <span>{c.nombre}</span>
                                        <span className={cn("text-[8px] px-1.5 py-0.5 rounded ml-2", idx === sugerenciaClienteActiva ? "bg-white/20" : "bg-neutral-100 text-neutral-500")}>
                                            {c.cuit || 'S/C'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cliente ? (
                    <div className="flex items-center gap-3 bg-primary-600 text-white px-4 py-2 rounded-xl animate-in zoom-in-95 shadow-lg shadow-primary-600/20">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{cliente.nombre}</span>
                            <span className="text-[8px] font-bold text-primary-200 uppercase mt-0.5">{cliente.cuit || 'Consumidor Final'}</span>
                        </div>
                        <button onClick={() => setCliente(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X size={14} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-500 rounded-xl border border-neutral-200 animate-in fade-in duration-300">
                        <User size={14} className="opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cliente de Paso</span>
                    </div>
                )}

                <div className="flex items-center gap-4 px-4 border-l border-neutral-100">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-neutral-400" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Validez</span>
                        <input
                            type="number"
                            value={validez}
                            onChange={(e) => setValidez(e.target.value)}
                            className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                        />
                        <span className="text-[10px] font-bold text-neutral-400">Días</span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <MessageSquare size={14} className="text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Observaciones..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-full px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                        />
                    </div>

                    {items.length > 0 && (
                        <button
                            onClick={cancelarPresupuesto}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black bg-error-50 text-error-700 border border-error-200 hover:bg-error-100 transition-all shadow-sm"
                        >
                            <Ban size={14} /> CANCELAR
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-6 ml-auto border-l border-neutral-100 pl-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Items</span>
                        <span className="text-base font-black text-neutral-900">{items.length}</span>
                    </div>
                    <div className="flex flex-col pr-4">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Unidades</span>
                        <span className="text-base font-black text-neutral-900">{items.reduce((a, b) => a + b.cantidad, 0)}</span>
                    </div>
                </div>
            </div>

            {/* Terminal Main Body - Medium Z-Index for Product Search */}
            <div className="flex-1 bg-white rounded-3xl shadow-premium border border-neutral-200 flex flex-col overflow-hidden relative z-[50]">

                {/* Search Inputs Bar */}
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex-shrink-0 relative z-[100] overflow-visible">
                    <div className="grid grid-cols-12 gap-4 items-end overflow-visible">
                        <div className="col-span-2 relative overflow-visible">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1">CÓDIGO</label>
                            <input
                                ref={codigoRef}
                                type="text"
                                value={inputCodigo}
                                onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                onKeyDown={handleCodigoKeyDown}
                                onBlur={handleCodigoBlur}
                                placeholder="----"
                                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-mono font-bold text-center text-primary-600 shadow-sm text-lg"
                            />
                            {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                <div ref={codigoListRef} className="absolute z-[150] top-full left-0 mt-2 w-[220%] bg-white border border-neutral-200 rounded-2xl shadow-2xl p-1 animate-in slide-in-from-top-2">
                                    {codigosSugeridos.map((p, idx) => (
                                        <div key={p.id} onClick={() => seleccionarProducto(p)} className={cn("px-4 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all", idx === sugerenciaCodigoActiva ? "bg-primary-600 text-white shadow-lg scale-[1.02]" : "hover:bg-neutral-50")}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tight">{p.codigo}</span>
                                                <span className={cn("text-[9px] font-bold uppercase", idx === sugerenciaCodigoActiva ? "text-primary-100" : "text-neutral-400")}>{p.descripcion}</span>
                                            </div>
                                            <span className="text-base font-black">${p.precio_efectivo}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-7 relative overflow-visible">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1">PRODUCTO / CONCEPTO</label>
                            <input
                                ref={productoRef}
                                type="text"
                                value={inputProducto}
                                onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                onKeyDown={handleProductoKeyDown}
                                onBlur={handleProductoBlur}
                                placeholder="Escriba para buscar..."
                                className="w-full px-5 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-neutral-800 shadow-sm text-lg"
                            />
                            {mostrarSugerenciasProducto && (
                                <div ref={productoListRef} className="absolute z-[150] top-full left-0 w-full mt-2 bg-white border border-neutral-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-1 scrollbar-thin animate-in slide-in-from-top-2">
                                    {productosSugeridos.map((p, idx) => (
                                        <div key={p.id} onClick={() => seleccionarProducto(p)} className={cn("px-5 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all", idx === sugerenciaActiva ? "bg-primary-50 border-l-4 border-primary-600 shadow-sm" : "hover:bg-neutral-50")}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black uppercase text-neutral-800 tracking-tight">{p.descripcion}</span>
                                                <span className="text-[10px] font-black text-neutral-400 font-mono">{p.codigo} - STOCK: {p.stock}</span>
                                            </div>
                                            <span className="text-lg font-black text-neutral-900">${p.precio_efectivo.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1 text-center">CANT.</label>
                            <input
                                ref={cantidadRef}
                                type="number"
                                value={inputCantidad}
                                onChange={(e) => setInputCantidad(e.target.value)}
                                onKeyDown={handleCantidadKeyDown}
                                className="w-full py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-center font-black text-neutral-900 text-lg"
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                onClick={agregarProductoALista}
                                disabled={!productoSeleccionado}
                                className={cn(
                                    "w-full h-[52px] rounded-xl flex items-center justify-center transition-all shadow-lg",
                                    productoSeleccionado ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-primary-600/20" : "bg-neutral-100 text-neutral-300"
                                )}
                            >
                                <Plus size={24} strokeWidth={4} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Table Area */}
                <div className={cn("flex-1 min-h-0 bg-white relative z-10 flex flex-col", items.length > 0 ? "overflow-y-auto" : "overflow-hidden")}>
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-neutral-50 z-20 border-b border-neutral-200">
                            <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-1.5 text-left w-32">REF</th>
                                <th className="px-6 py-1.5 text-left">DETALLE DEL PRODUCTO</th>
                                <th className="px-6 py-1.5 text-center w-36">CANTIDAD</th>
                                <th className="px-6 py-1.5 text-right w-36">PRECIO UNIT.</th>
                                <th className="px-6 py-1.5 text-right w-44">SUBTOTAL</th>
                                <th className="px-6 py-1.5 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {items.map((item) => (
                                <tr key={item.id} className="group hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-1 font-mono text-xs font-bold text-neutral-400 whitespace-nowrap">{item.codigo}</td>
                                    <td className="px-6 py-1">
                                        <p className="font-black text-sm text-neutral-800 uppercase tracking-tight">{item.descripcion}</p>
                                    </td>
                                    <td className="px-6 py-1">
                                        <div className="flex items-center justify-center bg-white border border-neutral-200 rounded-xl p-1 w-fit mx-auto shadow-sm">
                                            <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-error-600 font-black text-lg">-</button>
                                            <span className="w-10 text-center font-black text-sm text-neutral-900">{item.cantidad}</span>
                                            <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-success-600 font-black text-lg">+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-1 text-right font-bold text-xs text-neutral-500">${item.precio.toLocaleString()}</td>
                                    <td className="px-6 py-1 text-right">
                                        <span className="inline-block px-4 py-1.5 bg-neutral-900 text-white rounded-xl font-black text-base tracking-tighter">
                                            ${item.subtotal.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-1 text-center">
                                        <button onClick={() => eliminarItem(item.id)} className="p-2 text-neutral-300 hover:text-error-500 opacity-50 hover:opacity-100 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <div className="flex-grow flex flex-col items-center justify-center gap-4 opacity-20">
                            <ShoppingCart size={64} strokeWidth={1} />
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500">Terminal Aguardando Artículos</span>
                        </div>
                    )}
                </div>

                {/* Footer - Stays at bottom but doesn't block dropdowns */}
                <div className="p-4 px-8 bg-neutral-950 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex-shrink-0 relative z-20 border-t border-white/5">
                    <div className="flex items-center gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">Subtotal Neto</p>
                            <p className="text-xl font-black text-neutral-100 tracking-tighter">${totalNeto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">IVA Total (21%)</p>
                            <p className="text-xl font-black text-primary-200 tracking-tighter">${totalIVA.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-success-500 uppercase tracking-[0.3em] mb-2">Total Presupuestado</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-success-500 tracking-tighter select-none shadow-glow-success-lg">${totalGeneral.toLocaleString()}</span>
                                <span className="text-success-800 text-xs font-black font-mono uppercase">Ars</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={guardarPresupuesto}
                        disabled={items.length === 0 || guardando}
                        className={cn(
                            "px-14 py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] flex items-center gap-4 transition-all group active:scale-95 shadow-xl",
                            items.length > 0
                                ? "bg-primary-600 text-white hover:bg-primary-500 shadow-primary-600/40 hover:-translate-y-2"
                                : "bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5"
                        )}
                    >
                        {guardando ? "PROCESANDO" : "GUARDAR PRESUPUESTO"} <ChevronRight size={24} strokeWidth={4} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NuevoPresupuesto;
