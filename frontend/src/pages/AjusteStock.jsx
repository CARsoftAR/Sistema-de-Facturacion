import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Search, X, Check, ArrowRight } from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import Swal from 'sweetalert2';
import axios from 'axios';

const AjusteStock = () => {
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [tipo, setTipo] = useState('IN'); // 'IN' o 'OUT'
    const [cantidad, setCantidad] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    // Buscar productos
    const handleSearch = async (term) => {
        if (!term || term.length < 2) {
            setProductos([]);
            return;
        }

        try {
            const response = await axios.get('/api/productos/buscar/', {
                params: { q: term }
            });
            setProductos(response.data.data || []);
            setActiveIndex(0);
        } catch (error) {
            console.error('Error buscando productos:', error);
            setProductos([]);
        }
    };

    const handleKeyDown = (e) => {
        if (productos.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < productos.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelectProducto(productos[activeIndex]);
        } else if (e.key === 'Escape') {
            setProductos([]);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (productos.length > 0 && resultsRef.current) {
            const activeElement = resultsRef.current.children[activeIndex];
            if (activeElement) {
                activeElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [activeIndex, productos]);

    const handleSelectProducto = (producto) => {
        setSelectedProducto(producto);
        setProductos([]);
        setSearchTerm('');
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!selectedProducto) {
            Swal.fire('Error', 'Debe seleccionar un producto', 'error');
            return;
        }

        if (!cantidad || parseFloat(cantidad) <= 0) {
            Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
            return;
        }

        if (!observaciones.trim()) {
            Swal.fire('Error', 'Debe ingresar un motivo para el ajuste', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/stock/ajuste/', {
                producto_id: selectedProducto.id,
                tipo: tipo,
                cantidad: parseFloat(cantidad),
                observaciones: observaciones
            });

            if (response.data.success) {
                await Swal.fire({
                    title: '<span class="text-2xl font-black text-slate-800">¡Ajuste Realizado!</span>',
                    html: `
                        <div class="text-left space-y-2 text-slate-600 mt-2">
                            <p><strong>Producto:</strong> ${selectedProducto.descripcion}</p>
                            <p><strong>Stock Anterior:</strong> ${response.data.stock_anterior}</p>
                            <p><strong>Stock Nuevo:</strong> <span class="text-blue-600 font-bold">${response.data.stock_nuevo}</span></p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2563eb',
                    customClass: {
                        popup: 'rounded-3xl p-10',
                        confirmButton: 'rounded-xl px-12 py-3 font-bold text-lg'
                    }
                });

                // Limpiar formulario
                setSelectedProducto(null);
                setCantidad('');
                setObservaciones('');
                setTipo('IN');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Error al realizar el ajuste', 'error');
        } finally {
            setLoading(false);
        }
    };

    const qCant = parseFloat(cantidad || 0);
    const stockNuevo = selectedProducto ?
        (tipo === 'IN' ? selectedProducto.stock + qCant : selectedProducto.stock - qCant)
        : 0;

    return (
        <div className="p-6 pb-10 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* COLUMNA IZQUIERDA: BUSCADOR E INFO */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Header Interno */}
                    <div className="mb-2">
                        <div className="mb-4">
                            <BtnBack onClick={() => navigate('/productos')} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <Package className="text-blue-600" size={32} strokeWidth={2.5} />
                            Ajuste de Stock
                        </h1>
                        <p className="text-slate-500 font-medium ml-10 leading-tight">Registrar entradas o salidas manuales</p>
                    </div>

                    {/* Card de Búsqueda */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Search size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Producto</h2>
                        </div>

                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Buscar por código o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium outline-none"
                            />

                            {/* Resultados de búsqueda (Absolutos para no romper el layout) */}
                            {productos.length > 0 && (
                                <div
                                    ref={resultsRef}
                                    className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto ring-1 ring-black/5"
                                >
                                    {productos.map((p, index) => (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSelectProducto(p)}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between transition-colors ${activeIndex === index ? 'bg-blue-50' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="font-bold text-slate-800 text-sm truncate">{p.descripcion}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 rounded">{p.codigo}</span>
                                                    <span className={`text-[10px] font-bold ${p.stock <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>Stock: {p.stock}</span>
                                                </div>
                                            </div>
                                            {activeIndex === index && <Check size={16} className="text-blue-500" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedProducto ? (
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-start justify-between relative overflow-hidden">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center font-bold text-lg border border-blue-100">
                                        <Package size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate w-40" title={selectedProducto.descripcion}>
                                            {selectedProducto.descripcion}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                                                {selectedProducto.codigo}
                                            </span>
                                            <span className="text-slate-500 text-[11px] font-bold">Actual: {selectedProducto.stock}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProducto(null)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-all relative z-10"
                                >
                                    <X size={16} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2 text-slate-400 px-2 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                <span className="text-xs font-medium">Esperando selección de producto...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: CONFIGURACIÓN DEL AJUSTE */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">

                    {/* Header de la Tarjeta */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800">Detalles del Ajuste</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Configuración técnica</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10">

                        {/* Tipo y Cantidad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Tipo de Ajuste */}
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Movimiento</label>
                                <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setTipo('IN')}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black text-sm transition-all ${tipo === 'IN'
                                                ? 'bg-white text-emerald-600 shadow-md scale-[1.02]'
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                        ENTRADA
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTipo('OUT')}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black text-sm transition-all ${tipo === 'OUT'
                                                ? 'bg-white text-rose-600 shadow-md scale-[1.02]'
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <Minus size={20} strokeWidth={3} />
                                        SALIDA
                                    </button>
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Cantidad a Ajustar</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="0"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(e.target.value)}
                                        disabled={!selectedProducto}
                                        className={`w-full px-6 py-4 border-2 rounded-2xl text-2xl font-black transition-all outline-none ${!selectedProducto
                                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800'
                                            }`}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black uppercase text-xs pointer-events-none">Unidades</div>
                                </div>
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Motivo o Justificación *</label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                disabled={!selectedProducto}
                                placeholder="Ej: Mercadería dañada, Error de carga inicial, Merma por vencimiento..."
                                rows="4"
                                className={`w-full px-6 py-4 border-2 rounded-3xl text-base font-medium transition-all outline-none resize-none ${!selectedProducto
                                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800'
                                    }`}
                            />
                        </div>

                        {/* Estado Visual del Ajuste */}
                        {!selectedProducto && (
                            <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 opacity-50">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                    <Package size={32} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-600">No hay producto seleccionado</p>
                                    <p className="text-xs text-slate-400">Selecciona un producto del buscador para comenzar el ajuste</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Barra Inferior (Dark Bar style Nueva Venta) */}
                    <div className="p-6 m-4 mt-0 rounded-[2rem] bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl ring-1 ring-white/10 shrink-0 gap-4">
                        <div className="flex items-center gap-8">
                            <div className="space-y-0.5">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Stock Actual</p>
                                <p className="text-2xl font-black text-slate-200">{selectedProducto ? selectedProducto.stock : '—'}</p>
                            </div>

                            {selectedProducto && qCant > 0 && (
                                <>
                                    <div className="text-slate-700">
                                        <ArrowRight size={24} strokeWidth={3} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${tipo === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            Nuevo Stock
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-3xl font-black tracking-tight ${tipo === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {stockNuevo}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => navigate('/productos')}
                                className="px-6 py-4 text-slate-400 font-bold hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <BtnSave
                                label={loading ? 'Procesando...' : 'Confirmar Ajuste'}
                                onClick={handleSubmit}
                                disabled={loading || !selectedProducto || !cantidad || !observaciones}
                                className="px-10 py-4 rounded-xl font-black text-base shadow-xl shadow-blue-500/20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AjusteStock;
