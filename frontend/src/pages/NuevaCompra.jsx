// Nueva Compra - Intelligent Pro Terminal 2025
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Trash2, ShoppingCart, Truck,
    Check, X, Zap, ArrowLeft, Target, ChevronRight,
    LayoutGrid, Activity, Package, BadgePercent, FileText, Ban, Clock
} from 'lucide-react';
import { showWarningAlert, showSuccessAlert, showConfirmationAlert } from '../utils/alerts';
import { useProductSearch } from '../hooks/useProductSearch';
import PaymentModal from '../components/common/PaymentModal';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formats';

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

const NuevaCompra = () => {
    const navigate = useNavigate();

    // REFS
    const codigoRef = useRef(null);
    const proveedorInputRef = useRef(null);
    const cantidadRef = useRef(null);
    const costoRef = useRef(null);

    // STATE
    const [proveedor, setProveedor] = useState(null);
    const [busquedaProveedor, setBusquedaProveedor] = useState('');
    const [proveedoresSugeridos, setProveedoresSugeridos] = useState([]);
    const [mostrarSugerenciasProveedor, setMostrarSugerenciasProveedor] = useState(false);
    const [sugerenciaProveedorActiva, setSugerenciaProveedorActiva] = useState(0);

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputCosto, setInputCosto] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [items, setItems] = useState([]);
    const [medioPago, setMedioPago] = useState('EFECTIVO');
    const [discriminarIVA, setDiscriminarIVA] = useState(false);
    const [recepcionarInmediatamente, setRecepcionarInmediatamente] = useState(false);
    const [nroComprobante, setNroComprobante] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mostrarModalPago, setMostrarModalPago] = useState(false);

    const [config, setConfig] = useState({
        auto_foco_codigo_barras: false,
        comportamiento_lector_compras: 'DEFAULT'
    });

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
        seleccionar,
        limpiar
    } = useProductSearch({
        onSelect: (producto) => {
            setProductoSeleccionado(producto);
            setInputCosto(producto.costo ? producto.costo.toString() : '');
            setInputCantidad('1');
            if (config.comportamiento_lector_compras === 'DIRECTO' && producto.costo > 0) {
                setTimeout(() => handleAutoAdd(producto, 1, producto.costo), 50);
            } else {
                setTimeout(() => cantidadRef.current?.select(), 50);
            }
        }
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/obtener/');
                const data = await response.json();
                setConfig({
                    auto_foco_codigo_barras: data.auto_foco_codigo_barras || false,
                    comportamiento_lector_compras: data.comportamiento_lector_compras || 'DEFAULT',
                    discriminar_iva_compras: data.discriminar_iva_compras || false
                });
                setDiscriminarIVA(data.discriminar_iva_compras || false);
            } catch (err) { console.error(err); }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (config.auto_foco_codigo_barras) codigoRef.current?.focus();
            else proveedorInputRef.current?.focus();
        }, 400);
    }, [config]);

    // Buscar Proveedores
    useEffect(() => {
        if (!busquedaProveedor || busquedaProveedor.length < 2) {
            setProveedoresSugeridos([]); setMostrarSugerenciasProveedor(false); return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/proveedores/buscar/?q=${encodeURIComponent(busquedaProveedor)}`);
                const data = await res.json();
                setProveedoresSugeridos(data || []);
                setMostrarSugerenciasProveedor((data || []).length > 0);
            } catch (err) { console.error(err); }
        }, 300);
        return () => clearTimeout(timer);
    }, [busquedaProveedor]);

    const seleccionarProveedor = (p) => {
        setProveedor(p); setBusquedaProveedor(''); setMostrarSugerenciasProveedor(false);
        setTimeout(() => codigoRef.current?.focus(), 100);
    };

    const handleProveedorKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSugerenciaProveedorActiva(prev => Math.min(prev + 1, proveedoresSugeridos.length - 1));
        } else if (e.key === 'ArrowUp') {
            setSugerenciaProveedorActiva(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && proveedoresSugeridos.length > 0) {
            seleccionarProveedor(proveedoresSugeridos[sugerenciaProveedorActiva]);
        }
    };

    const handleAutoAdd = (producto, cantidad, costo) => {
        if (!producto) return;
        const finalCosto = parseFloat(costo) || 0;
        if (finalCosto <= 0) {
            showWarningAlert('Atención', 'El costo debe ser mayor a 0');
            setTimeout(() => costoRef.current?.focus(), 100);
            return;
        }
        const existe = items.find(i => i.id === producto.id);
        if (existe) {
            setItems(prev => prev.map(i =>
                i.id === producto.id
                    ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * finalCosto, costo: finalCosto }
                    : i
            ));
        } else {
            setItems(prev => [...prev, {
                id: producto.id,
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                costo: finalCosto,
                cantidad: cantidad,
                subtotal: cantidad * finalCosto,
                iva_alicuota: producto.iva_alicuota || 21.0
            }]);
        }
        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const limpiarCamposEntrada = () => {
        limpiar(); setInputCantidad('1'); setInputCosto(''); setProductoSeleccionado(null);
    };

    const cancelarOperacion = () => {
        showConfirmationAlert(
            '¿Cancelar Compra?',
            'Se borrarán todos los items cargados.',
            'SÍ, CANCELAR',
            'danger'
        ).then((result) => {
            if (result.isConfirmed) {
                setItems([]); setProveedor(null); setNroComprobante('');
                limpiarCamposEntrada();
                setTimeout(() => proveedorInputRef.current?.focus(), 50);
            }
        });
    };

    const cambiarCantidad = (id, nueva) => {
        if (nueva < 1) return;
        setItems(items.map(i => i.id === id ? { ...i, cantidad: nueva, subtotal: nueva * i.costo } : i));
    };

    const guardarCompra = async (paymentData) => {
        if (!proveedor) return showWarningAlert('Atención', 'Debe seleccionar un proveedor');
        setGuardando(true);
        try {
            const totalGen = items.reduce((a, b) => a + b.subtotal, 0) + (paymentData.percepcion_iva || 0) + (paymentData.percepcion_iibb || 0);

            const res = await fetch('/api/compras/orden/guardar/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                body: JSON.stringify({
                    proveedor: proveedor.id,
                    items: items.map(i => ({
                        producto_id: i.id, cantidad: i.cantidad, precio: i.costo, iva_alicuota: i.iva_alicuota
                    })),
                    observaciones: `Terminal Compras - ${paymentData.metodo_pago}`,
                    nro_comprobante: nroComprobante || 'S/N',
                    condicion_pago: paymentData.metodo_pago,
                    total_estimado: totalGen,
                    recepcionar: recepcionarInmediatamente,
                    datos_pago: paymentData
                })
            });
            const data = await res.json();
            if (data.ok) {
                showSuccessAlert('Compra Exitosa', `Orden #${data.orden_id} registrada.`);
                setItems([]); setProveedor(null); setNroComprobante(''); setMostrarModalPago(false);
                setTimeout(() => proveedorInputRef.current?.focus(), 500);
            } else throw new Error(data.error);
        } catch (err) {
            showWarningAlert('Error', err.message || 'Error de conexión');
        } finally { setGuardando(false); }
    };

    const totalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);
    const totalNeto = items.reduce((acc, i) => acc + (i.subtotal / (1 + (i.iva_alicuota || 21) / 100)), 0);
    const totalIVA = totalGeneral - totalNeto;

    return (
        <div className="p-3 lg:p-4 max-w-[1900px] mx-auto space-y-3 animate-in fade-in duration-500 h-full bg-slate-50 flex flex-col overflow-hidden relative">

            {/* Top Bar */}
            <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-neutral-200 shadow-sm flex-shrink-0 relative z-[200]">
                <div className="flex items-center gap-3 pr-4 border-r border-neutral-100">
                    <button
                        onClick={() => navigate('/compras')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all font-black text-[10px] shadow-lg shadow-red-500/20 uppercase tracking-widest group"
                    >
                        <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                        Volver
                    </button>
                    <h1 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-2 m-0 uppercase">
                        Compras <Truck size={14} className="text-primary-600" />
                    </h1>
                </div>

                {/* Proveedor Selector */}
                <div className="flex-1 max-w-sm relative overflow-visible">
                    <input
                        ref={proveedorInputRef}
                        type="text"
                        placeholder="Buscar Proveedor..."
                        value={busquedaProveedor}
                        onChange={(e) => setBusquedaProveedor(e.target.value)}
                        onKeyDown={handleProveedorKeyDown}
                        className="w-full pl-4 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold"
                    />
                    {mostrarSugerenciasProveedor && (
                        <div className="absolute z-[300] top-full left-0 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-2xl p-1 animate-in slide-in-from-top-2">
                            {proveedoresSugeridos.map((p, idx) => (
                                <div key={p.id} onClick={() => seleccionarProveedor(p)} className={cn("px-4 py-3 cursor-pointer rounded-lg text-xs font-bold transition-all", idx === sugerenciaProveedorActiva ? "bg-primary-600 text-white shadow-lg translate-x-1" : "hover:bg-neutral-50")}>
                                    <div className="flex justify-between items-center">
                                        <span>{p.nombre}</span>
                                        <span className={cn("text-[8px] px-1.5 py-0.5 rounded ml-2", idx === sugerenciaProveedorActiva ? "bg-white/20" : "bg-neutral-100 text-neutral-500")}>
                                            {p.cuit || 'S/D'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {proveedor && (
                    <div className="flex items-center gap-3 bg-indigo-600 text-white px-4 py-2 rounded-xl animate-in zoom-in-95 shadow-lg shadow-indigo-600/20">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{proveedor.nombre}</span>
                            <span className="text-[8px] font-bold text-indigo-200 uppercase mt-0.5">{proveedor.cuit}</span>
                        </div>
                        <button onClick={() => setProveedor(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X size={14} /></button>
                    </div>
                )}

                <div className="flex items-center gap-2 px-4 border-l border-neutral-100">
                    <div className="relative group">
                        <input
                            type="text"
                            value={nroComprobante}
                            onChange={(e) => setNroComprobante(e.target.value)}
                            placeholder="Nro Comprobante"
                            className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-[10px] font-black focus:ring-2 focus:ring-primary-500 outline-none w-32"
                        />
                    </div>
                    <button
                        onClick={() => setDiscriminarIVA(!discriminarIVA)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all border",
                            discriminarIVA ? "bg-primary-50 text-primary-700 border-primary-200" : "bg-neutral-50 text-neutral-400 border-neutral-200"
                        )}
                    >
                        <BadgePercent size={14} />
                        IVA {discriminarIVA ? 'ON' : 'OFF'}
                    </button>
                    <button
                        onClick={() => setRecepcionarInmediatamente(!recepcionarInmediatamente)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all border",
                            recepcionarInmediatamente ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-400 border-neutral-200"
                        )}
                        title="Impacta stock directamente al guardar"
                    >
                        <Package size={14} />
                        RECIBIR AHORA {recepcionarInmediatamente ? 'ON' : 'OFF'}
                    </button>
                    {items.length > 0 && (
                        <button onClick={cancelarOperacion} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black bg-error-50 text-error-700 border border-error-200 hover:bg-error-100 transition-all shadow-sm">
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

            {/* Terminal Main Body */}
            <div className="flex-1 bg-white rounded-3xl shadow-premium border border-neutral-200 flex flex-col overflow-hidden relative z-[50]">

                {/* Entry Row */}
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex-shrink-0 relative z-[100]">
                    <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-2 relative">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1">CÓDIGO (F4)</label>
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
                                        <div key={p.id} onClick={() => seleccionar(p)} className={cn("px-4 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all", idx === sugerenciaCodigoActiva ? "bg-primary-600 text-white shadow-lg scale-[1.02]" : "hover:bg-neutral-50")}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tight">{p.codigo}</span>
                                                <span className={cn("text-[9px] font-bold uppercase", idx === sugerenciaCodigoActiva ? "text-primary-100" : "text-neutral-400")}>{p.descripcion}</span>
                                            </div>
                                            <span className="text-base font-black">${p.costo || p.precio_efectivo}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-6 relative">
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
                                        <div key={p.id} onClick={() => seleccionar(p)} className={cn("px-5 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all", idx === sugerenciaActiva ? "bg-primary-50 border-l-4 border-primary-600 shadow-sm" : "hover:bg-neutral-50")}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black uppercase text-neutral-800 tracking-tight">{p.descripcion}</span>
                                                <span className="text-[10px] font-black text-neutral-400 font-mono">{p.codigo} - COSTO: ${p.costo || 0}</span>
                                            </div>
                                            <span className="text-lg font-black text-neutral-900">${formatNumber(p.costo || 0)}</span>
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
                                onKeyDown={(e) => e.key === 'Enter' && costoRef.current?.focus()}
                                className="w-full py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-center font-black text-neutral-900 text-lg"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1 text-center">COSTO</label>
                            <input
                                ref={costoRef}
                                type="number"
                                value={inputCosto}
                                onChange={(e) => setInputCosto(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAutoAdd(productoSeleccionado, parseFloat(inputCantidad), parseFloat(inputCosto))}
                                placeholder="0.00"
                                className="w-full py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-center font-black text-emerald-600 text-lg"
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                onClick={() => handleAutoAdd(productoSeleccionado, parseFloat(inputCantidad), parseFloat(inputCosto))}
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

                {/* Table Area */}
                <div className={cn("flex-1 min-h-0 bg-white relative z-10 flex flex-col", items.length > 0 ? "overflow-y-auto" : "overflow-hidden")}>
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-neutral-50 z-20 border-b border-neutral-200">
                            <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-1.5 text-left w-32">REF</th>
                                <th className="px-6 py-1.5 text-left">DETALLE DEL PRODUCTO</th>
                                <th className="px-6 py-1.5 text-center w-36">CANTIDAD</th>
                                <th className="px-6 py-1.5 text-right w-36">COSTO UNIT.</th>
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
                                    <td className="px-6 py-1 text-right font-bold text-xs text-neutral-500">${formatNumber(item.costo)}</td>
                                    <td className="px-6 py-1 text-right">
                                        <span className="inline-block px-4 py-1.5 bg-neutral-900 text-white rounded-xl font-black text-base tracking-tighter">
                                            ${formatNumber(item.subtotal)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-1 text-center">
                                        <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-2 text-neutral-300 hover:text-error-500 opacity-50 hover:opacity-100 transition-all">
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

                {/* Footer */}
                <div className="p-4 px-8 bg-neutral-950 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex-shrink-0 relative z-20 border-t border-white/5">
                    <div className="flex items-center gap-10">
                        {discriminarIVA ? (
                            <>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">Subtotal Neto</p>
                                    <p className="text-xl font-black text-neutral-100 tracking-tighter">${formatNumber(totalNeto)}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">IVA Total</p>
                                    <p className="text-xl font-black text-primary-200 tracking-tighter">${formatNumber(totalIVA)}</p>
                                </div>
                                <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                            </>
                        ) : null}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-success-500 uppercase tracking-[0.3em] mb-2">Monto Final Compra</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-emerald-500 tracking-tighter select-none shadow-glow-emerald-lg">${formatNumber(totalGeneral)}</span>
                                <span className="text-emerald-800 text-xs font-black font-mono uppercase">Ars</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => items.length > 0 && setMostrarModalPago(true)}
                        disabled={items.length === 0 || guardando}
                        className={cn(
                            "px-14 py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] flex items-center gap-4 transition-all group active:scale-95 shadow-xl",
                            items.length > 0
                                ? "bg-primary-600 text-white hover:bg-primary-500 shadow-primary-600/40 hover:-translate-y-2"
                                : "bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5"
                        )}
                    >
                        {guardando ? "PROCESANDO" : "CONFIRMAR COMPRA"} <ChevronRight size={24} strokeWidth={4} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>

            <PaymentModal
                isOpen={mostrarModalPago} onClose={() => setMostrarModalPago(false)}
                onConfirm={guardarCompra} onMethodChange={setMedioPago}
                total={totalGeneral} mode="purchase" clientName={proveedor?.nombre}
                initialMethod={medioPago}
            />
        </div>
    );
};

export default NuevaCompra;
