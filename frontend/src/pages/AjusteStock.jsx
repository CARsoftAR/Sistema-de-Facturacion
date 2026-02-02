import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Search, X, Check, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import axios from 'axios';
import { showSuccessAlert, showWarningAlert } from '../utils/alerts';

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
            showWarningAlert('Error', 'Debe seleccionar un producto');
            return;
        }

        if (!cantidad || parseFloat(cantidad) <= 0) {
            showWarningAlert('Error', 'La cantidad debe ser mayor a 0');
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
                await showSuccessAlert(
                    '¡Ajuste Realizado!',
                    `Producto: ${selectedProducto.descripcion}\nStock Anterior: ${response.data.stock_anterior}\nStock Nuevo: ${response.data.stock_nuevo}`
                );

                // Limpiar formulario
                setSelectedProducto(null);
                setCantidad('');
                setObservaciones('');
                setTipo('IN');
            }
        } catch (error) {
            showWarningAlert('Error', error.response?.data?.error || 'Error al realizar el ajuste');
        } finally {
            setLoading(false);
        }
    };

    const qCant = parseFloat(cantidad || 0);
    const stockNuevo = selectedProducto ?
        (tipo === 'IN' ? selectedProducto.stock + qCant : selectedProducto.stock - qCant)
        : 0;

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center gap-3">
                        <BtnBack onClick={() => navigate('/productos')} />
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <span className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-xl text-white shadow-md">
                                    <Package size={20} />
                                </span>
                                Ajuste de Stock
                            </h1>
                            <p className="text-sm text-slate-600 font-medium mt-0.5">
                                Registrar entradas o salidas manuales
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

                    {/* COLUMNA IZQUIERDA - Búsqueda de Producto */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>

                        {/* Card de Búsqueda */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                    <Search size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Producto</h3>
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
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 transition-all font-medium outline-none text-sm"
                                />

                                {/* Resultados de búsqueda */}
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
                                                className={`px-3 py-2.5 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between transition-colors ${activeIndex === index ? 'bg-purple-50' : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="font-bold text-slate-800 text-sm truncate">{p.descripcion}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 rounded">{p.codigo}</span>
                                                        <span className={`text-[10px] font-bold ${p.stock <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>Stock: {p.stock}</span>
                                                    </div>
                                                </div>
                                                {activeIndex === index && <Check size={16} className="text-purple-500" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedProducto ? (
                                <div className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-full bg-white text-purple-600 shadow-sm flex items-center justify-center font-bold border border-purple-100">
                                            <Package size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate" title={selectedProducto.descripcion}>
                                                {selectedProducto.descripcion}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                                                    {selectedProducto.codigo}
                                                </span>
                                                <span className="text-slate-500 text-[11px] font-bold">Stock: {selectedProducto.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProducto(null)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-white p-1.5 rounded-full transition-all"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 flex items-center gap-2 text-slate-400 px-2 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                    <span className="text-xs font-medium">Esperando selección...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA - Configuración del Ajuste */}
                    <div className="lg:col-span-2 flex flex-col min-h-0 bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                        <Plus size={18} />
                                    </div>
                                    Detalles del Ajuste
                                </h3>
                                <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    Configuración
                                </span>
                            </div>
                        </div>

                        {/* Contenido scrolleable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>

                            {/* Tipo y Cantidad */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Tipo de Ajuste */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Tipo de Movimiento</label>
                                    <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setTipo('IN')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-sm transition-all ${tipo === 'IN'
                                                ? 'bg-white text-emerald-600 shadow-md scale-[1.02]'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <TrendingUp size={18} strokeWidth={3} />
                                            ENTRADA
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTipo('OUT')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-sm transition-all ${tipo === 'OUT'
                                                ? 'bg-white text-rose-600 shadow-md scale-[1.02]'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <TrendingDown size={18} strokeWidth={3} />
                                            SALIDA
                                        </button>
                                    </div>
                                </div>

                                {/* Cantidad */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Cantidad a Ajustar</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="0"
                                            value={cantidad}
                                            onChange={(e) => setCantidad(e.target.value)}
                                            disabled={!selectedProducto}
                                            className={`w-full px-4 py-3 pr-24 border-2 rounded-xl text-xl font-black transition-all outline-none ${!selectedProducto
                                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800'
                                                }`}
                                        />
                                        <div className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-300 font-black uppercase text-xs pointer-events-none">Unidades</div>
                                    </div>
                                </div>
                            </div>

                            {/* Motivo */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                    Motivo o Justificación (Opcional)
                                </label>
                                <textarea
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    disabled={!selectedProducto}
                                    placeholder="Ej: Mercadería dañada, Error de carga inicial, Merma por vencimiento..."
                                    rows="4"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all outline-none resize-none ${!selectedProducto
                                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800'
                                        }`}
                                />
                            </div>

                            {/* Estado Visual del Ajuste */}
                            {!selectedProducto && (
                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 opacity-50">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <Package size={28} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-600 text-sm">No hay producto seleccionado</p>
                                        <p className="text-xs text-slate-400 mt-1">Selecciona un producto del buscador para comenzar</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer - Barra de acción */}
                        <div className="p-4 m-4 rounded-2xl bg-slate-900 text-white flex justify-between items-center shadow-xl">
                            <div className="flex items-center gap-6">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Stock Actual</p>
                                    <p className="text-2xl font-black text-slate-200">{selectedProducto ? selectedProducto.stock : '—'}</p>
                                </div>

                                {selectedProducto && qCant > 0 && (
                                    <>
                                        <div className="text-slate-600">
                                            <ArrowRight size={20} strokeWidth={3} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${tipo === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                Nuevo Stock
                                            </p>
                                            <span className={`text-2xl font-black ${tipo === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {stockNuevo}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/productos')}
                                    className="text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center gap-2 group"
                                >
                                    <X size={14} className="group-hover:rotate-90 transition-transform" />
                                    Cancelar
                                </button>
                                <BtnSave
                                    label={loading ? 'Procesando...' : 'Confirmar Ajuste'}
                                    onClick={handleSubmit}
                                    disabled={loading || !selectedProducto || !cantidad}
                                    className="px-6 py-2.5 rounded-xl font-black text-sm shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AjusteStock;
