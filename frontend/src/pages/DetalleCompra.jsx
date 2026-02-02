import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, ArrowLeft, ShoppingCart, Truck, Calendar, DollarSign, FileText, CheckCircle2, Clock, AlertCircle, XCircle, User, Receipt
} from 'lucide-react';
import { BtnPrint, BtnBack } from '../components/CommonButtons';
import { formatNumber } from '../utils/formats';
import Swal from 'sweetalert2';

const DetalleCompra = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [compra, setCompra] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const response = await fetch(`/api/compras/orden/${id}/detalle/`);

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
                setCompra(data);
                setItems(data.items || []);
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
        window.open(`/compras/imprimir/${id}/`, '_blank');
    };

    const handleRecibir = async (orderId) => {
        try {
            const result = await Swal.fire({
                title: '¿Recibir mercadería?',
                text: "Esto ingresará el stock de los productos al sistema.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, recibir',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const response = await fetch(`/api/compras/orden/${orderId}/recibir/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
                    }
                });

                if (response.ok) {
                    Swal.fire('¡Éxito!', 'Mercadería recibida correctamente.', 'success');
                    // Refresh data
                    const updatedResponse = await fetch(`/api/compras/orden/${id}/detalle/`);
                    const updatedData = await updatedResponse.json();
                    setCompra(updatedData);
                } else {
                    const errorMsg = await response.json();
                    Swal.fire('Error', errorMsg.error || 'No se pudo procesar la recepción.', 'error');
                }
            }
        } catch (error) {
            console.error("Error receiving order:", error);
            Swal.fire('Error de Conexión', 'No se pudo contactar con el servidor.', 'error');
        }
    };

    const getEstadoBadge = (estado) => {
        const est = estado?.toUpperCase();
        switch (est) {
            case 'RECIBIDA':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit uppercase tracking-tighter"><CheckCircle2 size={16} /> Recibida</span>;
            case 'CANCELADA':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit uppercase tracking-tighter"><XCircle size={16} /> Cancelada</span>;
            case 'PENDIENTE':
                return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit uppercase tracking-tighter"><Clock size={16} /> Pendiente</span>;
            case 'APROBADA':
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit uppercase tracking-tighter"><CheckCircle2 size={16} /> Aprobada</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-tighter">{estado}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!compra) return null;

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BtnBack onClick={() => navigate('/compras')} />
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <span className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl text-white shadow-md">
                                        <ShoppingCart size={20} />
                                    </span>
                                    Orden de Compra #{compra.numero_orden}
                                </h1>
                                <p className="text-sm text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar size={12} className="text-green-500" />
                                    {compra.fecha}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {compra.estado?.toUpperCase() === 'APROBADA' && (
                                <button
                                    onClick={() => handleRecibir(compra.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
                                >
                                    <Truck size={16} /> Recibir
                                </button>
                            )}
                            <BtnPrint onClick={handlePrint} className="shadow-md hover:shadow-lg transition-all" />
                        </div>
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
                                {getEstadoBadge(compra.estado)}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Orden</label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                                        $ {formatNumber(compra.total)}
                                    </span>
                                    <span className="text-slate-400 font-medium text-xs">ARS</span>
                                </div>
                            </div>
                        </div>

                        {/* Proveedor */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md">
                                    <Truck size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Proveedor</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nombre / Razón Social</label>
                                    <p className="text-base font-bold text-slate-900 leading-tight">{compra.proveedor_nombre}</p>
                                </div>
                                {(compra.proveedor_telefono || compra.proveedor_email) && (
                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
                                        {compra.proveedor_telefono && (
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Teléfono</label>
                                                <p className="text-xs font-semibold text-slate-700">{compra.proveedor_telefono}</p>
                                            </div>
                                        )}
                                        {compra.proveedor_email && (
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Email</label>
                                                <p className="text-xs font-semibold text-slate-700 truncate">{compra.proveedor_email}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Observaciones */}
                        {compra.observaciones && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Observaciones</h3>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{compra.observaciones}</p>
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
                                            <th className="px-3 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Costo Unit.</th>
                                            <th className="px-4 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-green-50/50 transition-all duration-200 group">
                                                <td className="px-4 py-1.5">
                                                    <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-green-700 transition-colors">{item.producto_descripcion}</p>
                                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">{item.producto_codigo}</p>
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 h-7 rounded-lg bg-slate-100 font-black text-slate-700 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {formatNumber(item.cantidad)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-right text-slate-600 font-semibold text-sm">
                                                    $ {formatNumber(item.costo_unitario)}
                                                </td>
                                                <td className="px-4 py-1.5 text-right">
                                                    <span className="font-black text-slate-900 text-base">$ {formatNumber(item.subtotal)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-white border-t-2 border-slate-100">
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 shadow-xl shadow-slate-900/20 ring-1 ring-white/10 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                                        {/* Desglose si existe */}
                                        {compra.subtotal && (
                                            <div className="flex gap-6">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                                                    <p className="text-sm font-bold text-white/90 font-mono">$ {formatNumber(compra.subtotal)}</p>
                                                </div>
                                                {compra.iva && (
                                                    <div className="space-y-0.5 border-l border-white/10 pl-6">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IVA</p>
                                                        <p className="text-sm font-bold text-white/90 font-mono">$ {formatNumber(compra.iva)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-1">Total Orden</p>
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-slate-400 text-lg font-light">$</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">
                                                    {formatNumber(compra.total)}
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

export default DetalleCompra;
