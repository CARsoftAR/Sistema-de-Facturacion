// Nuevo Pedido - Terminal Premium 2025
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Trash2, User, ShoppingCart,
    Check, X, Zap, ArrowLeft, ChevronRight,
    FileText, ClipboardList, AlertTriangle
} from 'lucide-react';
import { showWarningAlert, showSuccessAlert, showConfirmationAlert } from '../utils/alerts';
import { useProductSearch } from '../hooks/useProductSearch';
import { cn } from '../utils/cn';

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

const NuevoPedido = () => {
    const navigate = useNavigate();

    // REFS
    const codigoRef = useRef(null);
    const clienteInputRef = useRef(null);
    const cantidadRef = useRef(null);

    // STATE
    const [cliente, setCliente] = useState(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
    const [sugerenciaClienteActiva, setSugerenciaClienteActiva] = useState(0);

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputPrecio, setInputPrecio] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [items, setItems] = useState([]);
    const [observaciones, setObservaciones] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Modal Stock Custom
    const [modalStockOpen, setModalStockOpen] = useState(false);
    const [productoPendiente, setProductoPendiente] = useState(null);

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
            setInputPrecio(producto.precio_efectivo.toString());
            setInputCantidad('1');
            setTimeout(() => cantidadRef.current?.select(), 50);
        }
    });

    useEffect(() => {
        setTimeout(() => clienteInputRef.current?.focus(), 400);
    }, []);

    useEffect(() => {
        if (!busquedaCliente || busquedaCliente.length < 2) {
            setClientesSugeridos([]); setMostrarSugerenciasCliente(false); return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/clientes/buscar/?q=${encodeURIComponent(busquedaCliente)}`);
                const data = await res.json();
                setClientesSugeridos(data.data || []);
                setMostrarSugerenciasCliente((data.data || []).length > 0);
            } catch (err) { console.error(err); }
        }, 300);
        return () => clearTimeout(timer);
    }, [busquedaCliente]);

    const seleccionarCliente = (c) => {
        setCliente(c); setBusquedaCliente(''); setMostrarSugerenciasCliente(false);
        setTimeout(() => codigoRef.current?.focus(), 100);
    };

    const handleClienteKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSugerenciaClienteActiva(prev => Math.min(prev + 1, clientesSugeridos.length - 1));
        } else if (e.key === 'ArrowUp') {
            setSugerenciaClienteActiva(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && clientesSugeridos.length > 0) {
            seleccionarCliente(clientesSugeridos[sugerenciaClienteActiva]);
        }
    };

    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;
        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || productoSeleccionado.precio_efectivo;

        const existe = items.find(i => i.id === productoSeleccionado.id);
        const cantidadTotal = existe ? existe.cantidad + cantidad : cantidad;

        if (cantidadTotal > productoSeleccionado.stock) {
            setProductoPendiente({ producto: productoSeleccionado, cantidad, precio, existe });
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
                id: prod.id, codigo: prod.codigo, descripcion: prod.descripcion,
                precio: prec, cantidad: cant, subtotal: cant * prec, stock: prod.stock
            }]);
        }
        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const limpiarCamposEntrada = () => {
        limpiar(); setInputCantidad('1'); setInputPrecio(''); setProductoSeleccionado(null);
    };

    const cancelarPedido = () => {
        showConfirmationAlert('¿Cancelar Pedido?', 'Se borrarán todos los items cargados.').then((result) => {
            if (result.isConfirmed) {
                setItems([]); setCliente(null); setObservaciones('');
                clienteInputRef.current?.focus();
            }
        });
    };

    const guardarPedido = async () => {
        if (items.length === 0) return showWarningAlert('Error', 'Debe agregar al menos un producto.');
        if (!cliente) return showWarningAlert('Error', 'Debe seleccionar un cliente.');

        setGuardando(true);
        try {
            const payload = {
                cliente_id: cliente.id,
                detalles: items.map(p => ({
                    producto_id: p.id, cantidad: p.cantidad, precio_unitario: p.precio
                })),
                observaciones: observaciones
            };
            const response = await fetch('/api/pedidos/crear/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.ok) {
                showSuccessAlert('Pedido Creado', `Orden #${data.id} generada correctamente.`);
                setTimeout(() => navigate('/pedidos'), 1500);
            } else throw new Error(data.error);
        } catch (err) {
            showWarningAlert('Error', err.message || 'Error de conexión');
        } finally { setGuardando(false); }
    };

    const totalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);
    const totalNeto = totalGeneral / 1.21;
    const totalIVA = totalGeneral - totalNeto;

    return (
        <div className="p-3 lg:p-4 max-w-[1900px] mx-auto space-y-3 animate-in fade-in duration-500 h-full bg-slate-50 flex flex-col overflow-hidden relative">

            {/* Top Bar */}
            <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-neutral-200 shadow-sm flex-shrink-0 relative z-[200]">
                <div className="flex items-center gap-3 pr-4 border-r border-neutral-100">
                    <button
                        onClick={() => navigate('/pedidos')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all font-black text-[10px] shadow-lg shadow-red-500/20 uppercase tracking-widest group"
                    >
                        <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                        Volver
                    </button>
                    <h1 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-2 m-0 uppercase font-outfit">
                        NUEVO PEDIDO <ClipboardList size={14} className="text-blue-600" />
                    </h1>
                </div>

                {/* Cliente Selector */}
                <div className="flex-1 max-w-sm relative overflow-visible">
                    <input
                        ref={clienteInputRef}
                        type="text"
                        placeholder="Buscar Cliente..."
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                        onKeyDown={handleClienteKeyDown}
                        className="w-full pl-4 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                    />
                    {mostrarSugerenciasCliente && (
                        <div className="absolute z-[300] top-full left-0 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-2xl p-1 animate-in slide-in-from-top-2">
                            {clientesSugeridos.map((c, idx) => (
                                <div key={c.id} onClick={() => seleccionarCliente(c)} className={cn("px-4 py-3 cursor-pointer rounded-lg text-xs font-bold transition-all", idx === sugerenciaClienteActiva ? "bg-blue-600 text-white shadow-lg translate-x-1" : "hover:bg-neutral-50")}>
                                    <div className="flex justify-between items-center">
                                        <span>{c.nombre}</span>
                                        <span className={cn("text-[8px] px-1.5 py-0.5 rounded ml-2", idx === sugerenciaClienteActiva ? "bg-white/20" : "bg-neutral-100 text-neutral-500")}>
                                            {c.cuit || 'S.C.'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cliente && (
                    <div className="flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-xl animate-in zoom-in-95 shadow-lg shadow-blue-600/20">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{cliente.nombre}</span>
                            <span className="text-[8px] font-bold text-blue-200 uppercase mt-0.5">{cliente.cuit || 'SIN CUIT'}</span>
                        </div>
                        <button onClick={() => setCliente(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X size={14} /></button>
                    </div>
                )}

                <div className="flex items-center gap-2 px-4 border-l border-neutral-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Notas del pedido..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-64 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs font-bold"
                        />
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={cancelarPedido}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black bg-neutral-50 text-neutral-400 border border-neutral-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                        >
                            <Trash2 size={14} /> CANCELAR
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

                {/* Search Bar */}
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex-shrink-0 relative z-[100]">
                    <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-2 relative">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1">CÓDIGO</label>
                            <input
                                ref={codigoRef}
                                type="text"
                                value={inputCodigo}
                                onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                onKeyDown={handleCodigoKeyDown}
                                onBlur={handleCodigoBlur}
                                placeholder="----"
                                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono font-bold text-center text-blue-600 shadow-sm text-lg"
                            />
                            {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                <div ref={codigoListRef} className="absolute z-[150] top-full left-0 mt-2 w-[220%] bg-white border border-neutral-200 rounded-2xl shadow-2xl p-1">
                                    {codigosSugeridos.map((p, idx) => (
                                        <div key={p.id} onClick={() => seleccionar(p)} className={cn("px-4 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all", idx === sugerenciaCodigoActiva ? "bg-blue-600 text-white shadow-lg scale-[1.02]" : "hover:bg-neutral-50")}>
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm font-black tracking-tight">{p.codigo}</span>
                                                <span className={cn("text-[9px] font-bold uppercase", idx === sugerenciaCodigoActiva ? "text-blue-100" : "text-neutral-400")}>{p.descripcion}</span>
                                            </div>
                                            <span className="text-base font-black text-left">${p.precio_efectivo}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-7 relative">
                            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 ml-1">PRODUCTO</label>
                            <input
                                ref={productoRef}
                                type="text"
                                value={inputProducto}
                                onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                onKeyDown={handleProductoKeyDown}
                                onBlur={handleProductoBlur}
                                placeholder="Escriba para buscar..."
                                className="w-full px-5 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-neutral-800 shadow-sm text-lg"
                            />
                            {mostrarSugerenciasProducto && (
                                <div ref={productoListRef} className="absolute z-[150] top-full left-0 w-full mt-2 bg-white border border-neutral-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-1">
                                    {productosSugeridos.map((p, idx) => (
                                        <div key={p.id} onClick={() => seleccionar(p)} className={cn("px-5 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all", idx === sugerenciaActiva ? "bg-blue-50 border-l-4 border-blue-600 shadow-sm" : "hover:bg-neutral-50")}>
                                            <div className="flex flex-col text-left">
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
                                className="w-full py-3 bg-white border border-neutral-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-center font-black text-neutral-900 text-lg"
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                onClick={agregarProductoALista}
                                disabled={!productoSeleccionado}
                                className={cn(
                                    "w-full h-[52px] rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/10",
                                    productoSeleccionado ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-600/20" : "bg-neutral-100 text-neutral-300"
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
                                <th className="px-6 py-1.5 text-right w-36">PRECIO UNIT.</th>
                                <th className="px-6 py-1.5 text-right w-44">SUBTOTAL</th>
                                <th className="px-6 py-1.5 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {items.map((item) => (
                                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-1 font-mono text-xs font-bold text-neutral-400 whitespace-nowrap">{item.codigo}</td>
                                    <td className="px-6 py-1">
                                        <div className="text-left">
                                            <p className="font-black text-sm text-neutral-800 uppercase tracking-tight">{item.descripcion}</p>
                                            {item.cantidad > item.stock && <p className="text-[10px] text-amber-600 font-black uppercase mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Stock insuficiente ({item.stock})</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-1">
                                        <div className="flex items-center justify-center bg-white border border-neutral-200 rounded-xl p-1 w-fit mx-auto shadow-sm">
                                            <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-red-500 font-black text-lg">-</button>
                                            <span className="w-10 text-center font-black text-sm text-neutral-900">{item.cantidad}</span>
                                            <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-green-600 font-black text-lg">+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-1 text-right font-bold text-xs text-neutral-500">${item.precio.toLocaleString()}</td>
                                    <td className="px-6 py-1 text-right">
                                        <span className="inline-block px-4 py-1.5 bg-neutral-900 text-white rounded-xl font-black text-base tracking-tighter">
                                            ${item.subtotal.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-1 text-center">
                                        <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-2 text-neutral-300 hover:text-red-500 opacity-50 hover:opacity-100 transition-all">
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
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Aguardando Artículos del Pedido</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 px-8 bg-neutral-950 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex-shrink-0 relative z-20 border-t border-white/5">
                    <div className="flex items-center gap-10">
                        <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">Monto de Pedido</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-blue-500 tracking-tighter select-none">${totalGeneral.toLocaleString()}</span>
                                <span className="text-blue-800 text-xs font-black font-mono uppercase">Ars</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={guardarPedido}
                        disabled={items.length === 0 || guardando}
                        className={cn(
                            "px-14 py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] flex items-center gap-4 transition-all group active:scale-95 shadow-xl",
                            items.length > 0
                                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/40 hover:-translate-y-2"
                                : "bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5"
                        )}
                    >
                        {guardando ? "PROCESANDO" : "CONFIRMAR PEDIDO"} <ChevronRight size={24} strokeWidth={4} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Modal de Stock */}
            {modalStockOpen && productoPendiente && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-slate-200 text-center">
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                            <AlertTriangle size={40} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Advertencia de Stock</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            El producto <span className="text-slate-900 font-bold">"{productoPendiente.producto.descripcion}"</span> no tiene stock disponible suficiente.
                            <br />
                            <span className="text-sm mt-3 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full font-black inline-block uppercase tracking-wider">
                                Disponible: {productoPendiente.producto.stock}
                            </span>
                        </p>

                        <div className="flex gap-4">
                            <button onClick={() => { setModalStockOpen(false); setProductoPendiente(null); }} className="flex-1 py-4 bg-neutral-100 text-neutral-400 font-black rounded-2xl hover:bg-neutral-200 transition-all uppercase tracking-widest text-xs">
                                CANCELAR
                            </button>
                            <button onClick={() => { encolarProducto(productoPendiente.producto, productoPendiente.cantidad, productoPendiente.precio, productoPendiente.existe); setModalStockOpen(false); setProductoPendiente(null); }} className="flex-1 py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all uppercase tracking-widest text-xs">
                                AGREGAR IGUAL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevoPedido;
