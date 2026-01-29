import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FileText, Search, User, Package, Calendar,
    Check, ArrowLeft, AlertCircle, ShoppingCart, ArrowDownCircle, Trash2, X, Plus
} from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';
import Swal from 'sweetalert2';

const NuevaNotaCredito = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ventaIdParam = searchParams.get('venta_id');

    const [ventaId, setVentaId] = useState(ventaIdParam || '');
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [motivo, setMotivo] = useState('Anulación de venta');
    const [items, setItems] = useState([]);

    const [cantidadInput, setCantidadInput] = useState('1');
    const [precioInput, setPrecioInput] = useState('');
    const [selectedProd, setSelectedProd] = useState(null);
    const cantidadRef = useRef(null);

    // Búsqueda de productos (Igual a NuevaNotaDebito logic)
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
        seleccionar: seleccionarProducto
    } = useProductSearch({
        onSelect: (prod) => {
            setSelectedProd(prod);
            setPrecioInput(prod.precio?.toString());
            setCantidadInput('1');
            // Auto focus a cantidad
            setTimeout(() => {
                cantidadRef.current?.focus();
                cantidadRef.current?.select();
            }, 100);
        }
    });

    useEffect(() => {
        if (ventaIdParam) {
            buscarVenta(ventaIdParam);
        }
    }, [ventaIdParam]);

    const buscarVenta = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            let finalId = id;
            if (id.includes('-') || id.length > 5) {
                const listRes = await fetch(`/api/ventas/listar/?q=${encodeURIComponent(id)}`);
                const listData = await listRes.json();
                if (listData.ok && listData.data.length > 0) {
                    const match = listData.data.find(v => v.id.toString() === id || (v.numero_factura && v.numero_factura.includes(id)));
                    if (match) {
                        finalId = match.id;
                    }
                }
            }

            const response = await fetch(`/api/ventas/${finalId}/`);
            const data = await response.json();
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
                setVenta(null);
                setItems([]);
            } else {
                setVenta(data);
                // Cargar items de la venta inicial
                const initialItems = data.detalles.map(d => ({
                    id: d.producto_id || d.id, // Asumiendo que producto_id es el id original del producto
                    descripcion: d.producto_descripcion,
                    codigo: d.producto_codigo,
                    cantidad: d.cantidad,
                    precio: d.precio_unitario,
                    subtotal: d.subtotal,
                    es_original: true // Flag para saber que vino de la venta
                }));
                // Si el detalle no trae producto_id explicito, podria ser problematico si usamos `d.id` que es DetalleVentaID.
                // Ajuste: si el backend devuelve producto_id, úsalo. Si no, necesitamos fetch de producto?
                // Asumimos 'producto_id' viene en el serializer de DetalleVenta.
                setItems(initialItems);
            }
        } catch (error) {
            console.error("Error buscando venta:", error);
            Swal.fire('Error', 'No se pudo cargar la venta', 'error');
        } finally {
            setLoading(false);
        }
    };

    const agregarItem = () => {
        if (!selectedProd) return;
        const cant = parseFloat(cantidadInput);
        const precio = parseFloat(precioInput);

        if (isNaN(cant) || cant <= 0) {
            Swal.fire('Error', 'Cantidad inválida', 'warning');
            return;
        }

        const newItem = {
            id: selectedProd.id,
            codigo: selectedProd.codigo,
            descripcion: selectedProd.descripcion,
            cantidad: cant,
            precio: precio || 0,
            subtotal: cant * (precio || 0),
            es_original: false
        };

        setItems([...items, newItem]);
        setSelectedProd(null);
        setInputCodigo('');
        setInputProducto('');
        setCantidadInput('1');
        setPrecioInput('');
    };

    const eliminarItem = (idx) => {
        const newItems = [...items];
        newItems.splice(idx, 1);
        setItems(newItems);
    };

    const totalGeneral = items.reduce((acc, it) => acc + it.subtotal, 0);

    const handleGuardar = async () => {
        if (!venta) return;
        if (items.length === 0) {
            Swal.fire('Error', 'Debe haber al menos un ítem para la Nota de Crédito', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: '¿Confirmar Nota de Crédito?',
            text: "Esta acción generará una NC y devolverá los items seleccionados al stock.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Rojo para NC
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, generar NC'
        });

        if (!result.isConfirmed) return;

        setGuardando(true);
        try {
            const response = await fetch(`/api/notas-credito/crear/${venta.id}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    motivo,
                    items: items.map(i => ({
                        id: i.id, // ID del PRODUCTO
                        cantidad: i.cantidad,
                        precio: i.precio,
                        subtotal: i.subtotal
                    }))
                })
            });
            const data = await response.json();
            if (data.ok) {
                Swal.fire('Éxito', 'Nota de Crédito generada correctamente', 'success');
                navigate('/notas-credito');
            } else {
                Swal.fire('Error', data.error || 'Error al generar NC', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col fade-in">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* COLUMNA IZQUIERDA: BUSQUEDA / VENTA / MOTIVO */}
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

                    <div className="flex items-center gap-4">
                        <BtnBack onClick={() => navigate('/notas-credito')} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <ArrowDownCircle className="text-red-600" size={32} />
                            Nueva NC
                        </h1>
                        <p className="text-slate-500 font-medium ml-10">Generar Nota de Crédito</p>
                    </div>

                    {/* Venta Search / Info Box */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Search size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Buscar Venta</h2>
                        </div>

                        {!venta ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ID de Venta (ej: 123)"
                                    value={ventaId}
                                    onChange={(e) => setVentaId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && buscarVenta(ventaId.trim())}
                                    className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium text-sm"
                                />
                                <button
                                    onClick={() => buscarVenta(ventaId.trim())}
                                    disabled={loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Search size={16} />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                    <button
                                        onClick={() => { setVenta(null); setVentaId(''); setMotivo('Anulación de venta'); setItems([]); }}
                                        className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                                        title="Cambiar venta"
                                    >
                                        <X size={14} />
                                    </button>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Cliente</p>
                                    <p className="font-bold text-slate-800 text-lg">{venta.cliente_nombre}</p>
                                    <p className="text-sm text-slate-500">{venta.cliente_cuit || 'Consumidor Final'}</p>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-600">Factura Ref.</span>
                                    <span className="font-mono font-bold text-blue-600">#{venta.id}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Motivo Box */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col min-h-0">
                        <label className="block text-sm font-bold text-slate-600 mb-2">Motivo / Observación</label>
                        <textarea
                            className="w-full flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:border-red-500 resize-none text-sm min-h-[6rem]"
                            placeholder="Describa el motivo de la devolución..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                        />
                    </div>
                </div>

                {/* COLUMNA DERECHA: ITEMS + TOTALES */}
                <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">

                    {/* INPUT BAR (Igual a Nota Debito/Remito) */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex-shrink-0 z-20">
                        <div className="grid grid-cols-12 gap-4 items-end">

                            {/* Código (Ahora sí implementado igual que ND) */}
                            <div className="col-span-2 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">CÓDIGO</label>
                                <input
                                    type="text"
                                    value={inputCodigo}
                                    onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                    onKeyDown={handleCodigoKeyDown}
                                    onBlur={handleCodigoBlur}
                                    placeholder="XXX"
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-mono text-sm uppercase text-center font-bold"
                                />
                                {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                    <div ref={codigoListRef} className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                        {codigosSugeridos.map((p, idx) => (
                                            <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-4 py-2 cursor-pointer ${idx === sugerenciaCodigoActiva ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                                <span className="font-bold text-slate-700">{p.codigo}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Producto (Usando hook inputs) */}
                            <div className="col-span-5 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">PRODUCTO / CONCEPTO</label>
                                <input
                                    ref={productoRef}
                                    type="text"
                                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
                                    placeholder="Buscar producto..."
                                    value={inputProducto}
                                    onChange={(e) => {
                                        if (selectedProd) setSelectedProd(null);
                                        setInputProducto(e.target.value);
                                    }}
                                    onKeyDown={handleProductoKeyDown}
                                    onBlur={handleProductoBlur}
                                />
                                {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                    <ul ref={productoListRef} className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-slate-100">
                                        {productosSugeridos.map((prod, idx) => (
                                            <li
                                                key={prod.id}
                                                className={`group cursor-pointer select-none relative py-3 pl-3 pr-9 border-b border-slate-50 last:border-0 ${idx === sugerenciaActiva ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                                                onClick={() => seleccionarProducto(prod)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-bold text-slate-700 block">{prod.descripcion}</span>
                                                        <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-0 mt-1 inline-block">
                                                            {prod.codigo}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block font-bold text-indigo-600">${prod.precio}</span>
                                                        <span className="text-xs text-slate-400">Stock: {prod.stock}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Precio */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">PRECIO</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="block w-full pl-5 pr-2 py-2.5 border border-slate-200 rounded-lg text-right font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                        value={precioInput}
                                        onChange={(e) => setPrecioInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && agregarItem()}
                                    />
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">CANT.</label>
                                <input
                                    ref={cantidadRef}
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    className="block w-full px-2 py-2.5 border border-slate-200 rounded-lg text-center font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                    value={cantidadInput}
                                    onChange={(e) => setCantidadInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && agregarItem()}
                                />
                            </div>

                            <div className="col-span-1">
                                <button
                                    onClick={agregarItem}
                                    disabled={!selectedProd}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Items */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-100">
                                <tr className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-6 py-3 text-left w-24">Código</th>
                                    <th className="px-6 py-3 text-left">Producto</th>
                                    <th className="px-6 py-3 text-right">Precio</th>
                                    <th className="px-6 py-3 text-center">Cant.</th>
                                    <th className="px-6 py-3 text-right">Subtotal</th>
                                    <th className="px-4 py-3 text-center w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 group">
                                            <td className="px-6 py-3 font-mono text-xs font-bold text-slate-500">
                                                {item.codigo}
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="font-bold text-slate-800">{item.descripcion}</p>
                                                {item.es_original && (
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 mt-1 inline-block">
                                                        Original
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-600">
                                                ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio)}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                    {item.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold text-red-600">
                                                ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => eliminarItem(idx)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-slate-400">
                                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                                <Trash2 size={32} />
                                            </div>
                                            <p className="font-medium">Busque una venta o agregue ítems</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Totals */}
                    <div className="p-6 m-4 mb-8 rounded-3xl bg-slate-900 text-white flex justify-between items-center shadow-2xl ring-1 ring-white/10 flex-shrink-0 mt-auto">
                        <div className="space-y-1">
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Reembolso</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tight">
                                    ${venta ? new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(totalGeneral) : '0,00'}
                                </span>
                            </div>
                        </div>
                        <BtnSave
                            label="Generar Nota de Crédito"
                            onClick={handleGuardar}
                            disabled={!venta || guardando || items.length === 0}
                            className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-red-900/20"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NuevaNotaCredito;
