import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Printer, ArrowLeft, ShoppingCart, User, Calendar, DollarSign, FileText, CheckCircle2, Clock, AlertCircle, CreditCard, Receipt
} from 'lucide-react';
import { BtnPrint, BtnBack } from '../components/CommonButtons';

const DetalleVenta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [venta, setVenta] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const response = await fetch(`/api/ventas/${id}/`);

                if (!response.ok) {
                    const text = await response.text();
                    try {
                        const json = JSON.parse(text);
                        setError(json.error || `Error ${response.status}: ${response.statusText}`);
                    } catch (e) {
                        console.error('Server response:', text);
                        setError(`Error del servidor (${response.status}). Ver consola para detalles.`);
                    }
                    return;
                }

                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setVenta(data);
                    setItems(data.detalles || []);
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
        window.open(`/invoice/print/${id}/`, '_blank');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'Emitida':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><CheckCircle2 size={16} /> Emitida</span>;
            case 'Anulada':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><AlertCircle size={16} /> Anulada</span>;
            default:
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{estado}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!venta) return null;

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BtnBack onClick={() => navigate(location.state?.from || '/ventas')} />
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <span className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl text-white shadow-md">
                                        <Receipt size={20} />
                                    </span>
                                    Venta #{venta.numero_factura_formateado || venta.id}
                                </h1>
                                <p className="text-sm text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar size={12} className="text-blue-500" />
                                    {venta.fecha}
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
                                {getEstadoBadge(venta.estado)}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Transacción</label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                                        $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.total)}
                                    </span>
                                    <span className="text-slate-400 font-medium text-xs">ARS</span>
                                </div>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                                    <User size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Cliente</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nombre / Razón Social</label>
                                    <p className="text-base font-bold text-slate-900 leading-tight">{venta.cliente_nombre}</p>
                                </div>
                                {(venta.cliente_telefono || venta.cliente_email) && (
                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
                                        {venta.cliente_telefono && (
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Teléfono</label>
                                                <p className="text-xs font-semibold text-slate-700">{venta.cliente_telefono}</p>
                                            </div>
                                        )}
                                        {venta.cliente_email && (
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Email</label>
                                                <p className="text-xs font-semibold text-slate-700 truncate">{venta.cliente_email}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Facturación */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                    <CreditCard size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Facturación</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tipo</span>
                                    <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded-lg uppercase">Factura {venta.tipo_comprobante}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Medio de Pago</span>
                                    <span className="text-xs font-bold text-slate-800">{venta.medio_pago}</span>
                                </div>
                                {venta.cae && (
                                    <div className="pt-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1 text-center">CAE AFIP</label>
                                        <p className="font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center font-bold text-[10px] tracking-widest">{venta.cae}</p>
                                    </div>
                                )}
                                {venta.pedido_origen_id && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => navigate(`/pedidos/${venta.pedido_origen_id}`)}
                                            className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 shadow-md"
                                        >
                                            VER PEDIDO #{venta.pedido_origen_id} <ArrowLeft size={12} className="rotate-180" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                            <th className="px-3 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Unitario</th>
                                            <th className="px-4 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-50/50 transition-all duration-200 group">
                                                <td className="px-4 py-1.5">
                                                    <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">{item.producto_descripcion}</p>
                                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">{item.producto_codigo}</p>
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
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                                        {(venta.tipo_comprobante === 'A' || parseFloat(venta.iva_amount) > 0) && (
                                            <div className="flex gap-6">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subtotal Neto</p>
                                                    <p className="text-sm font-bold text-white/90 font-mono">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.neto)}</p>
                                                </div>
                                                <div className="space-y-0.5 border-l border-white/10 pl-6">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IVA (21%)</p>
                                                    <p className="text-sm font-bold text-white/90 font-mono">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.iva_amount)}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Total a Pagar</p>
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-slate-400 text-lg font-light">$</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">
                                                    {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.total)}
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

export default DetalleVenta;
