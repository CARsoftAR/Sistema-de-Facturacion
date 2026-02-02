import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, ArrowLeft, ShoppingCart, User, Calendar, DollarSign, FileText, CheckCircle2, AlertCircle, XCircle, Receipt
} from 'lucide-react';
import { BtnPrint, BtnBack } from '../components/CommonButtons';

const DetalleNotaDebito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nota, setNota] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const response = await fetch(`/api/notas-debito/${id}/`);

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
        window.open(`/comprobantes/nd/${id}/imprimir/?model=modern`, '_blank');
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
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BtnBack onClick={() => navigate('/notas-debito')} />
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <span className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-xl text-white shadow-md">
                                        <Receipt size={20} />
                                    </span>
                                    ND #{nota.numero}
                                </h1>
                                <p className="text-sm text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar size={12} className="text-red-500" />
                                    {nota.fecha}
                                </p>
                            </div>
                        </div>
                        <BtnPrint onClick={handlePrint} className="shadow-md hover:shadow-lg transition-all" />
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">

                        {/* Estado y Total */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</h3>
                                {getEstadoBadge(nota.estado)}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Débito</label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black bg-gradient-to-br from-red-700 to-red-900 bg-clip-text text-transparent leading-tight">
                                        $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
                                    </span>
                                    <span className="text-slate-400 font-medium text-xs">ARS</span>
                                </div>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-md">
                                    <User size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Cliente</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nombre / Razón Social</label>
                                    <p className="text-base font-bold text-slate-900 leading-tight">{nota.cliente_nombre}</p>
                                </div>
                            </div>
                        </div>

                        {/* Venta Origen */}
                        {nota.venta_origen_id && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                                        <Receipt size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Venta Origen</h3>
                                </div>
                                <button
                                    onClick={() => navigate(`/ventas/${nota.venta_origen_id}`)}
                                    className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 shadow-md"
                                >
                                    VER VENTA #{nota.venta_origen_id} <ArrowLeft size={12} className="rotate-180" />
                                </button>
                            </div>
                        )}

                        {/* Motivo */}
                        {nota.motivo && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                                        <AlertCircle size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Motivo</h3>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{nota.motivo}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Tabla */}
                    <div className="lg:col-span-2 flex flex-col min-h-0">
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden flex flex-col h-full">

                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                            <FileText size={18} />
                                        </div>
                                        Detalle de Conceptos
                                    </h3>
                                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                </div>
                            </div>

                            {/* Tabla */}
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-1.5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Concepto</th>
                                            <th className="px-3 py-1.5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Cant.</th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Unitario</th>
                                            <th className="px-4 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-red-50/50 transition-all duration-200 group">
                                                <td className="px-4 py-1.5">
                                                    <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-red-700 transition-colors">{item.producto_descripcion}</p>
                                                    {item.producto_codigo && (
                                                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">{item.producto_codigo}</p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 h-7 rounded-lg bg-slate-100 font-black text-slate-700 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.cantidad)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-right text-slate-600 font-semibold text-sm">
                                                    $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio_unitario)}
                                                </td>
                                                <td className="px-4 py-1.5 text-right">
                                                    <span className="font-black text-slate-900 text-base">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-white border-t-2 border-slate-100">
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 shadow-xl shadow-slate-900/20 ring-1 ring-white/10 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                    <div className="flex justify-end items-center relative z-10">
                                        {/* Total */}
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-1">Total Débito</p>
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-slate-400 text-lg font-light">$</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">
                                                    {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
                                                </span>
                                                <span className="text-slate-400 text-[10px] font-bold uppercase ml-1">ARS</span>
                                            </div>
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

export default DetalleNotaDebito;
