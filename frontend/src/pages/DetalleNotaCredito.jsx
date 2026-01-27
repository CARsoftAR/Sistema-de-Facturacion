import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, ArrowLeft, ShoppingCart, User, Calendar, DollarSign, FileText, CheckCircle2, AlertCircle, XCircle, Receipt
} from 'lucide-react';
import { BtnPrint, BtnBack } from '../components/CommonButtons';

const DetalleNotaCredito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nota, setNota] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const response = await fetch(`/api/notas-credito/${id}/`);

                if (!response.ok) {
                    const text = await response.text();
                    try {
                        const json = JSON.parse(text);
                        setError(json.error || `Error ${response.status}: ${response.statusText}`);
                    } catch (e) {
                        console.error('Server response:', text);
                        setError(`Error del servidor (${response.status}).`);
                    }
                    return;
                }

                const data = await response.json();
                if (data.ok) {
                    setNota(data.header);
                    setItems(data.items || []);
                } else {
                    setError(data.error || "Error al cargar datos");
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(`Error de conexión: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();
    }, [id]);

    const handlePrint = () => {
        window.open(`/comprobantes/nc/${id}/imprimir/?model=modern`, '_blank');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'EMITIDA':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><CheckCircle2 size={16} /> Emitida</span>;
            case 'ANULADA':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><XCircle size={16} /> Anulada</span>;
            default:
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{estado}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!nota) return null;

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Columna Izquierda: Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <BtnBack onClick={() => navigate('/notas-credito')} />
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                    <span className="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200">
                                        <Receipt size={24} />
                                    </span>
                                    NC <span className="text-green-600">#{nota.numero}</span>
                                </h1>
                                <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" /> Fecha: {nota.fecha}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <BtnPrint onClick={handlePrint} className="shadow-md hover:shadow-lg transition-all" />
                        </div>
                    </div>

                    {/* Estado y Total Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-200/50 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</h3>
                            {getEstadoBadge(nota.estado)}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">TOTAL DEVOLUCIÓN</label>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-green-600 leading-tight">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}</span>
                                <span className="text-slate-400 font-light text-sm">ARS</span>
                            </div>
                        </div>
                    </div>

                    {/* Cliente Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-200/50 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <User size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Cliente</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nombre / Razón Social</label>
                                <p className="text-xl font-bold text-slate-900 leading-tight">{nota.cliente}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-50">
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <FileText size={14} /> Venta Orig:
                                    <span className="font-bold text-slate-700">{nota.venta_asociada}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motivo Card */}
                    {nota.motivo && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-200/50 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Motivo</h3>
                            </div>
                            <p className="text-slate-600 text-sm italic leading-relaxed">
                                "{nota.motivo}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Items */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 ring-1 ring-slate-200/50 overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
                        {/* Header del Panel */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-700 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <ShoppingCart size={20} />
                                </div>
                                Detalle de Productos
                            </h3>
                            <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-indigo-200/50">
                                {items.length} {items.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>

                        {/* Tabla de Items */}
                        <div className="overflow-y-auto flex-grow px-2">
                            <table className="w-full text-sm text-left border-separate border-spacing-0">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Producto</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Cant.</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Unitario</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                            <td className="px-6 py-3">
                                                <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-700 transition-colors">{item.producto}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-12 h-8 rounded-xl bg-slate-100 font-black text-slate-700 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.cantidad)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500 font-medium">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio_unitario)}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="font-black text-slate-900 text-lg">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Flotante (Totales) */}
                        <div className="p-4 bg-white border-t border-slate-50">
                            <div className="bg-slate-900 rounded-[1.5rem] p-4 shadow-2xl shadow-slate-900/20 ring-1 ring-white/10 overflow-hidden relative">
                                {/* Decoración sutil */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                    {/* Total (Derecha) */}
                                    <div className="text-right ml-auto">
                                        <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-1">Total Devolución</p>
                                        <div className="flex items-baseline justify-end gap-2">
                                            <span className="text-slate-500 text-lg font-light">$</span>
                                            <span className="text-4xl font-black text-white tracking-tighter">
                                                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
                                            </span>
                                            <span className="text-slate-500 text-[10px] font-bold uppercase ml-1">ARS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleNotaCredito;
