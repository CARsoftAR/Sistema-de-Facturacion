import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, Printer, ArrowLeft, Receipt, ShoppingCart, Calendar, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { BtnBack, BtnPrint } from '../components/CommonButtons';

const DetalleRemito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [remito, setRemito] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRemito();
    }, [id]);

    const fetchRemito = async () => {
        try {
            const response = await fetch(`/api/remitos/${id}/`);
            if (response.ok) {
                const data = await response.json();
                console.log("Remito data:", data); // Debug
                setRemito(data);
            } else {
                setError("Error al cargar el remito");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.open(`/comprobantes/remito/${id}/imprimir/?model=modern`, '_blank');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'ENTREGADO':
                return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><CheckCircle2 size={16} /> Entregado</span>;
            case 'EN_CAMINO':
                return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><Truck size={16} /> En Camino</span>;
            case 'GENERADO':
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><FileText size={16} /> Generado</span>;
            case 'ANULADO':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><XCircle size={16} /> Anulado</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-bold">{estado}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!remito) return null;

    // Intentar obtener los items de diferentes posibles propiedades
    const items = remito.items || remito.productos || remito.detalles || [];
    console.log("Items:", items); // Debug

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BtnBack onClick={() => navigate('/remitos')} />
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <span className="bg-gradient-to-br from-cyan-600 to-cyan-700 p-2 rounded-xl text-white shadow-md">
                                        <Truck size={20} />
                                    </span>
                                    Remito #{remito.numero}
                                </h1>
                                <p className="text-sm text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar size={12} className="text-cyan-500" />
                                    {remito.fecha}
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

                        {/* Estado */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</h3>
                                {getEstadoBadge(remito.estado)}
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                                    <User size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Cliente</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nombre / Razón Social</label>
                                    <p className="text-base font-bold text-slate-900 leading-tight">{remito.cliente}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dirección de Entrega */}
                        {remito.direccion && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                                        <MapPin size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Dirección de Entrega</h3>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{remito.direccion}</p>
                            </div>
                        )}

                        {/* Venta Asociada */}
                        {remito.venta_id && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                                        <Receipt size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Venta Asociada</h3>
                                </div>
                                <button
                                    onClick={() => navigate(`/ventas/${remito.venta_id}`)}
                                    className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 shadow-md"
                                >
                                    VER VENTA #{remito.venta_str} <ArrowLeft size={12} className="rotate-180" />
                                </button>
                            </div>
                        )}

                        {/* Observaciones */}
                        {remito.observaciones && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Observaciones</h3>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{remito.observaciones}</p>
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
                                            <ShoppingCart size={18} />
                                        </div>
                                        Detalle de Productos
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
                                            <th className="px-4 py-1.5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Producto</th>
                                            <th className="px-3 py-1.5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Cant.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => {
                                            console.log(`Item ${index}:`, item);
                                            console.log(`  - producto:`, item.producto);
                                            console.log(`  - descripcion:`, item.descripcion);
                                            console.log(`  - codigo:`, item.codigo);
                                            return (
                                                <tr key={index} className="hover:bg-cyan-50/50 transition-all duration-200 group">
                                                    <td className="px-4 py-1.5">
                                                        <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-cyan-700 transition-colors">
                                                            {item.producto || item.descripcion || 'Sin nombre'}
                                                        </p>
                                                        {item.codigo && (
                                                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">{item.codigo}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-center">
                                                        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 h-7 rounded-lg bg-slate-100 font-black text-slate-700 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.cantidad)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleRemito;
