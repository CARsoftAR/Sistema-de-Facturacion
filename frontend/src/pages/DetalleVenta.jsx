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
                        // If response is not JSON (likely HTML error page)
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
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Columna Izquierda: Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <BtnBack onClick={() => navigate(location.state?.from || '/ventas')} />
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                    <span className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                                        <Receipt size={24} />
                                    </span>
                                    Venta <span className="text-blue-600">#{venta.numero_factura_formateado || venta.id}</span>
                                </h1>
                                <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" /> Fecha: {venta.fecha}
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
                            {getEstadoBadge(venta.estado)}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">TOTAL TRANSACCIÓN</label>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 leading-tight">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.total)}</span>
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
                                <p className="text-xl font-bold text-slate-900 leading-tight">{venta.cliente_nombre}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                {venta.cliente_telefono && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Teléfono</label>
                                        <p className="text-sm font-medium text-slate-600">{venta.cliente_telefono}</p>
                                    </div>
                                )}
                                {venta.cliente_email && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email</label>
                                        <p className="text-sm font-medium text-slate-600 truncate">{venta.cliente_email}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Comprobante Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-200/50 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Facturación</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</span>
                                <span className="text-xs font-black bg-slate-100 text-slate-700 px-2 py-1 rounded uppercase">Factura {venta.tipo_comprobante}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medio de Pago</span>
                                <span className="text-sm font-bold text-slate-800">{venta.medio_pago}</span>
                            </div>
                            {venta.cae && (
                                <div className="pt-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 text-center">CAE AFIP</label>
                                    <p className="font-mono text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center font-bold text-sm tracking-widest">{venta.cae}</p>
                                </div>
                            )}
                            {venta.pedido_origen_id && (
                                <div className="pt-2 border-t border-slate-50">
                                    <button
                                        onClick={() => navigate(`/pedidos/${venta.pedido_origen_id}`)}
                                        className="w-full py-2 bg-slate-50 text-blue-600 hover:bg-blue-50 transition-colors rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        VER PEDIDO #{venta.pedido_origen_id} <ArrowLeft size={12} className="rotate-180" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
                                                <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-700 transition-colors">{item.producto_descripcion}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">{item.producto_codigo}</p>
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
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                    {/* Desglose (Izquierda) */}
                                    <div className="flex gap-8">
                                        {(venta.tipo_comprobante === 'A' || parseFloat(venta.iva_amount) > 0) && (
                                            <>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subtotal Neto</p>
                                                    <p className="text-sm font-bold text-white/90 font-mono">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.neto)}</p>
                                                </div>
                                                <div className="space-y-1 border-l border-white/10 pl-8">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IVA (21%)</p>
                                                    <p className="text-sm font-bold text-white/90 font-mono">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.iva_amount)}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Total (Derecha) */}
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Total a Pagar</p>
                                        <div className="flex items-baseline justify-end gap-2">
                                            <span className="text-slate-500 text-lg font-light">$</span>
                                            <span className="text-4xl font-black text-white tracking-tighter">
                                                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.total)}
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

export default DetalleVenta;
