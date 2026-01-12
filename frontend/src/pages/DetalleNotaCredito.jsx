import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, ArrowLeft, ShoppingCart, User, Calendar, DollarSign, FileText, CheckCircle2, AlertCircle, XCircle
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
        <div className="container-fluid px-4 py-6 max-w-7xl mx-auto fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <BtnBack onClick={() => navigate('/notas-credito')} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Nota de Crédito <span className="text-blue-600">#{nota.numero}</span>
                        </h1>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar size={14} /> Fecha: {nota.fecha}
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
                            {getEstadoBadge(nota.estado)}
                        </div>
                        <div className="mt-2 pt-4 border-t border-gray-100">
                            <h4 className="text-xs text-gray-400 font-bold mb-1">TOTAL DEVOLUCIÓN</h4>
                            <p className="text-3xl font-black text-green-600">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}</p>
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
                                <h4 className="text-xl font-bold text-gray-900">{nota.cliente}</h4>
                            </div>
                            <div className="pt-2 border-t border-gray-50 mt-2">
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <FileText size={14} /> Venta Orig:
                                    <span className="font-bold text-gray-700">{nota.venta_asociada}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motivo Card */}
                    {nota.motivo && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-orange-500">
                                <AlertCircle size={20} />
                                <h3 className="text-lg font-bold text-gray-800">Motivo</h3>
                            </div>
                            <p className="text-gray-600 text-sm italic">
                                "{nota.motivo}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <ShoppingCart size={18} className="text-indigo-500" />
                                Items de la Nota
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
                                                <div className="font-medium text-gray-900">{item.producto}</div>
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
                                        <td colSpan="3" className="px-6 py-4 text-right text-gray-400 font-bold uppercase tracking-wider">Total Devolución</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-2xl font-black text-green-500 flex items-baseline justify-end gap-1">
                                                <span>$</span>
                                                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
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

export default DetalleNotaCredito;
