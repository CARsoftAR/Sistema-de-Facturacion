import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FileText, Search, User, Package, Calendar,
    Check, ArrowLeft, AlertCircle, ShoppingCart, ArrowDownCircle, Trash2
} from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const NuevaNotaCredito = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ventaIdParam = searchParams.get('venta_id');

    const [ventaId, setVentaId] = useState(ventaIdParam || '');
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [motivo, setMotivo] = useState('Anulación de venta');

    useEffect(() => {
        if (ventaIdParam) {
            buscarVenta(ventaIdParam);
        }
    }, [ventaIdParam]);

    const buscarVenta = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/ventas/${id}/`);
            const data = await response.json();
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
                setVenta(null);
            } else {
                setVenta(data);
            }
        } catch (error) {
            console.error("Error buscando venta:", error);
            Swal.fire('Error', 'No se pudo cargar la venta', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        if (!venta) return;

        const result = await Swal.fire({
            title: '¿Confirmar Nota de Crédito?',
            text: "Esta acción anulará la venta y devolverá el stock.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, generar NC'
        });

        if (!result.isConfirmed) return;

        setGuardando(true);
        try {
            // Nota: En el backend actual parece que la URL es /api/notas-credito/crear/<venta_id>/
            const response = await fetch(`/api/notas-credito/crear/${venta.id}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo })
            });
            const data = await response.json();
            if (data.ok) {
                Swal.fire('Éxito', 'Nota de Crédito generada correctamente', 'success');
                navigate('/notas-credito');
            } else {
                Swal.fire('Error', data.error || 'Error al generar NC', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <BtnBack onClick={() => navigate('/notas-credito')} />
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <ArrowDownCircle className="text-red-600" size={32} />
                        Nueva Nota de Crédito
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <label className="block text-sm font-bold text-slate-500 mb-2">Venta a Anular/Devolver</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ID de Venta (ej: 123)"
                                value={ventaId}
                                onChange={(e) => setVentaId(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium"
                            />
                            <button
                                onClick={() => buscarVenta(ventaId)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {venta && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <User size={20} className="text-blue-500" />
                                <h2 className="font-bold text-slate-700">Cliente</h2>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="font-bold text-slate-800 text-lg">{venta.cliente_nombre}</p>
                                <p className="text-slate-500 text-sm mt-1">{venta.cliente_cuit || 'Consumidor Final'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-500 ml-1">Motivo de la Nota de Crédito</label>
                                <textarea
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all text-sm h-24"
                                    placeholder="Especifique el motivo de la devolución..."
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center text-slate-500 text-sm mb-1">
                                    <span>Total Venta Original:</span>
                                    <span className="font-bold">${new Intl.NumberFormat('es-AR').format(venta.total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-600 text-lg font-black">
                                    <span>Total Nota de Crédito:</span>
                                    <span>${new Intl.NumberFormat('es-AR').format(venta.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                                <Package size={20} className="text-indigo-500" />
                                Ítems a Devolver
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0 bg-slate-50/30">
                            {venta ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                                        <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-6 py-4 text-left">Producto</th>
                                            <th className="px-6 py-4 text-center w-32">Cant.</th>
                                            <th className="px-6 py-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {venta.detalles.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{item.producto_descripcion}</p>
                                                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.producto_codigo}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                                        {item.cantidad}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                    ${new Intl.NumberFormat('es-AR').format(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-20 text-center text-slate-400">
                                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                        <Trash2 size={32} />
                                    </div>
                                    <p className="font-medium">Busque una venta para cargar los ítems</p>
                                </div>
                            )}
                        </div>

                        {venta && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <BtnSave
                                    label="Confirmar Nota de Crédito"
                                    icon={<ArrowDownCircle size={20} />}
                                    onClick={handleGuardar}
                                    disabled={guardando}
                                    className="bg-red-600 hover:bg-red-700"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaNotaCredito;
