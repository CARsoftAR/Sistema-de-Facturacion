import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, ArrowLeft, ShoppingCart, User, Calendar, DollarSign, FileText, CheckCircle2, Clock, AlertCircle, CreditCard, Receipt
} from 'lucide-react';
import { BtnPrint, BtnBack } from '../components/CommonButtons';

const DetalleVenta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
        window.open(`/ventas/imprimir/${id}/?model=modern`, '_blank');
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
        <div className="container-fluid px-4 py-6 max-w-7xl mx-auto fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <BtnBack onClick={() => navigate('/ventas')} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Venta <span className="text-blue-600">#{venta.numero_factura_formateado || venta.id}</span>
                        </h1>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar size={14} /> Fecha: {venta.fecha}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <BtnPrint onClick={handlePrint} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Estado y Total Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Estado</h3>
                            {getEstadoBadge(venta.estado)}
                        </div>
                        <div className="mt-2 pt-4 border-t border-gray-100">
                            <h4 className="text-xs text-gray-400 font-bold mb-1">TOTAL</h4>
                            <p className="text-3xl font-black text-gray-800">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.total)}</p>
                        </div>
                    </div>

                    {/* Cliente Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                            <User size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Cliente</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{venta.cliente_nombre}</h4>
                            </div>
                            {venta.cliente_telefono && (
                                <p className="text-sm text-gray-600"><span className="font-semibold">Tel:</span> {venta.cliente_telefono}</p>
                            )}
                            {venta.cliente_email && (
                                <p className="text-sm text-gray-600"><span className="font-semibold">Email:</span> {venta.cliente_email}</p>
                            )}
                        </div>
                    </div>

                    {/* Info Comprobante Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-purple-600">
                            <Receipt size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Facturación</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tipo:</span>
                                <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">Factura {venta.tipo_comprobante}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Medio de Pago:</span>
                                <span className="font-bold text-gray-800">{venta.medio_pago}</span>
                            </div>
                            {venta.cae && (
                                <div className="pt-2 border-t border-gray-100">
                                    <span className="block text-xs text-gray-400 uppercase font-bold mb-1">CAE</span>
                                    <span className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded w-full block text-center">{venta.cae}</span>
                                </div>
                            )}
                            {venta.pedido_origen_id && (
                                <div className="pt-2 border-t border-gray-100">
                                    <span className="text-gray-500 block mb-1">Generado desde:</span>
                                    <button
                                        onClick={() => navigate(`/pedidos/${venta.pedido_origen_id}`)}
                                        className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1"
                                    >
                                        VER PEDIDO #{venta.pedido_origen_id}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <ShoppingCart size={18} className="text-indigo-500" />
                                Items de la Venta
                            </h3>
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                                {items.length} Items
                            </span>
                        </div>

                        <div className="overflow-auto" style={{ height: '700px' }}>
                            <table className="w-full text-sm text-left relative min-h-full">
                                <thead className="bg-gray-900 text-white uppercase font-semibold sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3">Producto</th>
                                        <th className="px-6 py-3 text-center">Cant</th>
                                        <th className="px-6 py-3 text-right">Precio Unit.</th>
                                        <th className="px-6 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.producto_descripcion}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{item.producto_codigo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">
                                                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.cantidad)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio_unitario)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ height: '100%' }}><td colSpan="4"></td></tr>
                                </tbody>
                                <tfoot className="bg-gray-900 border-t border-gray-700 sticky bottom-0 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.2)]">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right text-gray-400 font-bold uppercase tracking-wider">Total</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-2xl font-black text-white flex items-baseline justify-end gap-1">
                                                <span>$</span>
                                                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(venta.total)}
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleVenta;
