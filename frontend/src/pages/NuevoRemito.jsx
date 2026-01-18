import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FileText, Search, User, Package, Calendar,
    Truck, Check, ArrowLeft, AlertCircle, ShoppingCart,
    Plus, Trash2, X
} from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';
import Swal from 'sweetalert2';

const NuevoRemito = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ventaIdParam = searchParams.get('venta_id');

    // MODO: 'VENTA' (Linked) or 'MANUAL' (Independent)
    const [modo, setModo] = useState('VENTA');

    // STATE FOR 'VENTA' MODE
    const [ventaId, setVentaId] = useState(ventaIdParam || '');
    const [venta, setVenta] = useState(null);

    // STATE FOR 'MANUAL' MODE
    const [cliente, setCliente] = useState(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
    const [inputCantidad, setInputCantidad] = useState('1');
    const [itemsManuales, setItemsManuales] = useState([]);

    // COMMON STATE
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [direccionEntrega, setDireccionEntrega] = useState('');
    const [observaciones, setObservaciones] = useState('');

    // Refs for Manual Mode
    const clienteInputRef = useRef(null);
    const cantidadRef = useRef(null);

    // Initial Setup
    useEffect(() => {
        if (ventaIdParam) {
            setModo('VENTA');
            buscarVenta(ventaIdParam);
        }
    }, [ventaIdParam]);

    // ==================== MANUAL MODE HOOKS ====================
    const {
        inputCodigo, setInputCodigo,
        inputProducto, setInputProducto,
        codigosSugeridos, productosSugeridos,
        mostrarSugerenciasCodigo, mostrarSugerenciasProducto,
        handleCodigoKeyDown, handleProductoKeyDown,
        handleCodigoBlur, handleProductoBlur,
        seleccionar: seleccionarProducto,
        codigoListRef, productoListRef, nextInputRef: productoRef,
        limpiar: limpiarBusquedaProducto
    } = useProductSearch({
        onSelect: (producto) => {
            // Logic when product selected
            // We just set focus to quantity
            setTimeout(() => cantidadRef.current?.select(), 50);
        }
    });

    // State for selected product in manual mode
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Hook wrapper limitation: useProductSearch doesn't return the selected product directly effectively in all versions, 
    // so we might need to capture it in onSelect.
    // Let's rely on `inputProducto` being filled, but better to track object.

    // Override logic for selection to capture object
    const handleSeleccionarProductoManual = (p) => {
        seleccionarProducto(p); // Call hook's method to update inputs
        setProductoSeleccionado(p);
    };

    // ==================== FETCHING & HANDLERS ====================

    const buscarVenta = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/ventas/${id}/`);
            const data = await response.json();
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
                setVenta(null);
            } else {
                setVenta(data);
                setDireccionEntrega(data.cliente_domicilio || '');
            }
        } catch (error) {
            console.error("Error buscando venta:", error);
            Swal.fire('Error', 'No se pudo cargar la venta', 'error');
        } finally {
            setLoading(false);
        }
    };

    // CLIENT SEARCH LOGIC
    useEffect(() => {
        if (!busquedaCliente || busquedaCliente.length < 2) {
            setClientesSugeridos([]);
            setMostrarSugerenciasCliente(false);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/clientes/buscar/?q=${encodeURIComponent(busquedaCliente)}`);
                const data = await response.json();
                setClientesSugeridos(data.data || []);
                setMostrarSugerenciasCliente((data.data || []).length > 0);
            } catch (error) { console.error(error); }
        }, 300);
        return () => clearTimeout(timer);
    }, [busquedaCliente]);

    const seleccionarCliente = (c) => {
        setCliente(c);
        setBusquedaCliente('');
        setMostrarSugerenciasCliente(false);
        setDireccionEntrega(c.domicilio || '');
    };

    // ITEM MANAGEMENT MANUAL
    const agregarItemManual = () => {
        if (!productoSeleccionado) return;

        const cant = parseFloat(inputCantidad);
        if (!cant || cant <= 0) return;

        // Check stock warning (optional for remito, but good practice)
        // If it's a remito, we are delivering, so stock IS important.
        if (productoSeleccionado.stock < cant) {
            Swal.fire({
                title: 'Stock Insuficiente',
                text: `El producto tiene ${productoSeleccionado.stock} en stock.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Agregar igual',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    doAgregar();
                }
            });
        } else {
            doAgregar();
        }

        function doAgregar() {
            setItemsManuales(prev => [...prev, {
                producto_id: productoSeleccionado.id,
                producto_descripcion: productoSeleccionado.descripcion,
                producto_codigo: productoSeleccionado.codigo,
                cantidad: cant
            }]);

            // Reset fields
            limpiarBusquedaProducto();
            setProductoSeleccionado(null);
            setInputCantidad('1');
            // Focus back to code
            document.querySelector('input[placeholder="XXX"]')?.focus(); // Hacky ref access, use hook ref if possible
        }
    };

    const eliminarItemManual = (idx) => {
        setItemsManuales(prev => prev.filter((_, i) => i !== idx));
    };

    // SAVE LOGIC
    const handleGuardar = async () => {
        const isVentaMode = modo === 'VENTA';

        if (isVentaMode && !venta) {
            Swal.fire('Error', 'Debe seleccionar una Venta', 'error');
            return;
        }
        if (!isVentaMode && !cliente) {
            Swal.fire('Error', 'Debe seleccionar un Cliente', 'error');
            return;
        }

        const itemsToSave = isVentaMode
            ? venta.detalles.map(d => ({ producto_id: d.producto_id, cantidad: d.cantidad }))
            : itemsManuales;

        if (itemsToSave.length === 0) {
            Swal.fire('Error', 'El remito no tiene ítems', 'error');
            return;
        }

        setGuardando(true);
        try {
            const body = {
                venta_id: isVentaMode ? venta.id : null,
                cliente_id: !isVentaMode ? cliente.id : null,
                direccion_entrega: direccionEntrega,
                observaciones: observaciones,
                items: itemsToSave
            };

            const response = await fetch(`/api/remitos/guardar/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (data.ok) {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Remito generado correctamente',
                    icon: 'success',
                    showDenyButton: true,
                    confirmButtonText: 'Ir a Lista',
                    denyButtonText: 'Imprimir',
                }).then((result) => {
                    if (result.isDenied) {
                        window.open(`/comprobantes/remito/${data.id}/imprimir/`, '_blank');
                        navigate('/remitos');
                    } else {
                        navigate('/remitos');
                    }
                });
            } else {
                Swal.fire('Error', data.error || 'Error al guardar remito', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* LEFT COLUMN: Data Input */}
                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-1">

                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <BtnBack onClick={() => navigate('/remitos')} />
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                                <Truck className="text-blue-600" size={32} />
                                Nuevo Remito
                            </h1>
                            <p className="text-slate-500 font-medium text-sm">Generación de documentos de traslado</p>
                        </div>
                    </div>

                    {/* Mode Selector */}
                    <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex relative z-0 w-full justify-center">
                        <button
                            onClick={() => setModo('VENTA')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex-1 ${modo === 'VENTA' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Desde Venta
                        </button>
                        <button
                            onClick={() => setModo('MANUAL')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex-1 ${modo === 'MANUAL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Manual
                        </button>
                    </div>

                    {/* VENTA SEARCH */}
                    {modo === 'VENTA' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <label className="block text-sm font-bold text-slate-500 mb-2">Venta Asociada</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ID de Venta (ej: 123)"
                                    value={ventaId}
                                    onChange={(e) => setVentaId(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium"
                                />
                                <button
                                    onClick={() => buscarVenta(ventaId)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                            {venta && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in">
                                    <p className="font-bold text-slate-800 text-lg">{venta.cliente_nombre}</p>
                                    <p className="text-slate-500 text-sm mt-1">{venta.cliente_cuit || 'Consumidor Final'}</p>
                                    <div className="mt-2 text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                                        Venta #{venta.id} confirmada
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CLIENT SEARCH (MANUAL) */}
                    {modo === 'MANUAL' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User size={20} className="text-blue-500" />
                                <h2 className="font-bold text-slate-700">Cliente Destinatario</h2>
                            </div>

                            {!cliente ? (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        ref={clienteInputRef}
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={busquedaCliente}
                                        onChange={(e) => setBusquedaCliente(e.target.value)}
                                        onFocus={() => setMostrarSugerenciasCliente(true)}
                                        onBlur={() => setTimeout(() => setMostrarSugerenciasCliente(false), 200)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium"
                                    />
                                    {mostrarSugerenciasCliente && clientesSugeridos.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                                            {clientesSugeridos.map((c) => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => seleccionarCliente(c)}
                                                    className="px-4 py-3 cursor-pointer border-b border-slate-50 hover:bg-slate-50 flex justify-between"
                                                >
                                                    <span className="font-bold text-slate-700">{c.nombre}</span>
                                                    <span className="text-xs text-slate-400 font-mono">{c.cuit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold text-slate-800">{cliente.nombre}</p>
                                        <p className="text-sm text-slate-500">{cliente.cuit}</p>
                                    </div>
                                    <button onClick={() => setCliente(null)} className="text-slate-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delivery Info */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <label className="block text-sm font-bold text-slate-500 ml-1">Dirección de Entrega</label>
                        <textarea
                            value={direccionEntrega}
                            onChange={(e) => setDireccionEntrega(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all text-sm h-24"
                            placeholder="Ingrese la dirección de destino..."
                        />

                        <label className="block text-sm font-bold text-slate-500 ml-1 mt-4">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all text-sm h-20"
                            placeholder="Notas adicionales..."
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: Items */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">

                        {/* Headers & Add Item (Only Manual) */}
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg mb-4">
                                <Package size={20} className="text-indigo-500" />
                                Ítems del Remito
                            </h2>

                            {modo === 'MANUAL' && (
                                <div className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="col-span-3">
                                        <label className="text-xs font-bold text-slate-400 ml-1">CÓDIGO</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="XXX"
                                                value={inputCodigo}
                                                onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                                onKeyDown={handleCodigoKeyDown}
                                                onBlur={handleCodigoBlur}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase text-center font-bold"
                                            />
                                            {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                                <div ref={codigoListRef} className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                                                    {codigosSugeridos.map((p) => (
                                                        <div key={p.id} onClick={() => handleSeleccionarProductoManual(p)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 text-xs">
                                                            <span className="font-bold text-blue-600">{p.codigo}</span> - {p.descripcion}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-6">
                                        <label className="text-xs font-bold text-slate-400 ml-1">PRODUCTO</label>
                                        <div className="relative">
                                            <input
                                                ref={productoRef}
                                                type="text"
                                                placeholder="Buscar..."
                                                value={inputProducto}
                                                onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                                onKeyDown={handleProductoKeyDown}
                                                onBlur={handleProductoBlur}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                            {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                                <div ref={productoListRef} className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                                                    {productosSugeridos.map((p) => (
                                                        <div key={p.id} onClick={() => handleSeleccionarProductoManual(p)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 text-xs flex justify-between">
                                                            <span>{p.descripcion}</span>
                                                            <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-slate-400'}`}>Stock: {p.stock}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1 text-center block">CANT.</label>
                                        <input
                                            ref={cantidadRef}
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={inputCantidad}
                                            onChange={(e) => setInputCantidad(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && agregarItemManual()}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm text-center font-bold"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button
                                            onClick={agregarItemManual}
                                            disabled={!productoSeleccionado}
                                            className={`w-full py-2 rounded-lg flex items-center justify-center ${productoSeleccionado ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-300'}`}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-0 bg-slate-50/30">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">Producto</th>
                                        <th className="px-6 py-4 text-center w-32">Cantidad</th>
                                        {modo === 'MANUAL' && <th className="px-6 py-4 w-10"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {/* LISTA VENTA */}
                                    {modo === 'VENTA' && venta && venta.detalles.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{item.producto_descripcion}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">{item.producto_codigo}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                                    {item.cantidad}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* LISTA MANUAL */}
                                    {modo === 'MANUAL' && itemsManuales.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{item.producto_descripcion}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">{item.producto_codigo}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                                    {item.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => eliminarItemManual(idx)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* EMPTY STATES */}
                                    {((modo === 'VENTA' && !venta) || (modo === 'MANUAL' && itemsManuales.length === 0)) && (
                                        <tr>
                                            <td colSpan="3" className="py-20 text-center text-slate-400">
                                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                                    <ShoppingCart size={32} />
                                                </div>
                                                <p className="font-medium">
                                                    {modo === 'VENTA' ? 'Busque una venta para cargar los ítems' : 'Agregue productos manualmente'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <BtnSave
                                label="Generar Remito"
                                icon={<Truck size={20} />}
                                onClick={handleGuardar}
                                disabled={guardando || (modo === 'VENTA' ? !venta : (!cliente || itemsManuales.length === 0))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevoRemito;
