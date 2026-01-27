
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, Printer, ArrowLeft, Receipt, ShoppingCart } from 'lucide-react';
import { BtnBack, BtnPrint } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const DetalleRemito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [remito, setRemito] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRemito();
    }, [id]);

    const fetchRemito = async () => {
        try {
            const response = await fetch(`/api/remitos/${id}/`);
            if (response.ok) {
                const data = await response.json();
                setRemito(data);
            } else {
                console.error("Error fetching remito");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.open(`/comprobantes/remito/${id}/imprimir/?model=modern`, '_blank');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!remito) {
        return <div className="text-center mt-5">Remito no encontrado.</div>;
    }

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Info Card */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <BtnBack onClick={() => navigate('/remitos')} />
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                    <span className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                                        <Receipt size={24} />
                                    </span>
                                    Remito <span className="text-blue-600">#{remito.numero}</span>
                                </h1>
                                <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                    Fecha: {remito.fecha}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <BtnPrint onClick={handlePrint} className="shadow-md hover:shadow-lg transition-all" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-200/50 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <User size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Información del Cliente</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Cliente</label>
                                <p className="text-xl font-bold text-slate-900 leading-tight">{remito.cliente}</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Dirección de Entrega</label>
                                <div className="flex items-start gap-2 text-slate-600">
                                    <MapPin size={16} className="mt-1 flex-shrink-0 text-slate-400" />
                                    <p className="text-sm font-medium">{remito.direccion || 'Sin dirección especificada'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-200/50 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Datos de Control</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Venta Asociada</span>
                                <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{remito.venta_asociada || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado Actual</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm
                                    ${remito.estado === 'ENTREGADO'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                    {remito.estado}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Items */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 ring-1 ring-slate-200/50 overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-700 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <ShoppingCart size={20} />
                                </div>
                                Detalle de Productos
                            </h3>
                            <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-indigo-200/50">
                                {remito.items.length} {remito.items.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>

                        <div className="overflow-auto flex-grow h-full" style={{ maxHeight: '600px' }}>
                            <table className="w-full text-sm text-left border-separate border-spacing-0">
                                <thead className="bg-slate-50/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Producto</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-32">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {remito.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-3 border-b border-slate-50/50">
                                                <p className="font-bold text-slate-800 text-base leading-tight">{item.producto}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">REF-MB-0034</p>
                                            </td>
                                            <td className="px-6 py-3 border-b border-slate-50/50 text-center">
                                                <span className="inline-flex items-center justify-center w-12 h-8 rounded-xl bg-slate-100 font-black text-slate-700 text-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                                    {item.cantidad}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {remito.items.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="py-20 text-center text-slate-300 italic font-medium">
                                                Este remito no tiene items asociados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleRemito;
